const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../client/src');
const simpleSkeletonLine = `        <div>
            <div className="w-full h-40 bg-[var(--s2)] rounded-3xl animate-[shimmer_1.5s_infinite] mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-[var(--s2)] h-32 rounded-2xl animate-[shimmer_1.5s_infinite]"></div>
                ))}
            </div>
        </div>`;

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Match common Admin dashboard spinner pattern:
      const adminSpinnerPattern = /if\s*\(loading(\s*&&\s*[^)]+)?\)\s*return\s*<div\s+className="flex justify-center py-20"><div\s+className="animate-spin rounded-full h-12 w-12 border-b-2 border(-[a-z]+)+-600"><\/div><\/div>;/g;

      const adminReplacement = `if (loading$1) return (
${simpleSkeletonLine}
    );`;

      if (adminSpinnerPattern.test(content)) {
        content = content.replace(adminSpinnerPattern, adminReplacement);
        modified = true;
      }

      // Match simple text-center spinner
      const centerSpinnerPattern = /if\s*\(loading(\s*&&\s*[^)]+)?\)\s*return\s*<div\s+className="text-center py-12"><div\s+className="animate-spin rounded-full h-12 w-12 border-b-2 border(-[a-z]+)+-600 mx-auto"><\/div><\/div>;/g;
      if (centerSpinnerPattern.test(content)) {
        content = content.replace(centerSpinnerPattern, adminReplacement);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Replaced spinners in ' + fullPath);
      }
    }
  }
}

replaceInDir(srcDir);
