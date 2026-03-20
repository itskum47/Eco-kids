module.exports = {
  endpoint: process.env.APPWRITE_ENDPOINT,
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  webhookKey: process.env.APPWRITE_WEBHOOK_KEY,

  databaseId: process.env.APPWRITE_DATABASE_ID || 'ecokids_main',

  collections: {
    users: 'users',
    challenges: 'challenges',
    submissions: 'submissions',
    ecoPoints: 'eco_points',
    badges: 'badges',
    leaderboards: 'leaderboards',
    auditLogs: 'audit_logs',
    refreshTokens: 'refresh_tokens'
  },

  buckets: {
    challengePhotos: process.env.APPWRITE_STORAGE_BUCKET_CHALLENGE_PHOTOS || 'challenge_photos',
    profileAvatars: process.env.APPWRITE_STORAGE_BUCKET_PROFILE_AVATARS || 'profile_avatars',
    documents: process.env.APPWRITE_STORAGE_BUCKET_DOCUMENTS || 'documents'
  },

  messaging: {
    emailProvider: process.env.APPWRITE_MESSAGING_EMAIL_PROVIDER,
    emailFrom: process.env.APPWRITE_MESSAGING_EMAIL_FROM,
    smsProvider: process.env.APPWRITE_MESSAGING_SMS_PROVIDER
  },

  encryption: {
    key: process.env.APPWRITE_ENCRYPTION_KEY,
    webhookSigningKey: process.env.APPWRITE_WEBHOOK_SIGNING_KEY
  }
};
