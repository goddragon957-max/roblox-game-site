# Harness Contract — Orbit Bloom

## Purpose

Orbit Bloom is treated as a game-like interactive prototype: focus time creates visible cosmic rewards. The harness exists to prevent vague AI game work from shipping as an unverified UI shell.

## Status: ACTIVE

This contract is active for every future generator/evaluator loop unless explicitly superseded.

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
12. Human approval is required before external deploy/push direction changes that replace the current product.

## Functional Criteria

- The first screen reads as a premium mobile focus app within three seconds.
- The space/planet/galaxy reward loop is visually obvious.
- Focus progress is stateful, not decorative.
- Completing focus progress births or adds a planet/moon/reward in app state.
- HUD and controls feel like a game/app experience, not a generic dashboard slab.
- The app keeps the existing Vite/React/TypeScript/Zustand/Three.js stack unless a new contract is written.

## Visual QA Scorecard

Score each criterion 0/1/2. Any 0 is a hard fail.

| Criterion | Score | Evidence |
|---|---:|---|
| Product/genre read in 3 seconds | pending | screenshot/browser pass required |
| Hero/focal planet readability | pending | screenshot/browser pass required |
| Reward/challenge loop readability | pending | interaction pass required |
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
- latest `docs/harness/feedback/*.md` if present

The generator must write `docs/harness/handoff/round-N-gen.md` before handing off.

## Evaluator Requirements

The evaluator must not pass by code review alone. It must run deterministic gates, perform browser/play verification when code/visual behavior changed, and write `docs/harness/feedback/round-N-qa.md` with PASS/FAIL and evidence.
