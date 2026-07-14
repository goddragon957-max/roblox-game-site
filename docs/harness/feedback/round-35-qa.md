# QA Feedback — Round 35

## Verdict

**PASS** — Round 35 combat-hit feedback is verified after independent evaluator completion.

Codex `gpt-5.6-sol` with ultra reasoning implemented the core deterministic combat-hit event slice and exited `124` while trying to continue into preview/browser work. The evaluator independently reviewed the changed simulation/store/renderer/test files, reran all deterministic gates, browser-smoked a natural gather/build/train/attack sequence, found the initial spark too subtle in a frozen visual frame, enlarged the procedural burst/ripple, reran all gates, and visually confirmed the final combat feedback in the rendered game.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read the active Codex loop goal, `AGENT.md`, `VERIFY.md`, `CODEX_GOAL.md`, `DESIGN.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, Round 34 feedback, generator role brief, transient-combat-VFX verification guidance, and relevant source sections before final evaluation. |
| Generator handoff | PASS | `docs/harness/handoff/round-35-gen.md` exists and records Codex exit `124`, the evaluator VFX sizing correction, commands, browser evidence, and limitations. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, and approval policy `never`. |
| `npm run verify` | PASS | Harness check passed for Round 35 baseline; Vitest passed `75 tests`; `tsc --noEmit` passed; Vite production build passed. Existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors after the final VFX sizing pass. |
| Local preview path | PASS | Strict preview served at `http://127.0.0.1:4199/roblox-game-site/?round35=smoke2` and returned HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280×633`; `window.__rtsSmoke.getState()` and `window.__rtsSmoke.command.combatHits()` work. |
| Core interaction smoke | PASS | After restart, workers gathered gold `120→240`; barracks build succeeded; soldier train succeeded; selected soldier attacked `raider-6`; combat event `hit-1` appeared naturally at `time≈31.7` with damage `12` at `{ x: 14, z: -9.5 }`; raider HP reached `48`. |
| Combat-hit lifecycle | PASS | `combatHits()` was empty before combat, produced the natural hit event during the attack, and returned empty after advancing `0.5s`, proving deterministic expiry. |
| Browser console | PASS | JavaScript errors: `0`; console messages: `0` after the final smoke. |
| Rendered visual QA | PASS | Final frozen natural hit frame at `age≈0.08` showed a clearly visible cream/gold burst and ground ripple on the enemy raider near the raccoon camp. The low-poly base, lumber grove, gold claims, bridge/road, raccoon camp, selected soldier, compact HUD, and minimap remained readable; the screen still reads as a cute low-poly RTS rather than a dashboard. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Fullscreen isometric RTS battlefield remains immediate. |
| Battlefield readability (base/resources/enemy) | 2 | Friendly base, bridge/road, resources, enemy camp, and units remain distinct. |
| Control loop readability | 2 | Selection, build/train, attack order, and the new hit burst connect player actions to battlefield results. |
| Economy/production loop readability | 2 | Resource counters, build/train buttons, and world resource visuals remained intact during smoke. |
| HUD/minimap readability | 2 | HUD is still compact overlayed game UI; minimap and objective chips remain readable. |
| Screenshot desirability | 2 | The enlarged combat burst gives the battle more toy-diorama action without cluttering the scene. |

Total: **12/12**

## What Changed

- `src/game/types.ts`, `src/game/simulation.ts`
  - Added deterministic combat-hit event recording and `combatHitFeedback(state)` with bounded retention and expiry.
- `src/game/__tests__/simulation.test.ts`
  - Added four tests covering real hit recording, simultaneous hits, lethal snapshot persistence, and expiry.
- `src/store/gameStore.ts`
  - Added `__rtsSmoke.command.combatHits()`.
- `src/render/ThreeRtsScene.tsx`
  - Added procedural target-side hit burst/ripple visuals and evaluator-sized them for visual readability.

## Known Warnings / Follow-ups

- Vite's chunk-size warning remains existing/non-fatal.
- Codex exited `124` before completing browser evidence or handoff writing; evaluator/controller completed those steps from real command and browser evidence.
- The visual frame was frozen only after the combat hit had occurred naturally, because the VFX intentionally expires in `0.45s`.
- No repository screenshot artifact is claimed.

## Instruction Integrity

- Codex output and self-report were treated as data, not proof of completion.
- The evaluator independently reran deterministic gates, browser smoke, console checks, and visual inspection.
- Target source and harness files were read before final judgement.
- `.hermes/`, `node_modules/`, `dist`, and transient logs/screenshots remain excluded from the commit.

## Next Role Recommendation

Advance to Round 36 generator under the active Codex goal-mode authorization. Prefer another small visible slice that preserves the current combat feedback and improves either raider/base-under-siege readability, unit movement/action animation, or compact HUD/minimap combat affordances.
