const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const CampusChapter = require('../models/CampusChapter');
const ActivitySubmission = require('../models/ActivitySubmission');
const User = require('../models/User');

const UG_GRADES = ['ug1', 'ug2', 'ug3', 'ug4'];

function isUGStudent(user) {
  return (
    user.role === 'student' &&
    (UG_GRADES.includes(user.profile && user.profile.grade) ||
      (user.profile && ['college', 'university'].includes(user.profile.institutionType)))
  );
}

// All routes require authentication
router.use(protect);

// GET /api/v1/campus-chapters — List chapters for user's institution
router.get('/', async (req, res) => {
  try {
    const institutionId = req.user.profile && req.user.profile.schoolId;
    if (!institutionId) {
      return res.status(400).json({ error: 'No institution associated with your account' });
    }
    const chapters = await CampusChapter.find({ institutionId, isActive: true })
      .select('name description members missions createdAt')
      .lean();
    const result = chapters.map(ch => ({
      ...ch,
      memberCount: ch.members.length,
      activeMissions: ch.missions.filter(m => m.status === 'active').length
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// POST /api/v1/campus-chapters — Create a new chapter (UG students only)
router.post('/', async (req, res) => {
  if (!isUGStudent(req.user)) {
    return res.status(403).json({ error: 'UNDERGRADUATE_ONLY', message: 'Only undergraduate students can create campus chapters' });
  }
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Chapter name is required' });
  }
  const institutionId = req.user.profile && req.user.profile.schoolId;
  if (!institutionId) {
    return res.status(400).json({ error: 'No institution associated with your account' });
  }
  try {
    const chapter = await CampusChapter.create({
      name: name.trim(),
      description: description && description.trim(),
      institutionId,
      members: [{ userId: req.user.id, role: 'captain' }]
    });
    res.status(201).json({ success: true, data: chapter });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A chapter with that name already exists at your institution' });
    }
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// POST /api/v1/campus-chapters/:chapterId/join — Join a chapter
router.post('/:chapterId/join', async (req, res) => {
  if (!isUGStudent(req.user)) {
    return res.status(403).json({ error: 'UNDERGRADUATE_ONLY', message: 'Only undergraduate students can join campus chapters' });
  }
  try {
    const chapter = await CampusChapter.findById(req.params.chapterId);
    if (!chapter || !chapter.isActive) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const alreadyMember = chapter.members.some(m => String(m.userId) === req.user.id);
    if (alreadyMember) {
      return res.status(409).json({ error: 'You are already a member of this chapter' });
    }
    chapter.members.push({ userId: req.user.id, role: 'member' });
    await chapter.save();
    res.json({ success: true, message: 'Joined chapter successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// POST /api/v1/campus-chapters/:chapterId/missions — Propose a mission
router.post('/:chapterId/missions', async (req, res) => {
  try {
    const chapter = await CampusChapter.findById(req.params.chapterId);
    if (!chapter || !chapter.isActive) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const isMember = chapter.members.some(m => String(m.userId) === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a chapter member to propose missions' });
    }
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Mission title is required' });
    }
    chapter.missions.push({
      title: title.trim(),
      description: description && description.trim(),
      createdBy: req.user.id,
      status: 'pending_review'
    });
    await chapter.save();
    res.status(201).json({ success: true, message: 'Mission proposed and sent for review' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// PUT /api/v1/campus-chapters/:chapterId/missions/:missionId/vote — Vote on a mission
router.put('/:chapterId/missions/:missionId/vote', async (req, res) => {
  try {
    const chapter = await CampusChapter.findById(req.params.chapterId);
    if (!chapter || !chapter.isActive) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const isMember = chapter.members.some(m => String(m.userId) === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a chapter member to vote' });
    }
    const mission = chapter.missions.id(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    const alreadyVoted = mission.voters.some(v => String(v) === req.user.id);
    if (alreadyVoted) {
      return res.status(409).json({ error: 'You have already voted on this mission' });
    }
    mission.voters.push(req.user.id);
    mission.votes = mission.voters.length;
    await chapter.save();
    res.json({ success: true, votes: mission.votes });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// GET /api/v1/campus-chapters/:chapterId/leaderboard — Internal chapter leaderboard
router.get('/:chapterId/leaderboard', async (req, res) => {
  try {
    const chapter = await CampusChapter.findById(req.params.chapterId).lean();
    if (!chapter || !chapter.isActive) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const memberIds = chapter.members.map(m => m.userId);
    const members = await User.find({ _id: { $in: memberIds } })
      .select('name gamification.ecoPoints gamification.level')
      .lean();
    const ranked = members
      .map(u => ({
        name: u.name,
        ecoPoints: (u.gamification && u.gamification.ecoPoints) || 0,
        level: (u.gamification && u.gamification.level) || 1
      }))
      .sort((a, b) => b.ecoPoints - a.ecoPoints)
      .map((u, i) => ({ rank: i + 1, ...u }));
    res.json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// POST /api/v1/campus-chapters/research-track — Submit a research track activity
router.post('/research-track', async (req, res) => {
  if (!isUGStudent(req.user)) {
    return res.status(403).json({ error: 'UNDERGRADUATE_ONLY', message: 'Research Track is available for undergraduate students only' });
  }
  const { writeUp, gpsCoordinates, photoUrls, facultyAdvisorId } = req.body;

  // Validate write-up word count (150–300 words)
  if (!writeUp || typeof writeUp !== 'string') {
    return res.status(400).json({ error: 'Write-up is required' });
  }
  const words = writeUp.trim().split(/\s+/).filter(Boolean);
  if (words.length < 150 || words.length > 300) {
    return res.status(400).json({
      error: 'WORD_COUNT_OUT_OF_RANGE',
      message: `Write-up must be 150–300 words. You have ${words.length}.`
    });
  }

  // Validate at least 3 photos
  if (!Array.isArray(photoUrls) || photoUrls.length < 3) {
    return res.status(400).json({ error: 'At least 3 photos are required for a research track submission' });
  }

  // Validate GPS
  if (!gpsCoordinates || gpsCoordinates.lat == null || gpsCoordinates.lng == null) {
    return res.status(400).json({ error: 'GPS coordinates are required' });
  }

  try {
    const submission = await ActivitySubmission.create({
      user: req.user.id,
      schoolId: req.user.profile && req.user.profile.schoolId,
      activityType: 'research-track',
      status: 'pending',
      evidencePhotos: photoUrls,
      researchTrack: {
        writeUp: writeUp.trim(),
        wordCount: words.length,
        gpsCoordinates: { lat: Number(gpsCoordinates.lat), lng: Number(gpsCoordinates.lng) },
        facultyAdvisorId: facultyAdvisorId || null
      }
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
