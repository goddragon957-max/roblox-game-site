# QA Feedback — Round 34

## Verdict

**PASS** — Round 34 authored renewable-lumber grove and regrowth-readability slice is verified locally after independent scheduled-evaluator checks.

Codex `gpt-5.6-sol` with ultra reasoning implemented the renderer diff and exercised transient early/mid-regrowth probes before the bounded run exited `124` with its browser still active. The evaluator independently reviewed the changed source, reran all repository gates, exercised the complete gather/build/train/attack path, checked renewable-node refill behavior, checked browser errors, and visually inspected both the real opening frame and an isolated early-regrowth frame. Wood now reads as a worked low-poly pine grove rather than repeated generic cones, while depleted/regrowing nodes retain a readable stump/log landmark and grow smoothly back to full size.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read `docs/goals/2026-07-13-48h-codex-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `DESIGN.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-33-qa.md`, supporting harness/gotcha/role docs, and the relevant renderer/resource-sync sections before judging or correcting the diff. |
| Generator handoff | PASS | `docs/harness/handoff/round-34-gen.md` exists and truthfully records Codex exit `124`, the useful renderer diff/probes, and evaluator-completed verification. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, and approval policy `never`. |
| `npm run verify` | PASS | Harness check passed for Round 34-ready baseline; Vitest passed `70 tests`; `tsc --noEmit` passed for lint and build; Vite production build passed. Existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors before documentation and is rerun in the final gate. |
| Local preview path | PASS | Strict port `4199` was occupied, so the evaluator used allowed alternate strict port `4242`. `http://127.0.0.1:4242/roblox-game-site/?cron=20260713-round34-eval` returned HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at 1280×633; `window.__rtsSmoke.getState()` works; live state and command keys were inspected before scripting. |
| Core interaction smoke | PASS | After restart, `selectWorkers()` selected `worker-3`, `worker-4`, and `worker-5`; 20 simulated seconds changed gold `120→240` and targeted node amount `500→370`; `build('barracks')` succeeded and produced `barracks-16`; `train()` succeeded and produced `soldier-17`; selecting the soldier and attacking reduced enemy-camp HP `400→208`. Match status remained `playing`. |
| Renewable-node behavior | PASS | In an isolated diagnostic after restart, `wood-10` was set to `amountLeft=0` with `regrowAt=36`; `nodeRegrowth()` reported the node active at approximately 10% progress. The rendered early-regrowth frame showed a small pine beside the full-size stump/sawn-log landmark. At refill the node returned to `amountLeft=140`, `regrowAt=null`, and `nodeRegrowth()` cleared. |
| Browser console | PASS | JavaScript errors: 0; fatal console errors: 0. The browser recorded only informational Three.js WebGL context lost/restored logs during evaluator capture; no uncaught exception or product failure occurred. |
| Rendered visual QA | PASS | Browser-rendered opening and isolated early-regrowth frames were inspected. Full three-layer pines, thicker trunks, subtle stump collars, and sawn logs make the cluster read as an authored lumber grove; the small regrowth sapling is visibly distinct from neighboring trees without clutter. Player base/workers, gold claims, road/bridge, raccoon camp/threat, compact HUD, controls, and minimap remain readable. No repository screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Fullscreen toy-diorama RTS composition remains immediate, with a more authored economy/resource cluster. |
| Battlefield readability (base/resources/enemy) | 2 | Puppy headquarters, gold claims, lumber grove, road/bridge, and defended raccoon camp remain visually distinct. |
| Control loop readability | 2 | Selection ring, command strip, route, and verified worker/soldier smart-command flow still connect controls to world targets. |
| Economy/production loop readability | 2 | Live pines read as wood resources, the regrowth state leaves a clear worked-node landmark, and counters/build/train controls remain compact and state-wired. |
| HUD/minimap readability | 2 | Mission, resources, warnings, controls, command cards, and minimap remain compact overlays with the world primary. |
| Screenshot desirability | 2 | Layered pines and worked-lumber details add frontier storytelling without copied assets or dashboard clutter. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Upgraded each wood node to a thicker three-layer faceted pine with restrained per-node variation.
  - Added persistent stump and sawn-log details outside the scalable live-tree group.
  - Smoothed renewable sapling scale from 15% to 100% over the existing regrowth progress.

## Known Warnings / Follow-ups

- Vite's existing chunk-size warning remains accepted as out-of-scope.
- Port `4199` belongs to another process; allowed strict alternate port `4242` was used and stopped after evaluation.
- Codex exited `124` after useful implementation/probes while its browser command remained active; evaluator independently completed all required checks and harness notes.
- This visual-only slice adds no simulation behavior or deterministic tests. All existing 70 tests remain green.
- The regrowth frame was an isolated browser diagnostic, not persisted game state or a repository artifact.
- Stump/log accents are intentionally restrained at opening scale to prevent the six-node grove from becoming visually noisy.

## Instruction Integrity

- Codex logs/probes were treated as data, not proof of completion.
- The evaluator read required docs and relevant source, independently reran repository gates and browser/state/visual checks, and snapshotted scalar/array evidence between mutable simulation stages.
- Visual PASS used real browser-rendered inspection of the opening and early-regrowth states; no transient capture is claimed as a repository artifact.
- `.hermes/`, `node_modules/`, `dist`, and transient screenshots/logs remain excluded from the commit.

## Next Role Recommendation

Advance to Round 35 generator under the active Codex 48-hour goal-mode authorization. Prefer one small visible combat-feedback or frontier-world slice that preserves the authored lumber/gold resources, road/bridge, carried-resource props, building/character silhouettes, opening composition, compact HUD, and deterministic RTS core loop.
