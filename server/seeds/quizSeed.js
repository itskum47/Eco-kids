const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('../models/Quiz');

dotenv.config({ path: '../.env' });

const questionsPool = {
    1: {
        'waste-management': [
            { type: 'multiple-choice', q: 'Which bin is for paper?', o: ['Blue', 'Green', 'Red', 'Black'], a: 'Blue' },
            { type: 'true-false', q: 'Plastic bags are good for animals.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What should you do with an old toy?', o: ['Throw it away', 'Give it to a friend', 'Burn it', 'Bury it'], a: 'Give it to a friend' },
            { type: 'true-false', q: 'Apple cores can go in the green bin.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which is wet waste?', o: ['Banana peel', 'Plastic bottle', 'Glass jar', 'Cardboard'], a: 'Banana peel' },
            { type: 'true-false', q: 'Littering is okay if no one sees you.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What is recycling?', o: ['Making new things from old', 'Throwing things away', 'Burning trash', 'Hiding trash'], a: 'Making new things from old' },
            { type: 'true-false', q: 'Paper comes from trees.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which of these is recyclable?', o: ['News paper', 'Half-eaten sandwich', 'Used tissue', 'Broken glass'], a: 'News paper' },
            { type: 'true-false', q: 'Worms help turn food scraps into soil.', o: ['True', 'False'], a: 'True' }
        ],
        'water-conservation': [
            { type: 'multiple-choice', q: 'What should you do when brushing teeth?', o: ['Leave tap running', 'Turn tap off', 'Play with water', 'Use hot water'], a: 'Turn tap off' },
            { type: 'true-false', q: 'Plants need water to live.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Where do fishes live?', o: ['In trees', 'In water', 'In sand', 'In clouds'], a: 'In water' },
            { type: 'true-false', q: 'We can drink water from the ocean.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'Which is a way to save water?', o: ['Long showers', 'Fast showers', 'Leaving the hose on', 'Half-empty washing machine'], a: 'Fast showers' },
            { type: 'true-false', q: 'Leaking taps waste water.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What makes water dirty?', o: ['Fish swimming', 'Throwing garbage in it', 'Rocks', 'Sand'], a: 'Throwing garbage in it' },
            { type: 'true-false', q: 'Rain is a source of water.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'How can you collect rain?', o: ['In a bucket', 'In a net', 'With your hands', 'In a sieve'], a: 'In a bucket' },
            { type: 'true-false', q: 'All living things need water.', o: ['True', 'False'], a: 'True' }
        ],
        'renewable-energy': [
            { type: 'multiple-choice', q: 'What gives us heat and light during the day?', o: ['The Moon', 'The Sun', 'A Fire', 'A Torch'], a: 'The Sun' },
            { type: 'true-false', q: 'You should turn off lights when leaving a room.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which of these uses electricity?', o: ['A book', 'A TV', 'A ball', 'A bicycle'], a: 'A TV' },
            { type: 'true-false', q: 'Wind can make electricity.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'How can you keep cool without a fan?', o: ['Open a window', 'Turn on the heater', 'Wear heavy clothes', 'Run around'], a: 'Open a window' },
            { type: 'true-false', q: 'Leaving the fridge open wastes energy.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What energy powers a bicycle?', o: ['Electricity', 'Petrol', 'Your legs', 'Sunlight'], a: 'Your legs' },
            { type: 'true-false', q: 'Solar panels catch sunlight.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What should you do during the day?', o: ['Turn all lights on', 'Use natural sunlight', 'Keep curtains closed', 'Use a torch'], a: 'Use natural sunlight' },
            { type: 'true-false', q: 'Trees give us shade and make us cool.', o: ['True', 'False'], a: 'True' }
        ],
        'climate-change': [
            { type: 'multiple-choice', q: 'What do trees do for the air?', o: ['Make it dirty', 'Make it clean', 'Make it hot', 'Nothing'], a: 'Make it clean' },
            { type: 'true-false', q: 'Smoke from cars is bad for the air.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'How is the weather today if it is raining?', o: ['Sunny', 'Wet', 'Dry', 'Snowy'], a: 'Wet' },
            { type: 'true-false', q: 'Walking is better for the air than driving a car.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What should you wear when it is cold?', o: ['A swimsuit', 'A sweater', 'Shorts', 'Nothing'], a: 'A sweater' },
            { type: 'true-false', q: 'Flowers bloom in Spring.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Where do polar bears live?', o: ['In the hot desert', 'In the cold ice', 'In a jungle', 'In a city'], a: 'In the cold ice' },
            { type: 'true-false', q: 'Ice melts when it gets warm.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What helps plants grow?', o: ['Poison', 'Rain and Sun', 'Salt', 'Plastic'], a: 'Rain and Sun' },
            { type: 'true-false', q: 'Bicycles do not make smoke.', o: ['True', 'False'], a: 'True' }
        ],
        'biodiversity': [
            { type: 'multiple-choice', q: 'What is a baby dog called?', o: ['Kitten', 'Puppy', 'Cub', 'Calf'], a: 'Puppy' },
            { type: 'true-false', q: 'All birds can fly.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What do bees make that we eat?', o: ['Milk', 'Honey', 'Butter', 'Cheese'], a: 'Honey' },
            { type: 'true-false', q: 'Trees are homes for many birds and bugs.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What animal has a long trunk?', o: ['Lion', 'Elephant', 'Monkey', 'Snake'], a: 'Elephant' },
            { type: 'true-false', q: 'Fish breathe underwater.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What should you do if you see a bug?', o: ['Squish it', 'Leave it alone', 'Eat it', 'Yell'], a: 'Leave it alone' },
            { type: 'true-false', q: 'Frogs start as tadpoles.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which is a farm animal?', o: ['Tiger', 'Cow', 'Shark', 'Penguin'], a: 'Cow' },
            { type: 'true-false', q: 'Plants need bees to grow fruit.', o: ['True', 'False'], a: 'True' }
        ]
    },

    generic: {
        'waste-management': [
            { type: 'multiple-choice', q: 'What is composting?', o: ['Burning trash', 'Burying plastic', 'Nature\'s way of recycling organic matter', 'A type of factory'], a: 'Nature\'s way of recycling organic matter' },
            { type: 'true-false', q: 'Glass can be recycled indefinitely without losing quality.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What does the 3 Rs stand for?', o: ['Run, Read, Rest', 'Reduce, Reuse, Recycle', 'Right, Round, Real', 'Remove, Return, Resell'], a: 'Reduce, Reuse, Recycle' },
            { type: 'true-false', q: 'Styrofoam is easily recyclable in regular bins.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'E-waste stands for...', o: ['Electronic waste', 'Extra waste', 'Energy waste', 'Easy waste'], a: 'Electronic waste' },
            { type: 'true-false', q: 'Upcycling means reusing an object in a way that creates a product of higher value.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'How long does a plastic bottle take to decompose?', o: ['10 years', '50 years', '100 years', '450+ years'], a: '450+ years' },
            { type: 'true-false', q: 'You can compost meat and dairy products in a standard home compost.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What is a landfill?', o: ['A park', 'A place where trash is buried', 'A recycling center', 'A water treatment plant'], a: 'A place where trash is buried' },
            { type: 'true-false', q: 'Aluminum foil can be recycled if it is clean.', o: ['True', 'False'], a: 'True' }
        ],
        'water-conservation': [
            { type: 'multiple-choice', q: 'What percentage of Earth is covered in water?', o: ['50%', '60%', '71%', '90%'], a: '71%' },
            { type: 'true-false', q: 'Only 3% of Earth\'s water is fresh water.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is the water cycle?', o: ['A bicycle in the water', 'Continuous movement of water on Earth', 'How fish breathe', 'Tides moving in and out'], a: 'Continuous movement of water on Earth' },
            { type: 'true-false', q: 'Evaporation happens when water turns into gas.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is groundwater?', o: ['Water in rivers', 'Water stored beneath Earth\'s surface', 'Rain hitting the ground', 'Puddles'], a: 'Water stored beneath Earth\'s surface' },
            { type: 'true-false', q: 'Desalination removes salt from seawater.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which sector uses the most freshwater globally?', o: ['Agriculture', 'Industry', 'Domestic/Homes', 'Energy'], a: 'Agriculture' },
            { type: 'true-false', q: 'A dripping tap can waste thousands of liters a year.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is a watershed?', o: ['A shed full of water', 'An area of land that drains into a common water body', 'A water tower', 'A type of boat'], a: 'An area of land that drains into a common water body' },
            { type: 'true-false', q: 'Water expands when it freezes.', o: ['True', 'False'], a: 'True' }
        ],
        'renewable-energy': [
            { type: 'multiple-choice', q: 'Which of these is a fossil fuel?', o: ['Solar', 'Wind', 'Coal', 'Geothermal'], a: 'Coal' },
            { type: 'true-false', q: 'Renewable energy can be replenished naturally.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What converts sunlight directly into electricity?', o: ['Wind turbine', 'Solar panel', 'Geothermal plant', 'Hydroelectric dam'], a: 'Solar panel' },
            { type: 'true-false', q: 'Nuclear energy produces large amounts of greenhouse gases.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What is biomass energy?', o: ['Energy from atoms', 'Energy from moving water', 'Energy from organic matter', 'Energy from the sun'], a: 'Energy from organic matter' },
            { type: 'true-false', q: 'LED light bulbs use less energy than incandescent bulbs.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is energy efficiency?', o: ['Using more energy', 'Using less energy to perform the same task', 'Stopping all energy use', 'Making energy faster'], a: 'Using less energy to perform the same task' },
            { type: 'true-false', q: 'Fossil fuels took millions of years to form.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which country is the largest producer of wind energy?', o: ['USA', 'China', 'Germany', 'India'], a: 'China' },
            { type: 'true-false', q: 'A phantom load is energy used by electronics when they are turned off but plugged in.', o: ['True', 'False'], a: 'True' }
        ],
        'climate-change': [
            { type: 'multiple-choice', q: 'What is the greenhouse effect?', o: ['A way to grow tomatoes', 'Trapping of heat by Earth\'s atmosphere', 'A type of cloud', 'The moon\'s gravity'], a: 'Trapping of heat by Earth\'s atmosphere' },
            { type: 'true-false', q: 'Carbon dioxide is a greenhouse gas.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Which of these contributes to global warming?', o: ['Planting trees', 'Riding a bike', 'Burning fossil fuels', 'Using solar power'], a: 'Burning fossil fuels' },
            { type: 'true-false', q: 'Climate is the same as Weather.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What happens when ice caps melt?', o: ['Sea levels drop', 'Sea levels rise', 'Oceans freeze', 'Tsunamis happen constantly'], a: 'Sea levels rise' },
            { type: 'true-false', q: 'Deforestation increases the amount of CO2 in the air.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is your carbon footprint?', o: ['The size of your shoe in coal', 'The total amount of greenhouse gases you produce', 'A trail you leave in the snow', 'A type of fossil'], a: 'The total amount of greenhouse gases you produce' },
            { type: 'true-false', q: 'Methane is a more potent greenhouse gas than CO2.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What agreement aims to limit global temperature rise?', o: ['Kyoto Protocol', 'Paris Agreement', 'Geneva Convention', 'Tokyo Treaty'], a: 'Paris Agreement' },
            { type: 'true-false', q: 'Ocean acidification is caused by oceans absorbing too much CO2.', o: ['True', 'False'], a: 'True' }
        ],
        'biodiversity': [
            { type: 'multiple-choice', q: 'What is biodiversity?', o: ['A type of diet', 'The variety of life on Earth', 'A biology class', 'A type of zoo'], a: 'The variety of life on Earth' },
            { type: 'true-false', q: 'Extinction means a species is gone forever.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is a habitat?', o: ['A bad habit', 'A rabbit hole', 'The natural home of an animal or plant', 'A cage'], a: 'The natural home of an animal or plant' },
            { type: 'true-false', q: 'Invasive species can harm local ecosystems.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'Why are bees important?', o: ['They make noise', 'They pollinate plants', 'They stung people', 'They are yellow'], a: 'They pollinate plants' },
            { type: 'true-false', q: 'A keystone species has little effect on its environment.', o: ['True', 'False'], a: 'False' },
            { type: 'multiple-choice', q: 'What is the largest coral reef system?', o: ['Belize Barrier Reef', 'Great Barrier Reef', 'Red Sea Coral Reef', 'Florida Reef'], a: 'Great Barrier Reef' },
            { type: 'true-false', q: 'Deforestation destroys animal habitats.', o: ['True', 'False'], a: 'True' },
            { type: 'multiple-choice', q: 'What is poaching?', o: ['Cooking eggs', 'Legal hunting', 'Illegal hunting/capturing of animals', 'A team sport'], a: 'Illegal hunting/capturing of animals' },
            { type: 'true-false', q: 'Protecting one species can help protect an entire ecosystem.', o: ['True', 'False'], a: 'True' }
        ]
    }
};

const getQuestionText = (grade, qObj) => {
    if (grade <= 3) return qObj.q;
    if (grade <= 6) return "Consider this: " + qObj.q;
    if (grade <= 9) return "Analyze the following: " + qObj.q;
    return "Advanced Level: " + qObj.q;
};

const difficulties = {
    1: 'easy', 2: 'easy', 3: 'easy',
    4: 'medium', 5: 'medium', 6: 'medium', 7: 'medium',
    8: 'hard', 9: 'hard', 10: 'hard', 11: 'hard', 12: 'hard'
};

const formatTopicName = (categoryStr) => {
    return categoryStr.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
}

const generateQuizForGradeAndTopic = (grade, category, poolKey, dummyAuthorId, dummyTopicId) => {
    const baseQuestions = questionsPool[poolKey][category];

    const mappedQuestions = baseQuestions.map((qObj, index) => {
        let options = [];
        if (qObj.type === 'multiple-choice') {
            options = qObj.o.map(opt => ({
                optionText: opt,
                isCorrect: opt === qObj.a
            }));
        } else {
            options = [
                { optionText: 'True', isCorrect: 'True' === qObj.a },
                { optionText: 'False', isCorrect: 'False' === qObj.a }
            ];
        }

        return {
            questionNumber: index + 1,
            questionText: getQuestionText(grade, qObj),
            questionType: qObj.type,
            options: options,
            points: 10 + (grade * 2),
            correctAnswer: qObj.type === 'true-false' ? qObj.a : undefined
        };
    });

    const title = `Class ${grade} ${formatTopicName(category)} Challenge`;

    return {
        title: title,
        slug: generateSlug(title + ' ' + Math.random().toString(36).substring(7)),
        description: `A comprehensive test specifically curated for Class ${grade} students covering ${formatTopicName(category)}.`,
        topic: dummyTopicId,
        category: category,
        difficulty: difficulties[grade],
        timeLimit: 5 + Math.floor(grade / 2),
        gradeLevel: [grade.toString()],
        questions: mappedQuestions,
        scoring: {
            totalPoints: mappedQuestions.reduce((acc, q) => acc + q.points, 0),
            passingScore: 60
        },
        author: dummyAuthorId,
        status: 'published'
    };
};

const seedQuizzes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecokids');
        console.log('MongoDB connected. Clearing existing quizzes...');
        await Quiz.deleteMany({});

        // Create generic ObjectIds to satisfy constraints safely
        const dummyAuthorId = new mongoose.Types.ObjectId();
        const dummyTopicId = new mongoose.Types.ObjectId();

        const allQuizzes = [];
        const categories = ['waste-management', 'water-conservation', 'renewable-energy', 'climate-change', 'biodiversity'];

        for (let grade = 1; grade <= 12; grade++) {
            for (const category of categories) {
                const poolKey = grade === 1 ? 1 : 'generic';
                allQuizzes.push(generateQuizForGradeAndTopic(grade, category, poolKey, dummyAuthorId, dummyTopicId));
            }
        }

        console.log(`Prepared ${allQuizzes.length} quizzes. Inserting...`);

        // Insert in batches manually to trigger save hooks and avoid validation bypass issues where possible
        // Alternatively, using insertMany is fine since we passed unique slugs
        await Quiz.insertMany(allQuizzes);

        console.log('✅ Successfully seeded 60 Quizzes (5 per Grade 1-12) into the database!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding quizzes:', error);
        process.exit(1);
    }
};

seedQuizzes();
