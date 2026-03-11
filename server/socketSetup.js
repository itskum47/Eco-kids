/**
 * PART 1 - W4: Socket.io Server-Side Room Configuration
 * Multi-room namespaces for segmented real-time communication
 * Integrated into server.js via: require('./socketSetup')(io)
 */

const logger = require('./utils/logger');

module.exports = (io) => {
  logger.info('[Socket] Initializing multi-room architecture');

  // ==========================================
  // DEFAULT NAMESPACE: / (connection only)
  // ==========================================
  io.on('connection', (socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    // Handle room subscriptions
    socket.on('join-room', ({ room, userId }) => {
      socket.join(room);
      logger.info(`[Socket] Client ${socket.id} joined room: ${room}`);
      
      // Notify room members
      io.to(room).emit('room-updated', {
        event: 'user-joined',
        userId,
        room,
        timestamp: new Date()
      });
    });

    socket.on('leave-room', ({ room }) => {
      socket.leave(room);
      logger.info(`[Socket] Client ${socket.id} left room: ${room}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`[Socket] Client disconnected: ${socket.id}`);
      socket.removeAllListeners();
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`[Socket] Error on client ${socket.id}:`, error);
      socket.disconnect(true);
    });
  });

  // ==========================================
  // ROOM 1: User Dashboard Rooms (user-${userId})
  // Real-time: badges, points, achievements, notifications
  // ==========================================
  io.on('connection', (socket) => {
    // User joins their personal notification room
    socket.on('join-user-room', ({ userId }) => {
      const room = `user-${userId}`;
      socket.join(room);
      logger.info(`[Socket] User ${userId} subscribed to personal room`);
      
      // Emit confirmation
      socket.emit('user-room-joined', { userId, room });
    });

    // Listen for badge-earned events
    socket.on('badge-earned', (data) => {
      const room = `user-${data.userId}`;
      io.to(room).emit('badge-earned', {
        badgeId: data.badgeId,
        badgeName: data.badgeName,
        badgeIcon: data.badgeIcon,
        timestamp: new Date()
      });
      logger.info(`[Socket] Badge earned emitted to ${room}`);
    });

    // Listen for points-earned events
    socket.on('points-earned', (data) => {
      const room = `user-${data.userId}`;
      io.to(room).emit('points-earned', {
        points: data.points,
        totalPoints: data.totalPoints,
        activity: data.activity,
        timestamp: new Date()
      });
      logger.info(`[Socket] Points earned emitted to ${room}`);
    });

    // Photo AI verification result
    socket.on('photo-verification-result', (data) => {
      const room = `user-${data.userId}`;
      io.to(room).emit('photo-verification', {
        submissionId: data.submissionId,
        isApproved: data.isApproved,
        ecoPointsAwarded: data.ecoPointsAwarded,
        timestamp: new Date()
      });
      logger.info(`[Socket] Photo verification result sent to ${room}`);
    });
  });

  // ==========================================
  // ROOM 2: School Admin Rooms (school-${schoolId})
  // Real-time: aggregated stats, student activities, submissions
  // ==========================================
  io.on('connection', (socket) => {
    socket.on('join-school-room', ({ schoolId }) => {
      const room = `school-${schoolId}`;
      socket.join(room);
      logger.info(`[Socket] Admin joined school room: ${room}`);
      
      socket.emit('school-room-joined', { schoolId, room });
    });

    // Broadcast school-wide achievements
    socket.on('school-achievement', (data) => {
      const room = `school-${data.schoolId}`;
      io.to(room).emit('school-achievement', {
        studentName: data.studentName,
        achievement: data.achievement,
        ecoPoints: data.ecoPoints,
        timestamp: new Date()
      });
      logger.info(`[Socket] School achievement broadcasted to ${room}`);
    });

    // Real-time submission notifications
    socket.on('submission-received', (data) => {
      const room = `school-${data.schoolId}`;
      io.to(room).emit('pending-submission', {
        submissionId: data.submissionId,
        studentId: data.studentId,
        studentName: data.studentName,
        activityTitle: data.activityTitle,
        photoUrl: data.photoUrl,
        timestamp: new Date()
      });
      logger.info(`[Socket] Submission notification sent to ${room}`);
    });

    // School aggregate stats updated
    socket.on('school-stats-updated', (data) => {
      const room = `school-${data.schoolId}`;
      io.to(room).emit('school-stats', {
        totalEcoPoints: data.totalEcoPoints,
        studentCount: data.studentCount,
        activitiesCompleted: data.activitiesCompleted,
        averageEcoPoints: data.averageEcoPoints,
        timestamp: new Date()
      });
      logger.info(`[Socket] School stats updated in ${room}`);
    });
  });

  // ==========================================
  // ROOM 3: Teacher Classroom Rooms (teacher-${teacherId})
  // Real-time: student submissions, class progress, activity approvals
  // ==========================================
  io.on('connection', (socket) => {
    socket.on('join-teacher-room', ({ teacherId }) => {
      const room = `teacher-${teacherId}`;
      socket.join(room);
      logger.info(`[Socket] Teacher ${teacherId} joined classroom room`);
      
      socket.emit('teacher-room-joined', { teacherId, room });
    });

    // Notify teacher of new student submissions
    socket.on('submission-pending', (data) => {
      const room = `teacher-${data.teacherId}`;
      io.to(room).emit('student-submission', {
        submissionId: data.submissionId,
        studentId: data.studentId,
        studentName: data.studentName,
        activityTitle: data.activityTitle,
        photoUrl: data.photoUrl,
        timestamp: new Date()
      });
      logger.info(`[Socket] Submission notification sent to teacher ${data.teacherId}`);
    });

    // Notify of class progress updates
    socket.on('class-progress', (data) => {
      const room = `teacher-${data.teacherId}`;
      io.to(room).emit('class-stats', {
        classSize: data.classSize,
        activeStudents: data.activeStudents,
        completedActivities: data.completedActivities,
        averageEcoPoints: data.averageEcoPoints,
        timestamp: new Date()
      });
      logger.info(`[Socket] Class progress updated for teacher ${data.teacherId}`);
    });
  });

  // ==========================================
  // ROOM 4: Admin Dashboard Rooms (admin-dashboard)
  // Real-time: system-wide stats, alerts, user activity feeds
  // ==========================================
  io.on('connection', (socket) => {
    socket.on('join-admin-dashboard', ({ adminId, role }) => {
      if (['admin', 'state_admin', 'district_admin'].includes(role)) {
        const room = `admin-dashboard-${adminId}`;
        socket.join(room);
        logger.info(`[Socket] Admin ${adminId} joined admin dashboard`);
        
        socket.emit('admin-dashboard-joined', { adminId, room });
      }
    });

    // Broadcast system alerts
    socket.on('system-alert', (data) => {
      io.to('admin-dashboard').emit('alert', {
        severity: data.severity, // 'warning', 'critical'
        message: data.message,
        affectedResource: data.affectedResource,
        timestamp: new Date()
      });
      logger.info(`[Socket] System alert broadcasted`);
    });

    // Real-time user activity feed for admins
    socket.on('user-activity', (data) => {
      io.to('admin-dashboard').emit('activity-log', {
        userId: data.userId,
        userName: data.userName,
        action: data.action,
        metric: data.metric,
        timestamp: new Date()
      });
      logger.info(`[Socket] Activity logged to admin dashboard`);
    });
  });

  // ==========================================
  // ROOM 5: Leaderboard/Competition Rooms (leaderboard-${type})
  // Real-time: rank changes, top 10 updates, new achievements
  // ==========================================
  io.on('connection', (socket) => {
    socket.on('watch-leaderboard', ({ leaderboardType }) => {
      const room = `leaderboard-${leaderboardType}`;
      socket.join(room);
      logger.info(`[Socket] Client watching leaderboard: ${leaderboardType}`);
    });

    // Broadcast rank changes
    socket.on('rank-changed', (data) => {
      const room = `leaderboard-${data.leaderboardType}`;
      io.to(room).emit('leaderboard-update', {
        userId: data.userId,
        userName: data.userName,
        newRank: data.newRank,
        previousRank: data.previousRank,
        ecoPoints: data.ecoPoints,
        timestamp: new Date()
      });
      logger.info(`[Socket] Rank change broadcasted on ${room}`);
    });
  });

  // ==========================================
  // ROOM 6: Eco-Club Coordination Rooms (eco-club-${clubId})
  // Real-time: club activities, submissions, member join notifications
  // ==========================================
  io.on('connection', (socket) => {
    socket.on('join-eco-club-room', ({ clubId }) => {
      const room = `eco-club-${clubId}`;
      socket.join(room);
      logger.info(`[Socket] User joined eco-club room: ${clubId}`);
    });

    // New member joining club
    socket.on('member-joined-club', (data) => {
      const room = `eco-club-${data.clubId}`;
      io.to(room).emit('member-joined',{
        memberId: data.memberId,
        memberName: data.memberName,
        timestamp: new Date()
      });
      logger.info(`[Socket] Member joined broadcast in ${room}`);
    });

    // Activity submission for club
    socket.on('club-submission-received', (data) => {
      const room = `eco-club-${data.clubId}`;
      io.to(room).emit('new-submission', {
        submissionId: data.submissionId,
        studentName: data.studentName,
        activityTitle: data.activityTitle,
        photoUrl: data.photoUrl,
        timestamp: new Date()
      });
      logger.info(`[Socket] Club submission notification in ${room}`);
    });

    // Club statistics updated
    socket.on('club-stats-updated', (data) => {
      const room = `eco-club-${data.clubId}`;
      io.to(room).emit('club-stats', {
        participationRate: data.participationRate,
        retentionRate: data.retentionRate,
        environmentalImpact: data.environmentalImpact,
        timestamp: new Date()
      });
      logger.info(`[Socket] Club stats updated in ${room}`);
    });
  });

  logger.info('[Socket] Multi-room architecture initialized successfully');
};
