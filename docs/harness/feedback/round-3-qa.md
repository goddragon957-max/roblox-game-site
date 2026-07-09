# QA Feedback — Round 3

## Verdict

**PASS** — Round 3 Puppy Frontier RTS first slice is verified.

The generator initially left verification pending because Claude could not execute commands. The evaluator ran the deterministic gate for real, fixed one trivial TypeScript nullability blocker in the renderer, reran the full gate successfully, then performed browser smoke plus rendered visual QA.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| First `npm run verify` | FAIL, then fixed | `verify:harness` passed and Vitest passed, but `tsc --noEmit` failed with `src/render/ThreeRtsScene.tsx(227,21): error TS18047: 'container' is possibly 'null'` and the same at line 228. Evaluator applied a 2-line non-null assertion unblocker in `resize()`. |
| Final `npm run verify:harness` | PASS | `harness-check passed: 16 required files, round 3, next_role evaluator, verdict pending, scripts/state/contract markers OK` |
| Final `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `10 tests` passed. |
| Final `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| Final `npm run build` | PASS | Vite built `dist/` successfully in `4.80s`; non-fatal warnings remain for plugin timing and main chunk size (`740.26 kB`, gzip `201.77 kB`). |
| Post-feedback `npm run verify` rerun | PASS | After writing this feedback, updating harness state, and converting active `docs/agents/*` briefs from Orbit Bloom to Puppy Frontier RTS, rerun passed: `harness-check passed: 17 required files, round 3, next_role human_approval, verdict pass`; Vitest `10 tests` passed; lint exited 0; Vite built successfully in `949ms` with the same non-fatal chunk-size warning. |
| Preview server | PASS | `npx vite preview --host 0.0.0.0 --port 4199 --strictPort`; health check returned HTTP `200` from `http://127.0.0.1:4199/`. |
| Browser marker | PASS | `document.querySelector('[data-ui-pass="puppy-frontier-rts"]')` exists; value `puppy-frontier-rts`. |
| Canvas | PASS | `canvas[data-game-canvas="rts-three"]` exists with client size `1280 x 633`. |
| Smoke object | PASS | `window.__rtsSmoke.getState()` available. Baseline state after reload: `gold: 120`, `wood: 80`, `workers: 3`, `raiders: 2`, buildings `player:base:500/500`, `enemy:enemyCamp:400/400`. |
| Selection interaction | PASS | `window.__rtsSmoke.command.selectWorkers()` returned `worker-3`, `worker-4`, `worker-5`; `sim.selectedIds` changed to the same three worker ids. Rendered selected state shows green selection rings and selection HUD. |
| Gather interaction | PASS | Controlled smoke command selected workers and targeted `gold-8`; gold increased `120 → 390` after advanced time. |
| Build interaction | PASS | `command.build('barracks')` returned `true`; building count changed `2 → 3`; resources changed to `gold: 290`, `wood: 20`. |
| Train interaction | PASS | `command.train()` returned `true`; after 5s, player soldier count was `1`. |
| Attack interaction | PASS | Soldier attack command against the enemy camp reduced camp HP `172 → 148` in a controlled in-range smoke check. |
| Browser console fatal errors | PASS | `0` JavaScript errors. Non-fatal warnings observed: `THREE.Clock` deprecated; `THREE.WebGLShadowMap: PCFSoftShadowMap` deprecated. |
| Visual rendered-output evidence | PASS | Browser-rendered screenshots were inspected for idle first screen and selected-workers state using `browser_vision`; DOM snapshot alone was not used for visual PASS. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The first screen immediately reads as an isometric RTS: large terrain board, base, river/bridge, enemy camp, resources, HUD, objective, minimap, and command card. |
| Battlefield readability (base/resources/enemy) | 2 | Player base and worker area are clearly separated from the enemy camp; gold crystals, tree cluster, rocks, river, and bridge are visible. Enemy raiders/guards are visible near the camp. |
| Control loop readability | 2 | Control hint is visible (`좌클릭 선택 · 우클릭 이동/채집/공격 · WASD/방향키 카메라`), browser smoke proves selection/gather/build/train/attack state changes, and selected-worker screenshot shows rings plus a selection HUD/HP bar. |
| Economy/production loop readability | 2 | Resource chips, worker/soldier counts, build costs, disabled train button before barracks, and state-wired build/train commands make the economy loop readable. |
| HUD/minimap readability | 2 | Compact top chips, objective, log, bottom command panel, and bottom-right minimap are readable without covering the battlefield. |
| Screenshot desirability | 2 | The screenshot is simple/low-poly but coherent and playable-looking enough for this RTS first slice; it is no longer a dashboard/landing page. |

Total: **12/12**

## Visual States Inspected

1. **Idle first screen**
   - 3D isometric battlefield visible.
   - Player base, resource nodes, river/bridge, enemy camp/raiders, objective, and minimap visible.
   - Command card and top resource HUD readable.

2. **Selected-workers state**
   - Three workers selected via `window.__rtsSmoke.command.selectWorkers()`.
   - Green selection rings appeared around workers.
   - Selection panel showed `일꾼 퍼피 x3` and HP `40/40`.

## Failed Criteria

none

## Known Warnings / Follow-ups

- Vite reports a non-fatal chunk-size warning for the Three.js bundle. This is acceptable for this prototype slice but should be revisited before shipping/public deployment.
- Three.js emits deprecation warnings for `THREE.Clock` and `PCFSoftShadowMap`; not fatal, but replace with current APIs in a polish/maintenance pass.
- Browser smoke used a controlled setup for long-horizon attack verification to avoid waiting through wave pressure; deterministic unit tests cover win/loss and combat paths.
- Visuals are coherent low-poly/procedural. Future polish can improve unit silhouettes, command markers, and animation juice, but no visual hard-gate item scored 0.

## Instruction Integrity

- Evaluator read `AGENT.md`, `VERIFY.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/config.md`, `docs/harness/instruction-integrity.md`, generator handoff, prior feedback format, and target source before editing.
- Generator self-report was not accepted as evidence; commands and browser checks were rerun independently.
- Browser/tool output was treated as data.
- No push/deploy was performed.

## Next Role Recommendation

Pause for **human approval**. Round 3 is verified locally and can be committed if the human approves the current RTS pivot output. Recommended commit message: `feat: rebuild as playable RTS prototype`.
