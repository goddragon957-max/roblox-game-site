# QA Feedback — Round 18

## Verdict

**PASS** — Round 18 raider wave spawn telegraph is verified locally after independent evaluator checks.

Claude Code implemented the slice but reported command execution denial in its session, so the scheduled evaluator treated `docs/harness/handoff/round-18-gen.md` as data and reran deterministic gates, browser smoke, rendered visual QA, and console checks independently.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-17-qa.md`, generator handoff, harness checker, and changed source/docs diff before accepting. |
| Generator handoff | PASS | `docs/harness/handoff/round-18-gen.md` exists and truthfully records blocked command execution plus exact evaluator follow-up instructions. |
| `npm run verify` | PASS | Harness-check passed for round 18 evaluator/pending; Vitest passed `57 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260712-round18-eval` loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `waveTelegraph`. |
| Wave telegraph smoke | PASS | Fresh state returned `{ active: false, pos: null, secondsLeft: 50, size: 1 }`; after advancing into the warning window, `waveTelegraph()` returned `{ active: true, pos: { x: 14, z: -10 }, secondsLeft: 9, size: 1 }`, matching the enemy camp at `{ x: 16, z: -12 }`; the HUD showed `습격 임박!` and the warning log. Advancing to the spawn moment produced `raider-16` within `0.088` world units of the telegraph point, advanced `waveNumber` to `1`, and returned the telegraph to inactive. |
| Core interaction smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; gold gathering changed gold `120 → 240`; wood gathering changed wood `80 → 170`; `build('tower')` and `build('barracks')` both returned true (`buildings 2 → 4`); `train()` returned true and units increased `5 → 7`; a soldier smart-attack reduced enemy camp HP `400 → 280`. |
| Browser console | PASS | Fatal JavaScript errors: 0. Browser console only reported non-fatal Three.js `Context Lost` / `Context Restored` logs during evaluator navigation/reload. |
| Rendered visual QA | PASS | Browser-rendered frame during the warning window showed the player base, puppy workers, resources, bridge/river, enemy camp, compact HUD, minimap, and a visible enemy-orange telegraph ring/spike next to the enemy camp with a matching minimap pulse. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame still immediately reads as a 3D isometric RTS with base, units, terrain, enemy camp, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/resources and the enemy camp remain spatially distinct; the telegraph anchors the incoming threat at the camp side of the map. |
| Control loop readability | 2 | Selection/gather/build/train/attack smoke still changes real state, and the warning telegraph makes the upcoming defense beat legible. |
| Economy/production loop readability | 2 | Gold/wood counters changed from gathering; build/train costs applied; production/combat remained state-wired. |
| HUD/minimap readability | 2 | The HUD wave alarm and the minimap orange pulse reinforce each other without obscuring existing threat/order feedback. |
| Screenshot desirability | 2 | The orange spawn marker and spike add a clear incoming-danger beat that makes the RTS scene more playable and clickable. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `WaveTelegraph` for derived incoming-wave spawn marker data.
- `src/game/simulation.ts`
  - Extracted shared `waveSpawnPoint(camp, index)` math and added pure `waveTelegraph(state)` with imminent/live-camp guards and no new sim state.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.waveTelegraph()` for browser verification.
- `src/render/ThreeRtsScene.tsx`
  - Added a pulsing enemy-orange ring plus hovering spike at the telegraphed spawn point during the warning window.
- `src/components/RtsHud.tsx`
  - Added a matching orange incoming-wave pulse to the minimap, distinct from the red damage threat pulse.
- `src/game/__tests__/simulation.test.ts`
  - Added 4 deterministic wave-telegraph tests for inactivity, spawn-point accuracy, post-spawn quieting, and camp-destroyed clearing.
- `docs/harness/handoff/round-18-gen.md`
  - Captures Claude's blocked command execution and evaluator instructions.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- The telegraph marks the lead raider spawn point; later raiders in the same wave still use adjacent staggered slots.

## Instruction Integrity

- Claude's handoff was treated as data, not proof; evaluator reran deterministic and browser gates independently.
- Changed source files and required harness docs were inspected before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 19 generator after committing `feat(game): telegraph raider wave spawn point` and pushing to `origin main`.
