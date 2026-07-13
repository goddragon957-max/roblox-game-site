# QA Feedback — Round 29

## Verdict

**PASS** — Round 29 puppy-barracks training-post identity and production-building readability slice is verified locally after independent scheduled-evaluator checks.

Codex `gpt-5.6-sol` with ultra reasoning added a framed entrance, shield-and-crossed-swords crest, and a compact shield rack to the previously plain barracks before the bounded process timed out during visual evidence. The evaluator inspected the renderer diff, reran deterministic gates, exercised the production-preview gather/build/train/attack path, checked the browser console, and visually inspected a rendered frame with the newly built barracks present. The structure now reads as a puppy soldier training post while preserving the fullscreen battlefield composition and compact HUD.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read `docs/goals/2026-07-13-48h-codex-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `DESIGN.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-28-qa.md`, and the changed renderer in `src/render/ThreeRtsScene.tsx`. |
| Generator handoff | PASS | `docs/harness/handoff/round-29-gen.md` exists and truthfully records the Codex timeout plus evaluator-completed verification. |
| Codex model/effort | PASS | CLI launch explicitly used `-m gpt-5.6-sol`, `model_reasoning_effort="ultra"`, `danger-full-access`, and approval policy `never`. |
| `npm run verify` | PASS | Independent evaluator rerun passed harness-check, Vitest `70 tests`, `tsc --noEmit`, and Vite production build. The existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so the evaluator used allowed alternate strict port `4229`. `http://127.0.0.1:4229/roblox-game-site/?cron=20260713-round29-eval` loaded successfully. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at 1280×633; `window.__rtsSmoke.getState()` works; live simulation keys and command keys were inspected before scripting. |
| Core interaction smoke | PASS | After `restart()`, `selectWorkers()` selected `worker-3`, `worker-4`, and `worker-5`; a gold smart-command plus 20 simulated seconds changed gold `120 → 240` and the HUD reflected the current value; `build('barracks')` returned true and produced `barracks-16` at `140g/20w`; `train()` returned true and subsequent advancement produced `soldier-17`; a smart attack plus advancement reduced enemy-camp HP `400 → 352`. |
| Browser console | PASS | Console messages: 0; JavaScript errors: 0 after the full smoke and rendered-frame inspection. |
| Rendered visual QA | PASS | Browser vision inspected the live frame with `barracks-16` present. The framed front entry and green crossed-weapon crest distinguish it from the nearby headquarters, while the side shield rack adds a compact training-yard cue. Player outpost, resources, bridge/river, defended raccoon camp, HUD, controls, and minimap remain readable. No repository screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame remains an immediately readable fullscreen isometric RTS confrontation. |
| Battlefield readability (base/resources/enemy) | 2 | Friendly outpost and barracks, resource clusters, bridge/river landmark, raccoon camp, and guards remain distinct in one frame. |
| Control loop readability | 2 | Selection, control hint, command strip, and smart-command flow remain readable; browser interaction passed. |
| Economy/production loop readability | 2 | The built barracks now has a visible soldier-training identity while build/train controls remain compact and state-wired. |
| HUD/minimap readability | 2 | Overlay hierarchy stays compact and the minimap continues to mirror the two-front battlefield. |
| Screenshot desirability | 2 | The crest, entry, and equipment rack make the friendly production area feel more authored and toy-diorama-like. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Added a leather door, light wooden frame/lintel, and front step to the barracks.
  - Added a frontier-green shield crest with crossed steel practice swords.
  - Added a side equipment rack with green shields and gold bosses.

## Known Warnings / Follow-ups

- Vite's existing chunk-size warning remains accepted as out-of-scope.
- Port `4199` was occupied by another process; allowed strict alternate port `4229` was used.
- Codex exited `124` before writing harness docs or reaching commit/push; the evaluator completed the required verification and documentation.
- This visual-only slice adds no simulation behavior or deterministic tests. All existing 70 tests remain green.
- The smallest sword/rack details are intentionally secondary at the full opening-frame scale; the building-level silhouette and green training crest carry the primary read.

## Instruction Integrity

- Codex output and exit `124` were treated as data, not proof of completion.
- The evaluator read the changed source and required docs, independently reran repository gates, and exercised live state/DOM/browser behavior.
- Smoke values were snapshotted immediately between mutable simulation steps rather than compared through stale state-object references.
- Visual PASS used real browser-rendered inspection; no transient capture is claimed as a repository artifact.
- `.hermes/`, `node_modules/`, `dist`, and transient screenshots/logs remain excluded from the commit.

## Next Role Recommendation

Advance to Round 30 generator under the active Codex 48-hour goal-mode authorization. Prefer one small visible tower/defense-building detail or combat-feedback slice that preserves the improved headquarters, training post, defended raider camp, bridge landmark, opening composition, and character silhouettes.
