# Generator Handoff — Round 11

## Slice

Defense-loop readability: tower range preview — selecting a player defense tower now shows its real attack radius as a translucent ring + disc on the battlefield, a matching green circle on the minimap, and a range note in the selection panel. From the 48h loop priority list item 2 ("tower range preview") and the Round 10 QA follow-up suggestion.

## Status: IMPLEMENTED, NOT VERIFIED — evaluator must run gates

This Claude session's permission layer auto-denied execution (`npm run verify` → "This command requires approval"), matching the Round 10 exec-denied pattern. Deterministic gates and browser smoke were **not** run. Do not treat this handoff as a PASS. The scheduled evaluator must verify before any commit/push.

## Implemented

- `src/game/types.ts` — new `RangePreview` interface (`id`, `pos: Vec2`, `radius`).
- `src/game/simulation.ts` — new pure `towerRangePreviews(state): RangePreview[]`: for each id in `selectedIds`, includes player-faction buildings with `attackRange > 0` (currently only towers; base/barracks/enemyCamp have `attackRange: 0` and are excluded by both the faction and range guards). Position is copied, radius is the building's real `attackRange` (8 for towers), so the preview can never drift from combat stats.
- `src/store/gameStore.ts` — exposes `window.__rtsSmoke.command.towerRanges()`.
- `src/render/ThreeRtsScene.tsx`
  - `EntityVisual` gains `rangeRing: THREE.Group | null` (null for units and non-tower buildings).
  - Player towers get a flat `RingGeometry(attackRange - 0.22, attackRange, 64)` edge (ringPlayer green, opacity 0.55) plus a faint `CircleGeometry(attackRange)` disc (opacity 0.08) at y ≈ 0.05, parented to the tower group so it follows the tower position.
  - `syncScene` toggles `rangeRing.visible` with selection, same pattern as the existing selection ring.
- `src/components/RtsHud.tsx`
  - Minimap draws a green stroked circle (`rgba(95, 240, 139, 0.85)`) at each `towerRangePreviews()` entry, radius scaled by `radius / (MAP_HALF * 2) * size`.
  - Selection panel shows `사거리 {attackRange} · 범위 안 라쿤 자동 공격` with `data-tower-range` when a tower is the primary selection.
- `src/game/__tests__/simulation.test.ts` — new `tower range preview` describe block, 3 deterministic tests:
  1. empty with no selection and with only non-attacking entities (base + worker + enemy camp) selected;
  2. selected tower previews at its position with its real `attackRange` (> 0);
  3. mixed selection keeps only the tower; preview clears after the tower dies (selection cleanup in `removeDead`).

## Files Changed

- `src/game/types.ts`
- `src/game/simulation.ts`
- `src/store/gameStore.ts`
- `src/render/ThreeRtsScene.tsx`
- `src/components/RtsHud.tsx`
- `src/game/__tests__/simulation.test.ts`
- `docs/harness/handoff/round-11-gen.md` (this file)
- `docs/harness/state.md` (phase/next_role/verdict updated for the evaluator)

## Commands / Results

- `npm run verify` — **NOT RUN**: auto-denied ("This command requires approval").
- `git diff --check` — PASS (exit 0, no whitespace errors).
- `git status --short` — exactly the six source files above modified; no `.hermes/` files touched or staged.
- Browser smoke — **NOT RUN** (no exec available to build/serve).

## Known Limitations / Risks for the Evaluator

- All changed files were read in full before editing; the diff type-checks by inspection only — run lint/build first.
- No CSS changes were needed (`selection-note` styling is reused), so `src/styles.css` is untouched this round.
- Browser smoke suggestion: `build('tower')` (initial 120g/80w affords one tower), then `getState().select([towerId])` with the id from `getState().sim.buildings`; check `command.towerRanges()` returns `[{ id, pos, radius: 8 }]`, the green range ring/disc appears around the tower in the scene, the minimap shows the matching circle, and the selection panel shows `사거리 8`. Deselect and confirm the ring hides.
- The range ring is parented to the tower group, so it disposes with the tower via the existing `disposeGroup` path — worth confirming no console errors after a tower dies while selected.

## Next Role

Evaluator: run `npm run verify` + `git diff --check`, do the browser/play smoke including the new `towerRanges()` hook and the rendered range ring, write `docs/harness/feedback/round-11-qa.md`, and only then commit as `feat(game): preview tower attack range on selection` and push to `origin main` per the 48h loop policy.
