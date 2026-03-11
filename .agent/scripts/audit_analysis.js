const fs = require('fs');

async function checkEmptyLimitFinds() {
    const glob = require('fast-glob');
    const files = await glob('server/controllers/**/*.js');

    let unbounded = [];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            if (line.includes('.find(') && !line.includes('.limit(') && !line.includes('.countDocuments(')) {
                unbounded.push(`${file}:${index + 1} - ${line.trim()}`);
            }
        });
    }

    fs.writeFileSync('server/unbounded_queries.txt', unbounded.join('\n'));
    console.log(`Found ${unbounded.length} potentially unbounded queries.`);
}

checkEmptyLimitFinds();
