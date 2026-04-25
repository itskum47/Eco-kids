const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const TreeSpecies = require('../models/TreeSpecies');
const PlantedTree = require('../models/PlantedTree');
const FollowUpTask = require('../models/FollowUpTask');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { awardEcoPoints } = require('../utils/ecoPointsManager');

const FOLLOW_UP_POINTS = { 1: 25, 2: 35, 3: 50 };

const REGION_BY_STATE = {
  himalayan: ['Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Ladakh', 'Sikkim', 'Arunachal Pradesh'],
  coastal: ['Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal', 'Gujarat', 'Maharashtra'],
  desert: ['Rajasthan'],
  forest: ['Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Odisha', 'Assam'],
  urban: []
};

function inferRegionFromState(stateName = '') {
  const normalized = String(stateName).trim();
  for (const [region, states] of Object.entries(REGION_BY_STATE)) {
    if (states.includes(normalized)) return region;
  }
  return 'urban';
}

function addMonths(date, months) {
  const output = new Date(date);
  output.setUTCMonth(output.getUTCMonth() + months);
  return output;
}

exports.getTreeSpecies = asyncHandler(async (req, res) => {
  const region = req.query.region;
  const query = { isActive: true };
  if (region) query.region = region;

  const species = await TreeSpecies.find(query)
    .select('speciesId scientificName commonNameEn commonNameHi region nativeStates co2AbsorptionPerYear waterNeeds matureAge description icon')
    .sort({ commonNameEn: 1 })
    .lean();

  res.status(200).json({ success: true, count: species.length, data: species });
});

exports.plantTree = asyncHandler(async (req, res) => {
  const { speciesId, location, photoUrl, notes, plantedDate } = req.body;

  if (!speciesId || !photoUrl) {
    return res.status(400).json({ success: false, message: 'speciesId and photoUrl are required' });
  }

  const species = await TreeSpecies.findById(speciesId);
  if (!species) {
    return res.status(404).json({ success: false, message: 'Tree species not found' });
  }

  const user = await User.findById(req.user.id).select('profile.state');
  const inferredRegion = inferRegionFromState(user?.profile?.state || '');
  if (species.region !== inferredRegion && species.region !== 'urban') {
    return res.status(400).json({
      success: false,
      message: `Selected species is not region-aligned for ${inferredRegion}`
    });
  }

  const plantDate = plantedDate ? new Date(plantedDate) : new Date();
  const followUpDates = [addMonths(plantDate, 3), addMonths(plantDate, 6), addMonths(plantDate, 12)];

  const plantedTree = await PlantedTree.create({
    userId: req.user.id,
    speciesId,
    plantedDate: plantDate,
    location,
    photoUrl,
    notes,
    status: 'active',
    pointsAwarded: 50,
    followUpDates
  });

  await FollowUpTask.insertMany([
    { plantedTreeId: plantedTree._id, followUpNumber: 1, dueDate: followUpDates[0], pointsAwarded: FOLLOW_UP_POINTS[1] },
    { plantedTreeId: plantedTree._id, followUpNumber: 2, dueDate: followUpDates[1], pointsAwarded: FOLLOW_UP_POINTS[2] },
    { plantedTreeId: plantedTree._id, followUpNumber: 3, dueDate: followUpDates[2], pointsAwarded: FOLLOW_UP_POINTS[3] }
  ]);

  res.status(201).json({
    success: true,
    data: {
      plantedTreeId: plantedTree._id,
      pointsAwarded: 0,
      followUpDates
    }
  });
});

exports.submitTreeFollowUp = asyncHandler(async (req, res) => {
  const { plantedTreeId } = req.params;
  const { followUpNumber, photoUrl, health, notes } = req.body;

  if (!followUpNumber || !photoUrl || !health) {
    return res.status(400).json({ success: false, message: 'followUpNumber, photoUrl and health are required' });
  }

  const plantedTree = await PlantedTree.findById(plantedTreeId).populate('speciesId');
  if (!plantedTree) {
    return res.status(404).json({ success: false, message: 'Planted tree not found' });
  }

  if (String(plantedTree.userId) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this tree' });
  }

  const followUp = await FollowUpTask.findOne({ plantedTreeId, followUpNumber: Number(followUpNumber) });
  if (!followUp) {
    return res.status(404).json({ success: false, message: 'Follow-up slot not found' });
  }

  if (followUp.status !== 'pending' && followUp.status !== 'overdue') {
    return res.status(400).json({ success: false, message: 'Follow-up already submitted' });
  }

  if (new Date() < new Date(followUp.dueDate)) {
    return res.status(400).json({ success: false, message: 'Follow-up cannot be submitted before due date' });
  }

  followUp.photoUrl = photoUrl;
  followUp.health = health;
  followUp.notes = notes;
  followUp.status = 'submitted';
  await followUp.save();

  plantedTree.status = health;
  plantedTree.lastVerifiedAt = new Date();
  await plantedTree.save();

  await Notification.create({
    userId: req.user.id,
    type: 'system',
    title: 'Tree Verification Submitted',
    message: `Follow-up #${followUpNumber} submitted for review`,
    data: { plantedTreeId, followUpNumber }
  }).catch(() => {});

  res.status(200).json({ success: true, data: { pointsPending: followUp.pointsAwarded } });
});

exports.reviewTreeFollowUp = asyncHandler(async (req, res) => {
  const { followUpTaskId } = req.params;
  const { decision, teacherNotes } = req.body;

  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'decision must be approve or reject' });
  }

  const followUpTask = await FollowUpTask.findById(followUpTaskId).populate('plantedTreeId');
  if (!followUpTask) {
    return res.status(404).json({ success: false, message: 'Follow-up task not found' });
  }

  if (followUpTask.status !== 'submitted') {
    return res.status(400).json({ success: false, message: 'Follow-up is not awaiting review' });
  }

  if (decision === 'approve') {
    followUpTask.status = 'verified';
    followUpTask.verifiedDate = new Date();
    followUpTask.reviewedBy = req.user.id;
    followUpTask.teacherNotes = teacherNotes;
    await followUpTask.save();

    const plantedTreeOwnerId = followUpTask.plantedTreeId?.userId;
    if (plantedTreeOwnerId) {
      await awardEcoPoints(plantedTreeOwnerId, followUpTask.pointsAwarded, 'tree-follow-up-verified', {
        sourceType: 'tree-follow-up',
        sourceModel: 'FollowUpTask',
        sourceId: followUpTask._id,
        verification: {
          status: 'followup_verified',
          reviewerId: req.user.id,
          verifiedAt: new Date().toISOString()
        },
        idempotencyKey: `tree:followup:${followUpTask._id.toString()}`
      });

      const treeOwner = await User.findById(plantedTreeOwnerId);
      if (treeOwner) {
        await treeOwner.updateStreak();
      }

      await Notification.create({
        userId: plantedTreeOwnerId,
        type: 'points',
        title: 'Tree Follow-up Verified',
        message: `You earned +${followUpTask.pointsAwarded} points for tree follow-up #${followUpTask.followUpNumber}`,
        data: { followUpTaskId: followUpTask._id, pointsAwarded: followUpTask.pointsAwarded }
      }).catch(() => {});
    }
  } else {
    followUpTask.status = 'rejected';
    followUpTask.reviewedBy = req.user.id;
    followUpTask.teacherNotes = teacherNotes;
    await followUpTask.save();
  }

  res.status(200).json({ success: true, data: followUpTask });
});

exports.getMyTrees = asyncHandler(async (req, res) => {
  const userId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;

  const trees = await PlantedTree.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'treespecies',
        localField: 'speciesId',
        foreignField: '_id',
        as: 'species'
      }
    },
    {
      $lookup: {
        from: 'followuptasks',
        localField: '_id',
        foreignField: 'plantedTreeId',
        as: 'followUps'
      }
    },
    { $unwind: '$species' },
    { $sort: { plantedDate: -1 } }
  ]);

  const summary = trees.reduce(
    (acc, tree) => {
      acc.totalTrees += 1;
      acc.co2CapacityPerYear += Number(tree.species?.co2AbsorptionPerYear || 0);
      return acc;
    },
    { totalTrees: 0, co2CapacityPerYear: 0 }
  );

  res.status(200).json({
    success: true,
    count: trees.length,
    summary,
    data: trees
  });
});
