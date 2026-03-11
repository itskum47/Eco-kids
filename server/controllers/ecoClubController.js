const EcoClub = require('../models/EcoClub');
const User = require('../models/User');
const Gamification = require('../models/Gamification');
const School = require('../models/School');
const logger = require('../utils/logger');

// Create new Eco-Club (Teacher/Admin)
exports.createEcoClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const { clubName, description, schoolId, clubFocusArea, meetingDay, meetingTime, meetingLocation } = req.body;
    const user = await User.findById(userId);

    // Check authorization (teacher or above)
    if (!['teacher', 'school_admin', 'district_admin', 'state_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only teachers and admins can create eco-clubs' });
    }

    const ecoClub = new EcoClub({
      clubName,
      description,
      schoolId: schoolId || user.schoolId,
      clubFocusArea: clubFocusArea || 'general',
      leadership: {
        coordinator: {
          userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
        },
        principal: {
          userId: null,
          name: 'To be assigned',
        },
      },
      meetingSchedule: {
        dayOfWeek: meetingDay || 0,
        meetingTime: meetingTime || '15:30',
        meetingLocation: meetingLocation || 'School Garden',
      },
    });

    await ecoClub.save();

    logger.info(`Eco-Club created: ${ecoClub.clubId} by ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Eco-Club created successfully',
      ecoClub,
    });
  } catch (error) {
    logger.error('Error creating eco-club', error);
    res.status(500).json({ error: 'Failed to create eco-club' });
  }
};

// Get all eco-clubs in a school
exports.getSchoolEcoClubs = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status, focusArea } = req.query;

    const filter = { schoolId, status: status || 'active' };
    if (focusArea) filter.clubFocusArea = focusArea;

    const clubs = await EcoClub.find(filter)
      .populate('leadership.coordinator.userId', 'firstName lastName email')
      .populate('membership.members.studentId', 'firstName lastName email')
      .sort({ 'metadata.createdAt': -1 });

    res.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    logger.error('Error fetching eco-clubs', error);
    res.status(500).json({ error: 'Failed to fetch eco-clubs' });
  }
};

// Get single eco-club details
exports.getEcoClubById = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await EcoClub.findOne({ clubId })
      .populate('leadership.coordinator.userId', 'firstName lastName email phone')
      .populate('leadership.principal.userId', 'firstName lastName')
      .populate('membership.members.studentId', 'firstName lastName email')
      .populate('schoolId', 'schoolName');

    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    res.json({
      success: true,
      club,
    });
  } catch (error) {
    logger.error('Error fetching eco-club', error);
    res.status(500).json({ error: 'Failed to fetch eco-club' });
  }
};

// Update eco-club details
exports.updateEcoClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    const { clubName, description, clubFocusArea, meetingDay, meetingTime, meetingLocation } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    // Check authorization (coordinator or admin)
    if (!club.leadership.coordinator.userId.equals(userId) && req.user.role !== 'school_admin') {
      return res.status(403).json({ error: 'Not authorized to update this club' });
    }

    if (clubName) club.clubName = clubName;
    if (description) club.description = description;
    if (clubFocusArea) club.clubFocusArea = clubFocusArea;
    if (meetingDay) club.meetingSchedule.dayOfWeek = meetingDay;
    if (meetingTime) club.meetingSchedule.meetingTime = meetingTime;
    if (meetingLocation) club.meetingSchedule.meetingLocation = meetingLocation;

    club.metadata.updatedAt = new Date();
    await club.save();

    logger.info(`Eco-Club updated: ${clubId}`);

    res.json({
      success: true,
      message: 'Eco-Club updated successfully',
      club,
    });
  } catch (error) {
    logger.error('Error updating eco-club', error);
    res.status(500).json({ error: 'Failed to update eco-club' });
  }
};

// Add member to eco-club (Student join)
exports.addClubMember = async (req, res) => {
  try {
    const { clubId } = req.params;
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    // Check if already a member
    if (club.membership.members.some(m => m.studentId.equals(studentId))) {
      return res.status(400).json({ error: 'Already a member of this club' });
    }

    // Check capacity
    if (club.membership.totalMembers >= club.membership.maxCapacity) {
      return res.status(400).json({ error: 'Club is at maximum capacity' });
    }

    if (club.joinApprovalRequired) {
      // Add to join requests
      club.membership.joinRequests.push({
        studentId,
        requestDate: new Date(),
        status: 'pending',
      });
    } else {
      // Directly add as member
      club.addMember(studentId, `${student.firstName} ${student.lastName}`, student.email);
    }

    await club.save();

    logger.info(`Student ${studentId} joined/requested eco-club ${clubId}`);

    res.json({
      success: true,
      message: club.joinApprovalRequired ? 'Join request submitted' : 'Successfully joined eco-club',
    });
  } catch (error) {
    logger.error('Error adding club member', error);
    res.status(500).json({ error: 'Failed to join club' });
  }
};

// Approve join request (Coordinator)
exports.approveJoinRequest = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { studentId } = req.body;
    const coordinatorId = req.user.id;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const joinRequest = club.membership.joinRequests.find(jr => jr.studentId.toString() === studentId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const student = await User.findById(studentId);
    joinRequest.status = 'approved';

    club.addMember(studentId, `${student.firstName} ${student.lastName}`, student.email);
    await club.save();

    logger.info(`Join request approved for ${studentId} in club ${clubId}`);

    res.json({
      success: true,
      message: 'Member approved',
    });
  } catch (error) {
    logger.error('Error approving join request', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

// Remove club member (Coordinator)
exports.removeClubMember = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { studentId } = req.body;
    const coordinatorId = req.user.id;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    club.removeMember(studentId);
    await club.save();

    logger.info(`Member removed from club ${clubId}: ${studentId}`);

    res.json({
      success: true,
      message: 'Member removed',
    });
  } catch (error) {
    logger.error('Error removing member', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Create activity (Coordinator)
exports.createActivity = async (req, res) => {
  try {
    const { clubId } = req.params;
    const coordinatorId = req.user.id;
    const { title, description, category, objectives, plannedDate, location, estimatedParticipants, expectedEcoPoints } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const activity = club.createActivity({
      title,
      description,
      category,
      objectives: objectives || [],
      plannedDate: new Date(plannedDate),
      location,
      estimatedParticipants,
      expectedEcoPoints,
    });

    await club.save();

    logger.info(`Activity created in club ${clubId}: ${activity.activityId}`);

    res.status(201).json({
      success: true,
      message: 'Activity created',
      activity,
    });
  } catch (error) {
    logger.error('Error creating activity', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

// Get club activities
exports.getClubActivities = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    let activities = club.activities;
    if (status) {
      activities = activities.filter(a => a.status === status);
    }

    res.json({
      success: true,
      count: activities.length,
      activities: activities.sort((a, b) => new Date(b.plannedDate) - new Date(a.plannedDate)),
    });
  } catch (error) {
    logger.error('Error fetching activities', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Submit activity for approval (Student)
exports.submitActivityApproval = async (req, res) => {
  try {
    const { clubId } = req.params;
    const studentId = req.user.id;
    const { activityId, description, photosUrls, location } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    // Check if student is a member
    if (!club.membership.members.some(m => m.studentId.equals(studentId))) {
      return res.status(403).json({ error: 'Must be a club member to submit' });
    }

    const submission = club.submitActivityForApproval({
      studentId,
      activityId,
      description,
      photosUrls,
      location,
    });

    await club.save();

    logger.info(`Activity submission in club ${clubId} by student ${studentId}`);

    res.status(201).json({
      success: true,
      message: 'Activity submitted for approval',
      submission,
    });
  } catch (error) {
    logger.error('Error submitting activity', error);
    res.status(500).json({ error: 'Failed to submit activity' });
  }
};

// Get submission queue (Coordinator)
exports.getSubmissionQueue = async (req, res) => {
  try {
    const { clubId } = req.params;
    const coordinatorId = req.user.id;
    const { status } = req.query;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let submissions = club.submissionQueue;
    if (status) {
      submissions = submissions.filter(s => s.status === status);
    }

    res.json({
      success: true,
      count: submissions.length,
      submissions: submissions.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)),
    });
  } catch (error) {
    logger.error('Error fetching submissions', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// Approve activity submission (Coordinator)
exports.approveActivitySubmission = async (req, res) => {
  try {
    const { clubId, submissionId } = req.params;
    const coordinatorId = req.user.id;
    const { ecoPoints, comments } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    club.approveSubmission(submissionId, ecoPoints, coordinatorId, comments);

    // Award eco-points to student
    const submission = club.submissionQueue.find(s => s.submissionId.toString() === submissionId);
    if (submission) {
      const gamification = await Gamification.findOne({ userId: submission.studentId });
      if (gamification) {
        gamification.ecoPoints += ecoPoints;
        await gamification.save();
      }
    }

    await club.save();

    logger.info(`Activity approved in club ${clubId}: ${submissionId}`);

    res.json({
      success: true,
      message: 'Activity approved',
    });
  } catch (error) {
    logger.error('Error approving submission', error);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
};

// Reject activity submission (Coordinator)
exports.rejectActivitySubmission = async (req, res) => {
  try {
    const { clubId, submissionId } = req.params;
    const coordinatorId = req.user.id;
    const { rejectionReason } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    club.rejectSubmission(submissionId, coordinatorId, rejectionReason);
    await club.save();

    logger.info(`Activity rejected in club ${clubId}: ${submissionId}`);

    res.json({
      success: true,
      message: 'Activity rejected',
    });
  } catch (error) {
    logger.error('Error rejecting submission', error);
    res.status(500).json({ error: 'Failed to reject submission' });
  }
};

// Get club statistics
exports.getClubStatistics = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    // Recalculate participation and retention rates
    const participationRate = club.calculateParticipationRate();
    const retentionRate = club.calculateRetentionRate();

    club.statistics.averageParticipationRate = participationRate;
    club.statistics.memberRetentionRate = retentionRate;
    await club.save();

    res.json({
      success: true,
      statistics: {
        ...club.statistics.toObject(),
        participationRate,
        retentionRate,
        memberDetails: {
          activeMembers: club.membership.members.filter(m => m.status === 'active').length,
          totalMembers: club.membership.totalMembers,
          capacity: club.membership.maxCapacity,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching statistics', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get club announcements
exports.getClubAnnouncements = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await EcoClub.findOne({ clubId });
    if (!club) {
      return res.status(404).json({ error: 'Eco-Club not found' });
    }

    const announcements = club.announcements.sort((a, b) => b.createdDate - a.createdDate);

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    logger.error('Error fetching announcements', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Post announcement (Coordinator)
exports.postAnnouncement = async (req, res) => {
  try {
    const { clubId } = req.params;
    const coordinatorId = req.user.id;
    const { title, content, images, priority } = req.body;

    const club = await EcoClub.findOne({ clubId });
    if (!club || !club.leadership.coordinator.userId.equals(coordinatorId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const announcement = {
      announcementId: new mongoose.Types.ObjectId(),
      title,
      content,
      createdBy: coordinatorId,
      createdDate: new Date(),
      images: images || [],
      priority: priority || 'medium',
    };

    club.announcements.push(announcement);
    await club.save();

    logger.info(`Announcement posted in club ${clubId}`);

    res.status(201).json({
      success: true,
      message: 'Announcement posted',
      announcement,
    });
  } catch (error) {
    logger.error('Error posting announcement', error);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// Get my eco-clubs (for logged-in user)
exports.getMyEcoClubs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get clubs where user is coordinator
    const coordinatedClubs = await EcoClub.find({ 'leadership.coordinator.userId': userId });

    // Get clubs where user is member
    const memberClubs = await EcoClub.find({ 'membership.members.studentId': userId });

    res.json({
      success: true,
      coordinatedClubs,
      memberClubs,
    });
  } catch (error) {
    logger.error('Error fetching user eco-clubs', error);
    res.status(500).json({ error: 'Failed to fetch eco-clubs' });
  }
};
