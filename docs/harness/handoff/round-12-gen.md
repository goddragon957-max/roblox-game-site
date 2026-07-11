# Generator Handoff — Round 12

## Slice

**Drag-box multi-select** (goal priority 1: stronger RTS control/readability).

Round 9 added the multi-selection summary panel, but real mouse input could only ever select one entity per left-click — multi-selection was reachable only through smoke commands. This slice adds the standard RTS left-drag selection box so a player can actually form a squad with the mouse.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, non-interactive) implemented the slice but the session's permission layer denied command execution:

- `npm run verify` → **denied** ("This command requires approval"), both piped and bare forms.
- `git diff --check` → **ran, exited 0**, no whitespace errors.
- `git status --short` → 7 modified files (listed below), nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no verification is claimed. The scheduled evaluator must run the gates independently, as in Rounds 10 and 11.

## What Changed

- `src/game/simulation.ts`
  - Added `DRAG_SELECT_PADDING` (0.35) and pure `playerUnitIdsInRect(state, a, b)`: returns ids of player-faction units inside the world-space XZ box spanned by two ground points, in either corner order, padded so edge units count. Buildings and enemy units are excluded (classic RTS drag-select semantics).
- `src/store/gameStore.ts`
  - Added smoke hook `window.__rtsSmoke.command.selectRect(x1, z1, x2, z2)` — computes the rect ids, applies them via `select`, returns the ids.
- `src/render/ThreeRtsScene.tsx`
  - Left pointerdown now records a drag anchor (screen pos, ground raycast point, picked entity id) instead of selecting immediately.
  - Window-level pointermove: past a 6px threshold the drag becomes a box select — a `div.drag-select-box` overlay is shown/sized in screen space and the latest valid ground point is tracked.
  - Window-level pointerup (left button): a drag selects `playerUnitIdsInRect(anchor, end)` (empty box clears selection); a plain click applies the previously picked entity (or clears), preserving single-click select behavior at release time.
  - Overlay element and both window listeners are cleaned up on unmount.
  - Right-click smart command handling is unchanged.
- `src/styles.css`
  - Added `.drag-select-box`: absolutely positioned, `display: none` by default, `pointer-events: none`, frontier-green border and translucent fill, `z-index: 1` (below the HUD at `z-index: 2`).
- `src/components/RtsHud.tsx`
  - Control hint now reads `좌클릭 선택 · 드래그 부대 선택 · 우클릭 이동/채집/공격 · WASD/방향키 카메라`.
- `src/game/__tests__/simulation.test.ts`
  - New `drag selection` describe with 3 deterministic tests: (1) box around the base area finds exactly the 3 starting workers in either corner order; (2) a box covering both starting raiders returns empty; (3) rect ids fed through `setSelection` produce a real 3-worker multi-selection (`selectionSummary` groups `worker ×3, 120/120 hp`) and an empty-area rect clears it.
- `docs/harness/state.md`
  - `current_phase: round_12_generated`, `next_role: evaluator`, `last_verdict: pending`, `updated_at: 2026-07-11T07:17:06Z`.

All edited files were read in full before editing.

## Behavior Note (intentional change)

Single-click selection now applies on pointer **release**, not press, so it can be distinguished from a drag. Entity pick still happens at press position. This is standard RTS input; smoke commands (`selectWorkers` etc.) are unaffected.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 33 tests: 30 existing + 3 new).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - `window.__rtsSmoke.command.selectRect(-16, 9, -11, 14)` returns 3 worker ids and `getState().sim.selectedIds` matches; the HUD selection panel shows `선택 부대 ×3` with worker composition chips.
   - `selectRect(5, 5, 8, 8)` (empty ground) clears the selection.
   - Real input: left-press on open ground near the base, drag across the workers, release — a green translucent box renders during the drag and the workers end selected with rings; a plain left-click on a single unit still selects only it; right-click orders still work after a drag.
   - Verify console fatal errors remain zero.
3. Rendered visual QA: the drag box must read as crisp RTS UI (green border/fill) and must not linger after release.
4. If PASS: write `docs/harness/feedback/round-12-qa.md`, update `docs/harness/state.md`, commit as `feat(game): drag-box multi-unit selection` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- Drag select uses the world-space AABB of the two ground raycast points; with the fixed isometric camera a screen rect maps to a slightly rotated world quad, so the box is an approximation (standard-feeling in play, deterministic in tests).
- Drag selects units only (workers/soldiers), never buildings — intentional.
- No additive (shift) selection yet; a drag replaces the current selection.
