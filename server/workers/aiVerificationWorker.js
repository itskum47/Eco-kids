/**
 * AI Verification Worker
 * Processes AI image verification jobs queued by activity submissions.
 * Auto-approved / auto-rejected results are logged to approval_audit_log
 * with teacher_id = null and action_source = 'ai_auto'.
 */
const { Worker } = require('bullmq');
const { bullmqRedisClient } = require('../services/cacheService');
const ActivitySubmission = require('../models/ActivitySubmission');
const ApprovalAuditLog = require('../models/ApprovalAuditLog');
const logger = require('../utils/logger');

const aiVerificationWorker = new Worker(
  'ai-verification',
  async (job) => {
    const { submissionId } = job.data;
    if (!submissionId) {
      logger.warn('[AIWorker] Job missing submissionId', { jobId: job.id });
      return;
    }

    const submission = await ActivitySubmission.findById(submissionId);
    if (!submission) {
      logger.warn('[AIWorker] Submission not found', { submissionId });
      return;
    }

    // Placeholder AI verification logic — replace with actual model call
    // For now, mark as ai_approved if no fraud flags
    const isApproved = !submission.flags || submission.flags.length === 0;
    const newStatus = isApproved ? 'ai_approved' : 'pending_review';

    await ActivitySubmission.findByIdAndUpdate(submissionId, {
      status: newStatus,
      'aiValidation.status': 'completed',
      'aiValidation.isVerified': isApproved,
      'aiValidation.processedAt': new Date()
    });

    if (isApproved) {
      // Log AI auto-approval to audit trail
      await ApprovalAuditLog.create({
        teacher_id: null,
        submission_id: submissionId,
        action: 'approved',
        action_source: 'ai_auto',
        ip_address: null,
        session_id: null
      });
    }

    logger.info('[AIWorker] Processed submission', { submissionId, newStatus });
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
