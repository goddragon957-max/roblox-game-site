import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rel = (file) => path.join(root, file);
const read = (file) => fs.existsSync(rel(file)) ? fs.readFileSync(rel(file), 'utf8') : '';

const checks = [];
const fail = (name, detail) => checks.push({ ok: false, name, detail });
const pass = (name, detail) => checks.push({ ok: true, name, detail });

const verify = read('VERIFY.md');
const app = read('src/App.tsx');
const css = read('src/styles.css');
const scene = read('src/render/BlockholdScene.tsx');
const agent = read('docs/agents/visual-qa-agent.md');

const requiredQuestions = [
  'First 3 seconds: is the game genre obvious?',
  'Does the character read as a character?',
  'Does the enemy read as an enemy?',
  'Does the map read as a board/stage?',
  'Does the UI read as a game HUD?',
  'Would a screenshot alone make someone want to play?',
];

if (!verify) fail('VERIFY.md exists', 'missing VERIFY.md');
else {
  const missing = requiredQuestions.filter((q) => !verify.includes(q));
  if (missing.length) fail('VERIFY.md contains first-3-seconds scorecard', `missing: ${missing.join('; ')}`);
  else pass('VERIFY.md contains first-3-seconds scorecard', `${requiredQuestions.length} criteria present`);
}

if (!agent) fail('visual QA agent prompt exists', 'missing docs/agents/visual-qa-agent.md');
else pass('visual QA agent prompt exists', 'docs/agents/visual-qa-agent.md');

if (app.includes('data-ui-pass="toon-gltf-boardgame"')) pass('current UI marker is toon-gltf-boardgame', 'marker found in src/App.tsx');
else fail('current UI marker is toon-gltf-boardgame', 'expected data-ui-pass="toon-gltf-boardgame" in src/App.tsx');

if (/image-rendering\s*:\s*(pixelated|crisp-edges)/i.test(css)) {
  fail('no pixelated/crisp canvas styling', 'src/styles.css still contains image-rendering: pixelated/crisp-edges');
} else {
  pass('no pixelated/crisp canvas styling', 'no forbidden image-rendering values found');
}

if (/setHardwareScalingLevel\s*\(\s*(2|2\.\d+|3|3\.\d+)\s*\)/.test(scene)) {
  fail('no forced low-res hardware scaling', 'scene contains high hardwareScalingLevel downscale');
} else {
  pass('no forced low-res hardware scaling', 'no forbidden low-res hardware scaling found');
}

const modelFiles = [
  'public/assets/models/puppy_guard.glb',
  'public/assets/models/blob_grunt.glb',
  'public/assets/models/blob_runner.glb',
  'public/assets/models/blob_brute.glb',
  'public/assets/models/pup_tower.glb',
  'public/assets/models/crystal_core.glb',
];
const missingModels = [];
const tinyModels = [];
for (const file of modelFiles) {
  const full = rel(file);
  if (!fs.existsSync(full)) missingModels.push(file);
  else if (fs.statSync(full).size < 1024) tinyModels.push(`${file} (${fs.statSync(full).size} bytes)`);
}
if (missingModels.length || tinyModels.length) {
  fail('required GLB assets exist and are non-empty', [
    missingModels.length ? `missing: ${missingModels.join(', ')}` : '',
    tinyModels.length ? `too small: ${tinyModels.join(', ')}` : '',
  ].filter(Boolean).join(' | '));
} else {
  pass('required GLB assets exist and are non-empty', `${modelFiles.length} files present`);
}

console.log('\nVisual QA static gate');
console.log('======================');
for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name} — ${check.detail}`);
}

console.log('\nManual screenshot gate still required before shipping visual changes:');
for (const [index, question] of requiredQuestions.entries()) {
  console.log(`${index + 1}. ${question} (0–2)`);
}
console.log('\nHard fail: any 0. Minimum pass: all >=1 and total >=9/12. Ship target: total >=10/12 and screenshot desire >=2.');

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} visual QA static check(s) failed.`);
  process.exit(1);
}
console.log('\nAll static visual QA checks passed.');
