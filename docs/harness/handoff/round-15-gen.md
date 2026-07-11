# Generator Handoff — Round 15

## Slice

**Barracks rally point** (goal priority 1: stronger RTS control/readability; also priority 4 production-loop flow).

Before this slice, a freshly trained soldier spawned next to the barracks with an `idle` order and stayed there until aggro or an explicit command. There was no way to tell production "send new soldiers to the front", so army building meant repeatedly walking back to collect stragglers. This slice adds the classic RTS rally point:

- Right-clicking **open ground** while a player barracks is selected sets `Building.rallyPoint` for that barracks (one log line per set: `집결 지점 지정 — 새로 훈련된 병사가 그곳으로 이동합니다`).
- Newly trained soldiers spawn with a `move` order to the rally instead of `idle`; on arrival they idle (and the Round 14 auto-defense aggro then applies at the rally position).
- Gather/attack right-clicks never move the rally: only commands with no resource-node and no hostile target set it, so worker gather loops and attack orders behave exactly as before.
- Mixed selections work like a real RTS: one right-click moves the selected units *and* retargets the selected barracks' rally.

Readability wiring, all derived from real state via a new pure selector `rallyPreviews(state)` (selected player barracks with a rally only):

- 3D scene: a green flag (pole + cloth + ground ring) at the rally, visible only while its barracks is selected (same policy as the tower range ring); the smart-command marker pulses green when a click sets a rally with no units commanded.
- Minimap: dashed green line from barracks to rally plus a rally dot, again selection-scoped.
- Selection panel: barracks now shows `집결 지점 (x, z) — 새 병사가 이동` or the hint `우클릭으로 병사 집결 지점을 지정하세요`, exposed as `data-rally-point="x,z"` / `"none"` for smoke.
- HUD control hint now reads `우클릭 이동/채집/공격/집결`.
- Smoke hook: `window.__rtsSmoke.command.rallyPoints()` returns the previews.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, autonomous) implemented the slice but the session's permission layer denied command execution, matching Rounds 10–14:

- `npm run verify` → **denied** ("This command requires approval"), both piped and bare forms.
- `node scripts/harness-check.mjs` → **denied**.
- `npx vitest run` → **denied**.
- `git diff --check` → **ran, exited 0**, no whitespace errors.
- `git status --short` → 7 modified files, nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no verification is claimed. The scheduled evaluator must run the gates independently.

## What Changed

- `src/game/types.ts`
  - `Building` gains `rallyPoint: Vec2 | null`.
  - New `RallyPreview` interface: `{ id, from: Vec2, point: Vec2 }` (barracks position + rally target, for the minimap line).
- `src/game/simulation.ts`
  - `makeBuilding` initializes `rallyPoint: null` (restart resets it for free).
  - `commandSmart`: the `units.length === 0` early return moved below target resolution; when the target resolves to neither a node nor a hostile, every selected player barracks gets `rallyPoint = { ...target.point }`, with one log line when at least one rally was set. Unit orders are dispatched exactly as before.
  - `stepBuilding`: a finished trainee spawns with `{ type: 'move', target: { ...rallyPoint } }` when a rally exists, else `idle` as before.
  - New pure `rallyPreviews(state)` selector (selection-scoped, player barracks only, clones positions).
- `src/store/gameStore.ts`
  - `__rtsSmoke.command.rallyPoints()` hook + `RallyPreview` typing.
- `src/render/ThreeRtsScene.tsx`
  - `EntityVisual` gains `rallyFlag`; player barracks visuals build a flag group (pole, green cloth, ground ring), hidden by default, positioned each sync at `rally − building.pos` inside the building group (so `disposeGroup` cleans it up), visible only while selected with a rally set.
  - Right-click marker: a click that only set a rally (no units commanded) now shows the marker in player-green; unit command colors are unchanged. Rally detection compares the stored rally to the clicked point (< 1e-6), so a barracks with an old rally doesn't false-positive on an ignored click.
- `src/components/RtsHud.tsx`
  - Minimap: dashed rally line + dot from `rallyPreviews` (drawn before tower range circles; `setLineDash` reset after use).
  - Selection panel barracks note with `data-rally-point`.
  - Control hint updated.
- `src/game/__tests__/simulation.test.ts`
  - New `barracks rally point` describe with 5 deterministic tests:
    1. ground command with barracks selected sets the rally + logs once, the next trained soldier spawns with a `move` order to the rally, arrives (< 0.3), and idles;
    2. gather-node and enemy-target commands leave `rallyPoint` null;
    3. a mixed worker+barracks selection moves the worker and sets the rally in one command;
    4. `rallyPreviews` is empty without selection or rally, returns `{ id, from, point }` when the rallied barracks is selected, and empties again when deselected;
    5. with no rally set, trained soldiers still spawn `idle` (Round 14 regression guard).

All six edited source files were read in full before editing. Generator estimated test count: 47 (42 existing + 5 new), but evaluator verification found the actual suite is 45 tests (40 existing + 5 new). Compatibility check done by reading, not running: existing tests that assert a trained soldier spawns `idle` (`stateWithSoldier`, idle-worker tests) never set a rally, so the `null → idle` default preserves them; the enemy-command test passes a raider id whose `findBuilding` lookup is undefined, so the new rally loop is a no-op there.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 47 tests passing).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - `command.build('barracks')`, select the barracks (click or `getState().select([id])`), right-click open ground (or `command.smart(x, z)` with the barracks selected): `command.rallyPoints()` should return the rally, the green flag should appear at the point, the minimap should show the dashed line + dot, and the selection panel should show `집결 지점 (x, z)` with `data-rally-point`.
   - `command.train()` + `command.advanceSeconds(5)`: the new soldier should walk to the rally and idle there.
   - Right-click a gold node with the barracks selected: rally must not move.
   - Deselect the barracks: flag and minimap line disappear; reselect: they return.
   - Verify console fatal errors remain zero.
3. Rendered visual QA: flag/minimap/selection-panel readability during the flow above; the first screen is unchanged.
4. If PASS: write `docs/harness/feedback/round-15-qa.md`, update `docs/harness/state.md`, commit as `feat(game): barracks rally point` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- One rally per barracks and rallies are ground points only (no rally-on-entity like "rally to this soldier" or auto-gather rally for workers — barracks only trains soldiers anyway).
- A soldier en route to the rally uses a plain `move` order, so it does not auto-engage until it arrives (consistent with Round 14's idle-only aggro; attack-move remains a future slice).
- The rally flag/minimap line are selection-scoped by design; there is no always-on indicator.
- Right-clicking a friendly entity (e.g. own base) with a barracks selected also sets the rally at that point, since only nodes and hostiles are excluded — this matches "rally at the base" RTS usage.

## Session Exit Record

Generator session 2026-07-11T13:05–13:1xZ used the blocked-session fallback: slice implemented, `npm run verify` / `node` / `npx` PERMISSION_DENIED, `git diff --check` passed, handoff + state + pipeline notes written, nothing committed or pushed. The scheduled evaluator continues from here.
