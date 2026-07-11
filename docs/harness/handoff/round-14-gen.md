# Generator Handoff — Round 14

## Slice

**Soldier auto-defense (defensive aggro)** (goal priority 2: defense loop polish; product direction "soldiers and towers defend the base").

Before this slice, an idle player soldier was a pure no-op in `stepUnit`: raiders could walk straight past a standing army to hit the base, and only towers (and explicit player attack commands) ever fought back. Raiders already have their own aggro (`assault` acquires targets within `RAIDER_AGGRO_RANGE = 8`), so combat was asymmetric against the player. This slice gives idle player soldiers a classic RTS defensive aggro: they automatically engage the nearest enemy **unit** within `SOLDIER_AGGRO_RANGE = 7` and return to idle after the kill (then re-acquire if another enemy is in range).

Deliberate boundaries, all enforced in code and covered by tests:

- Workers never auto-engage (they keep fleeing-free idle behavior; economy units are not combatants).
- Only enemy *units* trigger aggro (via the existing `nearestEnemyUnit`), so idle soldiers never auto-attack the enemy camp — destroying the camp stays an explicit player decision (win condition).
- Explicit orders are untouched: aggro only runs in the `idle` branch, so move/gather/attack orders behave exactly as before.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, non-interactive) implemented the slice but the session's permission layer denied command execution:

- `npm run verify` → **denied** ("This command requires approval"), both piped and bare forms.
- `git diff --check` → **ran, exited 0**, no whitespace errors.
- `git status --short` → 2 modified files (`src/game/simulation.ts`, `src/game/__tests__/simulation.test.ts`), nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no verification is claimed. The scheduled evaluator must run the gates independently, as in Rounds 10–13.

## What Changed

- `src/game/simulation.ts`
  - Added `export const SOLDIER_AGGRO_RANGE = 7;` next to `RAIDER_AGGRO_RANGE`.
  - In `stepUnit`, the `idle` case now checks: if the unit is a player-faction soldier, acquire the nearest enemy unit within `SOLDIER_AGGRO_RANGE` via the existing `nearestEnemyUnit`, set an `attack` order on it, and immediately run `stepAttack` for this tick (no dead frame). A comment documents the worker/camp exclusions.
  - No other sim behavior changed; the slice is renderer-independent (existing attack-pulse feedback in `ThreeRtsScene.tsx` already visualizes the strikes, and the threat alert/minimap pulse already covers "my units are fighting" awareness).
- `src/game/__tests__/simulation.test.ts`
  - Imported `SOLDIER_AGGRO_RANGE`.
  - New `soldier auto-defense` describe with 3 deterministic tests:
    1. an idle trained soldier engages a raider teleported to `SOLDIER_AGGRO_RANGE - 1` (order becomes `attack` with that raider's id), kills it within 12s (`raidersDefeated` increments, raider removed), and returns to `idle`;
    2. with every enemy placed at `SOLDIER_AGGRO_RANGE + 2`, the soldier stays `idle` and does not move (position compared to a snapshot);
    3. an idle worker with a raider 2 units away stays `idle` and the raider takes no damage.

Both edited files were read in full before editing. Generated-session expected test count note: 39 tests before the evaluator amendment (36 prior + 3 generated); final evaluator PASS after the added regression test has 40 tests.

Compatibility check done by reading, not running: the existing test `never lists soldiers or enemy units even when they are idle` still holds — the trained soldier spawns near the build slots (~x −8, z 16) while the starting raiders idle at (14, −9.5)/(18, −10), far outside aggro range.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 42 tests passing).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - Build a barracks, train a soldier, let it idle near the base (`command.build('barracks')`, `command.train()`, `command.advanceSeconds(5)`).
   - `command.advanceSeconds()` past the first wave (wave 1 arrives at 50s with a single raider): the idle soldier should switch to an `attack` order on its own once the raider closes within 7 units, and the raider should die without any player attack command (`stats.raidersDefeated` increases).
   - Confirm workers never auto-engage (starting idle workers keep `idle` orders while raiders are far; optionally teleport a raider near a worker via `setState` if deeper verification is wanted).
   - Confirm an explicitly commanded soldier (move/attack) behaves as before.
   - Verify console fatal errors remain zero.
3. Rendered visual QA: during the auto-defense fight, the existing attack pulse/HP-bar feedback must make the engagement readable; the first screen is unchanged.
4. If PASS: write `docs/harness/feedback/round-14-qa.md`, update `docs/harness/state.md`, commit as `feat(game): soldier auto-defense aggro` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Evaluator Amendment

The scheduled evaluator found that the generated `SOLDIER_AGGRO_RANGE = 7` passed the direct unit test but failed the natural browser wave smoke: a trained soldier stayed idle while raiders reached the base, the match was lost, and no raider was defeated. The evaluator applied one focused correction before acceptance:

- Raised `SOLDIER_AGGRO_RANGE` to `10`, wide enough for the barracks-spawned soldier to protect the headquarters approach.
- Added a deterministic regression test proving a trained idle soldier defeats the first assault wave without an explicit attack command.
- Reran `npm run verify`, `git diff --check`, browser smoke, console checks, and rendered visual QA; final PASS evidence is in `docs/harness/feedback/round-14-qa.md`.

## Known Limitations

- Aggro has no leash: once engaged, a soldier chases its target until one of them dies (or the player issues a new order). Raiders normally advance toward the base, so in practice fights happen near the defense line; a leash/return-to-post is a possible future slice.
- Auto-aggro applies only to the `idle` order; a soldier on a `move` order does not engage en route (attack-move is a separate future slice).
- `max_rounds` in `docs/harness/state.md` is 14; if the 48h loop should continue past this round, the evaluator (or operator) needs to raise it.

## Session Exit Record

Generator session terminated 2026-07-11 (after 12:19:17Z) via the blocked-session fallback: slice implemented, `npm run verify` PERMISSION_DENIED, `git diff --check` passed, handoff + state notes written, nothing committed or pushed. A no-op exit marker (`true`, exit code 0) was executed as the session's final command; `exit 0` itself was denied by the same permission layer. No further work will occur in this session — the scheduled evaluator continues from here.
