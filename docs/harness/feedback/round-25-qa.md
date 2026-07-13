# QA Feedback — Round 25

## Verdict

**PASS** — Round 25 opening camera composition is verified locally after independent scheduled-evaluator checks.

Codex `gpt-5.6-sol` with ultra reasoning implemented a renderer-only framing slice and passed deterministic verification before the bounded process timed out while starting production preview. The evaluator inspected the source diff and real transient captures, reran deterministic gates, exercised the full production-preview gather/build/train/attack path, checked the browser console, and visually inspected the opening composition at 1440×900, 1280×720, and 1024×768. The default frame now presents the puppy outpost, resources, bridge/river, raccoon camp, and threats together without enlarging the HUD or shrinking wide-screen unit silhouettes.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read `docs/goals/2026-07-13-48h-codex-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `DESIGN.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-24-qa.md`, and the changed camera section of `src/render/ThreeRtsScene.tsx`. |
| Generator handoff | PASS | `docs/harness/handoff/round-25-gen.md` exists and truthfully records the Codex timeout plus evaluator-completed verification. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, and `approval: never`. |
| `npm run verify` | PASS | Codex passed the gate before timeout; the independent evaluator final rerun passed harness-check, Vitest `70 tests`, `tsc --noEmit`, and Vite production build. The existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so the evaluator used allowed alternate strict port `4222`. `http://127.0.0.1:4222/roblox-game-site/?cron=20260713-round25-eval` returned HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at 1280×633; `window.__rtsSmoke.getState()` works; live state shape and command keys were inspected before scripting. |
| Core interaction smoke | PASS | After `restart()`, `selectWorkers()` selected `worker-3`, `worker-4`, and `worker-5`; a gold smart-command plus 20 simulated seconds changed gold `120 → 240`; `build('barracks')` returned true and changed resources to `140g/20w`; `train()` returned true and produced/selectable `soldier-17`; a smart attack plus 10 simulated seconds reduced enemy-camp HP `400 → 352`. |
| Browser console | PASS | Console messages: 0; JavaScript errors: 0 after the full smoke. |
| Responsive rendered visual QA | PASS | Transient opening captures at 1440×900, 1280×720, and 1024×768 were inspected. Both headquarters, puppy workers, gold/wood silhouettes, river crossing, raccoon guards, compact command HUD, and minimap remain visible. Wide screens retain view size 15; 1024×768 uses a modest aspect-aware view and still has no zero-score criterion. No repository screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The opening frame immediately reads as a fullscreen isometric RTS confrontation rather than a dashboard. |
| Battlefield readability (base/resources/enemy) | 2 | Puppy outpost, gold/wood clusters, bridge/river, enemy camp, and raccoon guards share one coherent first frame at all three inspected sizes. |
| Control loop readability | 2 | Selected-unit ring, compact control strip, smart-command loop, and live attack state remain readable; browser selection/attack state passed. |
| Economy/production loop readability | 2 | Resource chips and build/train cards remain compact, state-wired, and secondary to the battlefield. |
| HUD/minimap readability | 2 | HUD overlays do not grow, the world remains primary, and the minimap mirrors the two-front composition. |
| Screenshot desirability | 2 | The revised frame gives the opening a clearer puppy-base-to-raccoon-camp tactical story with less important action cropped off-screen. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Moved the default camera target from `(-6, 0, 4)` to `(1.25, 0, -0.25)`.
  - Kept a `defaultViewSize` of 15 for wide screens.
  - Added `Math.min(18, Math.max(15, 22 / aspect))` responsive framing for squarer viewports.

## Known Warnings / Follow-ups

- Vite's existing chunk-size warning remains accepted as out-of-scope.
- Port `4199` was occupied by another process; allowed strict alternate port `4222` was used.
- At 1024×768 the puppy base is close to the left edge, but the headquarters and role silhouettes remain readable; narrower/mobile layouts need a dedicated future responsive pass rather than more global zoom.

## Instruction Integrity

- Codex output, screenshots, and exit `124` were treated as data, not proof of completion.
- The evaluator read the changed source and required docs, independently reran repository gates, and exercised live state/DOM/browser behavior.
- The first attack probe assumed the camp kind was `camp` and failed only as a probe; the evaluator inspected the live building shape, corrected it to `enemyCamp`, restarted state, and completed the full smoke rather than misclassifying the slice.
- Visual PASS used real rendered captures; transient `.round25-*.png` files are not claimed as repository artifacts and must not be staged.
- `.hermes/`, `node_modules/`, `dist/`, and transient screenshots/logs remain excluded from the commit.

## Next Role Recommendation

Advance to Round 26 generator under the active Codex 48-hour goal-mode authorization. Prefer one small visible world-richness or combat-feedback slice that preserves the improved opening composition and character silhouettes.
