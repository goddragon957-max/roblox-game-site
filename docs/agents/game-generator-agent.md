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
7. `docs/harness/flutter-flame-harness-review.md`
8. `docs/harness/gotchas/web-game-gotchas.md`
9. `docs/harness/gotchas/orbit-bloom-gotchas.md`
10. Latest `docs/harness/feedback/*.md` if present
11. Relevant source files before editing

## Rules

- Do not redesign unrelated areas when fixing listed failures.
- Preserve the current Vite/React/TypeScript/Zustand/Three.js stack.
- Do not revive old Moonleaf/Roblox/Pixi code unless explicitly instructed.
- Keep controls wired to real state.
- Prefer fewer, clearer focal visuals over noisy effects.
- Treat screenshot/readability as a hard product gate, not polish.
- Procedural visuals must look intentional; invisible/dim/off-camera 3D objects count as visual failures.

## Current Round 2 Focus

The current generator round is **visual-first**:

```text
Make the first screen clearly show a cosmic reward world where focus creates planets/moons.
```

Prioritize:

1. visible central planet/rings in initial viewport;
2. progress-reactive scene energy;
3. obvious birth/reward event;
4. screenshot desirability;
5. no new product scope beyond this visual/reward slice.

## Required Verification Before Handoff

Run as applicable:

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

If visual behavior changed, start a strict-port dev/preview server and capture browser evidence for the evaluator.

## Output

Write `docs/harness/handoff/round-N-gen.md` containing:

- Files changed.
- What was built/fixed.
- Commands run and results.
- Known limitations.
- Browser verification attempted.
- Screenshot/visual notes if generated.
