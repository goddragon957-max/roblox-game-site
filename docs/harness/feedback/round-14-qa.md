# QA Feedback — Round 14

## Verdict

**PASS** — Round 14 soldier auto-defense is verified locally after an evaluator correction.

Claude Code implemented the initial slice but could not run `npm run verify` inside its non-interactive permission layer. The scheduled evaluator independently ran deterministic gates, found that the original `SOLDIER_AGGRO_RANGE = 7` did not protect the base in a natural browser wave smoke, applied one focused fix (`SOLDIER_AGGRO_RANGE = 10`), added a regression test for first-wave base defense, reran all gates, and verified the behavior in the browser before accepting the round.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Generator handoff | PASS | `docs/harness/handoff/round-14-gen.md` exists and truthfully records the exec-denied Claude session plus unverified implementation. |
| Evaluator correction | PASS | Initial browser smoke with range 7 left the trained soldier idle, base lost at `time=102.1`, `raidersDefeated` stayed `0`, and enemy camp attack did not run. Evaluator raised `SOLDIER_AGGRO_RANGE` to `10` and added a natural first-wave regression test. |
| `npm run verify:harness` | PASS | In combined `npm run verify`: `harness-check passed: 16 required files, round 14, next_role evaluator, verdict pending, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `40 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `939ms`; known non-fatal chunk-size warning remains (`750.87 kB`, gzip `204.84 kB`). |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Port `4199` was already in use, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260711-round14-fix` loaded successfully. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` and command hooks are available. |
| Selection and economy smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; smart-gathering a gold node and advancing 20s changed gold `120 → 240`. |
| Build/train smoke | PASS | `build('barracks')` returned true and added `barracks-16`; `train()` returned true; after 5s one player soldier existed (`soldier-17`). |
| Soldier auto-defense smoke | PASS | Without issuing an attack command, advancing the first wave made the idle soldier switch to attack at `time=57.0` against `raider-18`; `stats.raidersDefeated` changed `0 → 1`; game status remained `playing`. |
| Core attack smoke | PASS | Selecting soldiers and smart-attacking the enemy camp reduced camp HP `400 → 220`. |
| Browser console | PASS | Fatal JavaScript errors: 0 (`browser_console` returned no console messages and no JS errors after smoke). |
| Rendered visual QA | PASS | Browser-rendered output inspected after the auto-defense/attack sequence: HUD/minimap remain readable, the battlefield still reads as a 3D isometric RTS, and soldier combat feedback is visible enough for the defense beat. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Isometric battlefield, puppy base/workers, resources, enemy camp, HUD, command panel, and minimap remain immediately readable as an RTS. |
| Battlefield readability (base/resources/enemy) | 2 | Base, river/bridge, resources, enemy camp, and raider/soldier positions are visually distinct. |
| Control loop readability | 2 | Selection, gather/build/train, automatic defense, and explicit attack commands all changed real state in browser smoke. |
| Economy/production loop readability | 2 | Gold changed from gathering, barracks/training costs applied, and the HUD continued to expose the economy loop. |
| HUD/minimap readability | 2 | Compact HUD chips show mission/wave/threat state; minimap remains visible and useful during the fight. |
| Screenshot desirability | 2 | The screen communicates a recognizable RTS defense beat with active map pressure rather than a static dashboard. |

Total: **12/12**

## What Changed

- `src/game/simulation.ts`
  - Added `SOLDIER_AGGRO_RANGE = 10`.
  - Idle player soldiers now acquire and attack the nearest enemy unit in aggro range, so standing soldiers defend the base without needing an explicit attack command.
  - Workers still never auto-engage, and enemy camp destruction still requires an explicit player attack command.
- `src/game/__tests__/simulation.test.ts`
  - Added 4 deterministic soldier auto-defense tests: direct nearby-raider engagement, natural first-wave base protection, out-of-range idle behavior, and worker non-engagement.
- `docs/harness/handoff/round-14-gen.md`
  - Preserved Claude's truthful generator handoff and appended the evaluator amendment documenting the range correction.
- `docs/harness/state.md`
  - Advanced the harness to Round 15 readiness and raised `max_rounds` because the authorized 48-hour loop is still active.
- `docs/harness/pipeline-log.md`
  - Logged Round 14 generator and evaluator events.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied during this evaluator tick; allowed alternate strict port `4200` was used.
- Soldier aggro has no leash/return-to-post behavior after acquisition; attack-move/leash polish remains a possible future slice.

## Instruction Integrity

- Required goal, harness, verification, state, contract, instruction-integrity, latest feedback, handoff, changed source files, and diffs were read or inspected before acceptance.
- Claude's generator handoff was treated as data, not proof; evaluator reran gates and browser checks independently.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots were not staged.

## Next Role Recommendation

Commit `feat(game): add soldier auto-defense aggro`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 15.
