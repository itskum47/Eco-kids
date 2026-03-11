require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const EnvironmentalLesson = require('../models/EnvironmentalLesson');
const User = require('../models/User');

const categories = ['climate', 'waste', 'water', 'biodiversity', 'energy', 'pollution'];

const lessonTemplates = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const category = categories[i % categories.length];
  return {
    title: `Environmental Lesson ${n}: ${category.toUpperCase()} Action Plan`,
    description: `Lesson ${n} introduces practical ${category} concepts for school-level implementation in India.`,
    category,
    difficulty: n % 3 === 0 ? 'intermediate' : 'beginner',
    nep2020Competencies: ['critical-thinking', 'environmental-awareness', 'community-participation'],
    ncertChapters: [`NCERT-EVS-${(n % 10) + 1}`],
    sdgGoals: [6, 11, 12, 13],
    ecoPointsReward: 40 + (n % 20),
    content: `Detailed content for lesson ${n}. Students learn context, activity flow, and impact measurement for ${category}.`,
    objectives: [
      `Understand foundational ${category} concepts`,
      'Complete one school/community action task',
      'Reflect on measurable environmental impact'
    ],
    tags: [category, 'india', 'school-activity'],
    isPublished: true
  };
});

async function seedLessons() {
  try {
    await connectDB();
    console.log('Connected to database.');

    let creator = await User.findOne({ role: 'admin' });
    if (!creator) creator = await User.findOne({ role: 'teacher' });
    if (!creator) creator = await User.findOne();

    if (!creator) {
      throw new Error('No user found to assign as lesson creator. Seed users first.');
    }

    await EnvironmentalLesson.deleteMany({ title: { $regex: '^Environmental Lesson ' } });

    const payload = lessonTemplates.map((l) => ({
      ...l,
      createdBy: creator._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await EnvironmentalLesson.insertMany(payload);
    console.log(`Seeded ${payload.length} environmental lessons.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding lessons:', error.message);
    process.exit(1);
  }
}

seedLessons();
