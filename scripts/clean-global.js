const fs = require('fs');
const glob = require('fast-glob');
const path = require('path');

(async () => {
    console.log("Starting global cleanup for bg-white, Inter, and #fff...");
    const files = await glob(['client/src/**/*.js', 'client/src/**/*.jsx'], {
        absolute: true,
        ignore: ['**/node_modules/**']
    });
    let changedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let orig = content;

        content = content.replace(/\bbg-white\b/g, 'bg-[var(--s1)]');
        content = content.replace(/font-\['Inter'\]/g, 'font-ui');
        content = content.replace(/Inter,\s*/g, '');
        content = content.replace(/'Inter'/g, 'var(--font-ui)');
        // target specifically exact hardcoded white colors
        content = content.replace(/#ffffff\b/gi, 'var(--t1)');
        content = content.replace(/#fff\b/gi, 'var(--t1)');

        if (content !== orig) {
            fs.writeFileSync(file, content, 'utf8');
            changedCount++;
        }
    }
    console.log(`Successfully removed global remaining violations in ${changedCount} files.`);
})();
