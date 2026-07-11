# QA Feedback — Round 8

## Verdict

**PASS** — Round 8 wave preview is verified locally and ready to commit/push.

Claude Code implemented the slice but its non-interactive session was permission-denied for `npm`/`node` execution. The scheduled evaluator independently inspected the diff and changed files, ran deterministic gates, ran browser smoke, inspected rendered visual output, verified the wave forecast HUD/log behavior, and verified `git diff --check`.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Claude generator handoff | PASS | `docs/harness/handoff/round-8-gen.md` exists and truthfully recorded that Claude could not run deterministic/browser gates or push. |
| `npm run verify:harness` | PASS | `harness-check passed: 16 required files, round 8, next_role evaluator, verdict blocked, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `22 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `1.15s`; known non-fatal chunk-size warning remains (`745.05 kB`, gzip `203.13 kB`). |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Port `4199` was already in use, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=round8-verify` loaded successfully. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`. |
| Smoke object / initial wave forecast | PASS | `window.__rtsSmoke.getState()` and `window.__rtsSmoke.command.waveForecast()` available. Fresh restart returned `{ waveNumber: 1, size: 1, secondsLeft: 50, imminent: false }`; HUD chip rendered `첫 습격까지 50s · 라쿤 1기` with `data-next-wave-size="1"`. |
| Selection/gather/build/train | PASS | `selectWorkers()` selected 3 workers; smart gather against `gold-8` plus `advanceSeconds(20)` changed gold `120 → 240`; `build('barracks')` returned true; `train()` returned true; after `advanceSeconds(5)`, one player soldier existed. |
| Wave warning forecast | PASS | After restart + `advanceSeconds(45)`, `waveForecast()` returned `{ waveNumber: 1, size: 1, secondsLeft: 5, imminent: true }`; HUD chip rendered `습격 임박! 5s · 라쿤 1기`, had the `alarm` class, and log included `라쿤 습격대 1기가 다가옵니다 — 방어를 준비하세요!`. |
| Next-wave rollover | PASS | After advancing past wave 1, state had `waveNumber: 1`; `waveForecast()` returned `{ waveNumber: 2, size: 2, secondsLeft: 35, imminent: false }`; HUD chip rendered `웨이브 1 · 다음까지 35s · 라쿤 2기` with `data-next-wave-size="2"`. |
| Browser console | PASS | Fatal JavaScript errors: 0; console messages: 0 during the smoke run. |
| Rendered visual QA | PASS | Browser-rendered output inspected with `browser_vision`; the top HUD wave preview chip (`웨이브 1 · 다음까지 ... · 라쿤 2기`), objective log warning, compact command HUD, minimap, base/resources/river/enemy camp, and visible 3D battlefield remain readable. No visual blocker observed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The battlefield, base, resource clusters, enemy camp, HUD, and minimap still read as a 3D isometric RTS. |
| Battlefield readability (base/resources/enemy) | 2 | The low-poly map, player base, resource nodes, river/bridge, and enemy camp are all visible in the rendered preview. |
| Control loop readability | 2 | Browser smoke verified selection, smart gather, build, train, and wave-preview state changes. |
| Economy/production loop readability | 2 | Gold changed through gathering, barracks/training consumed resources, and one soldier spawned. |
| HUD/minimap readability | 2 | Top chips, command card, objective log, and minimap remain compact and readable; the wave chip now communicates raider count. |
| Screenshot desirability | 2 | The forecasted raider count and warning log make the next threat clearer without turning the screen into a dashboard. |

Total: **12/12**

## What Changed

- `src/game/types.ts`, `src/game/simulation.ts`
  - Added pure `WaveForecast` / `waveForecast(state)` for next-wave number, raider count, countdown, and imminence.
  - Updated the wave-warning log line to include the incoming raider count.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.waveForecast()` for browser smoke.
- `src/components/RtsHud.tsx`
  - The wave chip now uses `waveForecast(sim)`, appends `라쿤 N기`, and exposes `data-next-wave-size`.
- `src/game/__tests__/simulation.test.ts`
  - Added 3 wave-forecast tests and updated the warning-log test for the new count-bearing message.
- `docs/harness/handoff/round-8-gen.md`, `docs/harness/state.md`, `docs/harness/pipeline-log.md`
  - Added Round 8 generator handoff/bookkeeping.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains; still accepted as out-of-scope for this product slice.
- The forecast shows raider count only; if future slices add raider variants, the preview should communicate composition/type as well as count.
- Browser preview port `4199` was busy in this cron environment; strict alternate port `4200` was used successfully.

## Instruction Integrity

- Required goal, harness, verification, state, contract, instruction-integrity, latest feedback, handoff, and changed source files were read/inspected before acceptance.
- Claude handoff was not accepted as proof; evaluator reran gates and browser checks independently.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/` scratch files were not staged.

## Next Role Recommendation

Commit `feat(game): preview incoming raider waves`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 9.
