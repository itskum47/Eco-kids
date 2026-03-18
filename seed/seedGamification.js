const { Badge, Level, CertificateTemplate } = require('../models/Gamification');

const badges = [
  // Water Conservation (3)
  {
    name: 'Droplet Saver',
    description: 'Save at least 100 liters of water in total',
    icon: '💧',
    color: '#0EA5E9',
    category: 'achievement',
    criteria: { type: 'water_saved', value: 100, timeframe: 'all-time' },
    rarity: 'common',
    points: 25
  },
  {
    name: 'Drought Fighter',
    description: 'Save at least 500 liters of water in total',
    icon: '💦',
    color: '#0284C7',
    category: 'achievement',
    criteria: { type: 'water_saved', value: 500, timeframe: 'all-time' },
    rarity: 'rare',
    points: 50
  },
  {
    name: 'Ocean Guardian',
    description: 'Save at least 1000 liters of water in total',
    icon: '🌊',
    color: '#0369A1',
    category: 'achievement',
    criteria: { type: 'water_saved', value: 1000, timeframe: 'all-time' },
    rarity: 'epic',
    points: 75
  },

  // Energy Pioneer (3)
  {
    name: 'Light Switch Pro',
    description: 'Log 10 energy-saving activities in the last 30 days',
    icon: '💡',
    color: '#F59E0B',
    category: 'milestone',
    criteria: {
      type: 'activities_count',
      value: 10,
      activityTypes: ['energy-saving'],
      windowDays: 30,
      timeframe: 'monthly'
    },
    rarity: 'common',
    points: 30
  },
  {
    name: 'Renewable Advocate',
    description: 'Log 30 energy-saving activities in the last 90 days',
    icon: '🔋',
    color: '#D97706',
    category: 'milestone',
    criteria: {
      type: 'activities_count',
      value: 30,
      activityTypes: ['energy-saving'],
      windowDays: 90,
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 60
  },
  {
    name: 'Carbon Neutral',
    description: 'Log 50 energy-saving activities in the last 180 days',
    icon: '⚡',
    color: '#B45309',
    category: 'milestone',
    criteria: {
      type: 'activities_count',
      value: 50,
      activityTypes: ['energy-saving'],
      windowDays: 180,
      timeframe: 'all-time'
    },
    rarity: 'legendary',
    points: 100
  },

  // Waste Master (3)
  {
    name: 'Sort Starter',
    description: 'Reduce or recycle at least 5 kg of plastic/waste',
    icon: '🗂️',
    color: '#10B981',
    category: 'achievement',
    criteria: { type: 'plastic_reduced', value: 5, timeframe: 'all-time' },
    rarity: 'common',
    points: 25
  },
  {
    name: 'Recycle Warrior',
    description: 'Reduce or recycle at least 25 kg of plastic/waste',
    icon: '♻️',
    color: '#059669',
    category: 'achievement',
    criteria: { type: 'plastic_reduced', value: 25, timeframe: 'all-time' },
    rarity: 'rare',
    points: 50
  },
  {
    name: 'Zero Waste Champion',
    description: 'Reduce or recycle at least 100 kg of plastic/waste',
    icon: '🧹',
    color: '#047857',
    category: 'achievement',
    criteria: { type: 'plastic_reduced', value: 100, timeframe: 'all-time' },
    rarity: 'epic',
    points: 75
  },

  // Biodiversity (3)
  {
    name: 'Seed Planter',
    description: 'Plant 5 trees',
    icon: '🌱',
    color: '#22C55E',
    category: 'achievement',
    criteria: { type: 'trees_planted', value: 5, timeframe: 'all-time' },
    rarity: 'common',
    points: 35
  },
  {
    name: 'Forest Builder',
    description: 'Plant 25 trees',
    icon: '🌳',
    color: '#16A34A',
    category: 'achievement',
    criteria: { type: 'trees_planted', value: 25, timeframe: 'all-time' },
    rarity: 'rare',
    points: 60
  },
  {
    name: 'Green Guardian',
    description: 'Plant 100 trees',
    icon: '🌲',
    color: '#15803D',
    category: 'achievement',
    criteria: { type: 'trees_planted', value: 100, timeframe: 'all-time' },
    rarity: 'legendary',
    points: 100
  },

  // Community Leader (2)
  {
    name: 'Cleanup Captain',
    description: 'Complete 1 approved community cleanup activity',
    icon: '🧤',
    color: '#7C3AED',
    category: 'special',
    criteria: {
      type: 'cleanup_events',
      value: 1,
      activityTypes: ['sutlej-cleanup'],
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 40
  },
  {
    name: 'Environmental Hero',
    description: 'Complete 5 approved community cleanup activities',
    icon: '🦸',
    color: '#6D28D9',
    category: 'special',
    criteria: {
      type: 'cleanup_events',
      value: 5,
      activityTypes: ['sutlej-cleanup'],
      timeframe: 'all-time'
    },
    rarity: 'epic',
    points: 80
  },

  // Knowledge Master (3)
  {
    name: 'Eco Scholar',
    description: 'Complete 10 quizzes with average score at least 70%',
    icon: '📘',
    color: '#3B82F6',
    category: 'milestone',
    criteria: { type: 'quiz_mastery', value: 10, minAverageScore: 70, timeframe: 'all-time' },
    rarity: 'common',
    points: 20
  },
  {
    name: 'Nature Expert',
    description: 'Complete 50 quizzes with average score at least 75%',
    icon: '🎓',
    color: '#2563EB',
    category: 'milestone',
    criteria: { type: 'quiz_mastery', value: 50, minAverageScore: 75, timeframe: 'all-time' },
    rarity: 'rare',
    points: 50
  },
  {
    name: 'Sustainability PhD',
    description: 'Complete 100 quizzes with average score at least 80%',
    icon: '🏅',
    color: '#1D4ED8',
    category: 'milestone',
    criteria: { type: 'quiz_mastery', value: 100, minAverageScore: 80, timeframe: 'all-time' },
    rarity: 'legendary',
    points: 80
  },

  // Streak Medals (3)
  {
    name: 'Week Warrior',
    description: 'Be active on 7 distinct days in the last 7 days',
    icon: '🔥',
    color: '#EF4444',
    category: 'achievement',
    criteria: { type: 'active_days', value: 7, windowDays: 7, timeframe: 'weekly' },
    rarity: 'common',
    points: 15
  },
  {
    name: 'Month Maven',
    description: 'Be active on 30 distinct days in the last 30 days',
    icon: '📅',
    color: '#DC2626',
    category: 'achievement',
    criteria: { type: 'active_days', value: 30, windowDays: 30, timeframe: 'monthly' },
    rarity: 'rare',
    points: 30
  },
  {
    name: 'Year Champion',
    description: 'Be active on at least 350 distinct days in the last 365 days',
    icon: '🏆',
    color: '#B91C1C',
    category: 'milestone',
    criteria: { type: 'active_days', value: 350, windowDays: 365, timeframe: 'all-time' },
    rarity: 'legendary',
    points: 150
  },

  // Social Badges (2)
  {
    name: 'Friend Finder',
    description: 'Complete 10 approved community activities (cleanup or nature walk)',
    icon: '🤝',
    color: '#0EA5E9',
    category: 'special',
    criteria: {
      type: 'activities_count',
      value: 10,
      activityTypes: ['sutlej-cleanup', 'nature-walk'],
      timeframe: 'all-time'
    },
    rarity: 'common',
    points: 10
  },
  {
    name: 'Class Champion',
    description: 'Reach top 3 rank in your class leaderboard by EcoPoints',
    icon: '🥇',
    color: '#F59E0B',
    category: 'special',
    criteria: { type: 'class_rank', value: 3, rankScope: 'class', timeframe: 'all-time' },
    rarity: 'epic',
    points: 25
  },

  // Seasonal Badges (3)
  {
    name: 'Climate Advocate',
    description: 'Complete 5 climate actions in Apr-Jun',
    icon: '🌍',
    color: '#0F766E',
    category: 'seasonal',
    criteria: {
      type: 'seasonal_activity',
      value: 5,
      seasonMonths: [4, 5, 6],
      activityTypes: ['air-quality-monitoring', 'energy-saving'],
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 20
  },
  {
    name: 'Winter Warrior',
    description: 'Complete 5 energy actions in Dec-Feb',
    icon: '❄️',
    color: '#1E40AF',
    category: 'seasonal',
    criteria: {
      type: 'seasonal_activity',
      value: 5,
      seasonMonths: [12, 1, 2],
      activityTypes: ['energy-saving'],
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 20
  },
  {
    name: 'Monsoon Guardian',
    description: 'Complete 5 water actions in Jul-Sep',
    icon: '🌧️',
    color: '#1D4ED8',
    category: 'seasonal',
    criteria: {
      type: 'seasonal_activity',
      value: 5,
      seasonMonths: [7, 8, 9],
      activityTypes: ['water-conservation', 'groundwater-conservation'],
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 20
  }
];

const levels = [
  {
    level: 1,
    name: 'Eco Seedling',
    minPoints: 0,
    maxPoints: 99,
    icon: '🌱',
    color: '#22C55E',
    benefits: [
      {
        type: 'unlock_content',
        description: 'Access to basic quizzes and games',
        value: ['basic_quizzes', 'basic_games']
      }
    ]
  },
  {
    level: 2,
    name: 'Green Sprout',
    minPoints: 100,
    maxPoints: 249,
    icon: '🌿',
    color: '#16A34A',
    benefits: [
      {
        type: 'bonus_points',
        description: '5% bonus points on all activities',
        value: 0.05
      }
    ]
  },
  {
    level: 3,
    name: 'Nature Explorer',
    minPoints: 250,
    maxPoints: 499,
    icon: '🍃',
    color: '#15803D',
    benefits: [
      {
        type: 'unlock_content',
        description: 'Access to intermediate content',
        value: ['intermediate_quizzes', 'advanced_games']
      }
    ]
  },
  {
    level: 4,
    name: 'Eco Guardian',
    minPoints: 500,
    maxPoints: 999,
    icon: '🌳',
    color: '#166534',
    benefits: [
      {
        type: 'bonus_points',
        description: '10% bonus points on all activities',
        value: 0.10
      },
      {
        type: 'special_badge',
        description: 'Unlock Guardian badge',
        value: 'eco_guardian'
      }
    ]
  },
  {
    level: 5,
    name: 'Environmental Scientist',
    minPoints: 1000,
    maxPoints: 1999,
    icon: '🔬',
    color: '#065F46',
    benefits: [
      {
        type: 'unlock_content',
        description: 'Access to advanced experiments',
        value: ['advanced_experiments']
      }
    ]
  },
  {
    level: 6,
    name: 'Climate Champion',
    minPoints: 2000,
    maxPoints: 3999,
    icon: '🌡️',
    color: '#047857',
    benefits: [
      {
        type: 'bonus_points',
        description: '15% bonus points on all activities',
        value: 0.15
      }
    ]
  },
  {
    level: 7,
    name: 'Sustainability Master',
    minPoints: 4000,
    maxPoints: 7999,
    icon: '♻️',
    color: '#059669',
    benefits: [
      {
        type: 'early_access',
        description: 'Early access to new content',
        value: true
      }
    ]
  },
  {
    level: 8,
    name: 'Earth Protector',
    minPoints: 8000,
    maxPoints: 15999,
    icon: '🛡️',
    color: '#0D9488',
    benefits: [
      {
        type: 'bonus_points',
        description: '20% bonus points on all activities',
        value: 0.20
      }
    ]
  },
  {
    level: 9,
    name: 'Green Innovator',
    minPoints: 16000,
    maxPoints: 31999,
    icon: '💡',
    color: '#0F766E',
    benefits: [
      {
        type: 'special_badge',
        description: 'Unlock Innovator badge',
        value: 'green_innovator'
      }
    ]
  },
  {
    level: 10,
    name: 'Eco Legend',
    minPoints: 32000,
    maxPoints: 99999999,
    icon: '👑',
    color: '#134E4A',
    benefits: [
      {
        type: 'bonus_points',
        description: '25% bonus points on all activities',
        value: 0.25
      },
      {
        type: 'special_badge',
        description: 'Unlock Legendary status',
        value: 'eco_legend'
      }
    ]
  }
];

const certificateTemplates = [
  {
    name: 'Quiz Completion Certificate',
    type: 'quiz_completion',
    template: `
      <div class="certificate">
        <div class="certificate-header">
          <div class="logo">
            <img src="/logo.png" alt="EcoKids India" />
          </div>
          <h1>Certificate of Achievement</h1>
        </div>
        
        <div class="certificate-body">
          <p class="awarded-to">This is to certify that</p>
          <h2 class="recipient-name">{{userName}}</h2>
          <p class="achievement">has successfully completed the quiz</p>
          <h3 class="quiz-title">{{quizTitle}}</h3>
          <p class="score">with a score of {{score}}%</p>
          
          <div class="details">
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">{{issueDate}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Level:</span>
              <span class="value">Level {{userLevel}}</span>
            </div>
            <div class="detail-item">
              <span class="label">EcoPoints:</span>
              <span class="value">{{ecoPoints}}</span>
            </div>
          </div>
        </div>
        
        <div class="certificate-footer">
          <div class="signature">
            <div class="signature-line"></div>
            <p>EcoKids India Team</p>
          </div>
          <div class="certificate-id">
            Certificate ID: {{certificateId}}
          </div>
        </div>
      </div>
    `,
    style: `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .certificate {
        background: white;
        width: 800px;
        padding: 60px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        border: 8px solid #22C55E;
        position: relative;
      }
      
      .certificate::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: linear-gradient(45deg, #22C55E, #16A34A, #15803D, #166534);
        border-radius: 24px;
        z-index: -1;
      }
      
      .certificate-header {
        text-align: center;
        margin-bottom: 40px;
      }
      
      .logo img {
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
      }
      
      .certificate-header h1 {
        font-size: 36px;
        color: #22C55E;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .certificate-body {
        text-align: center;
        margin-bottom: 40px;
      }
      
      .awarded-to {
        font-size: 18px;
        color: #666;
        margin-bottom: 10px;
      }
      
      .recipient-name {
        font-size: 42px;
        color: #333;
        font-weight: 700;
        margin-bottom: 20px;
        text-decoration: underline;
        text-decoration-color: #22C55E;
      }
      
      .achievement {
        font-size: 20px;
        color: #666;
        margin-bottom: 15px;
      }
      
      .quiz-title {
        font-size: 28px;
        color: #22C55E;
        font-weight: 600;
        margin-bottom: 20px;
      }
      
      .score {
        font-size: 24px;
        color: #333;
        font-weight: 600;
        margin-bottom: 30px;
      }
      
      .details {
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
      }
      
      .detail-item {
        text-align: center;
      }
      
      .label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .value {
        font-size: 18px;
        color: #333;
        font-weight: 600;
      }
      
      .certificate-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .signature {
        text-align: center;
      }
      
      .signature-line {
        width: 200px;
        height: 2px;
        background: #333;
        margin-bottom: 10px;
      }
      
      .signature p {
        font-size: 16px;
        color: #666;
      }
      
      .certificate-id {
        font-size: 12px;
        color: #999;
        font-family: monospace;
      }
    `,
    requirements: {
      minScore: 70
    }
  },
  {
    name: 'Level Achievement Certificate',
    type: 'level_achievement',
    template: `
      <div class="certificate level-cert">
        <div class="certificate-header">
          <div class="logo">
            <img src="/logo.png" alt="EcoKids India" />
          </div>
          <h1>Level Achievement</h1>
        </div>
        
        <div class="certificate-body">
          <p class="awarded-to">Congratulations!</p>
          <h2 class="recipient-name">{{userName}}</h2>
          <p class="achievement">has reached</p>
          <h3 class="level-name">{{levelName}}</h3>
          <div class="level-icon">{{levelIcon}}</div>
          
          <div class="achievements">
            <div class="achievement-stat">
              <span class="number">{{ecoPoints}}</span>
              <span class="label">EcoPoints Earned</span>
            </div>
            <div class="achievement-stat">
              <span class="number">{{userLevel}}</span>
              <span class="label">Level Achieved</span>
            </div>
          </div>
        </div>
        
        <div class="certificate-footer">
          <div class="signature">
            <div class="signature-line"></div>
            <p>EcoKids India Team</p>
          </div>
          <div class="certificate-info">
            <p>{{issueDate}}</p>
            <p>Certificate ID: {{certificateId}}</p>
          </div>
        </div>
      </div>
    `,
    style: `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .level-cert {
        background: linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%);
        border: 8px solid #F59E0B;
      }
      
      .level-cert::before {
        background: linear-gradient(45deg, #F59E0B, #D97706, #B45309, #92400E);
      }
      
      .level-cert .certificate-header h1 {
        color: #D97706;
      }
      
      .level-cert .level-name {
        font-size: 32px;
        color: #B45309;
        font-weight: 700;
        margin-bottom: 20px;
      }
      
      .level-icon {
        font-size: 64px;
        margin: 20px 0;
      }
      
      .achievements {
        display: flex;
        justify-content: center;
        gap: 60px;
        margin: 30px 0;
      }
      
      .achievement-stat {
        text-align: center;
      }
      
      .achievement-stat .number {
        display: block;
        font-size: 36px;
        font-weight: 700;
        color: #B45309;
        margin-bottom: 8px;
      }
      
      .achievement-stat .label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `,
    requirements: {
      level: 3
    }
  }
];

const seedGamificationData = async () => {
  try {
    console.log('Seeding gamification data...');
    
    // Clear existing data
    await Badge.deleteMany({});
    await Level.deleteMany({});
    await CertificateTemplate.deleteMany({});
    
    // Insert badges
    console.log('Creating badges...');
    await Badge.insertMany(badges);
    console.log(`✅ Created ${badges.length} badges`);
    
    // Insert levels
    console.log('Creating levels...');
    await Level.insertMany(levels);
    console.log(`✅ Created ${levels.length} levels`);
    
    // Insert certificate templates
    console.log('Creating certificate templates...');
    await CertificateTemplate.insertMany(certificateTemplates);
    console.log(`✅ Created ${certificateTemplates.length} certificate templates`);
    
    console.log('✅ Gamification data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding gamification data:', error);
    throw error;
  }
};

module.exports = seedGamificationData;