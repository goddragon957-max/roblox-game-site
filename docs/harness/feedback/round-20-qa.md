# QA Feedback — Round 20

## Verdict

**PASS** — Round 20 worker carried-resource feedback is verified locally after independent scheduled-evaluator checks.

A bounded Claude Code continuation attempt exited immediately with a session-limit message (`You've hit your session limit · resets 11:20am (Asia/Seoul)`). The scheduled evaluator found an existing dirty partial worker-carry slice, treated Claude output as data, fixed the failing timing assertion in the deterministic test, and reran deterministic gates, browser smoke, rendered visual QA, and console checks independently.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-19-qa.md`, pipeline log, and relevant changed source/test files before acceptance. |
| Generator handoff | PASS | `docs/harness/handoff/round-20-gen.md` exists and truthfully records the Claude session-limit blocker plus evaluator completion. |
| `npm run verify` | PASS | Harness-check passed for round 20; Vitest passed `61 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260712-round20-eval` loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `workerCarrySummary`. |
| Carrying-resource smoke | PASS | One selected worker gathered gold; `workerCarrySummary()` returned `{ count: 1, gold: 10, wood: 0, total: 10 }`; HUD chip showed `운반 중 골드 10` with `data-carrying-workers="1"`, `data-carrying-gold="10"`, and `data-carrying-wood="0"`. After deposit, gold reached `130`, summary returned zeroes, and the chip disappeared. |
| Core interaction smoke | PASS | Workers gathered enough gold for production; `build('barracks')` returned true; `train()` returned true; a soldier spawned at `time≈44.9`; soldier smart-attack reduced enemy camp HP `400 → 280`. |
| Browser console | PASS | Fatal JavaScript errors: 0; console messages: 0 after smoke/visual inspection. |
| Rendered visual QA | PASS | Browser-rendered frame showed base, puppy workers, resources, bridge/river, enemy camp, compact HUD, minimap, and the new frontier-gold carrying chip integrated into the top HUD row. Browser visual inspection confirmed no fatal visual problems; no repo screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame still immediately reads as a 3D isometric RTS with base, units, terrain, enemy camp, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/resources and enemy camp remain spatially distinct; the selected worker and order line remain readable. |
| Control loop readability | 2 | Selection/gather/deposit/build/train/attack browser smoke changed real state; the carrying chip gives immediate economy feedback before bank counters update. |
| Economy/production loop readability | 2 | `운반 중 골드 10` chip connects worker gathering to in-transit income, then clears on deposit; build/train remain state-wired. |
| HUD/minimap readability | 2 | The new chip matches existing compact HUD styling and does not obscure the minimap or command card. |
| Screenshot desirability | 2 | The top HUD now communicates active economy motion, making the early RTS loop feel more alive and game-like. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `WorkerCarrySummary`.
- `src/game/simulation.ts`
  - Added pure `workerCarrySummary(state)` for in-transit worker-carried resource bundles.
- `src/store/gameStore.ts`
  - Added `__rtsSmoke.command.workerCarrySummary()`.
- `src/components/RtsHud.tsx`
  - Added the visible `운반 중 ...` HUD chip with stable data markers.
- `src/styles.css`
  - Styled the carrying chip with integrated frontier-gold treatment.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic tests for summary aggregation and real gather/deposit clearing.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- Per-worker carried-resource props in the 3D world remain a possible future visual polish slice.

## Instruction Integrity

- Claude's session-limit output was treated as data, not proof.
- Changed source files and required harness docs were inspected before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 21 generator after committing `feat(game): show carried resources in HUD` and pushing to `origin main`. Because the authorized 48-hour loop reached `max_rounds: 20`, raise `max_rounds` for the next scheduled slices.
