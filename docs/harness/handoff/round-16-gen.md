# Generator Handoff — Round 16

## Slice

**Tower shot tracer** (goal priority 2: defense loop polish — "visible projectile/impact feedback").

Before this slice, a player tower dealt damage with only a brief muzzle flash at its own top: at range there was no visible link between the tower and the raider losing HP, so tower kills read as raiders "just dying". This slice makes every tower shot readable:

- The simulation now records each tower shot: firing sets `Building.lastShotAt = state.time` and `lastShotTarget = { ...target.pos }` in `stepBuilding`, right where the damage is applied — the tracer can never point at a raider that wasn't actually hit.
- New pure selector `towerShots(state)` returns `{ id, from, to, age }` for every player tower whose last shot is younger than `TOWER_SHOT_DURATION = 0.35` seconds; it returns `[]` when the match is not `playing`, so no tracer freezes on the win/loss screen.
- 3D scene: a gold bolt flies from the tower top (y ≈ 3.4) down to torso height at the recorded impact point, shrinking slightly in flight; positions are relative to the tower group so `disposeGroup` cleans it up. Always visible during combat (unlike the selection-scoped range ring), because combat feedback should not require selecting the tower.
- Minimap: a gold line from tower to impact point while a shot is active.
- Smoke hook: `window.__rtsSmoke.command.towerShots()`.

`TOWER_SHOT_DURATION` (0.35s) is intentionally shorter than the tower cooldown (1.2s), so the tracer pulses once per shot instead of persisting.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, autonomous) implemented the slice but the session's permission layer denied command execution, matching Rounds 10–15:

- `npm run verify` → **denied** ("This command requires approval").
- `npm run verify:harness` → **denied**.
- `node scripts/harness-check.mjs` → **denied** (only trivial `node --version` was allowed).
- `git diff --check` and `git status --short` → **denied** (even read-only git, as in Round 6).

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no verification is claimed. The scheduled evaluator must run the gates independently.

## What Changed

- `src/game/types.ts`
  - `Building` gains `lastShotAt: number | null` and `lastShotTarget: Vec2 | null`.
  - New `TowerShot` interface: `{ id, from: Vec2, to: Vec2, age: number }`.
- `src/game/simulation.ts`
  - New exported `TOWER_SHOT_DURATION = 0.35`.
  - `makeBuilding` initializes both new fields to `null` (restart resets them for free).
  - `stepBuilding`: the existing tower-fire branch additionally records `lastShotAt`/`lastShotTarget` (a clone of the victim's position at the moment of the hit).
  - New pure `towerShots(state)` selector (player towers only, age-filtered, empty when `status !== 'playing'`, clones positions).
- `src/store/gameStore.ts`
  - `__rtsSmoke.command.towerShots()` hook + `TowerShot` typing.
- `src/render/ThreeRtsScene.tsx`
  - `EntityVisual` gains `bolt`; player tower visuals get a small gold sphere, hidden by default.
  - `syncScene` builds a `Map` from `towerShots(sim)` once per frame and lerps each firing tower's bolt from `(0, 3.4, 0)` to `(to − pos, 0.6, …)` by `age / TOWER_SHOT_DURATION`, with a slight shrink; hidden when no active shot.
- `src/components/RtsHud.tsx`
  - Minimap draws a gold `rgba(245, 197, 66, 0.9)` line from `shot.from` to `shot.to` for each active shot (drawn after the range circles, before the threat pulse).
- `src/game/__tests__/simulation.test.ts`
  - New `tower shot feedback` describe with 4 deterministic tests:
    1. a tower hit records exactly one tracer with `from` = tower pos, `to` = the hit raider's pos, small `age`, and the raider's HP reduced by the tower's real `attackDamage`;
    2. the tracer expires after `TOWER_SHOT_DURATION` and refreshes when the cooldown elapses and the tower fires again;
    3. no shot is ever recorded while all raiders are out of range (`lastShotAt` stays `null`);
    4. `towerShots` returns `[]` once the match ends, even with a fresh shot recorded.

All six edited files were read in full before editing. Expected test count: 49 (45 existing + 4 new) — estimated by reading, not running. Compatibility check done by reading: `Building` literals are only created in `makeBuilding` (updated); existing tower tests (`tower range preview`) build towers via `placeBuilding` and don't assert on the new fields; time freezes when `status !== 'playing'`, which is why `towerShots` must gate on status rather than relying on age growth.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 49 tests passing).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - `command.build('tower')`, then either wait for the first wave (~50s) or use `command.advanceSeconds(...)` until raiders enter the tower's range 8; while the tower is firing, `command.towerShots()` should return one entry per firing tower with `age ≤ 0.35`.
   - Visually: a gold bolt should streak from the tower top toward the raider roughly once per 1.2s, and the minimap should show a matching gold line pulse.
   - Confirm the tracer disappears between shots and after the match ends (win/loss overlay shows no frozen bolt).
   - Verify console fatal errors remain zero.
3. Rendered visual QA: tower→raider combat readability during a wave defense; the first screen is unchanged.
4. If PASS: write `docs/harness/feedback/round-16-qa.md`, update `docs/harness/state.md`, commit as `feat(game): tower shot tracer feedback` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- The tracer is a straight lerp to the victim's position at the moment of the hit; a raider that keeps moving during the 0.35s flight can outrun the impact point slightly (cosmetic, damage already applied in the sim).
- One tracer per tower (the most recent shot); with cooldown 1.2s > duration 0.35s a tower can never have two live shots anyway.
- Soldier/raider melee attacks keep their existing strike-pulse feedback; only towers get projectiles (they are the only ranged attacker).
- No impact burst/particles at the hit point yet — the bolt shrink plus the victim's HP bar carries the impact read; a future slice could add one.

## Session Exit Record

Generator session 2026-07-11T16:2x–16:4xZ used the blocked-session fallback: slice implemented, `npm`/`node <script>`/`git` all PERMISSION_DENIED (only `node --version`, `ls`, `wc`, `date` were allowed), handoff + state + pipeline notes written, nothing committed or pushed. The scheduled evaluator continues from here.
