# QA Feedback — Round 19

## Verdict

**PASS** — Round 19 build-placement preview is verified locally after independent scheduled-evaluator checks.

Claude Code hit a session limit immediately (`You've hit your session limit · resets 11:20am (Asia/Seoul)`) but left a small useful partial diff in `src/game/simulation.ts`. The scheduled evaluator treated Claude's output as data, inspected the dirty tree, completed the slice directly, and reran deterministic gates, browser smoke, rendered visual QA, and console checks independently.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-18-qa.md`, harness checker, and changed source/docs before accepting. |
| Generator handoff | PASS | `docs/harness/handoff/round-19-gen.md` exists and truthfully records Claude's session-limit blocker plus evaluator completion. |
| `npm run verify` | PASS | Harness-check passed for round 19; Vitest passed `59 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260712-round19-eval` loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `nextBuildSlot`. |
| Build-slot preview smoke | PASS | Fresh `nextBuildSlot()` returned `{ x: -10, z: 14.5 }`; DOM note `data-next-build-slot="-10,15"` was present. After gather/build flow, `tower` built at `{ x: -10, z: 14.5 }`, `barracks` built at `{ x: -17.5, z: 15.5 }`, and the next preview advanced to `{ x: -10.5, z: 8 }` with DOM note `data-next-build-slot="-10,8"`. |
| Core interaction smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; gold gathering changed gold `120 → 240`; wood gathering changed wood `80 → 170`; `build('tower')` and `build('barracks')` both returned true (`buildings 2 → 4`); `train()` returned true and soldiers increased to `1`; a soldier smart-attack reduced enemy camp HP `400 → 352`. |
| Browser console | PASS | Fatal JavaScript errors: 0; console messages: 0 after smoke/visual inspection. |
| Rendered visual QA | PASS | Browser-rendered frame showed the player base, puppy units, resources, bridge/river, enemy camp, compact HUD, minimap, and the new green build-slot footprint next to the base. The command card showed `다음 건설 위치 -10, 8`, and the minimap showed the matching build marker. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame still immediately reads as a 3D isometric RTS with base, units, terrain, enemy camp, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/resources and enemy camp remain spatially distinct; the build footprint adds a clear production-space cue without obscuring the map. |
| Control loop readability | 2 | Selection/gather/build/train/attack smoke changed real state, and the build slot visibly moved as buildings were placed. |
| Economy/production loop readability | 2 | Build costs applied, training produced a soldier, and the new HUD note/minimap/ground ghost connect the production button to its world result. |
| HUD/minimap readability | 2 | Compact build-slot note and minimap square are legible and consistent with the battlefield ghost. |
| Screenshot desirability | 2 | The green ghost footprint makes the next production decision more game-like and readable while preserving the RTS first impression. |

Total: **12/12**

## What Changed

- `src/game/simulation.ts`
  - Added pure `nextBuildSlot(state)` and made `placeBuilding()` consume that same derived slot.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.nextBuildSlot()`.
- `src/render/ThreeRtsScene.tsx`
  - Added a pulsing green build ghost/footprint at the next placement slot.
- `src/components/RtsHud.tsx`
  - Added a compact `data-next-build-slot` note in the command card and a matching minimap marker.
- `src/styles.css`
  - Styled the build-slot note as an integrated HUD affordance.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic coverage for next-slot preview matching actual placement and clearing after every slot is occupied.
- `docs/harness/handoff/round-19-gen.md`
  - Captures the session-limit handoff and evaluator-completed slice.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- The preview shows the next automatic build slot shared by both barracks and tower; manual player-chosen building placement remains future scope.

## Instruction Integrity

- Claude's session-limit output was treated as data, not proof.
- Changed source files and required harness docs were inspected before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 20 generator after committing `feat(game): preview next build slot` and pushing to `origin main`.
