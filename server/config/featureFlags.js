/**
 * PART 1 - W5: Feature Flags Configuration
 * 16 Strategic Flags for Progressive Rollout & A/B Testing
 * Environment variables: FEATURE_* = true|false, ROLLOUT_* = 0-100
 */

const logger = require('../utils/logger');

/**
 * 16 Strategic Feature Flags for EcoKids v1.0
 */
const FEATURE_FLAGS = {
  // ====================================
  // AI & SMART FEATURES (Flags 1-3)
  // ====================================
  AI_PHOTO_VERIFICATION: {
    name: 'AI Photo Verification',
    description: 'Automatically verify eco-activity photos using ML',
    enabled: process.env.FEATURE_AI_PHOTO_VERIFICATION !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_AI_PHOTO || 50),
    linkedModels: ['PhotoSubmission', 'Gamification'],
    performanceImpact: 'medium'
  },

  AI_PERSONALIZED_RECOMMENDATIONS: {
    name: 'AI-Powered Recommendations',
    description: 'Show personalized activity recommendations based on user behavior',
    enabled: process.env.FEATURE_AI_RECOMMENDATIONS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_RECOMMENDATIONS || 30),
    linkedModels: ['User', 'Activity', 'Recommendation'],
    performanceImpact: 'medium'
  },

  SMART_LEARNING_PATH: {
    name: 'Smart Learning Pathways',
    description: 'Adaptive learning paths based on grade and progress',
    enabled: process.env.FEATURE_SMART_PATHS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_SMART_PATHS || 40),
    linkedModels: ['LearningPath', 'User'],
    performanceImpact: 'low'
  },

  // ====================================
  // SOCIAL & COLLABORATION (Flags 4-6)
  // ====================================
  SOCIAL_BUDDY_SYSTEM: {
    name: 'Eco-Buddy System',
    description: 'Allow students to friend other students and collaborate',
    enabled: process.env.FEATURE_BUDDY_SYSTEM !== 'false',
    environment: ['production', 'staging', 'development'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_BUDDY || 100),
    linkedModels: ['User', 'Buddy'],
    performanceImpact: 'low'
  },

  TEAM_CHALLENGES: {
    name: 'Team-Based Challenges',
    description: 'Allow groups of students to compete in team challenges',
    enabled: process.env.FEATURE_TEAM_CHALLENGES !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_TEAM_CHALLENGES || 60),
    linkedModels: ['Team', 'Challenge', 'TeamMember'],
    performanceImpact: 'medium'
  },

  SOCIAL_FEED_COMMENTS: {
    name: 'Activity Feed Comments',
    description: 'Allow users to comment on and react to activity posts',
    enabled: process.env.FEATURE_COMMENTS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_COMMENTS || 70),
    linkedModels: ['ActivityFeed', 'Comment'],
    performanceImpact: 'medium'
  },

  // ====================================
  // GAMIFICATION & ENGAGEMENT (Flags 7-9)
  // ====================================
  ADVANCED_BADGE_SYSTEM: {
    name: 'Advanced Badge System',
    description: 'Enable rare badges, achievement streaks, and seasonal badges',
    enabled: process.env.FEATURE_ADVANCED_BADGES !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_BADGES || 80),
    linkedModels: ['Badge', 'Gamification'],
    performanceImpact: 'low'
  },

  LEADERBOARD_COMPETITIONS: {
    name: 'Global Leaderboards',
    description: 'Show global, school, and district leaderboards',
    enabled: process.env.FEATURE_LEADERBOARDS !== 'false',
    environment: ['production', 'staging', 'development'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_LEADERBOARDS || 100),
    linkedModels: ['Leaderboard', 'Gamification'],
    performanceImpact: 'low'
  },

  WEEKLY_MISSIONS: {
    name: 'Weekly Mission System',
    description: 'Assign weekly eco-missions to students',
    enabled: process.env.FEATURE_WEEKLY_MISSIONS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_MISSIONS || 75),
    linkedModels: ['Mission', 'Gamification'],
    performanceImpact: 'low'
  },

  // ====================================
  // TEACHER TOOLS (Flags 10-12)
  // ====================================
  TEACHER_SUBMISSION_APPROVAL: {
    name: 'Teacher Activity Approval Workflow',
    description: 'Teachers manually approve or reject student submissions',
    enabled: process.env.FEATURE_APPROVAL_WORKFLOW !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_APPROVAL || 100),
    linkedModels: ['Submission', 'Teacher', 'Gamification'],
    performanceImpact: 'low'
  },

  TEACHER_ANALYTICS_DASHBOARD: {
    name: 'Teacher Analytics',
    description: 'Show teachers detailed class analytics and progress',
    enabled: process.env.FEATURE_TEACHER_ANALYTICS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_TEACHER_ANALYTICS || 85),
    linkedModels: ['Teacher', 'Analytics', 'User'],
    performanceImpact: 'medium'
  },

  ECO_CLUB_MANAGEMENT: {
    name: 'Eco-Club Management',
    description: 'Teachers can create and manage eco-clubs',
    enabled: process.env.FEATURE_ECO_CLUBS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_ECO_CLUBS || 90),
    linkedModels: ['EcoClub', 'Teacher', 'Activity'],
    performanceImpact: 'medium'
  },

  // ====================================
  // PARENT & SCHOOL FEATURES (Flags 13-15)
  // ====================================
  PARENT_REPORT_CARDS: {
    name: 'Parent Progress Reports',
    description: 'Generate and send monthly progress reports to parents',
    enabled: process.env.FEATURE_PARENT_REPORTS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_PARENT_REPORTS || 100),
    linkedModels: ['ParentReport', 'User'],
    performanceImpact: 'low'
  },

  SCHOOL_LEVEL_ANALYTICS: {
    name: 'School-Level Analytics',
    description: 'Show school admins aggregated school-wide statistics',
    enabled: process.env.FEATURE_SCHOOL_ANALYTICS !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_SCHOOL_ANALYTICS || 95),
    linkedModels: ['SchoolAggregate', 'SchoolAdmin'],
    performanceImpact: 'low'
  },

  GOVERNMENT_INTEGRATION: {
    name: 'Government Reporting',
    description: 'NEP 2020 compliance reporting for government integration',
    enabled: process.env.FEATURE_GOVERNMENT_INTEGRATION !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_GOVERNMENT || 100),
    linkedModels: ['GovernmentReport', 'School'],
    performanceImpact: 'low'
  },

  // ====================================
  // COMPLIANCE & SECURITY (Flag 16)
  // ====================================
  DPDP_COMPLIANCE_MODE: {
    name: 'DPDP Act 2023 Compliance',
    description: 'Enable parental consent, data deletion, and export features',
    enabled: process.env.FEATURE_DPDP_COMPLIANCE !== 'false',
    environment: ['production', 'staging'],
    rolloutPercentage: parseInt(process.env.ROLLOUT_DPDP || 100),
    linkedModels: ['User', 'Consent', 'DataExport'],
    performanceImpact: 'low'
  }
};

/**
 * FeatureFlags Service
 */
class FeatureFlagsService {
  constructor() {
    this.flags = FEATURE_FLAGS;
    this.userOverrides = new Map();
    logger.info('[FeatureFlags] Service initialized with 16 strategic flags');
  }

  /**
   * Check if a feature is enabled with rollout percentage
   */
  isEnabled(flagName, userId = null, environment = process.env.NODE_ENV) {
    const flag = this.flags[flagName];

    if (!flag) {
      logger.warn(`[FeatureFlags] Unknown flag: ${flagName}`);
      return false;
    }

    // Check user override (for A/B testing)
    if (userId && this.userOverrides.has(`${userId}:${flagName}`)) {
      return this.userOverrides.get(`${userId}:${flagName}`);
    }

    // Check environment support
    if (!flag.environment.includes(environment)) {
      return false;
    }

    // Check if flag is globally enabled
    if (!flag.enabled) {
      return false;
    }

    // Check rollout percentage
    if (userId) {
      const userHash = this.hashUserId(userId);
      const percentage = userHash % 100;
      return percentage < flag.rolloutPercentage;
    }

    return true;
  }

  /**
   * Simple hash function for consistent user rollout
   */
  hashUserId(userId) {
    let hash = 0;
    const str = userId.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get all flags
   */
  getAllFlags() {
    return this.flags;
  }

  /**
   * Get flag details
   */
  getFlag(flagName) {
    return this.flags[flagName] || null;
  }

  /**
   * Override flag for specific user
   */
  setUserOverride(userId, flagName, enabled) {
    this.userOverrides.set(`${userId}:${flagName}`, enabled);
    logger.info(`[FeatureFlags] Override: ${userId} - ${flagName} = ${enabled}`);
  }

  /**
   * Get enabled flags for user
   */
  getEnabledFlagsForUser(userId) {
    const enabledFlags = {};
    Object.keys(this.flags).forEach(flagName => {
      if (this.isEnabled(flagName, userId)) {
        enabledFlags[flagName] = true;
      }
    });
    return enabledFlags;
  }

  /**
   * Log flag statistics
   */
  logStats() {
    const stats = {
      totalFlags: Object.keys(this.flags).length,
      enabledCount: Object.values(this.flags).filter(f => f.enabled).length,
      averageRollout: Math.round(
        Object.values(this.flags).reduce((sum, f) => sum + f.rolloutPercentage, 0) /
        Object.keys(this.flags).length
      )
    };
    logger.info('[FeatureFlags] Stats:', stats);
    return stats;
  }
}

// Export singleton
const featureFlags = new FeatureFlagsService();

// Legacy API for backward compatibility
const isFeatureEnabled = (featureName, userId = null) => {
  return featureFlags.isEnabled(featureName, userId);
};

featureFlags.logStats();

module.exports = {
  featureFlags,
  isFeatureEnabled,
  FEATURE_FLAGS
};

