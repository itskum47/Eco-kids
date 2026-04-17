module.exports = {
  users: {
    collectionId: 'users',
    attributes: [
      { name: 'email', type: 'email', required: true, size: 255 },
      { name: 'password', type: 'string', required: true, size: 255 },
      { name: 'fullName', type: 'string', required: true, size: 255 },
      { name: 'phone', type: 'string', required: false, size: 20 },
      { name: 'role', type: 'string', required: true, size: 50 },
      { name: 'schoolId', type: 'string', required: false, size: 255 },
      { name: 'avatar', type: 'string', required: false, size: 500 },
      { name: 'dateOfBirth', type: 'datetime', required: false },
      { name: 'isActive', type: 'boolean', required: true, default: true },
      { name: 'mfaEnabled', type: 'boolean', required: true, default: false },
      { name: 'mfaSecret', type: 'string', required: false, size: 500 },
      { name: 'createdAt', type: 'datetime', required: true },
      { name: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  challenges: {
    collectionId: 'challenges',
    attributes: [
      { name: 'title', type: 'string', required: true, size: 255 },
      { name: 'description', type: 'string', required: true, size: 2000 },
      { name: 'category', type: 'string', required: true, size: 50 },
      { name: 'difficulty', type: 'string', required: true, size: 20 },
      { name: 'basePoints', type: 'integer', required: true },
      { name: 'bonusPoints', type: 'integer', required: false },
      { name: 'startDate', type: 'datetime', required: true },
      { name: 'endDate', type: 'datetime', required: true },
      { name: 'schoolId', type: 'string', required: true, size: 255 },
      { name: 'createdBy', type: 'string', required: true, size: 255 },
      { name: 'status', type: 'string', required: true, size: 50 },
      { name: 'createdAt', type: 'datetime', required: true },
      { name: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  submissions: {
    collectionId: 'submissions',
    attributes: [
      { name: 'challengeId', type: 'string', required: true, size: 255 },
      { name: 'studentId', type: 'string', required: true, size: 255 },
      { name: 'description', type: 'string', required: false, size: 2000 },
      { name: 'status', type: 'string', required: true, size: 50 },
      { name: 'pointsAwarded', type: 'integer', required: false },
      { name: 'bonusPoints', type: 'integer', required: false },
      { name: 'approvedBy', type: 'string', required: false, size: 255 },
      { name: 'approvalNotes', type: 'string', required: false, size: 1000 },
      { name: 'rejectionReason', type: 'string', required: false, size: 500 },
      { name: 'submittedAt', type: 'datetime', required: true },
      { name: 'approvedAt', type: 'datetime', required: false }
    ]
  },
  ecoPoints: {
    collectionId: 'eco_points',
    attributes: [
      { name: 'studentId', type: 'string', required: true, size: 255 },
      { name: 'schoolId', type: 'string', required: true, size: 255 },
      { name: 'totalPoints', type: 'integer', required: true, default: 0 },
      { name: 'pointsThisWeek', type: 'integer', required: true, default: 0 },
      { name: 'pointsThisMonth', type: 'integer', required: true, default: 0 },
      { name: 'badges', type: 'string', required: false, size: 500 },
      { name: 'lastUpdated', type: 'datetime', required: true }
    ]
  },
  badges: {
    collectionId: 'badges',
    attributes: [
      { name: 'name', type: 'string', required: true, size: 255 },
      { name: 'description', type: 'string', required: true, size: 500 },
      { name: 'icon', type: 'string', required: true, size: 500 },
      { name: 'criteria', type: 'string', required: true, size: 1000 },
      { name: 'pointsRequired', type: 'integer', required: false },
      { name: 'createdAt', type: 'datetime', required: true }
    ]
  },
  leaderboards: {
    collectionId: 'leaderboards',
    attributes: [
      { name: 'schoolId', type: 'string', required: true, size: 255 },
      { name: 'period', type: 'string', required: true, size: 50 },
      { name: 'studentId', type: 'string', required: true, size: 255 },
      { name: 'rank', type: 'integer', required: true },
      { name: 'points', type: 'integer', required: true },
      { name: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  auditLogs: {
    collectionId: 'audit_logs',
    attributes: [
      { name: 'userId', type: 'string', required: true, size: 255 },
      { name: 'action', type: 'string', required: true, size: 255 },
      { name: 'actionType', type: 'string', required: true, size: 100 },
      { name: 'status', type: 'string', required: true, size: 50 },
      { name: 'ip', type: 'string', required: false, size: 50 },
      { name: 'userAgent', type: 'string', required: false, size: 500 },
      { name: 'details', type: 'string', required: false, size: 2000 },
      { name: 'timestamp', type: 'datetime', required: true }
    ]
  },
  refreshTokens: {
    collectionId: 'refresh_tokens',
    attributes: [
      { name: 'token', type: 'string', required: true, size: 500 },
      { name: 'userId', type: 'string', required: true, size: 255 },
      { name: 'expiresAt', type: 'datetime', required: true },
      { name: 'revoked', type: 'boolean', required: true, default: false },
      { name: 'revokedAt', type: 'datetime', required: false },
      { name: 'createdAt', type: 'datetime', required: true }
    ]
  }
};
