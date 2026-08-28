const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..', '..');
const localizationDir = path.join(repoRoot, 'src', 'localization', 'languages');
const translationsIndexPath = path.join(repoRoot, 'src', 'localization', 'index.ts');
const registryPath = path.join(repoRoot, 'src', 'domain', 'effects', 'registry.ts');
const outputDir = path.join(repoRoot, 'Swift_version', 'Corivo', 'Resources', 'Generated');

const categoryMap = {
  CELLULAR: 'cellular',
  TILING: 'tiling',
  DISTORTION: 'distortion',
  RELIEF: 'relief',
  GLITCH: 'glitch',
  STYLIZATION: 'stylization',
  BLUR_SHARPEN: 'blur-sharpen',
  BRUSH: 'brush',
  GLASS: 'glass',
  CORRECTION: 'correction',
  FREQUENCY: 'frequency',
  RENDER: 'render',
};

function evaluateObject(source, exportPattern) {
  const sanitized = source
    .replace(/^import .*$/gm, '')
    .replace(exportPattern, 'module.exports =');

  const context = {
    module: { exports: null },
    exports: {},
  };

  vm.createContext(context);
  vm.runInContext(sanitized, context, { timeout: 1000 });
  return context.module.exports;
}

function readLanguageNames() {
  const raw = fs.readFileSync(translationsIndexPath, 'utf8');
  const match = raw.match(/export const languageNames:[\s\S]*?=\s*(\{[\s\S]*?\n\});/);
  if (!match) {
    throw new Error('Could not parse languageNames');
  }
  return vm.runInNewContext(`(${match[1]})`, {}, { timeout: 1000 });
}

function loadTranslations() {
  const translations = {};
  const files = fs.readdirSync(localizationDir).filter(file => file.endsWith('.ts'));

  files.forEach(file => {
    const languageCode = path.basename(file, '.ts');
    const source = fs.readFileSync(path.join(localizationDir, file), 'utf8');
    translations[languageCode] = evaluateObject(
      source,
      /export const \w+\s*:\s*Translations\s*=/,
    );
  });

  return {
    languageNames: readLanguageNames(),
    translations,
  };
}

function loadEffects() {
  const raw = fs.readFileSync(registryPath, 'utf8');
  const start = raw.indexOf('export const EFFECTS: Effect[] = [');
  const end = raw.indexOf('\n];', start);

  if (start === -1 || end === -1) {
    throw new Error('Could not locate EFFECTS array');
  }

  let arraySource = raw.slice(start, end + 2);
  arraySource = arraySource
    .replace('export const EFFECTS: Effect[] =', 'module.exports =')
    .replace(/category:\s*EffectCategory\.([A-Z_]+)/g, (_, value) => {
      const mapped = categoryMap[value];
      if (!mapped) {
        throw new Error(`Unknown category: ${value}`);
      }
      return `category: '${mapped}'`;
    })
    .replace(
      /icon:\s*require\('\.\.\/\.\.\/assets\/(.+?)'\),/g,
      (_, assetPath) => `iconPath: '${assetPath}',`,
    );

  const context = {
    module: { exports: null },
    exports: {},
  };

  vm.createContext(context);
  vm.runInContext(arraySource, context, { timeout: 1000 });
  return context.module.exports;
}

function writeJSON(name, value) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, name),
    JSON.stringify(value, null, 2) + '\n',
  );
}

writeJSON('translations.json', loadTranslations());
writeJSON('effects.json', { effects: loadEffects() });

console.log('Generated metadata in', outputDir);
