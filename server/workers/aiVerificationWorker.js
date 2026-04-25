/**
 * AI Verification Worker
 *
 * Processes image verification jobs from the 'ai-verification' BullMQ queue.
 *
 * Decision logic (confidence-based, teacher-light):
 *   ≥ 0.80  → auto_approved  → award points immediately via gamification queue
 *   0.40–0.79 → pending_review → goes to teacher triage queue (minority of cases)
 *   < 0.40  → auto_rejected  → student notified, can appeal
 *
 * Vision provider: Google Cloud Vision API (SafeSearch + label detection).
 * Falls back gracefully if GOOGLE_VISION_API_KEY is not set (marks pending_review).
 *
 * All decisions are logged to ApprovalAuditLog with action_source = 'ai_auto'.
 */
const { Worker } = require('bullmq');
const { bullmqRedisClient } = require('../services/cacheService');
const ActivitySubmission = require('../models/ActivitySubmission');
const ApprovalAuditLog = require('../models/ApprovalAuditLog');
const OutboxEvent = require('../models/OutboxEvent');
const User = require('../models/User');
const { awardEcoPoints } = require('../utils/ecoPointsManager');
const rewardValues = require('../constants/rewardValues');
const { calculateImpact } = require('../utils/impactCalculator');
const { gamificationQueue } = require('../queues/gamificationQueue');
const logger = require('../utils/logger');

// ─── Vision API helpers ────────────────────────────────────────────────────────

/**
 * ACTIVITY → expected Vision API labels (partial match is enough).
 * These are checked against the labels Google Vision returns for the image.
 */
const ACTIVITY_LABEL_MAP = {
  'tree-planting':            ['tree', 'plant', 'sapling', 'vegetation', 'soil', 'nature'],
  'urban-tree-planting':      ['tree', 'plant', 'sapling', 'urban', 'street'],
  'waste-segregation':        ['waste', 'bin', 'garbage', 'trash', 'recycle', 'dustbin'],
  'water-conservation':       ['water', 'tap', 'bucket', 'rain', 'tank', 'conservation'],
  'energy-saving':            ['solar', 'panel', 'bulb', 'led', 'switch', 'electricity'],
  'composting':               ['compost', 'organic', 'soil', 'waste', 'decompose'],
  'nature-walk':              ['nature', 'park', 'forest', 'outdoor', 'path', 'trail'],
  'stubble-management':       ['field', 'farm', 'crop', 'stubble', 'agriculture'],
  'sutlej-cleanup':           ['river', 'water', 'bank', 'cleanup', 'waste'],
  'groundwater-conservation': ['water', 'pump', 'well', 'borewell', 'conservation'],
  'air-quality-monitoring':   ['sensor', 'device', 'monitor', 'air', 'sky'],
  'quiz-completion':          null, // quiz-completion requires no image validation — skip
  'research-track':           null, // research-track skips Vision check
};

/**
 * ── AI Vision: NVIDIA Gemma 3 27B ────────────────────────────────────────────
 *
 * Uses NVIDIA's NIM API (OpenAI-compatible) with google/gemma-3-27b-it.
 * Steps:
 *   1. Download the image from the Cloudinary URL (buffer)
 *   2. Encode as base64
 *   3. Send to NVIDIA API as a multimodal message (image_url + text)
 *   4. Parse structured YES/NO response
 *
 * Returns { labels: string[], safeSearch: {}, geminiVerdict: boolean|null }
 * (field named geminiVerdict kept for compatibility with computeConfidence)
 */
async function callNvidiaVision(imageUrl, activityType) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const axios = require('axios');
  const activityLabel = activityType.replace(/-/g, ' ');

  try {
    // ── Step 1: Download image and convert to base64 ──────────────────────
    let base64Image;
    let mimeType = 'image/jpeg';

    try {
      const imgResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: { 'Accept': 'image/*' }
      });
      base64Image = Buffer.from(imgResponse.data).toString('base64');
      const contentType = imgResponse.headers['content-type'] || '';
      if (contentType.includes('png'))  mimeType = 'image/png';
      if (contentType.includes('webp')) mimeType = 'image/webp';
    } catch (downloadErr) {
      logger.warn('[AIWorker] Could not download image for NVIDIA analysis', { imageUrl, error: downloadErr.message });
      return null;
    }

    // ── Step 2: Send to NVIDIA NIM API ────────────────────────────────────
    const prompt = `You are an eco-activity verification assistant for an Indian school platform called EcoKids.

Analyze the provided image carefully and answer:
1. Does this image clearly show a "${activityLabel}" activity? Answer YES or NO.
2. List up to 8 visible objects or activities in the image (comma-separated).
3. Does this image contain inappropriate, violent, or adult content? Answer YES or NO.

Respond ONLY in this exact format (no extra text):
ACTIVITY_MATCH: YES/NO
LABELS: label1, label2, label3
INAPPROPRIATE: YES/NO`;

    const payload = {
      model: 'google/gemma-3-27b-it',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      max_tokens: 150,
      temperature: 0.20,
      top_p: 0.70,
      stream: false   // Non-streaming for clean parsing
    };

    const { data } = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    // ── Step 3: Parse structured response ─────────────────────────────────
    const text = data?.choices?.[0]?.message?.content || '';
    logger.debug('[AIWorker] NVIDIA raw response', { text: text.slice(0, 200) });

    const matchLine       = text.match(/ACTIVITY_MATCH:\s*(YES|NO)/i);
    const labelsLine      = text.match(/LABELS:\s*(.+)/i);
    const inappropLine    = text.match(/INAPPROPRIATE:\s*(YES|NO)/i);

    const verdict      = matchLine    ? matchLine[1].toUpperCase() === 'YES'    : null;
    const inappropriate = inappropLine ? inappropLine[1].toUpperCase() === 'YES' : false;
    const labels       = labelsLine
      ? labelsLine[1].split(',').map(l => l.trim().toLowerCase()).filter(Boolean)
      : [];

    logger.info('[AIWorker] NVIDIA Gemma verdict', {
      activityType, verdict, inappropriate, labelCount: labels.length
    });

    return {
      labels,
      safeSearch: inappropriate ? { adult: 'LIKELY' } : {},
      geminiVerdict: verdict   // reuses existing field name
    };

  } catch (err) {
    logger.error('[AIWorker] NVIDIA API call failed', { error: err.message });
    return null;
  }
}

/**
 * Single entry point — calls NVIDIA Gemma 3.
 * Falls back gracefully to null (fraud-flag-based confidence) if key is missing.
 */
async function callVisionAPI(imageUrl, activityType) {
  return callNvidiaVision(imageUrl, activityType);
}




/**
 * Compute confidence score [0–1].
 *
 * If Gemini returned a direct verdict (geminiVerdict !== null):
 *   YES → 0.92 (high confidence — Gemini directly confirmed the activity)
 *   NO  → 0.20 (low confidence — Gemini said image doesn't match)
 *
 * If only Google Vision labels are available (geminiVerdict === null):
 *   Use keyword label matching as before.
 */
function computeConfidence(activityType, visionLabels, geminiVerdict) {
  // Gemini gave a direct answer — trust it over label matching
  if (geminiVerdict === true)  return 0.92;
  if (geminiVerdict === false) return 0.20;

  // Label-matching fallback (Google Vision path)
  const expected = ACTIVITY_LABEL_MAP[activityType];
  if (!expected || expected.length === 0) return 0.85;

  const matches = expected.filter(kw => visionLabels.some(l => l.includes(kw)));
  return Math.min(1, matches.length / Math.max(1, Math.ceil(expected.length * 0.4)));
}


/**
 * Check if safe-search flags indicate inappropriate content.
 */
function isSafeSearchViolation(safeSearch) {
  const dangerous = ['VERY_LIKELY', 'LIKELY'];
  return (
    dangerous.includes(safeSearch.adult) ||
    dangerous.includes(safeSearch.violence) ||
    dangerous.includes(safeSearch.racy)
  );
}

// ─── Auto-approval side-effects ────────────────────────────────────────────────

async function applyAutoApproval(submission) {
  const impact = calculateImpact(submission.activityType, {});

  // Apply environmental impact to user profile
  await User.findByIdAndUpdate(submission.user, {
    $inc: {
      'environmentalImpact.treesPlanted':  impact.treesPlanted  || 0,
      'environmentalImpact.co2Prevented':  impact.co2Prevented  || 0,
      'environmentalImpact.waterSaved':    impact.waterSaved    || 0,
      'environmentalImpact.plasticReduced': impact.plasticReduced || 0,
      'environmentalImpact.energySaved':   impact.energySaved   || 0,
      'environmentalImpact.activitiesCompleted': 1
    },
    $set: { 'environmentalImpact.lastImpactUpdate': new Date() }
  });

  // Award eco-points
  await awardEcoPoints(
    submission.user,
    submission.activityPoints || rewardValues.ACTIVITY_APPROVED,
    'ai-auto-approved',
    {
      sourceType: 'activity',
      sourceModel: 'ActivitySubmission',
      submissionId: submission._id,
      activityType: submission.activityType,
      verification: { status: 'ai_approved', reviewerId: null, verifiedAt: new Date().toISOString() },
      idempotencyKey: `ai_auto:${submission._id.toString()}`
    }
  );

  // Enqueue badge check + leaderboard update
  await gamificationQueue.add('check-badges-and-rank', {
    userId: submission.user.toString(),
    submissionId: submission._id.toString()
  });

  // Outbox event for downstream consumers
  await OutboxEvent.create({
    type: 'SUBMISSION_AI_APPROVED',
    payload: {
      submissionId: submission._id,
      studentId: submission.user,
      action: 'ai_auto_approve'
    },
    processed: false
  });

  // Real-time socket notification to the student
  if (global.io) {
    global.io.to(`student-${submission.user.toString()}`).emit('submission:verified', {
      submissionId: submission._id,
      status: 'ai_approved',
      pointsAwarded: submission.activityPoints || rewardValues.ACTIVITY_APPROVED,
      activityType: submission.activityType,
      message: '🌿 Your activity was verified! Eco-points credited.'
    });
  }
}

// ─── Worker ────────────────────────────────────────────────────────────────────

const aiVerificationWorker = new Worker(
  'ai-verification',
  async (job) => {
    const { submissionId, imageUrl, activityType } = job.data;

    if (!submissionId) {
      logger.warn('[AIWorker] Job missing submissionId', { jobId: job.id });
      return;
    }

    const submission = await ActivitySubmission.findById(submissionId).populate('user', '_id');
    if (!submission) {
      logger.warn('[AIWorker] Submission not found', { submissionId });
      return;
    }

    // Skip if already processed by another worker instance (race guard)
    if (!['pending', 'ai_processing', 'pending_ai'].includes(submission.status)) {
      logger.info('[AIWorker] Submission already processed — skipping', { submissionId, status: submission.status });
      return;
    }

    // Mark as processing immediately to prevent duplicate processing
    await ActivitySubmission.findByIdAndUpdate(submissionId, {
      status: 'ai_processing',
      'aiValidation.status': 'processing'
    });

    // ── Types that skip image analysis (quiz, research) ──
    const skipTypes = ['quiz-completion', 'research-track'];
    let confidenceScore = 0.85;
    let analysisNotes = 'Skipped — activity type does not require image analysis';
    let safeSearchOk = true;

    if (!skipTypes.includes(activityType)) {
      const targetUrl = imageUrl || submission.evidence?.imageUrl;
      if (!targetUrl) {
        // No image URL — escalate to teacher
        await ActivitySubmission.findByIdAndUpdate(submissionId, {
          status: 'pending_review',
          'aiValidation.status': 'failed',
          'aiValidation.isVerified': false,
          'aiValidation.processedAt': new Date(),
          'aiValidation.analysis': 'No image URL available for AI analysis'
        });
        logger.warn('[AIWorker] No imageUrl — escalated to teacher', { submissionId });
        return;
      }

      const visionResult = await callVisionAPI(targetUrl, activityType);

      if (!visionResult) {
        // Vision API unavailable — fall back: if no fraud flags, tentatively approve
        const hasFlags = submission.flags && submission.flags.length > 0;
        confidenceScore = hasFlags ? 0.45 : 0.75;
        analysisNotes = 'Vision API unavailable — confidence derived from fraud flag status';
        logger.warn('[AIWorker] Vision API unavailable — using fallback confidence', { submissionId, confidenceScore });
      } else {
        safeSearchOk = !isSafeSearchViolation(visionResult.safeSearch);
        confidenceScore = safeSearchOk
          ? computeConfidence(activityType, visionResult.labels, visionResult.geminiVerdict)
          : 0.0;

        const provider = visionResult.geminiVerdict !== null ? 'Gemini' : 'Vision Labels';
        const verdictStr = visionResult.geminiVerdict !== null
          ? `Gemini verdict: ${visionResult.geminiVerdict ? 'MATCH' : 'NO MATCH'}`
          : `Labels: [${visionResult.labels.slice(0, 8).join(', ')}]`;
        analysisNotes = `${provider} — ${verdictStr}`;
        if (!safeSearchOk) analysisNotes += ' | SAFE_SEARCH_VIOLATION';
      }


      // Fraud flags reduce confidence
      if (submission.flags && submission.flags.length > 0) {
        confidenceScore = Math.max(0, confidenceScore - 0.25 * submission.flags.length);
        analysisNotes += ` | Fraud flags: [${submission.flags.join(', ')}]`;
      }
    }

    // ── Decision ──────────────────────────────────────────────────────────────
    let newStatus;
    let isVerified = false;

    if (confidenceScore >= 0.80 && safeSearchOk) {
      newStatus = 'ai_approved';
      isVerified = true;
    } else if (confidenceScore < 0.40 || !safeSearchOk) {
      newStatus = 'pending_review'; // teacher sees it flagged
    } else {
      newStatus = 'pending_review'; // borderline — human review
    }

    // Persist result
    await ActivitySubmission.findByIdAndUpdate(submissionId, {
      status: newStatus,
      impactApplied: isVerified,
      'aiValidation.status': 'completed',
      'aiValidation.isVerified': isVerified,
      'aiValidation.confidenceScore': Math.round(confidenceScore * 100),
      'aiValidation.analysis': analysisNotes,
      'aiValidation.processedAt': new Date()
    });

    // Audit log
    await ApprovalAuditLog.create({
      teacher_id: null,
      submission_id: submissionId,
      action: isVerified ? 'approved' : 'escalated_to_teacher',
      action_source: 'ai_auto',
      ip_address: null,
      session_id: null
    }).catch(() => {});

    // If auto-approved — apply impact + points + real-time notification
    if (isVerified) {
      try {
        await applyAutoApproval(submission);
      } catch (err) {
        logger.error('[AIWorker] applyAutoApproval failed — submission stays ai_approved but points not awarded', {
          submissionId,
          error: err.message
        });
      }
    }

    logger.info('[AIWorker] Processed submission', { submissionId, newStatus, confidenceScore: Math.round(confidenceScore * 100) });
  },
  {
    connection: bullmqRedisClient,
    concurrency: 5
  }
);

aiVerificationWorker.on('failed', (job, err) => {
  logger.error('[AIWorker] Job failed', { jobId: job?.id, err: err.message });
});

module.exports = { aiVerificationWorker };
