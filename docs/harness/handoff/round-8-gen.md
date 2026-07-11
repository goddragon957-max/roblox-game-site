# Generator Handoff — Round 8

Date: 2026-07-11T02:18Z
Work order: `docs/goals/2026-07-11-48h-claude-goal-loop.md` (48h loop, one slice per session)

## Slice

Wave preview: a deterministic `waveForecast(state)` that tells the player exactly what is coming — the incoming wave's number, raider count, countdown, and imminence — surfaced in the HUD wave chip and in the wave-warning log line. Maps to work-order priority 4 ("wave preview, difficulty ramp") and improves priority 2's "better raider telegraph": the player can now size their defense against a known threat instead of a bare countdown.

## What changed

- `src/game/types.ts`
  - Added `WaveForecast` (`{ waveNumber, size, secondsLeft, imminent }`).
- `src/game/simulation.ts`
  - Added pure `waveForecast(state)`: next wave number is `state.waveNumber + 1`, size from the existing `waveSize()` ramp, `secondsLeft = max(0, ceil(nextWaveAt - time))`, `imminent` uses the same `WAVE_WARNING_LEAD` window as the in-sim warning trigger (and is false when the match is over).
  - The wave-warning log line now includes the incoming raider count: `라쿤 습격대 N기가 다가옵니다 — 방어를 준비하세요!` (was countless).
- `src/components/RtsHud.tsx`
  - The wave chip now derives from `waveForecast(sim)` instead of inline math and appends `라쿤 N기` in both states (`습격 임박! 9s · 라쿤 1기` / `첫 습격까지 50s · 라쿤 1기` / `웨이브 1 · 다음까지 39s · 라쿤 2기`). Added `data-next-wave-size` attribute for smoke assertions. Dropped the now-unused `WAVE_WARNING_LEAD` import.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.waveForecast()` for browser smoke.
- `src/game/__tests__/simulation.test.ts`
  - New `wave forecast` describe block with 3 tests: fresh-state forecast is `{ waveNumber: 1, size: waveSize(1), secondsLeft: FIRST_WAVE_AT, imminent: false }`; forecast turns imminent inside the warning window; after wave 1 spawns the forecast rolls to wave 2 with `waveSize(2)` raiders and a countdown within `WAVE_INTERVAL`.
  - Updated the existing warning-log test to assert the new count-bearing message (the old message text changed, so the old substring assertion was updated deliberately, not incidentally).

## Determinism note

`waveForecast` is a pure function of `GameState` (no randomness, no clock). The only simulation behavior change is the warning log string gaining a count; wave timing, sizes, and all other mechanics are untouched. No renderer (`src/render/`) or CSS changes — the chip reuses existing `hud-chip wave`/`alarm` styles.

## Commands run and results

- `node --version` — PASS (`v22.22.2`; trivial read-only exec is allowed).
- `node scripts/harness-check.mjs` — **PERMISSION_DENIED** ("This command requires approval"; tried once, not retried).
- `npm run verify` — **PERMISSION_DENIED** (same auto-deny, consistent with Rounds 4–7).
- `git diff --check` — **PASS** (exit 0, no output) at 2026-07-11T02:17Z.
- `git status --short` — 5 modified source/test files exactly matching the "What changed" list above, plus this handoff and harness bookkeeping; `.hermes/` untouched and unstaged.

Because `npm run verify` could not be executed, this slice is **NOT verified** and was deliberately **not committed or pushed**, per the work-order rule that a blocked session writes a truthful handoff instead of claiming completion. The Hermes scheduled evaluator should run the gates, browser smoke, and rendered visual QA, then commit/push under the existing 48h authorization if everything passes.

Browser smoke and rendered visual QA were NOT run by the generator in this session (no browser tooling; exec denied). The change is HUD-chip-plus-sim-log only, covered by the 3 new deterministic tests and the `__rtsSmoke.command.waveForecast()` smoke hook.

## Known limitations

- The forecast shows raider count only; if a future slice adds raider variants, the preview should show composition, not just count.
- `secondsLeft` still ticks while the wave chip shows `웨이브 N` — this matches prior behavior (the chip always showed the countdown), just with the count appended.

## Suggested evaluator checks

1. `npm run verify` and `git diff --check`.
2. Browser smoke per `VERIFY.md`; additionally confirm `__rtsSmoke.command.waveForecast()` returns `{ waveNumber: 1, size: 1, secondsLeft: ~50, imminent: false }` on a fresh match, the wave chip text ends with `라쿤 1기` and carries `data-next-wave-size="1"`, and after `advanceSeconds(45)` the chip switches to the alarm state with `습격 임박! ... 라쿤 1기` and the log shows `라쿤 습격대 1기가 다가옵니다`.
3. After forcing/advancing past wave 1, confirm the chip previews wave 2 with `라쿤 2기` (`data-next-wave-size="2"`).
4. Rendered visual inspection of the wave chip in both normal and alarm states (no zero scores).
