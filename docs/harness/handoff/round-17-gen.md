# Generator Handoff — Round 17

## Slice

**Selected-unit order lines** (goal priority 1: stronger RTS control/readability — "command path/target markers").

Before this slice, issuing a smart command produced only a 0.6s fading click marker: once it faded, nothing showed where a selected unit was actually going, which node it was gathering, or which enemy it was attacking. This slice makes every selected unit's current order readable at a glance:

- New pure selector `orderPreviews(state)` returns `{ id, from, to, kind }` for each **selected player unit** with an active destination, derived entirely from real orders:
  - `move` → the order's ground target;
  - `gather` → the live node's position (skipped if the node is gone or empty);
  - `deposit` → the player base position (skipped if the base is gone);
  - `attack` → the target entity's current position (skipped once the target's HP ≤ 0);
  - `idle`/`assault` produce nothing (assault is enemy-only), and the selector returns `[]` when `status !== 'playing'` so no lines linger under the endgame overlay.
- 3D scene: a ground-level line from unit to destination plus a small flat dot at the destination, per selected unit, updated every frame. Colors reuse the smart-command marker language: **white** move, **gold** gather/deposit, **red** attack.
- Minimap: matching dashed lines in the same three colors, drawn before rally/range/shot overlays.
- Smoke hook: `window.__rtsSmoke.command.orderPreviews()`.

Selection-scoped on purpose (like the tower range ring and rally flag): the field stays uncluttered until the player asks "what is this unit doing?" by selecting it. Since `from` is the unit's live position and `to` tracks a moving attack target, lines follow units each frame with no extra sim state — this slice adds **zero** new fields to `GameState`.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, autonomous) implemented the slice but the session's permission layer denied command execution, matching Rounds 10–16:

- `npm run verify` → **denied** ("This command requires approval").
- `npx vitest run` → **denied**.
- `node scripts/harness-check.mjs` → **denied**.
- `git diff --check` → **allowed**, exit 0, no whitespace errors.
- `git status --short` → **allowed**; exactly the six intended source files are modified, nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no deterministic or browser verification is claimed. The scheduled evaluator must run the gates independently.

## What Changed

- `src/game/types.ts`
  - New `OrderPreviewKind = 'move' | 'gather' | 'deposit' | 'attack'` and `OrderPreview { id, from: Vec2, to: Vec2, kind }`.
- `src/game/simulation.ts`
  - New pure `orderPreviews(state)` selector (selected player units only, clones positions, target-liveness guards, empty when `status !== 'playing'`). No stepping logic touched.
- `src/store/gameStore.ts`
  - `__rtsSmoke.command.orderPreviews()` hook + `OrderPreview` typing.
- `src/render/ThreeRtsScene.tsx`
  - New `ORDER_COLORS` map reusing the existing marker palette.
  - Per-preview `orderVisuals` (a two-point `THREE.Line` with a preallocated position attribute, `frustumCulled = false` since endpoints move every frame, plus a destination dot); synced/recolored each frame in `syncScene`, disposed when the preview disappears and on unmount.
- `src/components/RtsHud.tsx`
  - Minimap draws a dashed line per order preview (white/gold/red by kind) using the existing `toPx` mapping.
- `src/game/__tests__/simulation.test.ts`
  - New `order previews` describe with 4 deterministic tests:
    1. a commanded move shows a line only after the unit is selected (unselected units produce nothing);
    2. gather lines point at the node; flipping the same worker to `deposit` (with carry) points the line at the player base;
    3. an attack line tracks the raider and disappears the moment the target's HP reaches 0;
    4. idle selections produce nothing and `status = 'won'` empties active previews.

All six edited files were read in full before editing. Expected test count: 53 (49 existing + 4 new) — estimated by reading, not running. Compatibility check done by reading: `orderPreviews` is purely derived (no new `GameState` fields, so restart/`createInitialState` and existing tests are unaffected); `selectedPlayerUnits`, `findNode`, `findTargetEntity`, and `playerBase` already existed and are reused; the render loop already calls `syncScene` every frame, so no new tick wiring was needed.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 53 tests passing).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - `command.selectWorkers()` then `command.smart(x, z)` on open ground → `command.orderPreviews()` returns one `move` entry per worker and white lines render from each worker to the point, vanishing as each arrives (order flips to idle).
   - Smart-command a gold node → previews flip to `gather` (gold line to the node), then alternate `gather`/`deposit` (gold line to the base) as workers shuttle.
   - Select a soldier and smart-command a raider or the camp → one red `attack` line that tracks the target and disappears on the kill.
   - Deselect (click empty ground) → `orderPreviews()` returns `[]` and all lines disappear.
   - Confirm the minimap shows matching dashed lines while previews are active, and console fatal errors remain zero.
3. Rendered visual QA: with several gathering workers selected, the gold shuttle lines should make the economy loop legible without clutter; first screen (nothing selected) is unchanged.
4. If PASS: write `docs/harness/feedback/round-17-qa.md`, update `docs/harness/state.md`, commit as `feat(game): selected-unit order lines` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- Lines are straight unit→destination segments, not pathfinding routes (movement itself is straight-line, so they match actual travel).
- `deposit` reads as gold-colored even when carrying wood; the carried-cube color on the worker already distinguishes the resource.
- Enemy raiders never show lines (previews are player-selection-scoped by design).
- A large drag-selected army shows one line per unit; acceptable at current unit counts, and previews only exist while selected.

## Session Exit Record

Generator session 2026-07-11T21:1x–21:3xZ used the blocked-session fallback: slice implemented, `npm run verify`/`npx vitest run`/`node scripts/harness-check.mjs` all PERMISSION_DENIED (read-only `git diff --check`/`git status` were allowed and passed), handoff + state + pipeline notes written, nothing committed or pushed. The scheduled evaluator continues from here.
