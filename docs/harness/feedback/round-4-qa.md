# QA Feedback — Round 4

## Verdict

**PASS** — Round 4 Puppy Frontier RTS polish is verified locally.

Claude Code was available after the token/session reset and implemented the bounded Round 4 polish. Its own non-interactive session could not run `npm`/browser/git, so the evaluator reran the gates independently, performed browser smoke, inspected rendered output, and verified the prior Three.js deprecation warnings are gone.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Claude availability smoke | PASS | `claude --model fable --permission-mode acceptEdits --effort low -p 'Reply exactly: CLAUDE_READY'` returned `CLAUDE_READY`. |
| `npm run verify:harness` | PASS | `harness-check passed: 16 required files, round 4, next_role evaluator, verdict pending, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `10 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `1.00s`; known non-fatal chunk-size warning remains (`dist/assets/index-BZ0foaoR.js 740.50 kB`, gzip `201.85 kB`). |
| Preview server | PASS | `npx vite preview --host 0.0.0.0 --port 4199 --strictPort`; HTTP health check returned `200`. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`. |
| Smoke object | PASS | `window.__rtsSmoke.getState()` available. |
| Selection smoke | PASS | `selectWorkers()` returned `worker-3`, `worker-4`, `worker-5`; `sim.selectedIds` changed to the same three ids. |
| Gather smoke | PASS | Gold increased `120 → 390` after worker gather command and advanced time. |
| Build smoke | PASS | `build('barracks')` returned `true`; building count changed `2 → 3`; resources changed to `gold: 290`, `wood: 20`. |
| Train smoke | PASS | `train()` returned `true`; after 5s, player soldier count was `1`. |
| Attack smoke | PASS | Controlled in-range soldier attack reduced enemy camp HP `400 → 352`. |
| Browser console | PASS | Initial load console messages/errors: `0`; after smoke, console messages/errors: `0`. Round 3 warnings for `THREE.Clock` and `PCFSoftShadowMap` are gone. |
| Visual rendered-output evidence | PASS | Browser-rendered idle and selected/gather states inspected with `browser_vision`; no visual regression found. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | First screen still reads as a 3D isometric RTS with base, resources, enemy camp, raiders, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base, gold crystals, trees, river/bridge, enemy camp, raiders, and minimap markers remain visible and spatially coherent. |
| Control loop readability | 2 | Selected/gather state shows selection rings, worker group panel, HP, and gather status; command/state smoke confirms controls are wired. |
| Economy/production loop readability | 2 | Resource chips, build buttons, costs, disabled train state, gather counter changes, and minimap remain readable. |
| HUD/minimap readability | 2 | HUD remains compact and readable without covering the battlefield. |
| Screenshot desirability | 2 | Round 4 polish does not regress screenshot quality; it keeps the low-poly playable RTS look. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Replaced deprecated `THREE.Clock` usage with requestAnimationFrame timestamp delta.
  - Replaced deprecated `THREE.PCFSoftShadowMap` with `THREE.PCFShadowMap`.
  - Added state-driven visual feedback: gather bob, attack pulse, tower flash, and command marker coloring by actual order type.
- `docs/goals/2026-07-10-rts-polish.md`
  - Durable Round 4 goal/work order.
- `docs/harness/handoff/round-4-gen.md`
  - Claude generator handoff and blocker report.
- `docs/harness/state.md`, `docs/harness/pipeline-log.md`
  - Round 4 state/progress bookkeeping.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains. This was explicitly accepted as out-of-scope for Round 4; consider route-level/lazy Three.js splitting in a separate performance pass.
- Attack feedback pulses attackers rather than victims. Victim hit-flash would require renderer-side HP delta tracking and can be a future polish task.
- No push/deploy was performed.

## Instruction Integrity

- Claude generator handoff was not accepted as proof; evaluator reran deterministic and browser gates independently.
- Browser visual PASS used rendered screenshots, not DOM snapshot alone.
- Document/tool output was treated as data.
- `.hermes/` scratch files were not staged.

## Next Role Recommendation

Pause for human approval before any GitHub push. Local commit is appropriate after this verified pass.
