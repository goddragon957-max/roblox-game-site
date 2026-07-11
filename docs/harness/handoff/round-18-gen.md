# Generator Handoff — Round 18

## Slice

**Raider wave spawn telegraph** (goal priority 2: defense loop polish — "better raider telegraph").

Before this slice, the wave warning existed only as a countdown: the HUD wave chip turned into an alarm and a log line announced the raider count, but nothing on the battlefield or minimap showed **where** the wave would appear. This slice gives the warning a place:

- New pure selector `waveTelegraph(state)` returns `{ active, pos, secondsLeft, size }`:
  - `active` only while `waveForecast(state).imminent` is true (inside the `WAVE_WARNING_LEAD` window, `status === 'playing'`) **and** a live enemy camp exists;
  - `pos` is the exact ground point where `spawnWave` will place the wave's lead raider — the spawn math was extracted into a shared `waveSpawnPoint(camp, index)` helper used by both `spawnWave` and the telegraph, so the ring cannot drift from the real spawn location;
  - `secondsLeft`/`size` are passed through from `waveForecast` for HUD/smoke convenience.
- 3D scene: a pulsing enemy-orange (`COLORS.ringEnemy`) ground ring plus a small hovering downward spike at the spawn point, visible only during the warning window, driven by `sim.time` (deterministic, no renderer clock).
- Minimap: a matching pulsing orange circle at the spawn point, drawn before the red "being hit" threat pulse so the two alarms stay visually distinct (orange = incoming, red = taking damage).
- Smoke hook: `window.__rtsSmoke.command.waveTelegraph()`.

Zero new `GameState` fields — the telegraph is fully derived from existing wave timing and camp state, so restart and existing tests are unaffected.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, autonomous) implemented the slice but the session's permission layer denied command execution, matching Rounds 10–17:

- `npm run verify` → **denied** ("This command requires approval").
- `git diff --check` → **allowed**, exit 0, no whitespace errors.
- `git status --short` → **allowed**; exactly the six intended source files are modified, nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no deterministic or browser verification is claimed. The scheduled evaluator must run the gates independently.

## What Changed

- `src/game/types.ts`
  - New `WaveTelegraph { active, pos: Vec2 | null, secondsLeft, size }`.
- `src/game/simulation.ts`
  - New `waveSpawnPoint(camp, index)` helper extracted from `spawnWave` (identical math: `{ x: camp.x - 2 - i*1.4, z: camp.z + 2 + (i%2)*1.6 }`, clamped to map); `spawnWave` now uses it.
  - New pure `waveTelegraph(state)` selector (imminence + live-camp guards, inactive result still carries `secondsLeft`/`size`). No stepping logic touched.
- `src/store/gameStore.ts`
  - `__rtsSmoke.command.waveTelegraph()` hook + `WaveTelegraph` typing.
- `src/render/ThreeRtsScene.tsx`
  - One `telegraphGroup` (ring + spike) created at scene setup, positioned/pulsed per frame in `syncScene` from `waveTelegraph(sim)` and `sim.time`, hidden when inactive, disposed on unmount via the existing `disposeGroup`.
- `src/components/RtsHud.tsx`
  - Minimap draws the pulsing orange incoming circle at `telegraph.pos` using the existing `toPx` mapping.
- `src/game/__tests__/simulation.test.ts`
  - New `wave telegraph` describe with 4 deterministic tests:
    1. inactive at start (full initial-object equality: `pos: null`, `secondsLeft = FIRST_WAVE_AT`, `size = waveSize(1)`);
    2. active inside the warning window with `pos = { x: camp.x - 2, z: camp.z + 2 }`, then advancing just past the spawn moment proves the lead raider actually appears within 0.6 of the telegraphed point;
    3. quiet again after the wave spawns (until the next warning window);
    4. cleared when the enemy camp is destroyed (match won).

All six edited files were read in full before editing. Expected test count: 57 (53 existing + 4 new) — estimated by reading, not running. Compatibility check done by reading: `waveSpawnPoint` preserves `spawnWave`'s exact spawn math (`makeUnit` clones the position, so sharing the Vec2 is safe); `waveForecast` and the camp lookup already existed; the render loop already calls `syncScene` every frame, so no new tick wiring was needed.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 57 tests passing).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - Fresh state: `command.waveTelegraph()` → `{ active: false, pos: null, secondsLeft: 50, size: 1 }`.
   - `command.advanceSeconds(41)` → `waveTelegraph().active === true`, `pos ≈ { x: 14, z: -10 }` (camp at `(16, -12)`), and a pulsing orange ring + spike renders on that ground next to the camp, with a matching pulsing circle on the minimap.
   - `command.advanceSeconds(10)` → wave 1 spawns; `waveTelegraph().active` back to `false`, ring and minimap pulse gone; lead raider appeared where the ring was.
   - Confirm the wave chip alarm (`습격 임박!`) and the telegraph activate over the same window, and console fatal errors remain zero.
3. Rendered visual QA: during the warning window the orange spawn ring should read as "raiders will come from here" without being confusable with the red threat pulse; first screen (t < 40s) is unchanged.
4. If PASS: write `docs/harness/feedback/round-18-qa.md`, update `docs/harness/state.md`, commit as `feat(game): telegraph raider wave spawn point` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- The telegraph marks the lead raider's spawn point only; later raiders in the same wave spawn in the adjacent staggered slots (within ~5.6 units), which the single ring summarizes.
- Ring pulse phase is derived from `sim.time`, so while the game is paused on the endgame overlay the ring is hidden anyway (`imminent` requires `playing`).
- The minimap telegraph reuses the threat-pulse drawing pattern with a different color; colorblind players still get the HUD `습격 임박!` alarm chip and countdown as a non-color channel.

## Session Exit Record

Generator session 2026-07-11T22:2x–22:3xZ used the blocked-session fallback: slice implemented, `npm run verify` PERMISSION_DENIED (read-only `git diff --check`/`git status` were allowed and passed), handoff + state + pipeline notes written, nothing committed or pushed. The scheduled evaluator continues from here.
