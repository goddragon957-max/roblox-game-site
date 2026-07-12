# QA Feedback — Round 21

## Verdict

**PASS** — Round 21 wave-cleared reward feedback is verified locally after independent scheduled-evaluator checks and one focused evaluator correction.

Claude generated the initial slice but could not run `npm run verify` from its non-interactive session (`PERMISSION_DENIED`). The evaluator treated Claude output as data, inspected the changed source/docs, found that the first implementation only celebrated after **all** enemy units were dead (so normal wave defense with camp guards alive would not show the reward), and corrected it by tracking `activeWaveRaiderIds` for spawned wave raiders. The verified product behavior now celebrates clearing the active wave while pre-wave camp guards remain alive.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Evaluator read `docs/goals/2026-07-11-48h-claude-goal-loop.md`, `AGENT.md`, `VERIFY.md`, `package.json`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, latest feedback `docs/harness/feedback/round-20-qa.md`, pipeline log, generator handoff, and relevant changed source/test files before acceptance. |
| Generator handoff | PASS | `docs/harness/handoff/round-21-gen.md` exists and truthfully records Claude's `npm run verify` permission blocker; evaluator notes below record the correction beyond the original handoff. |
| `npm run verify` | PASS | Harness-check passed for round 21; Vitest passed `64 tests`; `tsc --noEmit` passed; Vite build succeeded. Vite chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Strict port `4199` was occupied, so evaluator used allowed alternate strict port `4201`; `http://127.0.0.1:4201/roblox-game-site/?cron=20260712-round21-eval2` loaded in the browser. |
| Browser marker/canvas/smoke hooks | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`; `window.__rtsSmoke.getState()` works; command hooks include `waveClear`. |
| Core interaction smoke | PASS | `selectWorkers()` selected 3 workers; gather command increased gold `120 → 270`; `build('barracks')` returned true; `train()` returned true; selecting the spawned soldier and smart-attacking the enemy camp reduced camp HP `400 → 100`. |
| Wave-clear smoke | PASS | After `advanceSeconds(51)`, active wave raider ids were `['raider-16']` with 2 camp guards alive. Evaluator set only the active wave raider HP to 0, advanced the sim, and `waveClear()` returned `{ active: true, waveNumber: 1, secondsAgo: ~0.23 }`; the HUD chip appeared with `data-wave-cleared="1"` and text `웨이브 1 격퇴! 다음 습격을 준비하세요`; both camp guards remained alive. After advancing past the feedback window, `waveClear().active` was false and the chip disappeared. |
| Browser console | PASS | Fatal JavaScript errors: 0; console messages: 0 after smoke/visual inspection. |
| Rendered visual QA | PASS | Browser-rendered frame showed a 3D isometric RTS battlefield with player base, workers, resources, bridge/river, enemy camp, compact HUD, minimap, and the new green `웨이브 1 격퇴!` reward chip readable in the top HUD row. Browser visual inspection confirmed no fatal visual problems; no repo screenshot path is claimed. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The frame immediately reads as a 3D isometric RTS with base, units, resources, terrain, enemy camp, HUD, and minimap. |
| Battlefield readability (base/resources/enemy) | 2 | Player base/resources and enemy camp remain spatially distinct, with the battlefield unobscured by the new chip. |
| Control loop readability | 2 | Selection/gather/build/train/attack browser smoke changed real state; the wave-clear chip adds a visible reward beat after defense. |
| Economy/production loop readability | 2 | Existing resource/build/train HUD remains state-wired and readable while the reward chip is active. |
| HUD/minimap readability | 2 | The green reward chip is compact, legible, and integrated into the top HUD row without hiding the minimap or command card. |
| Screenshot desirability | 2 | The celebratory `웨이브 1 격퇴!` chip makes the post-defense moment feel more like a game reward beat. |

Total: **12/12**

## What Changed

- `src/game/types.ts`
  - Added `WaveClear` and wave-clear state fields, including `activeWaveRaiderIds` for spawned wave raider tracking.
- `src/game/simulation.ts`
  - Added `WAVE_CLEAR_FEEDBACK_DURATION = 5`.
  - `spawnWave()` records spawned wave raider ids.
  - `removeDead()` now celebrates when the active wave raider list clears, even if pre-wave camp guards remain alive.
  - Added pure `waveClear(state)` for HUD/smoke use.
- `src/store/gameStore.ts`
  - Added `__rtsSmoke.command.waveClear()`.
- `src/components/RtsHud.tsx`
  - Added a green `웨이브 N 격퇴! 다음 습격을 준비하세요` HUD chip with `data-wave-cleared`.
- `src/styles.css`
  - Styled the wave-clear chip and pop animation.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic wave-clear tests, including a regression that spawned wave raiders can clear while camp guards remain alive.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains accepted as out-of-scope.
- Preview port `4199` was occupied; allowed alternate strict port `4201` was used.
- Future visual polish could add a world-space burst at the last wave-raider death position; current verified slice is HUD/log reward feedback.

## Instruction Integrity

- Claude's `PERMISSION_DENIED` output was treated as data, not proof.
- Evaluator rejected the first passing deterministic implementation until the normal player-facing case (active wave clears while camp guards remain alive) was covered.
- Changed source files and required harness docs were inspected before acceptance.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/`, `node_modules/`, `dist/`, and transient logs/screenshots must not be staged.

## Next Role Recommendation

Advance to Round 22 generator under the same 48-hour loop authorization after committing `feat(game): celebrate cleared raider waves` and pushing to `origin main`.
