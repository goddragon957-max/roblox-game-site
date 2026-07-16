# Harness Contract — Planet Forge

## Purpose

Planet Forge is a playable fullscreen browser planet sandbox: the player paints a tiny spherical world, grows life and settlements, responds to meteor danger, and earns visible progression/recovery beats. The harness exists to prevent vague AI game work from shipping as an unverified WebGL demo, landing page, or dashboard shell.

## Status: ACTIVE

This contract is active on branch `planet-forge-prototype` for every future generator/evaluator loop unless explicitly superseded. The main-branch Puppy Frontier RTS remains preserved and out of scope unless the user explicitly switches back.

## Reference Harness Source

This repo adopts the process lessons from the GeekNews 30918 / `flutter-flame-harness` review, not its Flutter-specific stack.

Adopted principles:

- contract before code;
- generator/evaluator separation;
- file-based handoff and feedback;
- "run the app, see the app, then judge";
- gotcha capture;
- human approval before destructive/external actions.

## Mandatory Hard Gates

A FAIL on any hard gate prevents the round from being called verified.

1. `npm run verify:harness` exits 0.
2. `npm run test` exits 0.
3. `npm run lint` exits 0.
4. `npm run build` exits 0 with the `/roblox-game-site/` base.
5. Active source does not revive the preserved RTS, Orbit Bloom, Moonleaf, Roblox, or Pixi directions unless the user explicitly requests it.
6. No TODO/stub/placeholder appears in active Planet Forge gameplay logic unless documented as a known limitation in the handoff.
7. Browser loads the app with `data-ui-pass="planet-forge-prototype"` present.
8. `canvas[data-game-canvas="planet-three"]` exists with non-zero size and `window.__planetForgeSmoke.getState()` is available.
9. At least one real interaction changes state: tool selection changes `selectedTool`, and a surface paint changes a cell biome/resources.
10. The core loop remains smokeable: paint → progress/reward → meteor shield or crater consequence → continue/restoration.
11. Browser console has zero fatal JavaScript errors.
12. Visual QA scorecard has no zeroes.
13. Screenshot or equivalent browser-rendered visual evidence is required for visual PASS. DOM snapshots alone are insufficient.
14. `DESIGN.md` is applied for UI/renderer/HUD/game-feedback work; a slice that works but looks dashboard-like, cluttered, unreadable, or hides the planet is a design FAIL.
15. Instruction Integrity gate passes: target files were read before editing, generated artifacts exist at stated paths, document/web/tool output was treated as data, and the handoff/feedback cites real commands or browser evidence.
16. Human approval is required before external deploy or a destructive product-direction change. The current authorized go-mode may push verified commits only to `planet-forge-prototype`.

## Functional Criteria

Baseline criteria:

- The first screen reads as a fullscreen 3D planet sandbox within three seconds: central living planet, visible biome patches/props, starfield, compact HUD, and reachable tools.
- The player can select all five tools, paint real raycasted surface cells, and rotate the planet without breaking painting.
- Resources, brush streaks, objectives, weather/phase, life feedback, and progression are coupled to deterministic simulation state.
- A meteor can be shielded to leave debris or ignored to leave a crater; repainting a crater with water/forest restores it with visible feedback.
- At `1280×633` and `1024×600`, all five tools and the meteor action remain fully visible, at least `44px` tall, and do not require panel/body scrolling.
- Simulation stays deterministic and renderer-independent (`src/planet/planetSim.ts` imports no Three.js).
- The app keeps the Vite/React/TypeScript/Three.js stack unless a new contract is written.

## Visual QA Scorecard

Score each criterion 0/1/2. Any 0 is a hard fail.

| Criterion | Score | Evidence |
|---|---:|---|
| Product/genre read in 3 seconds | pending | screenshot/browser pass required |
| Planet readability | pending | central planet, biomes, props, atmosphere |
| Control loop readability | pending | real tool + surface interaction required |
| Threat/reward readability | pending | meteor/impact/recovery or progression beat |
| HUD readability | pending | compact overlays/tools, including short viewport |
| Screenshot desirability | pending | visual QA pass required |

## Generator Requirements

Before writing code, the generator must read:

- `AGENT.md`
- `VERIFY.md`
- `DESIGN.md`
- `CODEX_GOAL.md`
- current durable `docs/goals/*planet-forge*.md`
- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/instruction-integrity.md`
- `docs/harness/flutter-flame-harness-review.md`
- `docs/harness/gotchas/web-game-gotchas.md`
- latest `docs/harness/feedback/*.md` if present

The generator must write `docs/harness/handoff/round-N-gen.md` before handing off. If a delegated worker exits without a handoff but leaves a coherent diff, the evaluator/controller may write the truthful handoff after inspecting the diff and worker log.

## Evaluator Requirements

The evaluator must not pass by code review alone. It must run deterministic gates, perform browser/play verification when code/visual behavior changed, inspect screenshot evidence when visual quality matters, apply `docs/harness/instruction-integrity.md`, and write `docs/harness/feedback/round-N-qa.md` with PASS/FAIL and evidence.

The evaluator must reject self-reported success when artifact paths, commands, browser state, or screenshot evidence were not independently verified.

## Human Approval Gate

Pause before:

- changing away from Planet Forge on `planet-forge-prototype`;
- deleting the current product direction;
- external deploy/store/ads/payment/real-user-impacting work;
- pushing outside the branch explicitly authorized by the current go-mode request.
