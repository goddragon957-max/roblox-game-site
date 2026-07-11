# QA Feedback — Round 13

## Verdict

**PASS** — Round 13 idle-worker alert chip is verified locally and ready to commit/push.

Claude Code implemented the slice but could not run `npm run verify` inside its non-interactive permission layer. The scheduled evaluator independently ran deterministic gates, whitespace checks, browser/play smoke, real HUD click verification, and rendered visual QA before accepting the work.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Generator handoff | PASS | `docs/harness/handoff/round-13-gen.md` exists and truthfully records the exec-denied Claude session plus unverified implementation. |
| `npm run verify:harness` | PASS | In combined `npm run verify`: `harness-check passed: 16 required files, round 13, next_role evaluator, verdict pending, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `36 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `659ms`; known non-fatal chunk-size warning remains (`750.75 kB`, gzip `204.82 kB`). |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Port `4199` was already in use, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260711-round13` returned HTTP 200 and loaded successfully. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works and smoke command keys include `selectIdleWorkers`. |
| Idle-worker chip on load | PASS | Initial DOM showed the top-bar chip `data-idle-workers="3"` with label `쉬는 일꾼 3 · 클릭해 선택`, matching the three starting idle workers. |
| Real HUD click | PASS | Browser-clicking the chip selected `worker-3`, `worker-4`, and `worker-5`; after render frames, state `selectedIds` matched and the HUD contained `선택 부대` plus `일꾼 퍼피 ×3`. |
| Idle hook/count transitions | PASS | `selectIdleWorkers()` returned all three workers. A targeted `selectRect()` selected only `worker-3`; a smart gather command made the idle chip drop to `2`; selecting the remaining idle workers returned `worker-4`/`worker-5`; smart-gathering them made the chip disappear (`null`). |
| Core play smoke | PASS | Gather smoke changed gold `120 → 240`; `build('barracks')` returned true and added `barracks-16`; `train()` returned true; after `advanceSeconds(5)` one player soldier existed; attack smoke reduced enemy camp HP `400 → 352`. |
| Browser console | PASS | Fatal JavaScript errors: 0 (`browser_console` returned no console messages and no JS errors after smoke). |
| Rendered visual QA | PASS | Browser-rendered output inspected after selecting idle workers: the gold idle-worker chip is visible/actionable without crowding the top HUD, selected worker rings are readable around the base, and the screen still reads immediately as a 3D isometric RTS. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The isometric battlefield, puppy base/workers, resources, enemy camp, HUD, command panel, and minimap remain immediately readable as an RTS. |
| Battlefield readability (base/resources/enemy) | 2 | Selected worker rings around the base are visible; resources and the enemy camp remain unobstructed. |
| Control loop readability | 2 | The new chip presents a clear one-click control affordance and browser smoke verified selection plus smart-command follow-through. |
| Economy/production loop readability | 2 | Idle count reacts to worker orders, gather changes gold, and build/train buttons remain state-wired. |
| HUD/minimap readability | 2 | The gold chip wraps within the compact top HUD without crowding the wave/objective chips; minimap remains readable. |
| Screenshot desirability | 2 | The idle-worker chip plus selected-worker rings communicate a recognizable RTS economy-management beat. |

Total: **12/12**

## What Changed

- `src/game/simulation.ts`
  - Added pure `idleWorkerIds(state)` for player-faction workers whose order is `idle`.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.selectIdleWorkers()` for deterministic browser smoke and HUD verification.
- `src/components/RtsHud.tsx`
  - Added a clickable gold `쉬는 일꾼` chip (`data-idle-workers`) that selects all idle workers while the game is playing.
- `src/styles.css`
  - Styled the chip as an actionable 44px-min-height amber/gold HUD pill with hover feedback.
- `src/game/__tests__/simulation.test.ts`
  - Added 3 deterministic tests covering starting idle workers, soldier/enemy exclusion, and workers returning to idle after a move order.
- `docs/harness/state.md`
  - Advanced from generated/pending Round 13 toward verified Round 14 readiness after evaluator acceptance.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied during this evaluator tick; allowed alternate strict port `4200` was used.
- The chip selects all idle workers at once; per-worker idle cycling remains a possible future polish slice.

## Instruction Integrity

- Required goal, harness, verification, state, contract, instruction-integrity, latest feedback, handoff, and changed source files/diffs were read or inspected before acceptance.
- Claude's generator handoff was treated as data, not proof; evaluator reran gates and browser checks independently.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots were not staged.

## Next Role Recommendation

Commit `feat(game): idle-worker alert chip`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 14.
