import { existsSync, readFileSync } from 'node:fs';

const baseRequiredFiles = [
  'AGENT.md',
  'VERIFY.md',
  'CODEX_GOAL.md',
  'docs/harness/config.md',
  'docs/harness/state.md',
  'docs/harness/contract.md',
  'docs/harness/instruction-integrity.md',
  'docs/harness/pipeline-log.md',
  'docs/harness/flutter-flame-harness-review.md',
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
let nextRole = null;
let countedRoundArtifacts = 0;

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

  const nextRoleMatch = state.match(/next_role:\s*([a-z_]+)/);
  nextRole = nextRoleMatch?.[1] ?? null;
  if (nextRole && !['generator', 'evaluator', 'visual_qa', 'human_approval', 'orchestrator', 'completed'].includes(nextRole)) {
    failures.push(`state has unknown next_role: ${nextRole}`);
  }

  const verdictMatch = state.match(/last_verdict:\s*([a-z_]+)/);
  lastVerdict = verdictMatch?.[1] ?? null;
  if (lastVerdict && !['pending', 'pass', 'fail', 'blocked'].includes(lastVerdict)) {
    failures.push(`state has invalid last_verdict: ${lastVerdict}`);
  }
}

if (currentRound) {
  const currentHandoff = `docs/harness/handoff/round-${currentRound}-gen.md`;
  const currentFeedback = `docs/harness/feedback/round-${currentRound}-qa.md`;

  if (nextRole === 'generator') {
    // A freshly opened generator round should not require its own handoff yet.
    if (currentRound > 1) {
      requireFile(`docs/harness/feedback/round-${currentRound - 1}-qa.md`);
      countedRoundArtifacts += 1;
    }
  } else if (nextRole === 'evaluator' || nextRole === 'visual_qa') {
    requireFile(currentHandoff);
    countedRoundArtifacts += 1;
  } else if (lastVerdict === 'pass' || lastVerdict === 'fail' || lastVerdict === 'blocked' || status === 'completed') {
    requireFile(currentHandoff);
    requireFile(currentFeedback);
    countedRoundArtifacts += 2;
  }
}

if (existsSync('docs/harness/contract.md')) {
  const contract = read('docs/harness/contract.md');
  for (const marker of [
    '## Status: ACTIVE',
    '## Mandatory Hard Gates',
    '## Functional Criteria',
    '## Visual QA Scorecard',
    'Instruction Integrity gate',
    'Generator Requirements',
    'Evaluator Requirements'
  ]) {
    if (!contract.includes(marker)) failures.push(`contract missing marker: ${marker}`);
  }
}

if (existsSync('docs/harness/instruction-integrity.md')) {
  const integrity = read('docs/harness/instruction-integrity.md');
  for (const marker of [
    '## Priority and Injection Defense',
    '## Required Worker Discipline',
    '## Evaluator Rejection Rules',
    '## Short Worker Checklist'
  ]) {
    if (!integrity.includes(marker)) failures.push(`instruction-integrity missing marker: ${marker}`);
  }
}

if (existsSync('VERIFY.md')) {
  const verify = read('VERIFY.md');
  if (!verify.includes('npm run verify:harness')) failures.push('VERIFY.md must include npm run verify:harness');
  if (!verify.includes('Browser smoke')) failures.push('VERIFY.md must include Browser smoke section');
  if (!verify.includes('Instruction Integrity gate')) failures.push('VERIFY.md must include Instruction Integrity gate section');
  if (!verify.includes('docs/harness/feedback/round-N-qa.md')) failures.push('VERIFY.md must require evaluator feedback output');
}

if (existsSync('CODEX_GOAL.md')) {
  const codexGoal = read('CODEX_GOAL.md');
  if (!codexGoal.includes('npm run verify:harness') && !codexGoal.includes('npm run verify')) {
    failures.push('CODEX_GOAL.md must include harness verification command');
  }
  if (!codexGoal.includes('Instruction Integrity Checklist')) failures.push('CODEX_GOAL.md must include Instruction Integrity Checklist');
  if (!codexGoal.includes('docs/harness/instruction-integrity.md')) failures.push('CODEX_GOAL.md must require instruction-integrity read');
}

if (existsSync('docs/agents/game-generator-agent.md')) {
  const generator = read('docs/agents/game-generator-agent.md');
  for (const file of ['docs/harness/config.md', 'docs/harness/state.md', 'docs/harness/contract.md', 'docs/harness/instruction-integrity.md']) {
    if (!generator.includes(file)) failures.push(`game-generator-agent missing required read: ${file}`);
  }
}

if (existsSync('docs/agents/game-evaluator-agent.md')) {
  const evaluator = read('docs/agents/game-evaluator-agent.md');
  if (!evaluator.includes('Instruction Integrity Rejection Rule')) failures.push('game-evaluator-agent missing Instruction Integrity Rejection Rule');
  if (!evaluator.includes('docs/harness/instruction-integrity.md')) failures.push('game-evaluator-agent missing instruction-integrity read');
}

if (existsSync('docs/agents/game-harness-orchestrator-agent.md')) {
  const orchestrator = read('docs/agents/game-harness-orchestrator-agent.md');
  if (!orchestrator.includes('docs/harness/instruction-integrity.md')) failures.push('game-harness-orchestrator-agent missing instruction-integrity input');
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

const checkedFiles = baseRequiredFiles.length + countedRoundArtifacts;
console.log(`harness-check passed: ${checkedFiles} required files, round ${currentRound ?? 'unknown'}, next_role ${nextRole ?? 'unknown'}, verdict ${lastVerdict ?? 'unknown'}, scripts/state/contract markers OK`);
