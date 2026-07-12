# QA Feedback — Round 23

## Verdict

**PASS** — Round 23 renewable lumber / wood-regrowth feedback is verified locally after independent scheduled-evaluator checks.

Claude's visible output was a Fable usage-limit line, but the worktree contained a coherent source diff. The evaluator treated the limit output as data, inspected the changed files, ran deterministic gates, verified the new `nodeRegrowth()` hook and rendered regrowth frame in the browser, checked cooldown/refill behavior, and confirmed the existing gather/build/train/attack loop still changes real game state.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-22-qa.md`, pipeline log, the Round 23 source diff, and relevant source/test files before acceptance. |
| Generator handoff | PASS | `docs/harness/handoff/round-23-gen.md` exists and truthfully records the Claude Fable-limit output plus evaluator-completed verification. |
| `npm run verify` | PASS | Harness-check passed for round 23; Vitest passed `70 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4203`; `http://127.0.0.1:4203/roblox-game-site/?cron=20260712-round23-eval` loaded with HTTP 200. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `nodeRegrowth`. |
| Wood-regrowth smoke | PASS | After `restart()`, selecting workers, setting one wood node to a 10-resource isolated depletion case, issuing a smart gather command, and advancing `2.6s`, the node reached `amountLeft: 0`, `regrowAt: 42.3`, and `nodeRegrowth()` returned `[{ id: "wood-10", progress: ~0.013, secondsLeft: ~39.48 }]`; the log included `나무가 모두 베어졌습니다 — 잠시 후 다시 자랍니다`. |
| Regrowth completion smoke | PASS | After advancing through the cooldown, the same wood node returned to `amountLeft: 140`, `regrowAt: null`, `nodeRegrowth()` returned `[]`, and the log included `나무가 다시 자랐습니다 — 벌목을 재개하세요`. |
| Core interaction smoke | PASS | Existing loop still works after the regrowth slice: selected all workers, gathered gold `120 → 240`, `build('barracks')` returned true, `train()` returned true, `selectSoldiers()` returned `['soldier-17']`, and a smart attack reduced enemy camp HP `400 → 352`. |
| Browser console | PASS | Browser console messages: 0; JavaScript errors: 0 after smoke and visual inspection. |
| Rendered visual QA | PASS | Browser-rendered frame showed a 3D isometric RTS battlefield with player base, selected workers, resources/rocks/wood, river/bridge, enemy camp, compact HUD, minimap, and the regrowth state visible as a subtle sapling/minimap feedback without obscuring play. Browser visual inspection confirmed no fatal visual problems; no repo screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame immediately reads as a 3D isometric RTS with base, units, terrain, resources, enemy camp, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/resources and enemy camp remain spatially distinct; regrowth visuals are subtle and do not confuse the map. |
| Control loop readability | 2 | Selection/gather/build/train/attack browser smoke changed real state; depleted wood logs and regrowth preview show economy feedback. |
| Economy/production loop readability | 2 | Wood depletion now schedules visible return, refill logs appear, and production controls remain state-wired. |
| HUD/minimap readability | 2 | The minimap regrowth ring is compact and fits the existing HUD language. |
| Screenshot desirability | 2 | The active RTS battlefield remains readable and more alive because depleted trees can visibly recover instead of disappearing forever. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `ResourceNode.regrowAt` and `NodeRegrowth`.
- `src/game/simulation.ts`
  - Added `WOOD_REGROW_TIME`, `nodeRegrowth(state)`, and `stepRegrowth(state)`.
  - Wood depletion now starts a 40s regrowth cooldown and logs the upcoming return; gold depletion remains finite.
  - Regrown wood nodes refill to `maxAmount`, log readiness, and can reassign idle workers that last gathered that node.
- `src/store/gameStore.ts`
  - Added `__rtsSmoke.command.nodeRegrowth()`.
- `src/render/ThreeRtsScene.tsx`
  - Renders regrowing wood as a small scaling sapling instead of removing the resource visual entirely.
- `src/components/RtsHud.tsx`
  - Minimap renders a green regrowth ring whose opacity follows progress.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic coverage for wood regrowth/refill, gold non-regrowth, and idle woodcutter return behavior.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4203` was used.
- Future economy readability could add a stronger HUD chip/count for depleted/regrowing wood if players need more explicit planning information.

## Instruction Integrity

- Claude's Fable-limit output was treated as data, not proof of success or failure.
- Evaluator read changed source/docs before acceptance and independently ran the repo gates.
- Browser PASS used live `window.__rtsSmoke` state, DOM markers, command hooks, console inspection, and rendered visual inspection.
- Visual PASS used browser-rendered output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 24 generator under the same 48-hour loop authorization after committing `feat(game): regrow depleted wood nodes` and pushing to `origin main`.
