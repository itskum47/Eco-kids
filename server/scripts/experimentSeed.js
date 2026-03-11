require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Experiment = require('../models/Experiment');
const User = require('../models/User');

const EXPERIMENTS = [
    {
        title: 'Seed Sprouting Race',
        description: 'Plant 3 seeds in different conditions (dark/light/no water) and observe for 7 days.',
        objective: 'Understand the basic requirements for seed germination.',
        category: 'environmental-science',
        difficulty: 'easy',
        estimatedTime: 15, // setup time mostly
        gradeLevel: ['1', '2', '3'],
        ecoPointsReward: 30,
        status: 'published',
        safety: { required: false, adultSupervision: false, warnings: [] },
        materials: [{ name: 'Mustard Seeds', quantity: '9' }, { name: 'Cotton Wool', quantity: '3 pieces' }, { name: 'Small Cups', quantity: '3' }],
        procedure: [
            { stepNumber: 1, title: 'Setup', instruction: 'Place cotton wool in 3 cups. Add 3 seeds to each.' },
            { stepNumber: 2, title: 'Conditions', instruction: 'Cup 1 gets light & water. Cup 2 gets light, no water. Cup 3 gets water, no light (inside a box).' }
        ]
    },
    {
        title: 'Natural Water Filter',
        description: 'Build a DIY water filter using sand, gravel, and cotton.',
        objective: 'Learn how layers of the earth act to filter groundwater naturally.',
        category: 'water-saving',
        difficulty: 'medium',
        estimatedTime: 40,
        gradeLevel: ['4', '5', '6'],
        ecoPointsReward: 45,
        status: 'published',
        safety: { required: true, adultSupervision: true, warnings: ['Do NOT drink the filtered water directly.'] },
        materials: [{ name: 'Empty plastic bottle cut in half', quantity: '1' }, { name: 'Sand', quantity: '1 cup' }, { name: 'Gravel', quantity: '1 cup' }, { name: 'Cotton', quantity: '1 wad' }],
        procedure: [
            { stepNumber: 1, title: 'Layering', instruction: 'Stuff cotton in the neck. Add a layer of sand, then gravel.' },
            { stepNumber: 2, title: 'Testing', instruction: 'Pour muddy water through the filter and observe the clarity of the water that drips out.' }
        ]
    },
    {
        title: 'Leaf Transpiration Bag',
        description: 'Tie a clear plastic bag around a living leaf to see plant "sweat".',
        objective: 'Observe how plants release water vapor back into the atmosphere.',
        category: 'environmental-science',
        difficulty: 'easy',
        estimatedTime: 10,
        gradeLevel: ['2', '3', '4', '5'],
        ecoPointsReward: 25,
        status: 'published',
        safety: { required: false, adultSupervision: false, warnings: [] },
        materials: [{ name: 'Clear plastic ziplock bag', quantity: '1' }, { name: 'Living potted plant or tree', quantity: '1' }, { name: 'String or rubber band', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Bagging', instruction: 'Place the bag over a leafy branch and secure it tightly. Leave in the sun for 2 hours.' }]
    },
    {
        title: 'Solar Oven Hot Dogs',
        description: 'Construct a simple solar oven out of a pizza box to cook a snack using only the sun.',
        objective: 'Demonstrate the power of concentrated solar thermal energy.',
        category: 'renewable-energy-experiment',
        difficulty: 'hard',
        estimatedTime: 60,
        gradeLevel: ['7', '8', '9'],
        ecoPointsReward: 60,
        status: 'published',
        safety: { required: true, adultSupervision: true, warnings: ['The oven interior can get hot.'] },
        materials: [{ name: 'Pizza box', quantity: '1' }, { name: 'Aluminum foil', quantity: '1 roll' }, { name: 'Plastic wrap', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Construction', instruction: 'Cut a flap in the lid and cover the inner side with foil. Cover the opening with plastic wrap to trap heat.' }]
    },
    {
        title: 'Mini Composter in a Bottle',
        description: 'Create a micro-composting environment in a clear 2-liter bottle to watch organic matter break down.',
        objective: 'Understand aerobic decomposition and nutrient cycling.',
        category: 'composting',
        difficulty: 'medium',
        estimatedTime: 30,
        gradeLevel: ['5', '6', '7'],
        ecoPointsReward: 40,
        status: 'published',
        safety: { required: false, adultSupervision: true, warnings: ['Wash hands thoroughly after handling soil.'] },
        materials: [{ name: '2-liter plastic bottle (top cut off)', quantity: '1' }, { name: 'Vegetable scraps (greens)', quantity: '1 cup' }, { name: 'Dried leaves/paper (browns)', quantity: '1 cup' }, { name: 'Garden soil', quantity: '1 cup' }],
        procedure: [{ stepNumber: 1, title: 'Layering', instruction: 'Alternate layers of soil, greens, and browns. Add a little water so it\'s damp like a sponge. Leave it by a window for weeks.' }]
    },
    {
        title: 'Testing Air Pollution Particles',
        description: 'Smear petroleum jelly on index cards and place them in different indoor and outdoor locations.',
        objective: 'Measure and compare particulate matter pollution in different environments.',
        category: 'air-quality-monitoring',
        difficulty: 'easy',
        estimatedTime: 20,
        gradeLevel: ['4', '5', '6', '7'],
        ecoPointsReward: 35,
        status: 'published',
        safety: { required: false, adultSupervision: false, warnings: [] },
        materials: [{ name: 'White index cards', quantity: '4' }, { name: 'Petroleum jelly (Vaseline)', quantity: '1 tub' }, { name: 'String', quantity: '4 pieces' }],
        procedure: [{ stepNumber: 1, title: 'Placement', instruction: 'Punch a hole in each card, smear jelly in a circle, and hang them in locations like near a road, in a park, and indoors.' }]
    },
    {
        title: 'Acid Rain on Statues',
        description: 'Place chalk in cups of vinegar and water to simulate the effects of acid rain on limestone buildings.',
        objective: 'Observe the chemical reaction between acids and calcium carbonate.',
        category: 'pollution-control',
        difficulty: 'medium',
        estimatedTime: 15,
        gradeLevel: ['6', '7', '8'],
        ecoPointsReward: 30,
        status: 'published',
        safety: { required: false, adultSupervision: false, warnings: [] },
        materials: [{ name: 'Chalk pieces', quantity: '2' }, { name: 'White vinegar', quantity: '1 cup' }, { name: 'Water', quantity: '1 cup' }],
        procedure: [{ stepNumber: 1, title: 'Submerge', instruction: 'Place one piece of chalk in water and one in vinegar. Observe the bubbling as the vinegar (acid) eats away the chalk.' }]
    },
    {
        title: 'Biodiversity Quadrat Survey',
        description: 'Use a 1x1 meter square to count plant and insect species in a local patch of grass.',
        objective: 'Learn basic field ecology techniques to measure species richness.',
        category: 'biodiversity-survey',
        difficulty: 'hard',
        estimatedTime: 45,
        gradeLevel: ['8', '9', '10', '11', '12'],
        ecoPointsReward: 50,
        status: 'published',
        safety: { required: true, adultSupervision: false, warnings: ['Watch out for biting insects.'], protectiveGear: ['Closed shoes'] },
        materials: [{ name: 'String', quantity: '4 meters' }, { name: 'Pegs/Sticks', quantity: '4' }, { name: 'Notebook', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Surveying', instruction: 'Stake out a 1x1 meter square. Carefully count and identify (or describe) every distinct plant and insect species found inside.' }]
    },
    {
        title: 'Turmeric pH Soil Test',
        description: 'Use a dissolved turmeric solution as a natural pH indicator to test if soil is acidic or alkaline.',
        objective: 'Understand soil chemistry using household items.',
        category: 'soil-analysis',
        difficulty: 'medium',
        estimatedTime: 30,
        gradeLevel: ['7', '8', '9', '10'],
        ecoPointsReward: 40,
        status: 'published',
        safety: { required: true, adultSupervision: true, warnings: ['Turmeric stains hands and clothes easily.'] },
        materials: [{ name: 'Turmeric powder', quantity: '1 spoon' }, { name: 'Rubbing alcohol', quantity: '1 cup' }, { name: 'Soil samples', quantity: '2' }],
        procedure: [{ stepNumber: 1, title: 'Reaction', instruction: 'Mix turmeric with alcohol to make yellow indicator liquid. Add to mud water. If it turns dark red/brown, the soil is highly alkaline.' }]
    },
    {
        title: 'DIY Wind Anemometer',
        description: 'Build a device using paper cups to measure wind speed.',
        objective: 'Understand how wind energy potential is measured.',
        category: 'renewable-energy-experiment',
        difficulty: 'medium',
        estimatedTime: 45,
        gradeLevel: ['5', '6', '7', '8'],
        ecoPointsReward: 45,
        status: 'published',
        safety: { required: false, adultSupervision: true, warnings: ['Care required when using pushpins.'] },
        materials: [{ name: 'Small paper cups', quantity: '4' }, { name: 'Straws', quantity: '2' }, { name: 'Pushpin', quantity: '1' }, { name: 'Pencil with eraser', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Assembly', instruction: 'Cross the straws and pin them to the eraser. Attach cups facing the same circular direction to catch the wind.' }]
    },
    {
        title: 'Upcycled Plastic Rope',
        description: 'Cut spent plastic bottles spirally to create surprisingly strong plastic string/rope.',
        objective: 'Demonstrate creative reuse and material strength of single-use plastics.',
        category: 'waste-recycling',
        difficulty: 'hard',
        estimatedTime: 30,
        gradeLevel: ['9', '10', '11', '12'],
        ecoPointsReward: 50,
        status: 'published',
        safety: { required: true, adultSupervision: true, warnings: ['Sharp scissors and sharp plastic edges can cut skin.'] },
        materials: [{ name: 'Smooth plastic bottle (PET)', quantity: '1' }, { name: 'Scissors or craft knife', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Cutting', instruction: 'Carefully start a cut at the base and cut in a continuous thin spiral all the way up the bottle.' }]
    },
    {
        title: 'Ocean Acidification Simulator',
        description: 'Blow carbon dioxide into a cup of water with a pH indicator (like red cabbage juice) to watch it turn more acidic.',
        objective: 'Model how CO2 emissions lower the pH of ocean water, threatening marine life.',
        category: 'pollution-control',
        difficulty: 'medium',
        estimatedTime: 25,
        gradeLevel: ['7', '8', '9', '10'],
        ecoPointsReward: 45,
        status: 'published',
        safety: { required: false, adultSupervision: false, warnings: [] },
        materials: [{ name: 'Red cabbage', quantity: '2 leaves' }, { name: 'Cup of water', quantity: '1' }, { name: 'Straw', quantity: '1' }],
        procedure: [{ stepNumber: 1, title: 'Extracting Indicator', instruction: 'Boil cabbage to get purple water.' }, { stepNumber: 2, title: 'Blowing CO2', instruction: 'Use the straw to blow exhaled CO2 gently into the water until the color shifts towards pink/red.' }]
    }
];

async function seedExperiments() {
    try {
        await connectDB();
        console.log('Connected to database.');

        let author = await User.findOne({ role: 'admin' });
        if (!author) {
            author = await User.findOne({});
        }

        if (!author) {
            author = await User.create({
                name: 'EcoSystem Admin',
                email: 'admin_exp@ecokids.in',
                password: 'Password123!',
                role: 'admin',
                isEmailVerified: true
            });
            console.log('Created dummy admin user for seeding.');
        }

        await Experiment.deleteMany({});
        console.log('Cleared existing experiments.');

        const expsWithAuthor = EXPERIMENTS.map(e => ({
            ...e,
            author: author._id,
            publishedAt: new Date()
        }));

        let createdCount = 0;
        for (const e of expsWithAuthor) {
            await Experiment.create(e);
            createdCount++;
        }
        console.log(`Successfully seeded ${createdCount} experiments!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding experiments:', err);
        process.exit(1);
    }
}

seedExperiments();
