# Generator Handoff — Round 37

## Summary

Round 37 records Planet Forge prototype Round 7 on branch `planet-forge-prototype`: an ignored meteor crater can now be restored with water or forest through the normal paint path. The deterministic recovery increments once, grants a bounded stability/biomass/water reward, logs the ecological recovery, exposes `getRestoration()`, shows a compact HUD chip, and renders a surface-attached emerald regrowth ring.

Claude Code was launched with `--model sonnet --fallback-model opus --permission-mode bypassPermissions --effort high` from the canonical repository. It produced a coherent source/test/style diff but exited `143` without a final report or commit. The Hermes evaluator/controller preserved and reviewed that diff, added the required branch docs, corrected the expiry test after extending the transient effect to 12 seconds for observable visual QA, strengthened the regrowth ring after rendered inspection, and independently completed deterministic/browser/visual verification.

## Files Changed

- `src/planet/planetSim.ts`
  - Adds deterministic crater-restoration count, last cell/tool/time, bounded rewards, Korean log, and `planetRestorationSignal`.
  - Limits ecological recovery to water/forest and keeps the active signal for 12 deterministic seconds.
- `src/planet/__tests__/planetSim.test.ts`
  - Covers natural ignored-meteor crater recovery, one-time rewards, all three non-restorative tools, repaint non-duplication, non-negative signal age, and signal expiry.
- `src/planet/PlanetForgeApp.tsx`
  - Exposes `getRestoration()` through `window.__planetForgeSmoke`.
  - Adds stable restoration DOM markers, a compact chip, and a surface-attached emerald regrowth ring.
- `src/styles.css`
  - Adds restoration-chip active/inactive visual states.
- `README.md`, `VERIFY.md`, `DESIGN.md`
  - Document the shipped loop, markers, browser checks, and visual design intent.
- `docs/goals/2026-07-16-planet-forge-claude-sonnet-round7.md`
  - Durable delegated work order.
- `docs/harness/handoff/round-37-gen.md`, `docs/harness/feedback/round-37-qa.md`, `docs/harness/state.md`, `docs/harness/pipeline-log.md`
  - Truthful generator/evaluator trail and next-round state.

## Commands Run

- Generator invocation: Claude Code `sonnet`, fallback `opus`, bypass-permissions mode, high effort.
- Generator result: exit `143` after a useful source/test/style diff; log contained no model report; no commit or push attempted by Claude.
- Evaluator: `npm run verify && git diff --check`: PASS after focused expiry-test and independent-review corrections.
- Independent review: Codex `gpt-5.6-sol` high, narrow read-only source diff; two P2 findings fixed (negative-age guard and full shield/crystal/settlement coverage).

Final deterministic details:

```text
npm run verify:harness: PASS (Round 37 baseline before state advancement)
vitest: 96 tests PASS
TypeScript (`tsc --noEmit`): PASS
Vite production build with `/roblox-game-site/` base: PASS
dist JS: dist/assets/index-BkoH2ION.js
git diff --check: PASS
```

Vite's existing chunk-size warning and Three.js `Clock` deprecation warning remain non-fatal follow-ups.

## Browser Evidence

Evaluator strict production preview:

```text
http://127.0.0.1:4214/roblox-game-site/?cron=20260716-round7c
```

Independent browser smoke verified:

- `data-ui-pass="planet-forge-prototype"`: present.
- `canvas[data-game-canvas="planet-three"]`: present at `1280×633` with a nonzero backing buffer.
- Loaded production asset: `dist/assets/index-BkoH2ION.js`.
- Existing smoke hooks remained available: state, weather, life, guardian, objective, selection/paint, meteor, tick, and reset.
- A real browser click selected `바다 뿌리기`, coupling the visible selected button to `selectedTool: "water"`.
- Shield path: a shield-painted impact resolved with `lastImpactKind: "shield"`, `scar: "debris"`, matching impact cell id, and `meteorsBlocked: 1`.
- Natural crater path: an ignored meteor produced `lastImpactKind: "crater"` and `scar: "crater"` at `cell-57`.
- Forest restoration cleared the scar, incremented count `0→1`, recorded `cell-57`/`forest`, changed resources by the normal tool cost/result plus bounded restoration reward, and logged `크레이터가 복구되며 생명이 돌아왔어요! ...` exactly once for the recovery.
- Repainting the healed cell left the restoration count at `1`.
- `getRestoration()` was active immediately, and `[data-crater-restoration-active="true"]` exposed count/cell/tool after render.
- Advancing three 5-second deterministic ticks made the signal and DOM marker inactive while preserving count `1` and `scar: "none"`.
- Browser fatal JavaScript errors: `0`; only the existing non-fatal `THREE.Clock` deprecation warning appeared.
- Rendered visual inspection: PASS. An isolated repeating visual probe kept the otherwise transient beat active long enough for capture; the green recovery chip and a large surface-attached emerald/cyan regrowth ring were clearly visible without covering the planet or controls. The probe was cleared before final smoke.

No repository screenshot artifact is claimed; browser-rendered captures were transient evaluator evidence.

## Known Limitations

- The procedural art remains intentionally prototype-level; the effect is a ring rather than a bespoke particle/sprout asset.
- Non-living tools still follow the pre-existing paint behavior that clears a crater scar, but they never increment ecological restoration or grant its reward.
- The generator did not write a final report because its process exited `143`; this handoff is the evaluator/controller reconstruction from the actual diff and independent evidence.
