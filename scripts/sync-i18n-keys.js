const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'client', 'src');
const localesDir = path.join(srcRoot, 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, acc);
      continue;
    }
    if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function get(obj, keyPath) {
  return keyPath.split('.').reduce((curr, segment) => {
    if (curr && typeof curr === 'object' && segment in curr) {
      return curr[segment];
    }
    return undefined;
  }, obj);
}

function set(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const seg = parts[i];
    if (!curr[seg] || typeof curr[seg] !== 'object' || Array.isArray(curr[seg])) {
      curr[seg] = {};
    }
    curr = curr[seg];
  }
  curr[parts[parts.length - 1]] = value;
}

function humanize(key) {
  const tail = key.split('.').pop() || key;
  const withSpaces = tail
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!withSpaces) return key;
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function collectUsedKeysAndDefaults(files) {
  const keyDefaults = new Map();

  const fallbackPattern = /\bt\(\s*['\"]([^'\"]+)['\"](?:\s*,\s*\{[^}]*\})?\s*\)\s*\|\|\s*(["'`])([\s\S]*?)\2/g;
  const defaultValuePattern = /\bt\(\s*['\"]([^'\"]+)['\"]\s*,\s*\{[^}]*defaultValue\s*:\s*(["'`])([\s\S]*?)\2[^}]*\}\s*\)/g;
  const barePattern = /\bt\(\s*['\"]([^'\"]+)['\"](?:\s*,\s*\{[^}]*\})?\s*\)/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    let match;
    while ((match = fallbackPattern.exec(content)) !== null) {
      const key = match[1];
      const fallbackText = match[3].trim();
      if (!keyDefaults.has(key) && fallbackText) {
        keyDefaults.set(key, fallbackText);
      }
    }

    while ((match = defaultValuePattern.exec(content)) !== null) {
      const key = match[1];
      const fallbackText = match[3].trim();
      if (!keyDefaults.has(key) && fallbackText) {
        keyDefaults.set(key, fallbackText);
      }
    }

    while ((match = barePattern.exec(content)) !== null) {
      const key = match[1];
      if (!keyDefaults.has(key)) {
        keyDefaults.set(key, humanize(key));
      }
    }
  }

  return keyDefaults;
}

function main() {
  const files = walk(srcRoot);
  const keyDefaults = collectUsedKeysAndDefaults(files);

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  let addedToEn = 0;

  for (const [key, defaultValue] of keyDefaults.entries()) {
    if (typeof get(en, key) === 'undefined') {
      set(en, key, defaultValue);
      addedToEn += 1;
    }
  }

  fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');

  const localeFiles = fs.readdirSync(localesDir).filter((name) => name.endsWith('.json') && name !== 'en.json');
  let propagated = 0;

  for (const fileName of localeFiles) {
    const localePath = path.join(localesDir, fileName);
    const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    let addedHere = 0;

    for (const [key] of keyDefaults.entries()) {
      if (typeof get(locale, key) === 'undefined') {
        set(locale, key, get(en, key));
        addedHere += 1;
      }
    }

    propagated += addedHere;
    fs.writeFileSync(localePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8');
    console.log(`Synced ${fileName}: +${addedHere} keys`);
  }

  console.log(`Added to en.json: ${addedToEn}`);
  console.log(`Total propagated keys: ${propagated}`);
}

main();
