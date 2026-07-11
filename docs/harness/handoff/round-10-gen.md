# Generator Handoff — Round 10

## Slice

Defense-loop readability: under-attack threat alert (HUD alarm chip + minimap threat pulse + one-per-episode warning log), from the 48h loop priority list items 2/5 (raider telegraph, minimap threat pulses).

## Status: IMPLEMENTED, NOT VERIFIED — evaluator must run gates

This Claude session was non-interactive and the permission layer auto-denied every execution attempt (`npm run verify`, `./node_modules/.bin/vitest run` → "This command requires approval"). Deterministic gates and browser smoke were **not** run. Do not treat this handoff as a PASS. The scheduled evaluator must verify before any commit/push.

## Implemented

- `src/game/types.ts` — `GameState` gains `lastPlayerHitAt: number | null` and `lastPlayerHitPos: Vec2 | null`; new `ThreatAlert` interface (`active`, `pos`, `secondsAgo`).
- `src/game/simulation.ts`
  - New constant `THREAT_ALERT_DURATION = 4` (seconds an alert stays active after the last hostile hit).
  - `damageTarget()` now records player-faction hits via `recordPlayerHit()` (only enemy attacks can reach player-faction targets, so any player hit there is hostile damage).
  - `recordPlayerHit()` stores hit time/position and pushes one log warning per attack episode (re-logs only after the alert has fully expired): `본부가 공격받고 있습니다 — 방어하세요!` for the base, `아군이 공격받고 있습니다 — 미니맵을 확인하세요!` otherwise.
  - New pure `threatAlert(state)` derives `{ active, pos, secondsAgo }`; inactive when no hit yet, after `THREAT_ALERT_DURATION`, or when the match is over.
- `src/store/gameStore.ts` — exposes `window.__rtsSmoke.command.threatAlert()`.
- `src/components/RtsHud.tsx`
  - Top bar shows a red pulsing `피격 경보! 미니맵을 확인하세요` chip (`data-threat-alert`, `ShieldAlert` icon) while the alert is active.
  - Minimap draws an expanding/fading red ring at the last hit position while the alert is active (phase derived from `sim.time`, so it animates on the existing 220ms redraw interval).
- `src/styles.css` — `.hud-chip.threat` red alarm styling reusing the existing `wave-alarm` keyframes.
- `src/game/__tests__/simulation.test.ts` — new `threat alert` describe block, 4 deterministic tests:
  1. inactive at start and after 5 quiet seconds;
  2. activates at the base position with the base warning log when raiders damage the base;
  3. logs exactly one warning over 10s of continuous attack;
  4. expires after `THREAT_ALERT_DURATION` once attackers die, while keeping the last hit position.

## Files Changed

- `src/game/types.ts`
- `src/game/simulation.ts`
- `src/store/gameStore.ts`
- `src/components/RtsHud.tsx`
- `src/styles.css`
- `src/game/__tests__/simulation.test.ts`
- `docs/harness/handoff/round-10-gen.md` (this file)
- `docs/harness/state.md` (note only; round counters left for the evaluator)

## Commands / Results

- `npm run verify` — **NOT RUN**: auto-denied ("This command requires approval").
- `./node_modules/.bin/vitest run` — **NOT RUN**: auto-denied.
- `git diff --check` — PASS (exit 0, no whitespace errors).
- `git status --short` — exactly the six source files above modified; no `.hermes/` files touched or staged.
- Browser smoke — **NOT RUN** (no exec available to build/serve).

## Known Limitations / Risks for the Evaluator

- All source files were read in full before editing; the diff type-checks by inspection only — `tsc` was not run, so verify lint/build first.
- `grep -rn "waveWarned" src` confirmed `createInitialState()` is the only `GameState` constructor, so the two new fields should not break other call sites.
- Browser smoke suggestion: `selectWorkers()` is unaffected; for the alert, either wait past the first wave (50s) or use `smart()` to send a worker at a raider and `advanceSeconds()` until it takes a hit, then check `command.threatAlert().active === true`, the `[data-threat-alert]` chip, and the red minimap ring.
- The endgame overlay hides the chip because `threatAlert()` is inactive when `status !== 'playing'` — worth confirming in smoke.

## Next Role

Evaluator: run `npm run verify` + `git diff --check`, do the browser/play smoke including the new `threatAlert()` hook and visual pulse, write `docs/harness/feedback/round-10-qa.md`, and only then commit as `feat(game): alert when the base is under attack` and push to `origin main` per the 48h loop policy.
