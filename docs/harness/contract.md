# Harness Contract — Orbit Bloom

## Purpose

Orbit Bloom is treated as a game-like interactive prototype: focus time creates visible cosmic rewards. The harness exists to prevent vague AI game work from shipping as an unverified UI shell.

## Status: ACTIVE

This contract is active for every future generator/evaluator loop unless explicitly superseded.

## Reference Harness Source

This repo adopts the process lessons from the GeekNews 30918 / `flutter-flame-harness` review, not its Flutter-specific stack.

Adopted principles:

- contract before code;
- generator/evaluator separation;
- file-based handoff and feedback;
- “run the app, see the app, then judge”;
- gotcha capture;
- human approval before destructive/external actions.

## Mandatory Hard Gates

A FAIL on any hard gate prevents the round from being called verified.

1. `npm run verify:harness` exits 0.
2. `npm run test` exits 0.
3. `npm run lint` exits 0.
4. `npm run build` exits 0.
5. Active source does not revive Moonleaf/Roblox/Pixi code unless the user explicitly requests restoring the backup tag.
6. No TODO/stub/placeholder appears in active gameplay/product logic unless documented as a known limitation in the handoff.
7. Browser loads the app with `data-ui-pass="orbit-bloom-focus-app"` present.
8. Three.js canvas exists and `window.__orbitBloomScene.ready === true`.
9. At least one real interaction changes state: Start Focus changes focus/progress and Add Focus can increase progress or births/moons.
10. Browser console has zero fatal JavaScript errors.
11. Visual QA scorecard has no zeroes.
12. Screenshot or equivalent browser-rendered visual evidence is required for visual PASS. DOM snapshots alone are insufficient.
13. Human approval is required before external deploy/push direction changes that replace the current product.

## Functional Criteria

Baseline criteria:

- The first screen reads as a premium mobile focus app within three seconds.
- The space/planet/galaxy reward loop is visually obvious.
- Focus progress is stateful, not decorative.
- Completing focus progress births or adds a planet/moon/reward in app state.
- HUD and controls feel like a game/app experience, not a generic dashboard slab.
- The app keeps the existing Vite/React/TypeScript/Zustand/Three.js stack unless a new contract is written.

Round 2 active criteria:

- The focal planet/ring/world is clearly visible in the first screenshot without requiring user imagination.
- The visual scene, not only text copy, communicates that focus creates cosmic rewards.
- Starting focus visibly changes scene energy: glow, orbit/ring intensity, halo, dust, animation pacing, or equivalent.
- Triggering a reward/birth produces a visible moment: pulse, new mini-planet/moon, collection growth, or equivalent.
- The first screen should be desirable enough to use as portfolio/game-harness evidence.

## Visual QA Scorecard

Score each criterion 0/1/2. Any 0 is a hard fail.

| Criterion | Score | Evidence |
|---|---:|---|
| Product/genre read in 3 seconds | pending | screenshot/browser pass required |
| Hero/focal planet readability | pending | screenshot/browser pass required |
| Reward/challenge loop readability | pending | interaction + visual pass required |
| World/stage readability | pending | Three.js scene pass required |
| HUD/controls readability | pending | visual/browser pass required |
| Screenshot desirability | pending | visual QA pass required |

## Generator Requirements

Before writing code, the generator must read:

- `AGENT.md`
- `VERIFY.md`
- `CODEX_GOAL.md`
- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/flutter-flame-harness-review.md`
- `docs/harness/gotchas/web-game-gotchas.md`
- `docs/harness/gotchas/orbit-bloom-gotchas.md`
- latest `docs/harness/feedback/*.md` if present

The generator must write `docs/harness/handoff/round-N-gen.md` before handing off.

## Evaluator Requirements

The evaluator must not pass by code review alone. It must run deterministic gates, perform browser/play verification when code/visual behavior changed, inspect screenshot evidence when visual quality matters, and write `docs/harness/feedback/round-N-qa.md` with PASS/FAIL and evidence.

## Human Approval Gate

Pause before:

- changing away from Orbit Bloom;
- deleting current product direction;
- external deploy/push that changes what users can see;
- store/ads/payment/real-user-impacting work.
