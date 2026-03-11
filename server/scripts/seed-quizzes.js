require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecokids';

const quizSeeds = [
  {
    title: 'Water Conservation in India',
    description: 'Basics of saving water at home, school, and community level.',
    subject: 'EVS',
    grade: '6',
    difficulty: 'easy',
    category: 'water-conservation',
  },
  {
    title: 'Ganga River Pollution',
    description: 'Understanding causes, impacts, and prevention of river pollution.',
    subject: 'Science',
    grade: '8',
    difficulty: 'medium',
    category: 'water-conservation',
  },
  {
    title: 'Solar Energy Basics',
    description: 'Core concepts of solar power and clean energy usage.',
    subject: 'Science',
    grade: '7',
    difficulty: 'easy',
    category: 'renewable-energy',
  },
  {
    title: 'Biodiversity of Western Ghats',
    description: 'Species diversity and conservation in the Western Ghats.',
    subject: 'Biology',
    grade: '9',
    difficulty: 'hard',
    category: 'biodiversity',
  },
  {
    title: 'Plastic Waste Management',
    description: 'Segregation, recycling, and policy-level plastic management.',
    subject: 'EVS',
    grade: '6',
    difficulty: 'medium',
    category: 'waste-management',
  },
];

const mkQuestions = (title) => [
  {
    questionNumber: 1,
    questionText: `${title}: Which action best supports sustainability?`,
    questionType: 'multiple-choice',
    options: [
      { optionText: 'Ignoring resource use', isCorrect: false },
      { optionText: 'Reducing waste at source', isCorrect: true },
      { optionText: 'Burning all waste', isCorrect: false },
      { optionText: 'Using only single-use items', isCorrect: false },
    ],
    explanation: 'Reducing waste at source is one of the most effective sustainable strategies.',
    difficulty: 'easy',
  },
  {
    questionNumber: 2,
    questionText: `${title}: Which stakeholder has a role in environmental protection?`,
    questionType: 'multiple-choice',
    options: [
      { optionText: 'Only the government', isCorrect: false },
      { optionText: 'Only students', isCorrect: false },
      { optionText: 'Only industries', isCorrect: false },
      { optionText: 'Government, communities, and citizens', isCorrect: true },
    ],
    explanation: 'Environmental protection requires collaboration across all stakeholders.',
    difficulty: 'easy',
  },
  {
    questionNumber: 3,
    questionText: `${title}: Which is a measurable environmental indicator?`,
    questionType: 'multiple-choice',
    options: [
      { optionText: 'Air quality index', isCorrect: true },
      { optionText: 'Phone battery level', isCorrect: false },
      { optionText: 'Website clicks', isCorrect: false },
      { optionText: 'School bell timing', isCorrect: false },
    ],
    explanation: 'AQI is widely used to measure air quality health impact.',
    difficulty: 'medium',
  },
  {
    questionNumber: 4,
    questionText: `${title}: What does the 3R framework include?`,
    questionType: 'multiple-choice',
    options: [
      { optionText: 'Run, Rest, Repeat', isCorrect: false },
      { optionText: 'Reduce, Reuse, Recycle', isCorrect: true },
      { optionText: 'Read, Review, Rewrite', isCorrect: false },
      { optionText: 'Raise, Reach, React', isCorrect: false },
    ],
    explanation: '3R stands for Reduce, Reuse, Recycle.',
    difficulty: 'easy',
  },
  {
    questionNumber: 5,
    questionText: `${title}: Which long-term outcome is expected from good environmental practices?`,
    questionType: 'multiple-choice',
    options: [
      { optionText: 'Lower ecosystem resilience', isCorrect: false },
      { optionText: 'Healthier communities and habitats', isCorrect: true },
      { optionText: 'Higher pollution levels', isCorrect: false },
      { optionText: 'Fewer natural resources', isCorrect: false },
    ],
    explanation: 'Sustained good practices improve health and ecosystem resilience.',
    difficulty: 'medium',
  },
];

const ensureTopic = async (seed, authorId) => {
  let topic = await Topic.findOne({ title: seed.title });
  if (!topic) {
    topic = await Topic.create({
      title: seed.title,
      description: seed.description,
      content: `${seed.title} foundational content for Grade ${seed.grade}.`,
      category: seed.category,
      gradeLevel: [seed.grade],
      status: 'published',
      publishedAt: new Date(),
      author: authorId,
      tags: [seed.subject.toLowerCase(), 'quiz-seed'],
    });
  }
  return topic;
};

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    let author = await User.findOne({ role: 'admin' });
    if (!author) {
      author = await User.findOne({ role: 'school_admin' });
    }
    if (!author) {
      author = await User.create({
        name: 'Seed Admin',
        email: 'seed.admin@ecokids.in',
        password: 'SeedAdmin@123',
        role: 'admin',
      });
    }

    for (const seed of quizSeeds) {
      try {
        const exists = await Quiz.findOne({ title: seed.title });
        if (exists) {
          console.log(`SKIP: ${seed.title} (already exists)`);
          continue;
        }

        const topic = await ensureTopic(seed, author._id);
        await Quiz.create({
          title: seed.title,
          description: seed.description,
          topic: topic._id,
          category: seed.category,
          difficulty: seed.difficulty,
          gradeLevel: [seed.grade],
          status: 'published',
          publishedAt: new Date(),
          author: author._id,
          tags: [seed.subject.toLowerCase(), `grade-${seed.grade}`],
          questions: mkQuestions(seed.title),
        });

        console.log(`OK: ${seed.title}`);
      } catch (err) {
        console.error(`FAIL: ${seed.title} -> ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
