# QA Feedback — Round 1

## Verdict

**TECHNICAL PASS / VISUAL BASELINE REOPENED**

Round 1 successfully adopted the repo-local harness and verified the technical browser baseline. A later live visual inspection recalibrated the visual score: the app can pass marker/canvas/interaction checks while still not strongly passing the first-screen game-like visual gate.

Treat Round 1 as a working technical baseline, not as final visual approval.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| `npm run verify:harness` | PASS | harness checker passed required files/scripts/state/contract markers |
| `npm run test` | PASS | Vitest: 1 file, 4 tests passed |
| `npm run lint` | PASS | `tsc --noEmit` exited 0 |
| `npm run build` | PASS | Vite build exited 0 |
| Browser load | PASS | title `Orbit Bloom — Focus Galaxy` |
| Marker | PASS | `data-ui-pass="orbit-bloom-focus-app"` exists |
| Canvas | PASS | Three.js canvas exists |
| Scene readiness | PASS | `window.__orbitBloomScene.ready === true` |
| Start Focus interaction | PASS | focusing/progress state changes |
| Add Focus interaction | PASS | progress can increase; reward state can change |
| Console errors | PASS | browser console messages/errors: 0 |

## Visual QA Scorecard — Recalibrated

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Title, Korean subtitle, mobile shell, and focus panel read as a focus/reward app. |
| Hero/focal planet readability | 1 | The Three.js scene exists, but the central planet/world needs to be brighter, larger, and more immediately dominant. |
| Reward/challenge loop readability | 1 | Focus bar/counter explain the loop, but the scene itself must show energy/reward more clearly. |
| World/stage readability | 1 | Cosmic tone exists, but the first screenshot risks reading as darkness/particles instead of a coherent reward world. |
| HUD/controls readability | 2 | Primary CTA and plus/reset controls are visible and wired to state. |
| Screenshot desirability | 1 | Acceptable prototype feel, but not strong enough as portfolio/game-harness evidence. |

## Failed Criteria Carried Into Round 2

- **Hero/focal planet readability:** make the planet/rings/world clearly visible and appealing in the first screenshot.
- **Reward loop readability:** make focus progress visibly energize the scene, not just update text/HUD.
- **Birth/reward moment:** make Add Focus/completion create an obvious visual event.
- **Screenshot desirability:** first screen should look like a premium cosmic focus/reward app worth trying.

## Known Warnings

- Vite may report a non-fatal chunk-size warning. This is acceptable for the current prototype but should be revisited if productionizing.
- Current project is Orbit Bloom, a game-like focus app, not the older Roblox/Moonleaf game. Any return to a full game direction needs a new contract and human approval.

## Next Role Recommendation

`generator` for Round 2 visual-first fix.
