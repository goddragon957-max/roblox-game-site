# Generator Handoff — Round 13

## Slice

**Idle-worker alert chip** (goal priority 3: economy loop polish, with priority-1 control readability).

Workers go idle at match start (all three), after a `move` order completes, and when a gather chain ends with no reachable node. Nothing surfaced this, so idle puppies silently stall the economy. This slice adds the classic RTS "idle worker" affordance: a pure `idleWorkerIds(state)` selector, a clickable HUD chip showing the live idle count that selects all idle workers on click, and a smoke hook.

Note: the originally considered "worker carried-resource visuals" slice was found to already exist (`carryCube` in `ThreeRtsScene.tsx` colors gold/wood per `unit.carry`), as does node-depletion scaling — so this slice was chosen instead.

## Status: UNVERIFIED — exec denied in this session

Claude Code (goal-mode, non-interactive) implemented the slice but the session's permission layer denied command execution:

- `npm run verify` → **denied** ("This command requires approval"), both piped and bare forms.
- `git diff --check` → **ran, exited 0**, no whitespace errors.
- `git status --short` → 5 modified files (listed below), nothing staged.

Per the 48h loop work order (`docs/goals/2026-07-11-48h-claude-goal-loop.md`), nothing was committed or pushed, and no verification is claimed. The scheduled evaluator must run the gates independently, as in Rounds 10–12.

## What Changed

- `src/game/simulation.ts`
  - Added pure `idleWorkerIds(state)`: ids of player-faction workers whose order is `idle`. Soldiers, raiders, and busy workers are excluded.
- `src/store/gameStore.ts`
  - Added smoke hook `window.__rtsSmoke.command.selectIdleWorkers()` — computes the idle ids, applies them via `select`, returns the ids. Declared in the global `__rtsSmoke` type.
- `src/components/RtsHud.tsx`
  - New top-bar chip after the threat chip: a `button.hud-chip.idle-workers` with `data-idle-workers={count}`, a `BellRing` icon, and label `쉬는 일꾼 {n} · 클릭해 선택`. Rendered only while `sim.status === 'playing'` and at least one worker is idle; clicking calls `select(idleWorkers)`. Hooked `select` from the store alongside `build`/`train`/`restart`.
- `src/styles.css`
  - `.hud-chip.idle-workers`: pointer cursor, 44px min-height (StyleSeed target size), gold text/border on a dark amber panel, gold glow on hover. Inherits the shared `.hud-chip` pill styling (the class sets `font`, border, and background explicitly, so the button element renders like the other chips).
- `src/game/__tests__/simulation.test.ts`
  - New `idle worker alert` describe with 3 deterministic tests: (1) all 3 starting workers are listed and a gather order drops that worker from the list; (2) a freshly trained idle soldier and the idle starting raiders are never listed; (3) a worker re-enters the list when its move order completes, and the ids feed `setSelection` into a real selection.
- `docs/harness/state.md`
  - `current_phase: round_13_generated`, `next_role: evaluator`, `last_verdict: pending`, `updated_at: 2026-07-11T11:30:23Z`, plus a Round 13 note.

All edited files were read in full before editing.

## Evaluator Instructions

1. `npm run verify` and `git diff --check` (expect 36 tests: 33 existing + 3 new).
2. Browser smoke per `VERIFY.md`, plus for this slice:
   - On load, the top bar shows the idle chip with `data-idle-workers="3"` (all starting workers idle).
   - `window.__rtsSmoke.command.selectIdleWorkers()` returns 3 worker ids, `getState().sim.selectedIds` matches, and the selection panel shows `선택 부대 ×3` / `일꾼 퍼피 ×3`.
   - Order a gather on one worker (`command.smart(x, z, goldNodeId)` with only that worker selected): the chip count drops to 2; order all workers to gather: the chip disappears.
   - Real input: click the chip itself — idle workers get selection rings and the panel updates.
   - Verify console fatal errors remain zero.
3. Rendered visual QA: the chip must read as an actionable gold-accented pill in the top bar and must not crowd the wave/threat chips (chips wrap via the existing flex-wrap).
4. If PASS: write `docs/harness/feedback/round-13-qa.md`, update `docs/harness/state.md`, commit as `feat(game): idle-worker alert chip` (exclude `.hermes/`, `node_modules/`, `dist/`), push to `origin main`.

## Known Limitations

- The chip selects **all** idle workers at once; there is no per-click cycling through individual idle workers (a common variant) — kept minimal for this slice.
- Workers waiting at a depleted node auto-retarget to the nearest same-type node in `stepGather`, so they only show as idle when no node of that type remains — that is real idleness, not a false positive.
- The chip is HUD-only; no minimap/3D marker for idle workers.
