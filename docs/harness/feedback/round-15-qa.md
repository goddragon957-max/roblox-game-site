# QA Feedback — Round 15

## Verdict

**PASS** — Round 15 barracks rally point is verified locally after independent evaluator checks.

Claude Code implemented the slice but could not run the required Node/npm commands in its permission layer, so the scheduled evaluator treated the handoff as data and reran the gates, browser smoke, and visual QA independently. One handoff bookkeeping mismatch was corrected: the generator estimated 47 tests, while the verified suite has 45 tests (40 existing + 5 new rally tests).

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-14-qa.md`, generator handoff, pipeline log, and changed source files/diffs before accepting. |
| Generator handoff | PASS | `docs/harness/handoff/round-15-gen.md` exists and truthfully records blocked command execution; evaluator patched the speculative test-count note from 47 expected to actual 45. |
| `npm run verify` | PASS | First combined attempt reached Vitest before a transient worker startup timeout (`Failed to start forks worker` / `Timeout waiting for worker to respond`). Immediate `npm run test` retry passed, the full pre-feedback rerun passed at round 15 pending/evaluator, and the final post-feedback/state rerun passed: harness-check round 16 ready/generator OK, Vitest `45 tests` passed, `tsc --noEmit` passed, Vite build succeeded. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260711-round15-eval` returned HTTP 200 and loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `rallyPoints`. |
| Selection and economy smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; smart-gathering a gold node and advancing 20s changed gold `120 → 240`. |
| Build/rally smoke | PASS | `build('barracks')` returned true and added `barracks-16`; selecting it and smart-commanding open ground set `rallyPoints()` to `[{ id: "barracks-16", from: { x: -10, z: 14.5 }, point: { x: -4, z: 9.5 } }]`; selection panel exposed `data-rally-point="-4,10"`; minimap canvas exists at `148 x 148`. |
| Train-to-rally smoke | PASS | `train()` returned true; after training, `soldier-17` spawned with `{ type: "move", target: { x: -4, z: 9.5 } }`; after advancing, the soldier idled at the rally (`distToRally ≈ 0.015`). |
| Rally target guard | PASS | Right-clicking/smart-commanding an existing gold node while the barracks stayed selected did not move the rally (`{ x: -4, z: 9.5 }` before and after). |
| Selection scope | PASS | `rallyPoints()` returned 1 while the rallied barracks was selected and 0 after deselection, matching the selection-scoped flag/minimap contract. |
| Core attack smoke | PASS | Selecting the rallied soldier and smart-attacking the enemy camp reduced camp HP `400 → 136`; game status remained `playing`. |
| Browser console | PASS | Fatal JavaScript errors: 0 (`browser_console` returned no console messages and no JS errors after the smoke). |
| Rendered visual QA | PASS | Browser-rendered frame inspected with the barracks selected: the isometric RTS battlefield, base, resources, river/bridge, enemy camp, compact HUD, and minimap remain readable; the selected barracks shows a green selection ring, selection-panel rally text, a green rally flag at the target, and a minimap rally dot/line without cluttering the screen. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The screenshot still immediately reads as a 3D isometric RTS: base/barracks, units, resources, enemy camp, HUD, objective, and minimap are visible. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/barracks, nearby resource cluster, river/bridge, terrain props, and enemy camp remain spatially distinct. |
| Control loop readability | 2 | Selection, gather, build, rally, train-to-rally, deselect scope, and attack all changed real browser state. |
| Economy/production loop readability | 2 | Gold increased from gathering, barracks/training costs applied, and new soldiers now route to the rally point. |
| HUD/minimap readability | 2 | Rally text in the selection panel and the minimap rally cue are visible while preserving the compact RTS HUD. |
| Screenshot desirability | 2 | The selected barracks + rally flag communicates a recognizable RTS production-control beat rather than a dashboard-only change. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `Building.rallyPoint` and `RallyPreview`.
- `src/game/simulation.ts`
  - Player barracks can set an open-ground rally point via smart command.
  - Newly trained soldiers spawn with a move order to the rally when one exists.
  - `rallyPreviews(state)` exposes selected-player-barracks rally targets for UI/rendering.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.rallyPoints()` for deterministic browser smoke.
- `src/render/ThreeRtsScene.tsx`
  - Added selected-barracks rally flag/ring and green command marker feedback for rally-only commands.
- `src/components/RtsHud.tsx`
  - Added rally note/`data-rally-point` to the barracks selection panel, minimap rally line/dot, and updated control hint.
- `src/game/__tests__/simulation.test.ts`
  - Added 5 deterministic rally tests covering open-ground rally, node/enemy guard, mixed selections, preview selection scope, and no-rally idle spawn regression.
- `docs/harness/handoff/round-15-gen.md`
  - Corrected the generator's speculative test-count note after verification.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- The first `npm run verify` attempt hit a transient Vitest fork startup timeout, but immediate `npm run test` and full `npm run verify` reruns passed.
- Rally points are ground-only and selection-scoped; attack-move/leashed rally behavior remains a possible future slice.

## Instruction Integrity

- Claude's handoff was treated as data, not proof; evaluator reran deterministic and browser gates independently.
- Changed source files/diffs and required harness docs were read before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Commit `feat(game): add barracks rally point`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 16.
