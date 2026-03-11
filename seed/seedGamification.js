const { Badge, Level, CertificateTemplate } = require('../models/Gamification');

const badges = [
  // Achievement Badges
  {
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🌱',
    color: '#10B981',
    category: 'achievement',
    criteria: {
      type: 'quizzes',
      value: 1,
      timeframe: 'all-time'
    },
    rarity: 'common',
    points: 50
  },
  {
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🧠',
    color: '#3B82F6',
    category: 'achievement',
    criteria: {
      type: 'quizzes',
      value: 10,
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 200
  },
  {
    name: 'Game Explorer',
    description: 'Play 5 different games',
    icon: '🎮',
    color: '#8B5CF6',
    category: 'achievement',
    criteria: {
      type: 'games',
      value: 5,
      timeframe: 'all-time'
    },
    rarity: 'common',
    points: 100
  },
  {
    name: 'Eco Scientist',
    description: 'Complete 3 experiments',
    icon: '🧪',
    color: '#F59E0B',
    category: 'achievement',
    criteria: {
      type: 'experiments',
      value: 3,
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 150
  },
  
  // Milestone Badges
  {
    name: 'EcoPoints Champion',
    description: 'Earn 1000 EcoPoints',
    icon: '⭐',
    color: '#F59E0B',
    category: 'milestone',
    criteria: {
      type: 'points',
      value: 1000,
      timeframe: 'all-time'
    },
    rarity: 'epic',
    points: 250
  },
  {
    name: 'EcoPoints Legend',
    description: 'Earn 5000 EcoPoints',
    icon: '💎',
    color: '#6366F1',
    category: 'milestone',
    criteria: {
      type: 'points',
      value: 5000,
      timeframe: 'all-time'
    },
    rarity: 'legendary',
    points: 500
  },
  
  // Streak Badges
  {
    name: 'Consistent Learner',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    color: '#EF4444',
    category: 'achievement',
    criteria: {
      type: 'streak',
      value: 7,
      timeframe: 'all-time'
    },
    rarity: 'rare',
    points: 200
  },
  {
    name: 'Dedication Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🏆',
    color: '#DC2626',
    category: 'achievement',
    criteria: {
      type: 'streak',
      value: 30,
      timeframe: 'all-time'
    },
    rarity: 'legendary',
    points: 1000
  },
  
  // Special Badges
  {
    name: 'Early Bird',
    description: 'Join EcoKids India in its first month',
    icon: '🐦',
    color: '#06B6D4',
    category: 'special',
    criteria: {
      type: 'special',
      value: 1,
      timeframe: 'all-time'
    },
    rarity: 'epic',
    points: 300
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete activities on 4 consecutive weekends',
    icon: '⚔️',
    color: '#7C3AED',
    category: 'special',
    criteria: {
      type: 'special',
      value: 4,
      timeframe: 'monthly'
    },
    rarity: 'rare',
    points: 150
  },
  
  // Seasonal Badges
  {
    name: 'Earth Day Champion',
    description: 'Complete special Earth Day activities',
    icon: '🌍',
    color: '#059669',
    category: 'seasonal',
    criteria: {
      type: 'special',
      value: 1,
      timeframe: 'all-time'
    },
    rarity: 'epic',
    points: 400
  },
  {
    name: 'World Environment Day Hero',
    description: 'Participate in World Environment Day events',
    icon: '🌿',
    color: '#16A34A',
    category: 'seasonal',
    criteria: {
      type: 'special',
      value: 1,
      timeframe: 'all-time'
    },
    rarity: 'epic',
    points: 400
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