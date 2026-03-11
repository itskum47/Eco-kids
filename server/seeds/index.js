// Master Seed Data File for EcoKids India Platform
// This file combines all educational content for the comprehensive environmental learning platform

import { topics } from './topics.js';
import { experiments } from './experiments.js';
import { quizzes, quizCategories } from './quizzes.js';
import { games, gameCategories } from './games.js';

// User roles and permissions
export const userRoles = [
  {
    id: 1,
    name: 'student',
    nameHi: 'छात्र',
    permissions: ['read_content', 'take_quizzes', 'play_games', 'track_progress'],
    description: 'Regular student with access to all educational content'
  },
  {
    id: 2,
    name: 'teacher',
    nameHi: 'शिक्षक',
    permissions: ['read_content', 'create_assignments', 'view_student_progress', 'manage_classroom'],
    description: 'Teacher with classroom management capabilities'
  },
  {
    id: 3,
    name: 'admin',
    nameHi: 'प्रशासक',
    permissions: ['all'],
    description: 'Full administrative access to the platform'
  }
];

// Sample users for demonstration
export const sampleUsers = [
  {
    id: 1,
    name: 'Arjun Sharma',
    email: 'arjun.student@ecokids.in',
    role: 'student',
    grade: 8,
    school: 'Delhi Public School, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    preferredLanguage: 'en',
    joinedAt: '2024-01-10T10:00:00Z',
    lastActive: '2024-01-15T16:30:00Z',
    achievements: ['first_quiz', 'eco_warrior'],
    totalPoints: 450,
    level: 3
  },
  {
    id: 2,
    name: 'प्रिया पटेल',
    email: 'priya.student@ecokids.in',
    role: 'student',
    grade: 10,
    school: 'Kendriya Vidyalaya, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    preferredLanguage: 'hi',
    joinedAt: '2024-01-12T14:20:00Z',
    lastActive: '2024-01-15T18:45:00Z',
    achievements: ['quiz_master', 'experiment_hero', 'conservation_champion'],
    totalPoints: 720,
    level: 5
  },
  {
    id: 3,
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.teacher@ecokids.in',
    role: 'teacher',
    subject: 'Environmental Science',
    school: 'St. Mary\'s School, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    preferredLanguage: 'en',
    joinedAt: '2024-01-05T09:00:00Z',
    lastActive: '2024-01-15T17:20:00Z',
    studentsManaged: 45,
    classroomsCreated: 3
  }
];

// Achievement system
export const achievements = [
  {
    id: 'first_quiz',
    name: 'Quiz Starter',
    nameHi: 'प्रश्नोत्तरी शुरुआतकर्ता',
    description: 'Complete your first quiz',
    descriptionHi: 'अपनी पहली प्रश्नोत्तरी पूरी करें',
    icon: '🏆',
    points: 50,
    rarity: 'common'
  },
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    nameHi: 'पर्यावरण योद्धा',
    description: 'Score 80%+ in 5 environmental quizzes',
    descriptionHi: '5 पर्यावरणीय प्रश्नोत्तरी में 80%+ स्कोर करें',
    icon: '🌱',
    points: 200,
    rarity: 'uncommon'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    nameHi: 'प्रश्नोत्तरी मास्टर',
    description: 'Complete 20 quizzes with average score 85%+',
    descriptionHi: '85%+ औसत स्कोर के साथ 20 प्रश्नोत्तरी पूरी करें',
    icon: '🧠',
    points: 500,
    rarity: 'rare'
  },
  {
    id: 'experiment_hero',
    name: 'Experiment Hero',
    nameHi: 'प्रयोग हीरो',
    description: 'Complete 10 hands-on experiments',
    descriptionHi: '10 व्यावहारिक प्रयोग पूरे करें',
    icon: '🔬',
    points: 300,
    rarity: 'uncommon'
  },
  {
    id: 'conservation_champion',
    name: 'Conservation Champion',
    nameHi: 'संरक्षण चैंपियन',
    description: 'Master all water conservation topics',
    descriptionHi: 'सभी जल संरक्षण विषयों में निपुणता प्राप्त करें',
    icon: '💧',
    points: 400,
    rarity: 'rare'
  }
];

// Learning paths for structured progression
export const learningPaths = [
  {
    id: 1,
    name: 'Water Conservation Journey',
    nameHi: 'जल संरक्षण यात्रा',
    description: 'Complete learning path about water conservation in India',
    descriptionHi: 'भारत में जल संरक्षण के बारे में पूर्ण शिक्षण पथ',
    category: 'water',
    difficulty: 'beginner',
    estimatedTime: 180, // minutes
    topics: [1], // Water Conservation in India
    experiments: [2], // Rainwater Harvesting Model
    quizzes: [1], // Water Conservation Quiz
    games: [2], // Water Wise City Planner
    prerequisites: [],
    learningObjectives: [
      'Understand water scarcity in India',
      'Learn traditional and modern conservation methods',
      'Design water-efficient systems',
      'Apply conservation techniques in daily life'
    ]
  },
  {
    id: 2,
    name: 'Renewable Energy Explorer',
    nameHi: 'नवीकरणीय ऊर्जा अन्वेषक',
    description: 'Explore solar and renewable energy technologies',
    descriptionHi: 'सौर और नवीकरणीय ऊर्जा प्रौद्योगिकियों का अन्वेषण करें',
    category: 'energy',
    difficulty: 'intermediate',
    estimatedTime: 240,
    topics: [2], // Solar Energy in India
    experiments: [1], // Solar Water Heater
    quizzes: [4], // Renewable Energy in India Quiz
    games: [4], // Solar System Engineer
    prerequisites: ['basic_physics'],
    learningObjectives: [
      'Understand solar energy principles',
      'Learn about India\'s renewable energy initiatives',
      'Design basic solar systems',
      'Calculate energy efficiency and savings'
    ]
  },
  {
    id: 3,
    name: 'Biodiversity Guardian',
    nameHi: 'जैव विविधता संरक्षक',
    description: 'Become a protector of India\'s rich biodiversity',
    descriptionHi: 'भारत की समृद्ध जैव विविधता के संरक्षक बनें',
    category: 'biodiversity',
    difficulty: 'intermediate',
    estimatedTime: 200,
    topics: [3], // Indian Wildlife and Biodiversity
    experiments: [],
    quizzes: [2], // Indian Wildlife and Biodiversity Quiz
    games: [1], // EcoChain - Food Web Builder
    prerequisites: [],
    learningObjectives: [
      'Understand ecosystem relationships',
      'Learn about endangered species conservation',
      'Explore India\'s national parks and sanctuaries',
      'Analyze impact of human activities on wildlife'
    ]
  }
];

// Platform statistics and metrics
export const platformStats = {
  totalUsers: 15420,
  totalStudents: 13500,
  totalTeachers: 1800,
  totalSchools: 450,
  totalContent: {
    topics: topics.length,
    experiments: experiments.length,
    quizzes: quizzes.length,
    games: games.length
  },
  monthlyActiveUsers: 8750,
  averageSessionTime: 25, // minutes
  totalQuizzesCompleted: 45230,
  totalExperimentsCompleted: 12340,
  totalGamesPlayed: 23450,
  topPerformingStates: [
    { state: 'Karnataka', users: 2100 },
    { state: 'Maharashtra', users: 1950 },
    { state: 'Tamil Nadu', users: 1800 },
    { state: 'Gujarat', users: 1650 },
    { state: 'Delhi', users: 1200 }
  ]
};

// Feedback and review system
export const sampleFeedback = [
  {
    id: 1,
    userId: 1,
    contentType: 'topic',
    contentId: 1,
    rating: 5,
    comment: 'Very informative content about water conservation! The examples from different Indian states were really helpful.',
    commentHi: 'जल संरक्षण के बारे में बहुत जानकारीपूर्ण सामग्री! विभिन्न भारतीय राज्यों के उदाहरण वास्तव में सहायक थे।',
    helpful: 23,
    createdAt: '2024-01-14T12:30:00Z'
  },
  {
    id: 2,
    userId: 2,
    contentType: 'experiment',
    contentId: 1,
    rating: 4,
    comment: 'The solar water heater experiment was great! I actually built one at home.',
    commentHi: 'सोलर वाटर हीटर का प्रयोग बहुत बढ़िया था! मैंने वास्तव में घर पर एक बनाया।',
    helpful: 31,
    createdAt: '2024-01-13T16:45:00Z'
  }
];

// Export all seed data
export const seedData = {
  // Educational Content
  topics,
  experiments,
  quizzes,
  quizCategories,
  games,
  gameCategories,
  
  // User System
  userRoles,
  sampleUsers,
  achievements,
  learningPaths,
  
  // Platform Data
  platformStats,
  sampleFeedback
};

// Database seeding functions
export const seedDatabase = async (db) => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await db.collection('topics').deleteMany({});
    await db.collection('experiments').deleteMany({});
    await db.collection('quizzes').deleteMany({});
    await db.collection('games').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('achievements').deleteMany({});
    await db.collection('learningPaths').deleteMany({});
    await db.collection('feedback').deleteMany({});
    
    // Insert educational content
    await db.collection('topics').insertMany(topics);
    console.log(`✅ Inserted ${topics.length} environmental topics`);
    
    await db.collection('experiments').insertMany(experiments);
    console.log(`✅ Inserted ${experiments.length} hands-on experiments`);
    
    await db.collection('quizzes').insertMany(quizzes);
    console.log(`✅ Inserted ${quizzes.length} environmental quizzes`);
    
    await db.collection('games').insertMany(games);
    console.log(`✅ Inserted ${games.length} educational games`);
    
    // Insert user system data
    await db.collection('users').insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);
    
    await db.collection('achievements').insertMany(achievements);
    console.log(`✅ Inserted ${achievements.length} achievements`);
    
    await db.collection('learningPaths').insertMany(learningPaths);
    console.log(`✅ Inserted ${learningPaths.length} learning paths`);
    
    await db.collection('feedback').insertMany(sampleFeedback);
    console.log(`✅ Inserted ${sampleFeedback.length} sample feedback entries`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded Content Summary:');
    console.log(`   📚 Topics: ${topics.length} comprehensive environmental topics`);
    console.log(`   🔬 Experiments: ${experiments.length} hands-on activities`);
    console.log(`   ❓ Quizzes: ${quizzes.length} knowledge assessments`);
    console.log(`   🎮 Games: ${games.length} interactive learning games`);
    console.log(`   👥 Users: ${sampleUsers.length} sample user accounts`);
    console.log(`   🏆 Achievements: ${achievements.length} gamification rewards`);
    console.log(`   🛤️  Learning Paths: ${learningPaths.length} structured curricula`);
    console.log('\n🌍 The EcoKids India platform is now ready with comprehensive environmental education content!');
    
    return {
      success: true,
      message: 'Database seeded successfully with comprehensive educational content',
      stats: {
        topics: topics.length,
        experiments: experiments.length,
        quizzes: quizzes.length,
        games: games.length,
        users: sampleUsers.length,
        achievements: achievements.length,
        learningPaths: learningPaths.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return {
      success: false,
      message: 'Failed to seed database',
      error: error.message
    };
  }
};

export default seedData;