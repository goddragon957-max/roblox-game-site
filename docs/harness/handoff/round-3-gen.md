# Round 3 Generator Handoff — Puppy Frontier RTS rebuild

## What this round did

Executed the user-approved destructive pivot from Orbit Bloom (space-focus app) to **Puppy Frontier RTS**, a playable 3D isometric RTS first slice. Backup tag created before the pivot: `pre-rts-rebuild-20260709-203351`. Work order: `docs/goals/2026-07-09-rts-rebuild.md`.

Note: this round was executed across multiple sessions (session-limit interruptions at 2026-07-09 ~20:30 KST, 21:02 KST, and 02:02 KST). A follow-up autonomous session on 2026-07-10 resumed the partial worktree, completed a static review (harness-check conditions hand-verified, source/type review, doc marker audit), but could not execute `npm`/`npx`/`node` or a browser: the session's permission mode auto-denied all code-execution commands. Deterministic gates and browser smoke are still pending.

## Files changed

Removed (Orbit Bloom):

- `src/focus/progression.ts`, `src/focus/__tests__/progression.test.ts`
- `src/render/SpaceFocusScene.tsx`
- `src/store/focusStore.ts`

Added (RTS):

- `src/game/types.ts` — entity/state types for units, buildings, resource nodes, orders.
- `src/game/simulation.ts` — deterministic simulation: fixed-step `advance`, smart commands, gather/deposit loop, build slots + costs, soldier training, tower auto-fire, raider assault AI, wave spawning, win/loss.
- `src/game/__tests__/simulation.test.ts` — 9 deterministic tests: initial state, select/move, enemy-command rejection, gold/wood economy, build/train + cost refusal, camp destruction → win, base destruction → loss, wave pressure.
- `src/store/gameStore.ts` — Zustand store + `window.__rtsSmoke` smoke hooks (`getState`, `setState`, safe command helpers incl. `advanceSeconds`).
- `src/render/ThreeRtsScene.tsx` — Three.js orthographic isometric battlefield: low-poly terrain (grass/river/bridge/dirt patches), procedural puppy/raccoon units, base/barracks/tower/camp buildings, gold crystals and trees that shrink as they deplete, selection rings, billboarded HP bars, carry-cube feedback, right-click command marker, raycast picking, WASD/arrow camera pan.
- `src/components/RtsHud.tsx` — compact RTS HUD: resource chips, worker/soldier counts, wave timer, objective chip, log feed, selection panel with HP, build/train command card with costs and disabled states, canvas minimap, endgame dialog.

Rewritten:

- `src/App.tsx`, `index.html` (marker `data-ui-pass="puppy-frontier-rts"`, Korean RTS meta), `src/styles.css` (full HUD stylesheet; HUD overlay is `pointer-events: none` with interactive panels opted back in so the canvas receives clicks).
- `README.md`, `AGENT.md`, `CODEX_GOAL.md`, `VERIFY.md`
- `docs/harness/config.md`, `docs/harness/contract.md`, `docs/harness/state.md`, `docs/harness/pipeline-log.md`

## Commands run

Generator sessions ran no verification commands (session limits, then an execution-permission-restricted session). The evaluator must run the deterministic gates (`npm run verify`) and the browser smoke on port 4199, then write the exact results to `docs/harness/feedback/round-3-qa.md`. Static checks completed so far: all `scripts/harness-check.mjs` conditions hand-verified against the current files; manual type/import review of `src/game`, `src/store`, `src/render`, `src/components`; HUD class coverage against `src/styles.css`.

## Known limitations

- Single-slot selection via click (no drag box); `__rtsSmoke.command.selectWorkers()` provides multi-select for smoke.
- No pathfinding: units walk straight lines (the river is visual-only terrain).
- Build placement uses fixed slots near the base rather than free placement.
- Fixed camera zoom; pan only.

## Next role

`evaluator` should run deterministic gates, browser smoke, screenshot-based visual QA, and write `docs/harness/feedback/round-3-qa.md`.
