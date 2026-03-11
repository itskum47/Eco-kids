const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../controllers');

function scanDirectory(directory) {
    let issues = 0;
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            issues += scanDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Simple regex check for .find( but lacking .limit or paginate(
                if (line.includes('.find(') && !line.includes('.limit') && !line.includes('paginate(')) {
                    // If the next line has .limit, it's fine (simple multi-line check)
                    const nextLines = lines.slice(index, index + 3).join(' ');
                    if (!nextLines.includes('.limit')) {
                        console.log(`Potential unbounded query in ${file}:${index + 1} - ${line.trim()}`);
                        issues++;
                    }
                }
            });
        }
    }
    return issues;
}

const totalIssues = scanDirectory(controllersDir);

if (totalIssues > 0) {
    console.log(`\n❌ Found ${totalIssues} potential unbounded queries without .limit()`);
    process.exit(1);
} else {
    console.log(`\n✅ 0 unbounded queries found`);
}
