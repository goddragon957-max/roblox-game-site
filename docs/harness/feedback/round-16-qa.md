# QA Feedback — Round 16

## Verdict

**PASS** — Round 16 tower shot tracer feedback is verified locally after independent evaluator checks.

Claude Code implemented the slice but could not run commands in its permission layer, so the scheduled evaluator treated `docs/harness/handoff/round-16-gen.md` as data and reran the gates, browser smoke, and rendered visual QA independently.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-15-qa.md`, generator handoff, pipeline log, harness checker, and changed source files before accepting. |
| Generator handoff | PASS | `docs/harness/handoff/round-16-gen.md` exists and truthfully records blocked command execution plus exact evaluator follow-up instructions. |
| `npm run verify` | PASS | Harness-check passed for round 16 evaluator/pending; Vitest passed `49 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260712-round16-eval` returned HTTP 200 and loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `towerShots`. |
| Selection/economy smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; smart-gathering a gold node and advancing 20s changed gold `120 → 240`; smart-gathering wood changed wood `80 → 170`. |
| Build/train smoke | PASS | `build('tower')` returned true (`tower-16`); `build('barracks')` returned true (`barracks-17`); `train()` returned true and produced `soldier-18`. |
| Tower-shot smoke | PASS | Natural wave defense produced `towerShots()` at `time≈56.2` with `tower-16` shot from `{ x: -10, z: 14.5 }` to a real raider impact point; after advancing `0.5s`, `towerShots()` returned `[]`; after cooldown it refreshed at `time≈57.4`; a later active shot was frozen for visual QA at `time≈100.7` with age `≈0.05s`. |
| Attack/core-loop smoke | PASS | Selecting `soldier-18` and smart-attacking the enemy camp reduced camp HP `400 → 232`; game status remained `playing`. |
| Tower UI/readability | PASS | Selecting `tower-16` exposed `towerRanges()` radius `8` and the HUD selection panel read `방어 타워`, HP `220/220`, and `사거리 8 · 범위 안 라쿤 자동 공격`. |
| Browser console | PASS | Fatal JavaScript errors: 0. Browser console only showed non-fatal Three.js WebGL context lost/restored log messages. |
| Rendered visual QA | PASS | Browser-rendered frame inspected with the naturally produced tower shot frozen: the selected tower, green range ring, gold muzzle/bolt tracer toward a raider, compact HUD, objective log, minimap, base/barracks/resources/river/enemy camp all remained readable. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame immediately reads as a 3D isometric RTS with buildings, units, terrain, enemy camp, command HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/barracks/tower, resource clusters, river/bridge, raiders, and enemy camp remain spatially distinct. |
| Control loop readability | 2 | Selection, gather, build, train, attack, and tower auto-fire all changed real browser state; the selected tower's range ring and tracer clarify defense behavior. |
| Economy/production loop readability | 2 | Gold/wood counters changed from gathering; tower/barracks/training costs applied; soldier training produced a usable unit. |
| HUD/minimap readability | 2 | The compact HUD, tower selection panel, objective log, and minimap remained legible; minimap includes the tower/range/tracer context without clutter. |
| Screenshot desirability | 2 | The selected tower defending against raiders with a visible gold shot tracer communicates a recognizable RTS defense beat. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `Building.lastShotAt`, `Building.lastShotTarget`, and `TowerShot`.
- `src/game/simulation.ts`
  - Added `TOWER_SHOT_DURATION = 0.35`.
  - Tower fire now records the shot time and target position exactly where damage is applied.
  - Added pure `towerShots(state)` selector, empty after shots expire or when the match is not playing.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.towerShots()` for browser verification.
- `src/render/ThreeRtsScene.tsx`
  - Added per-player-tower gold bolt meshes that lerp from tower top to the recorded hit position while a shot is active.
- `src/components/RtsHud.tsx`
  - Minimap draws a matching gold tower-shot tracer line.
- `src/game/__tests__/simulation.test.ts`
  - Added 4 deterministic tower-shot tests for record, expiry/refresh, out-of-range no-shot, and match-end clearing.
- `docs/harness/handoff/round-16-gen.md`
  - Captures Claude's blocked command execution and evaluator instructions.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4200` was used.
- Browser console logged non-fatal `THREE.WebGLRenderer: Context Lost/Restored` during the browser session; `js_errors` was empty.
- The tracer is intentionally a short 0.35s straight shot to the impact point. A future slice could add a small hit burst at the raider.

## Instruction Integrity

- Claude's handoff was treated as data, not proof; evaluator reran deterministic and browser gates independently.
- Changed source files and required harness docs were read before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 17 generator after committing `feat(game): add tower shot tracer feedback` and pushing to `origin main`.
