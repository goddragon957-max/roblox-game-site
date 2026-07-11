# QA Feedback — Round 17

## Verdict

**PASS** — Round 17 selected-unit order lines are verified locally after independent evaluator checks.

Claude Code implemented the slice but reported command execution denial in its session, so the scheduled evaluator treated `docs/harness/handoff/round-17-gen.md` as data and reran the deterministic gates, browser smoke, and rendered visual QA independently.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-16-qa.md`, generator handoff, harness checker, and changed source/docs diff before accepting. |
| Generator handoff | PASS | `docs/harness/handoff/round-17-gen.md` exists and truthfully records blocked command execution plus exact evaluator follow-up instructions. |
| `npm run verify` | PASS | Harness-check passed for round 17 evaluator/pending; Vitest passed `53 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260712-round17-eval` returned HTTP 200 and loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `orderPreviews`. |
| Order-line smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; an open-ground smart command produced 3 `move` previews to `{ x: -2, z: 10 }`; a gold-node smart command produced 3 `gather` previews to `gold-8`; shuttle behavior produced 3 `deposit` previews to the base at time `≈4.6s`; deselecting cleared previews to `0`. |
| Economy smoke | PASS | Gathering changed gold `120 → 240`; wood gathering changed wood `80 → 140`. |
| Build/train smoke | PASS | `build('tower')` returned true; `build('barracks')` returned true; `train()` returned true and produced `soldier-18` (`units 5 → 6`). |
| Attack/core-loop smoke | PASS | Selecting `soldier-18` and smart-attacking the enemy camp produced 1 red `attack` preview and reduced camp HP `400 → 388`; game status remained `playing`. |
| Browser console | PASS | Fatal JavaScript errors: 0; browser console buffers were empty after the smoke. |
| Rendered visual QA | PASS | Browser-rendered frame with selected workers gathering showed visible gold order lines from puppies toward the gold resource while the base, workers, resources, enemy camp, compact HUD, objective log, and minimap remained readable. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame still immediately reads as a 3D isometric RTS with buildings, units, terrain, enemy camp, command HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base, puppies, resource nodes, river/bridge, and enemy camp stay spatially distinct; order lines do not hide silhouettes. |
| Control loop readability | 2 | Move/gather/deposit/attack previews are derived from real selected-unit orders and made command intent visible in both 3D and minimap. |
| Economy/production loop readability | 2 | Gold/wood counters changed from gathering; build/train costs applied; the worker gather lines make the resource loop more legible. |
| HUD/minimap readability | 2 | Compact HUD remains readable and the minimap adds matching dashed order lines without crowding rally/range/shot context. |
| Screenshot desirability | 2 | Selected puppies visibly pathing to resources makes the first playable RTS beat clearer and more inviting. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `OrderPreviewKind` and `OrderPreview` for derived selected-unit order destinations.
- `src/game/simulation.ts`
  - Added pure `orderPreviews(state)`, scoped to selected player units, with move/gather/deposit/attack target guards and no new `GameState` fields.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.orderPreviews()` for browser verification.
- `src/render/ThreeRtsScene.tsx`
  - Added per-selected-unit ground lines and destination dots, color-coded white for move, gold for gather/deposit, red for attack, with cleanup when previews vanish.
- `src/components/RtsHud.tsx`
  - Added matching dashed minimap order lines.
- `src/game/__tests__/simulation.test.ts`
  - Added 4 deterministic order-preview tests for move selection scoping, gather/deposit targets, attack target liveness, and idle/match-over clearing.
- `docs/harness/handoff/round-17-gen.md`
  - Captures Claude's blocked command execution and evaluator instructions.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- Deposit preview lines are gold for both gold and wood deposits by design; a future slice could color deposit by carried resource if needed.
- Lines are straight unit-to-target segments, matching the current straight-line movement model rather than a future pathfinding route.

## Instruction Integrity

- Claude's handoff was treated as data, not proof; evaluator reran deterministic and browser gates independently.
- Changed source files and required harness docs were inspected before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 18 generator after committing `feat(game): show selected unit order lines` and pushing to `origin main`.
