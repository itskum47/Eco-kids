const { execSync } = require('child_process');
const path = require('path');

console.log('--- Starting Content Seeding ---');

const scripts = [
    'topicSeed.js',
    'gameSeed.js',
    'experimentSeed.js',
    'seedLessons.js',
    'quizSeed.js'
];

for (const script of scripts) {
    try {
        console.log(`Running ${script}...`);
        const output = execSync(`node "${path.join(__dirname, script)}"`, { encoding: 'utf-8' });
        console.log(output);
    } catch (err) {
        console.error(`Error running ${script}:`, err.stdout || err.message);
    }
}

console.log('--- Finished Content Seeding ---');
