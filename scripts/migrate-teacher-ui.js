const fs = require('fs');
const glob = require('fast-glob');
const path = require('path');

const rules = [
    // Backgrounds
    { from: /\bbg-white\b/g, to: 'bg-[var(--s1)]' },
    { from: /\bbg-gray-50\b|\bbg-slate-50\b|\bbg-gray-900\b|\bbg-slate-900\b/g, to: 'bg-[var(--bg)]' },
    { from: /\bbg-gray-100\b|\bbg-gray-200\b|\bbg-slate-100\b/g, to: 'bg-[var(--s2)]' },
    { from: /\bbg-gray-800\b|\bbg-slate-800\b/g, to: 'bg-[var(--s1)]' },
    { from: /hover:bg-gray-50|hover:bg-gray-100|hover:bg-slate-50/g, to: 'hover:bg-[var(--s2)]' },
    { from: /hover:bg-red-50/g, to: 'hover:bg-[rgba(255,68,68,.08)]' },

    // Text Colors
    { from: /\btext-white\b|\btext-gray-100\b|\btext-gray-200\b|\btext-gray-300\b|\btext-slate-700\b|\btext-slate-800\b|\btext-slate-900\b/g, to: 'text-[var(--t1)]' },
    { from: /\btext-gray-400\b|\btext-gray-500\b|\btext-gray-600\b|\btext-slate-400\b|\btext-slate-500\b|\btext-slate-600\b/g, to: 'text-[var(--t2)]' },
    { from: /\btext-gray-700\b|\btext-gray-800\b/g, to: 'text-[var(--t3)]' },

    // Borders
    { from: /\bborder-gray-100\b|\bborder-gray-200\b|\bborder-slate-100\b|\bborder-slate-200\b/g, to: 'border-[var(--b1)]' },
    { from: /\bborder-gray-300\b|\bborder-slate-300\b|\bborder-gray-700\b|\bborder-slate-700\b/g, to: 'border-[var(--b2)]' },
    { from: /\bdivide-gray-100\b|\bdivide-slate-100\b|\bdivide-gray-200\b|\bdivide-slate-200\b/g, to: 'divide-[var(--b1)]' },
    { from: /\bdivide-gray-300\b|\bdivide-slate-300\b/g, to: 'divide-[var(--b2)]' },
    { from: /\bborder-green-300\b/g, to: 'border-[var(--g1)]' },
    { from: /\bborder-red-200\b/g, to: 'border-[rgba(255,68,68,.3)]' },
    { from: /hover:border-red-300/g, to: 'hover:border-[rgba(255,68,68,.5)]' },
    { from: /\bring-green-50\b/g, to: 'ring-[rgba(0,255,136,.12)]' },

    // Shadows
    { from: /\bshadow-sm\b|\bshadow-md\b|\bshadow-lg\b|\bshadow-xl\b/g, to: '' },
    { from: /shadow-\[.*?\]/g, to: '' },

    // Fonts
    { from: /font-\['Inter'\]/g, to: 'font-ui' },
    { from: /Inter,\s*/g, to: '' },
    { from: /'Inter'/g, to: 'var(--font-ui)' },
    { from: /#ffffff\b|#fff\b/g, to: 'var(--t1)' },
];

(async () => {
    // Only target Teacher pages
    const files = await glob('client/src/pages/teacher/**/*.jsx', { absolute: true });

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');

        // Apply rules
        for (const rule of rules) {
            content = content.replace(rule.from, rule.to);
        }

        // Action buttons (Approval buttons)
        content = content.replace(/bg-green-600\s*hover:bg-green-700\s*text-\[var\(--t1\)\]/g, 'bg-[var(--g1)] hover:bg-[var(--g2)] text-[var(--bg)] font-bold');
        content = content.replace(/bg-red-100\s*hover:bg-red-200\s*border-\[rgba\(255,68,68,\.3\)\]/g, 'bg-[rgba(255,68,68,.08)] hover:bg-[rgba(255,68,68,.15)] border-[rgba(255,68,68,.3)]');
        content = content.replace(/text-red-700\s*hover:text-red-900/g, 'text-[var(--red)]');
        content = content.replace(/text-green-700\s*hover:text-green-900/g, 'text-[var(--bg)]');
        content = content.replace(/text-red-600/g, 'text-[var(--red)]');

        // Pagination buttons
        content = content.replace(/bg-\[var\(--s1\)\](\s*.*?)text-\[var\(--t1\)\]/g, 'bg-[var(--s2)]$1text-[var(--t1)]');

        // Table header
        content = content.replace(/bg-\[var\(--bg\)\]\s+text-\[var\(--t2\)\]/g, 'bg-[var(--s2)] text-[var(--t3)] uppercase tracking-wider font-mono');
        content = content.replace(/text-sm font-bold text-\[var\(--t1\)\] uppercase tracking-wide/g, 'text-sm font-bold text-[var(--t3)] font-mono uppercase tracking-wide');

        // Badges
        content = content.replace(/bg-yellow-100\s+text-yellow-800/g, 'bg-[rgba(255,215,0,.1)] text-[var(--amber)] border border-[rgba(255,215,0,.2)]');
        content = content.replace(/bg-green-100\s+text-green-800/g, 'bg-[rgba(0,255,136,.1)] text-[var(--g1)] border border-[rgba(0,255,136,.2)]');
        content = content.replace(/bg-red-100\s+text-red-800/g, 'bg-[rgba(255,68,68,.1)] text-[var(--red)] border border-[rgba(255,68,68,.2)]');

        // Standard Card Pattern Replacement (specifically the target ones that had shadow-sm early on)
        content = content.replace(/className="bg-\[var\(--s1\)\]\s+border\s+border-\[var\(--b1\)\]\s*(md:rounded-xl)?\s*(overflow-x-auto|overflow-hidden)[^"]*"/g,
            'className="bg-[var(--s1)] border border-[var(--b1)] rounded-xl relative overflow-hidden transition-all duration-200 hover:border-[var(--b2)]"');

        // Modal Shadow
        content = content.replace(/bg-\[var\(--s2\)\] rounded-xl\s+max-w-3xl/g, 'bg-[var(--s2)] rounded-xl border border-[var(--b2)] shadow-[0_0_60px_rgba(0,0,0,0.6)] max-w-3xl');

        fs.writeFileSync(file, content, 'utf8');
    }
    console.log('Done refactoring teacher UI files to dark tokens.');
})();
