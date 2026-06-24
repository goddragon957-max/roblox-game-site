import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rel = (file) => path.join(root, file);
const read = (file) => (fs.existsSync(rel(file)) ? fs.readFileSync(rel(file), 'utf8') : '');
const walk = (dir) => {
  const full = rel(dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
};

const checks = [];
const fail = (name, detail) => checks.push({ ok: false, name, detail });
const pass = (name, detail) => checks.push({ ok: true, name, detail });

const files = [
  'README.md',
  'AGENT.md',
  'CODEX_GOAL.md',
  'VERIFY.md',
  'package.json',
  ...walk('src'),
  ...walk('scripts'),
].filter((file) => fs.existsSync(rel(file)));
const corpus = files.map((file) => `${file}\n${read(file)}`).join('\n\n');
const activeCodeFiles = [
  'package.json',
  ...walk('src'),
].filter((file) => fs.existsSync(rel(file)));
const activeCodeCorpus = activeCodeFiles.map((file) => `${file}\n${read(file)}`).join('\n\n');

const requiredQuestions = [
  'First 3 seconds: is the game genre obvious?',
  'Does the hero read as a cute playable character?',
  'Does the enemy read as an enemy?',
  'Does the stage read as a side-scrolling field?',
  'Does the UI read as a compact game HUD?',
  'Would a screenshot alone make someone want to play?',
];

const verify = read('VERIFY.md');
if (!verify) fail('VERIFY.md exists', 'missing VERIFY.md');
else {
  const missing = requiredQuestions.filter((q) => !verify.includes(q));
  if (missing.length) fail('VERIFY.md contains 2D first-3-seconds scorecard', `missing: ${missing.join('; ')}`);
  else pass('VERIFY.md contains 2D first-3-seconds scorecard', `${requiredQuestions.length} criteria present`);
}

const app = read('src/App.tsx');
if (app.includes('data-ui-pass="moonleaf-2d-action-rpg"')) {
  pass('current UI marker is moonleaf-2d-action-rpg', 'marker found in src/App.tsx');
} else {
  fail('current UI marker is moonleaf-2d-action-rpg', 'expected data-ui-pass="moonleaf-2d-action-rpg" in src/App.tsx');
}

const pixi = read('src/render/PixiGame.tsx');
if (pixi.includes('pixi.js') && pixi.includes('data-game-root="moonleaf-trail"') && pixi.includes('data-game-canvas')) {
  pass('Pixi 2D renderer markers exist', 'PixiGame imports pixi.js and exposes smoke-testable markers');
} else {
  fail('Pixi 2D renderer markers exist', 'expected PixiGame renderer, data-game-root, and data-game-canvas markers');
}

const simulation = read('src/game/simulation.ts');
const requiredGameplay = ['jump', 'attack', 'enemies', 'pickups', 'quest', 'respawn'];
const missingGameplay = requiredGameplay.filter((term) => !simulation.toLowerCase().includes(term));
if (missingGameplay.length) fail('2D action RPG gameplay markers exist', `missing: ${missingGameplay.join(', ')}`);
else pass('2D action RPG gameplay markers exist', requiredGameplay.join(', '));

if (/babylon|@babylonjs|blockhold|kenney|gltf|glb/i.test(activeCodeCorpus)) {
  fail('no obsolete 3D renderer/assets in active code', 'found Babylon/Blockhold/Kenney/GLB/GLTF reference in package or src');
} else {
  pass('no obsolete 3D renderer/assets in active code', 'package and src are 2D side-scroller focused');
}

const modelDir = rel('public/assets/models');
if (fs.existsSync(modelDir)) fail('obsolete 3D model assets removed', 'public/assets/models still exists');
else pass('obsolete 3D model assets removed', 'public/assets/models absent');

const manifest = read('public/assets/2d/manifest.json');
if (manifest.includes('original 2D side-scrolling action RPG')) pass('2D asset manifest generated', 'public/assets/2d/manifest.json present');
else fail('2D asset manifest generated', 'run npm run generate:assets');

console.log('\n2D Visual QA static gate');
console.log('========================');
for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name} - ${check.detail}`);
}

console.log('\nManual screenshot gate still required before shipping visual changes:');
for (const [index, question] of requiredQuestions.entries()) {
  console.log(`${index + 1}. ${question} (0-2)`);
}
console.log('\nHard fail: any 0. Minimum pass: all >=1 and total >=9/12. Ship target: total >=10/12 and screenshot desire >=2.');

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} visual QA static check(s) failed.`);
  process.exit(1);
}
console.log('\nAll static 2D visual QA checks passed.');
