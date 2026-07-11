# QA Feedback — Round 12

## Verdict

**PASS** — Round 12 drag-box multi-select is verified locally and ready to commit/push.

Claude Code implemented the slice but could not run `npm run verify` inside its non-interactive permission layer. The scheduled evaluator independently ran deterministic gates, whitespace checks, browser/play smoke, real pointer-input drag/select checks, and rendered visual QA before accepting the work.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Generator handoff | PASS | `docs/harness/handoff/round-12-gen.md` exists and truthfully records the exec-denied Claude session plus unverified implementation. |
| `npm run verify:harness` | PASS | In combined `npm run verify`: `harness-check passed: 16 required files, round 12, next_role evaluator, verdict blocked, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `33 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `832ms`; known non-fatal chunk-size warning remains (`749.87 kB`, gzip `204.56 kB`). |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Port `4199` was already in use, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260711-round12` returned HTTP 200 and loaded successfully. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; minimap canvas exists at `148 x 148`; `window.__rtsSmoke.getState()` works and exposes `command.selectRect()`. |
| `selectRect` smoke hook | PASS | `selectRect(-16, 9, -11, 14)` returned `worker-3`, `worker-4`, `worker-5`; store `selectedIds` matched; HUD panel rendered `선택 부대 ×3` and `일꾼 퍼피 ×3 · 120/120`; `selectRect(5, 5, 8, 8)` returned `[]` and cleared selection. |
| Real pointer drag select | PASS | Browser-dispatched real pointer input on the canvas dragged from approximately `(400,267)` to `(432,366)`: `.drag-select-box` rendered during drag (`display: block`, `32px x 99px`) and release selected all three starting workers (`worker-3`, `worker-4`, `worker-5`). Browser-rendered output showed selection rings on the workers and the multi-unit HUD panel. |
| Plain click and right-click after drag | PASS | After the drag, a real left-click on a worker replaced the squad with one selected worker (`worker-3`); a real right-click on `gold-8` assigned a gather order and `advanceSeconds(20)` changed gold `120 → 160`; HUD gold updated to `160` and the selection note read `채집 중`. |
| Core play smoke | PASS | Additional smoke verified selected workers gather (`120 → 240` gold), `build('barracks')` returned true, `train()` returned true, after `advanceSeconds(5)` one player soldier existed, and an attack command against the enemy camp changed camp HP `400 → 280`. |
| Browser console | PASS | Fatal JavaScript errors: 0 (`browser_console` returned no console messages and no JS errors after smoke). |
| Rendered visual QA | PASS | Browser-rendered output inspected during drag and after release: the translucent frontier-green drag rectangle is visible, selected worker rings/HP context are readable, the compact HUD/minimap remain intact, and the screen still reads as a 3D isometric RTS. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The isometric battlefield, puppy workers, base, resource nodes, enemy camp, compact HUD, command card, and minimap remain immediately readable as an RTS. |
| Battlefield readability (base/resources/enemy) | 2 | The drag-box overlay does not obscure the base/resource/enemy silhouettes; selected workers show clear rings after release. |
| Control loop readability | 2 | Browser smoke verified drag-select, plain click-select, right-click gather, build, train, and attack state changes. |
| Economy/production loop readability | 2 | HUD counters and command buttons remained state-wired during gather/build/train smoke; gold increased visibly after a real right-click gather order. |
| HUD/minimap readability | 2 | The updated control hint fits the HUD, the multi-selection panel shows `×3` composition, and the minimap remains readable. |
| Screenshot desirability | 2 | The drag box and selected-worker rings communicate standard RTS squad control and make the opening more playable/legible. |

Total: **12/12**

## What Changed

- `src/game/simulation.ts`
  - Added `DRAG_SELECT_PADDING` and pure `playerUnitIdsInRect(state, a, b)` for player-unit-only world-rect selection.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.selectRect(x1, z1, x2, z2)` for deterministic browser smoke.
- `src/render/ThreeRtsScene.tsx`
  - Added release-based left-click selection, left-drag selection anchor/end tracking, visible `.drag-select-box` overlay, window-level pointermove/pointerup cleanup, and drag selection via `playerUnitIdsInRect`.
- `src/components/RtsHud.tsx`
  - Updated the control hint to mention drag squad selection.
- `src/styles.css`
  - Styled the translucent green drag-select box under the HUD layer.
- `src/game/__tests__/simulation.test.ts`
  - Added 3 deterministic drag-selection tests covering worker box selection, enemy exclusion, and setSelection/multi-selection summary behavior.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied during this evaluator tick; allowed alternate strict port `4200` was used.
- Drag-select uses a world-space AABB between ground raycast points, so the screen rectangle is an approximation under the fixed isometric camera. It verified as playable for the opening worker squad; future polish could add shift-additive selection.

## Instruction Integrity

- Required goal, harness, verification, state, contract, instruction-integrity, latest feedback, handoff, and changed source files were read/inspected before acceptance.
- Claude's generator handoff was treated as data, not proof; evaluator reran gates and browser checks independently.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots were not staged.

## Next Role Recommendation

Commit `feat(game): drag-box multi-unit selection`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 13.
