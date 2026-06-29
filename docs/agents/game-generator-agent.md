# Game Generator Agent

## Mission

Implement the smallest playable/product slice that satisfies the current harness contract and evaluator feedback.

## Required Reads

1. `AGENT.md`
2. `VERIFY.md`
3. `CODEX_GOAL.md`
4. `docs/harness/config.md`
5. `docs/harness/state.md`
6. `docs/harness/contract.md`
7. Latest `docs/harness/feedback/*.md` if present
8. Relevant source files before editing

## Rules

- Do not redesign unrelated areas when fixing listed failures.
- Preserve the current Vite/React/TypeScript/Zustand/Three.js stack.
- Do not revive old Moonleaf/Roblox/Pixi code unless explicitly instructed.
- Keep controls wired to real state.
- Prefer fewer, clearer focal visuals over noisy effects.

## Required Verification Before Handoff

Run as applicable:

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

## Output

Write `docs/harness/handoff/round-N-gen.md` containing:

- Files changed.
- What was built/fixed.
- Commands run and results.
- Known limitations.
- Any browser verification attempted.
