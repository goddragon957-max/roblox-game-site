# Generator Handoff — Round 21

## Slice

Wave-cleared reward feedback for the wave/replay loop: when the player wipes every raider after a wave has gone out, the game now celebrates the defense instead of silently ticking toward the next wave.

## What Changed

- `src/game/types.ts`
  - Added `WaveClear { active, waveNumber, secondsAgo }`.
  - Added `activeWaveRaiderIds: string[]`, `lastWaveClearedAt: number | null`, and `lastWaveClearedNumber: number` to `GameState`.
- `src/game/simulation.ts`
  - Added `WAVE_CLEAR_FEEDBACK_DURATION = 5`.
  - `createInitialState()` initializes the new wave-clear fields (restart resets them for free).
  - `spawnWave()` records spawned raider ids in `activeWaveRaiderIds`.
  - `removeDead()` records a wave clear when a spawned active-wave raider dies and the active wave-raider list becomes empty, so pre-wave camp guards can remain alive without suppressing the reward; clearing guards before any wave stays quiet.
  - Added pure `waveClear(state)` deriving the celebration window (active only while `status === 'playing'` and within the feedback duration).
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.waveClear()` for browser smoke.
- `src/components/RtsHud.tsx`
  - Added a green `웨이브 N 격퇴! 다음 습격을 준비하세요` HUD chip (PartyPopper icon) with `data-wave-cleared={waveNumber}`, rendered between the wave-forecast chip and the threat chip while `waveClear(sim).active`.
- `src/styles.css`
  - Added `.hud-chip.wave-clear` (frontier-green celebratory treatment) and the `wave-clear-pop` entry animation.
- `src/game/__tests__/simulation.test.ts`
  - New `describe('wave clear feedback')` with 3 deterministic tests: celebration after wiping wave 1 (log line + active window + wave number), pre-wave camp-guard kills never celebrate, and expiry after `WAVE_CLEAR_FEEDBACK_DURATION` with exactly one log line per wave.

## Commands / Verification

```bash
npm run verify
# BLOCKED: PERMISSION_DENIED — this non-interactive session auto-denies npm/npx/node,
# so harness-check, vitest, tsc, and vite build were NOT run. Do not treat this
# slice as verified.

git diff --check
# PASS: exited 0, no whitespace errors.
```

No browser smoke, screenshot, or visual QA was performed by Claude. All generator-session verification claims above are limited to `git diff --check`; the scheduled evaluator subsequently ran the full gates and recorded the verified result in `docs/harness/feedback/round-21-qa.md`.

## Suggested Evaluator Smoke

1. `npm run verify` and `git diff --check`.
2. Browser: load the app, run `__rtsSmoke.command.advanceSeconds(51)` (wave 1 out), kill remaining raiders (e.g. train soldiers first or set enemy unit HP via `setState`-driven sim access), then confirm:
   - `__rtsSmoke.command.waveClear()` returns `{ active: true, waveNumber: 1, ... }`;
   - the green `웨이브 1 격퇴!` chip with `data-wave-cleared="1"` appears and disappears after ~5s;
   - the log shows `라쿤 습격대 1차 웨이브 격퇴 — 프론티어를 지켜냈습니다!`;
   - console fatal errors: 0.

## Known Limitations / Follow-up

- The celebration is HUD/log only; a world-space confetti/particle burst at the last kill position remains future visual polish.
- Wave clears grant no score bonus; wiring `lastWaveClearedNumber` into `matchScore` could be a future replayability slice.
- Vite chunk-size warning (pre-existing) remains out of scope.
