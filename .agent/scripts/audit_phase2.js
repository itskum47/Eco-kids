const fs = require('fs');
const glob = require('fast-glob');

async function runPhase2Audit() {
    const files = await glob(['client/src/**/*.jsx', 'client/src/**/*.js', 'client/src/**/*.css'], { ignore: ['**/node_modules/**'] });

    let fontViolations = [];
    let whiteViolations = [];
    let grayViolations = [];
    let accessibilityViolations = []; // e.g. onClick on non-interactive elements without keyboard handlers

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const num = index + 1;
            // Check old fonts
            if (/Inter|Roboto|Arial|system-ui/.test(line) && !line.includes('eslint')) {
                fontViolations.push(`${file}:${num}`);
            }

            // Check white backgrounds
            if (/(bg-white|text-white|#fff\b|#ffffff)/i.test(line)) {
                // Ignore tokens.css or index.css definitions if they are setting up variables, but log for components
                if (!file.endsWith('tokens.css') && !file.endsWith('index.css')) {
                    whiteViolations.push(`${file}:${num}`);
                }
            }

            // Check legacy gray/slate
            if (/(bg-gray-|text-gray-|bg-slate-)/.test(line)) {
                if (!file.endsWith('tokens.css') && !file.endsWith('index.css')) {
                    grayViolations.push(`${file}:${num}`);
                }
            }

            // Accessibility: onClick div without role or tabIndex
            if (line.includes('onClick=') && /<div|<span/.test(line) && !line.includes('role=') && !line.includes('tabIndex=')) {
                accessibilityViolations.push(`${file}:${num}`);
            }
        });
    }

    console.log('--- PHASE 2 AUDIT RESULTS ---');
    console.log(`Font Violations (Inter, Roboto, Arial): ${fontViolations.length}`);
    console.log(`White Color Violations (bg-white, text-white, #fff): ${whiteViolations.length}`);
    console.log(`Gray/Slate Color Violations (bg-gray-, bg-slate-): ${grayViolations.length}`);
    console.log(`Accessibility Interactive Divs/Spans without role/tabIndex: ${accessibilityViolations.length}`);

    fs.writeFileSync('.agent/scripts/phase2_results.json', JSON.stringify({
        fonts: fontViolations.length,
        white: whiteViolations.length,
        gray: grayViolations.length,
        accessibility: accessibilityViolations.length
    }, null, 2));
}

runPhase2Audit().catch(console.error);
