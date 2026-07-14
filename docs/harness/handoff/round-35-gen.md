# Generator Handoff — Round 35

## Summary

Round 35 adds combat-hit battlefield feedback for Puppy Frontier RTS. Unit-driven attacks against units/buildings now record deterministic short-lived hit events in the simulation, expose them through the smoke API, and render a bright target-side burst/ripple in the Three.js battlefield so melee combat reads visually during the first play loop.

Codex `gpt-5.6-sol` with ultra reasoning produced the core simulation/store/renderer/test diff but exited with code `124` during preview/browser evidence. The Hermes evaluator/controller then inspected the diff, reran deterministic gates, performed browser smoke, found the first spark too subtle in the frozen visual frame, enlarged the VFX, and reran verification.

## Files Changed

- `src/game/types.ts`
  - Added `CombatHitEvent` / `CombatHitFeedback` and the `combatHitSeq` / `combatHitEvents` state fields.
- `src/game/simulation.ts`
  - Added `COMBAT_HIT_DURATION`, bounded event retention, `combatHitFeedback(state)`, and event recording at the exact place real unit-driven damage is applied to units/buildings.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic coverage for real soldier hits, unit attacks against buildings, simultaneous opposing hits, lethal-hit snapshot persistence, and natural expiry.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.combatHits()` for browser/evaluator proof.
- `src/render/ThreeRtsScene.tsx`
  - Added target-side procedural low-poly hit burst visuals: cream octahedron core, faction-colored rays, and ground ripple keyed to real hit ids.
  - Evaluator enlarged the burst/ripple after visual inspection so it remains readable near the raccoon camp and campfire.

## Commands Run

- Codex attempted the slice via `codex --ask-for-approval never --sandbox danger-full-access -m gpt-5.6-sol -c 'model_reasoning_effort="ultra"' ...`.
- Codex exited `124` after leaving a coherent diff; no commit/push was attempted by Codex.
- Hermes evaluator ran `npm run verify && git diff --check` after the Codex diff: PASS.
- Hermes evaluator enlarged the VFX and reran `npm run verify && git diff --check`: PASS.

Latest deterministic gate details after evaluator polish:

```text
npm run verify:harness: PASS
vitest: 75 tests PASS
npm run lint / tsc --noEmit: PASS
npm run build: PASS
vite build output: dist/assets/index-BweIpenQ.js
git diff --check: PASS
```

Vite's existing chunk-size warning remains non-fatal and out of scope.

## Browser Evidence Attempted

Strict preview was run at `http://127.0.0.1:4199/roblox-game-site/?round35=smoke2`.

Browser smoke after the final VFX sizing pass verified:

- `data-ui-pass="puppy-frontier-rts"`: present.
- `canvas[data-game-canvas="rts-three"]`: present at `1280×633`.
- `window.__rtsSmoke.getState()`: available.
- Natural loop: workers gathered gold `120→240`, barracks build succeeded, soldier train succeeded.
- Natural combat: selected soldier attacked `raider-6`; `combatHits()` produced `hit-1` at `time≈31.7`, damage `12`, target `raider-6`, impact `{ x: 14, z: -9.5 }`; raider HP reached `48` after the hit.
- Expiry: after `0.5s`, `combatHits()` returned an empty list.
- Visual inspection: frozen natural hit frame at `age≈0.08` showed a visible cream/gold hit burst/ripple on the enemy raider beside the raccoon camp; HUD remained compact and the battlefield stayed primary.
- Browser console after smoke: `0` messages, `0` JS errors.

No repository screenshot path is claimed; visual evidence was inspected live through the browser.

## Known Limitations

- This slice records unit-driven damage events. Tower shots already have the separate existing `towerShots()` tracer path and are not duplicated as combat-hit events.
- The hit burst is intentionally short-lived (`0.45s`) to avoid visual clutter, so evaluator/browser checks freeze an already naturally produced hit frame for visual inspection.
- Codex timed out before writing this handoff; this file is the truthful evaluator/controller reconstruction from the actual diff and command/browser evidence.
