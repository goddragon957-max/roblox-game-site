# QA Feedback — Round 27

## Verdict

**PASS** — Round 27 raccoon raider-camp world-richness and threat-readability slice is verified locally after independent scheduled-evaluator checks.

Codex `gpt-5.6-sol` with ultra reasoning added a campfire, loot crates, and wooden barricades to the enemy headquarters before the bounded process timed out during browser evidence. The evaluator inspected the renderer diff, reran deterministic gates, exercised the production-preview gather/build/train/attack path, checked the browser console, and visually inspected the rendered opening frame. The objective now reads as defended raider territory while preserving the fullscreen battlefield composition and compact HUD.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read `docs/goals/2026-07-13-48h-codex-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `DESIGN.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-26-qa.md`, and the changed renderer in `src/render/ThreeRtsScene.tsx`. |
| Generator handoff | PASS | `docs/harness/handoff/round-27-gen.md` exists and truthfully records the Codex timeout plus evaluator-completed verification. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, and `approval: never`. |
| `npm run verify` | PASS | Independent evaluator rerun passed harness-check, Vitest `70 tests`, `tsc --noEmit`, and Vite production build. The existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so the evaluator used allowed alternate strict port `4227`. `http://127.0.0.1:4227/roblox-game-site/?cron=20260713-round27-eval` returned HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at 1280×633; `window.__rtsSmoke.getState()` works; live state and all command keys were inspected before scripting. |
| Core interaction smoke | PASS | After `restart()`, `selectWorkers()` selected `worker-3`, `worker-4`, and `worker-5`; a gold smart-command plus 20 simulated seconds changed gold `120 → 240`; `build('barracks')` returned true and produced `barracks-16` at `140g/20w`; `train()` returned true and produced/selectable `soldier-17`; a smart attack plus 10 simulated seconds reduced enemy-camp HP `400 → 364`. |
| Browser console | PASS | Console messages: 0; JavaScript errors: 0 after the full smoke and opening-frame reset. |
| Rendered visual QA | PASS | Browser vision inspected the opening frame. The orange/yellow stone-ring campfire, two banded crates with gold loot, and paired pointed barricades remain visible around the purple tent; the enemy camp and raccoon guards are not obscured, and the bridge, puppy outpost, resource clusters, command strip, and minimap remain readable. No repository screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The opening frame remains an immediately readable fullscreen isometric RTS confrontation. |
| Battlefield readability (base/resources/enemy) | 2 | Puppy outpost, resources, bridge/river landmark, defended raccoon camp, and guards remain distinct in one frame. |
| Control loop readability | 2 | Selection ring, control hint, command strip, and smart-command path remain readable; browser interaction passed. |
| Economy/production loop readability | 2 | Resource chips and build/train cards remain compact and state-wired; camp loot adds world storytelling instead of HUD weight. |
| HUD/minimap readability | 2 | Overlay hierarchy stays compact and the minimap continues to mirror the two-front battlefield. |
| Screenshot desirability | 2 | Campfire, crates, loot, and barricades add a clearer tactical objective and stronger toy-diorama story. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Added ember/flame/charcoal palette values.
  - Added a low-poly campfire with seven stones, crossed logs, and two flame layers.
  - Added two banded supply crates and small gold-loot props.
  - Added two pointed wooden barricade groups around the enemy tent.

## Known Warnings / Follow-ups

- Vite's existing chunk-size warning remains accepted as out-of-scope.
- Port `4199` was occupied by another process; allowed strict alternate port `4227` was used.
- Codex exited `124` before writing harness docs or reaching commit/push; the evaluator completed the required verification and documentation.
- The flame is static stylized geometry; this slice adds no animation, simulation behavior, or deterministic tests. All existing 70 tests remain green.

## Instruction Integrity

- Codex output and exit `124` were treated as data, not proof of completion.
- The evaluator read the changed source and required docs, independently reran repository gates, and exercised live state/DOM/browser behavior.
- Smoke values were snapshotted immediately between mutable simulation steps rather than compared through stale state-object references.
- Visual PASS used real browser-rendered inspection; no transient capture is claimed as a repository artifact.
- `.hermes/`, `node_modules/`, `dist/`, and transient screenshots/logs remain excluded from the commit.

## Next Role Recommendation

Advance to Round 28 generator under the active Codex 48-hour goal-mode authorization. Prefer one small visible world-richness, player-outpost detail, or combat-feedback slice that preserves the improved camp objective, bridge landmark, opening composition, and character silhouettes.
