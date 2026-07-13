# QA Feedback — Round 26

## Verdict

**PASS** — Round 26 low-poly frontier bridge world-richness is verified locally after independent scheduled-evaluator checks.

Codex `gpt-5.6-sol` with ultra reasoning replaced the flat bridge plane with a modeled toy-diorama crossing and passed deterministic verification before the bounded process timed out during browser evidence. The evaluator inspected the source diff, reran deterministic gates, exercised the production-preview gather/build/train/attack path, checked the browser console, and visually inspected the rendered opening frame. The bridge now reads as a hand-built frontier landmark while preserving the fullscreen battlefield composition and compact HUD.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read `docs/goals/2026-07-13-48h-codex-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `DESIGN.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-25-qa.md`, and the changed renderer in `src/render/ThreeRtsScene.tsx`. |
| Generator handoff | PASS | `docs/harness/handoff/round-26-gen.md` exists and truthfully records the Codex timeout plus evaluator-completed verification. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, and `approval: never`. |
| `npm run verify` | PASS | Independent evaluator rerun passed harness-check, Vitest `70 tests`, `tsc --noEmit`, and Vite production build. The existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so the evaluator used allowed alternate strict port `4222`. `http://127.0.0.1:4222/roblox-game-site/?cron=20260713-round26-eval` returned HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at 1280×633; `window.__rtsSmoke.getState()` works; live state and command keys were inspected before scripting. |
| Core interaction smoke | PASS | After `restart()`, `selectWorkers()` selected `worker-3`, `worker-4`, and `worker-5`; a gold smart-command plus 20 simulated seconds changed gold `120 → 240`; `build('barracks')` returned true and produced `barracks-16` at `140g/20w`; `train()` returned true and produced/selectable `soldier-17`; a smart attack plus 10 simulated seconds reduced enemy-camp HP `400 → 352`. |
| Browser console | PASS | Console messages: 0; JavaScript errors: 0 after the full smoke. |
| Rendered visual QA | PASS | Browser vision inspected the opening frame. Nine alternating warm planks, dark rails, support beams, and posts read as a handcrafted low-poly bridge across the river; the crossing remains visually secondary to the puppy outpost, resources, raccoon camp, units, commands, and minimap. No repository screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The opening frame remains an immediately readable fullscreen isometric RTS confrontation. |
| Battlefield readability (base/resources/enemy) | 2 | Puppy outpost, resources, river/bridge landmark, raccoon camp, and guards remain distinct in one frame. |
| Control loop readability | 2 | Selection ring, compact control strip, smart-command flow, and attack state remain readable; browser interaction passed. |
| Economy/production loop readability | 2 | Resource chips and build/train cards remain compact and state-wired while the modeled bridge adds world detail rather than HUD weight. |
| HUD/minimap readability | 2 | Overlay hierarchy remains compact and the minimap continues to mirror the two-front battlefield. |
| Screenshot desirability | 2 | The plank-and-rail crossing adds a clear handcrafted frontier landmark and improves the toy-diorama feel. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Added a warm secondary bridge-plank color.
  - Replaced the single flat plane with a nine-plank bridge, supports, side rails, and posts.
  - Reused the existing terrain bridge span/width and world position, preserving gameplay geometry.

## Known Warnings / Follow-ups

- Vite's existing chunk-size warning remains accepted as out-of-scope.
- Port `4199` was occupied by another process; allowed strict alternate port `4222` was used.
- Codex's own temporary headless browser probe failed to create a WebGL context, but the independent evaluator browser rendered the scene and completed visual QA without errors.
- This slice does not change movement/pathing and adds no new simulation tests; all existing 70 deterministic tests remain green.

## Instruction Integrity

- Codex output and exit `124` were treated as data, not proof of completion.
- The evaluator read the changed source and required docs, independently reran repository gates, and exercised live state/DOM/browser behavior.
- Smoke values were snapshotted immediately between mutable simulation steps rather than compared through stale state-object references.
- Visual PASS used real browser-rendered inspection; no transient capture is claimed as a repository artifact.
- `.hermes/`, `node_modules/`, `dist/`, and transient screenshots/logs remain excluded from the commit.

## Next Role Recommendation

Advance to Round 27 generator under the active Codex 48-hour goal-mode authorization. Prefer one small visible world-richness or combat-feedback slice that preserves the improved bridge landmark, opening composition, and character silhouettes.
