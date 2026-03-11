const SchoolTeam = require('../models/SchoolTeam');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

/**
 * @desc    Get all teams for a school
 * @route   GET /api/v1/teams/school/:schoolId
 * @access  Private
 */
exports.getSchoolTeams = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;

  const teams = await SchoolTeam.getSchoolTeams(schoolId);

  res.status(200).json({
    success: true,
    count: teams.length,
    data: teams
  });
});

/**
 * @desc    Get team by ID
 * @route   GET /api/v1/teams/:id
 * @access  Private
 */
exports.getTeamById = asyncHandler(async (req, res) => {
  const team = await SchoolTeam.findById(req.params.id)
    .populate('captain', 'name email profile.avatar')
    .populate('coaches', 'name email')
    .populate('members.userId', 'name email profile.avatar gamification.level gamification.ecoPoints')
    .lean();

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  res.status(200).json({
    success: true,
    data: team
  });
});

/**
 * @desc    Create new team
 * @route   POST /api/v1/teams
 * @access  Private/Teacher/Admin
 */
exports.createTeam = asyncHandler(async (req, res) => {
  const { teamName, school, schoolName, teamType, grade, description, captainId, memberIds } = req.body;

  if (!teamName || !school || !schoolName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide team name, school, and school name'
    });
  }

  const team = await SchoolTeam.create({
    teamName,
    school,
    schoolName,
    teamType: teamType || 'class',
    grade,
    description,
    captain: captainId || null,
    members: (memberIds || []).map(id => ({ userId: id, role: 'member' })),
    createdBy: req.user.id,
    isActive: true
  });

  logger.info(`Team created: ${team._id} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: team
  });
});

/**
 * @desc    Update team details
 * @route   PATCH /api/v1/teams/:id
 * @access  Private/Teacher/Admin
 */
exports.updateTeam = asyncHandler(async (req, res) => {
  const { teamName, description, captainId, teamType, grade } = req.body;

  const team = await SchoolTeam.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Update fields
  if (teamName) team.teamName = teamName;
  if (description !== undefined) team.description = description;
  if (captainId) team.captain = captainId;
  if (teamType) team.teamType = teamType;
  if (grade) team.grade = grade;

  await team.save();

  logger.info(`Team ${team._id} updated by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Team updated successfully',
    data: team
  });
});

/**
 * @desc    Add member to team
 * @route   POST /api/v1/teams/:id/members
 * @access  Private/Teacher/Admin
 */
exports.addTeamMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide userId'
    });
  }

  const team = await SchoolTeam.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Add member
  team.addMember(userId, role || 'member');
  await team.save();

  logger.info(`User ${userId} added to team ${team._id}`);

  res.status(200).json({
    success: true,
    message: 'Member added to team',
    data: team
  });
});

/**
 * @desc    Remove member from team
 * @route   DELETE /api/v1/teams/:id/members/:userId
 * @access  Private/Teacher/Admin
 */
exports.removeTeamMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const team = await SchoolTeam.findById(id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  team.removeMember(userId);
  await team.save();

  logger.info(`User ${userId} removed from team ${id}`);

  res.status(200).json({
    success: true,
    message: 'Member removed from team',
    data: team
  });
});

/**
 * @desc    Update team stats
 * @route   POST /api/v1/teams/:id/update-stats
 * @access  Private
 */
exports.updateTeamStats = asyncHandler(async (req, res) => {
  const team = await SchoolTeam.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  await team.updateStats();

  logger.info(`Team ${team._id} stats updated`);

  res.status(200).json({
    success: true,
    message: 'Team stats updated',
    data: team
  });
});

/**
 * @desc    Get team leaderboard
 * @route   GET /api/v1/teams/leaderboard
 * @access  Public
 */
exports.getTeamLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const teams = await SchoolTeam.getTeamLeaderboard(parseInt(limit));

  res.status(200).json({
    success: true,
    count: teams.length,
    data: teams
  });
});

/**
 * @desc    Delete team
 * @route   DELETE /api/v1/teams/:id
 * @access  Private/Admin
 */
exports.deleteTeam = asyncHandler(async (req, res) => {
  const team = await SchoolTeam.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  team.isActive = false;
  await team.save();

  logger.info(`Team ${req.params.id} deactivated by user ${req.user.id}`);

  res.status(200).json({
    success: true,
    message: 'Team deleted successfully'
  });
});

module.exports = exports;
