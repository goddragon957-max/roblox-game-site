import { existsSync, readFileSync } from 'node:fs';

const baseRequiredFiles = [
  'AGENT.md',
  'VERIFY.md',
  'CODEX_GOAL.md',
  'docs/harness/config.md',
  'docs/harness/state.md',
  'docs/harness/contract.md',
  'docs/harness/pipeline-log.md',
  'docs/harness/gotchas/web-game-gotchas.md',
  'docs/harness/gotchas/orbit-bloom-gotchas.md',
  'docs/agents/game-harness-orchestrator-agent.md',
  'docs/agents/game-generator-agent.md',
  'docs/agents/game-evaluator-agent.md',
  'docs/agents/visual-qa-agent.md'
];

const failures = [];

function read(file) {
  return readFileSync(file, 'utf8');
}

function requireFile(file) {
  if (!existsSync(file)) failures.push(`missing required file: ${file}`);
}

for (const file of baseRequiredFiles) requireFile(file);

let currentRound = null;
let lastVerdict = null;
let status = null;

if (existsSync('docs/harness/state.md')) {
  const state = read('docs/harness/state.md');
  for (const marker of ['status:', 'current_phase:', 'current_round:', 'next_role:', 'last_verdict:']) {
    if (!state.includes(marker)) failures.push(`state missing key: ${marker}`);
  }

  const roundMatch = state.match(/current_round:\s*(\d+)/);
  currentRound = roundMatch ? Number(roundMatch[1]) : null;
  if (!Number.isInteger(currentRound) || currentRound < 1) failures.push('state current_round must be an integer >= 1');

  const statusMatch = state.match(/status:\s*([a-z_]+)/);
  status = statusMatch?.[1] ?? null;
  if (status && !['running', 'paused', 'completed'].includes(status)) failures.push(`state has invalid status: ${status}`);

  const verdictMatch = state.match(/last_verdict:\s*([a-z_]+)/);
  lastVerdict = verdictMatch?.[1] ?? null;
  if (lastVerdict && !['pending', 'pass', 'fail', 'blocked'].includes(lastVerdict)) {
    failures.push(`state has invalid last_verdict: ${lastVerdict}`);
  }
}

if (currentRound) {
  requireFile(`docs/harness/handoff/round-${currentRound}-gen.md`);
  if (lastVerdict === 'pass' || lastVerdict === 'fail' || lastVerdict === 'blocked') {
    requireFile(`docs/harness/feedback/round-${currentRound}-qa.md`);
  }
}

if (existsSync('docs/harness/contract.md')) {
  const contract = read('docs/harness/contract.md');
  for (const marker of [
    '## Status: ACTIVE',
    '## Mandatory Hard Gates',
    '## Functional Criteria',
    '## Visual QA Scorecard',
    'Generator Requirements',
    'Evaluator Requirements'
  ]) {
    if (!contract.includes(marker)) failures.push(`contract missing marker: ${marker}`);
  }
}

if (existsSync('VERIFY.md')) {
  const verify = read('VERIFY.md');
  if (!verify.includes('npm run verify:harness')) failures.push('VERIFY.md must include npm run verify:harness');
  if (!verify.includes('Browser smoke')) failures.push('VERIFY.md must include Browser smoke section');
  if (!verify.includes('docs/harness/feedback/round-N-qa.md')) failures.push('VERIFY.md must require evaluator feedback output');
}

if (existsSync('CODEX_GOAL.md')) {
  const codexGoal = read('CODEX_GOAL.md');
  if (!codexGoal.includes('npm run verify:harness') && !codexGoal.includes('npm run verify')) {
    failures.push('CODEX_GOAL.md must include harness verification command');
  }
}

if (existsSync('docs/agents/game-generator-agent.md')) {
  const generator = read('docs/agents/game-generator-agent.md');
  for (const file of ['docs/harness/config.md', 'docs/harness/state.md', 'docs/harness/contract.md']) {
    if (!generator.includes(file)) failures.push(`game-generator-agent missing required read: ${file}`);
  }
}

if (existsSync('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  const scripts = pkg.scripts || {};
  for (const script of ['test', 'lint', 'build', 'verify:harness', 'verify']) {
    if (!scripts[script]) failures.push(`package.json missing script: ${script}`);
  }
  const verifyScript = scripts.verify || '';
  for (const command of ['verify:harness', 'test', 'lint', 'build']) {
    if (!verifyScript.includes(command)) failures.push(`package.json verify script must include: ${command}`);
  }
}

if (existsSync('AGENT.md')) {
  const agent = read('AGENT.md');
  if (!agent.includes('Harness Operating Contract')) failures.push('AGENT.md missing Harness Operating Contract section');
}

if (failures.length) {
  console.error('harness-check failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const checkedFiles = baseRequiredFiles.length + (currentRound ? (lastVerdict === 'pending' ? 1 : 2) : 0);
console.log(`harness-check passed: ${checkedFiles} required files, round ${currentRound ?? 'unknown'}, verdict ${lastVerdict ?? 'unknown'}, scripts/state/contract markers OK`);
