# QA Feedback — Round 9

## Verdict

**PASS** — Round 9 selection readability/status slice is verified locally and ready to commit/push.

Claude Code returned a session-limit message, but the scheduled evaluator found a partial selection-summary diff in the worktree, completed the focused slice, and independently verified deterministic gates, browser/play smoke, rendered visual output, and whitespace checks.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Generator handoff | PASS | `docs/harness/handoff/round-9-gen.md` exists and truthfully records the Claude session-limit plus evaluator/completer finish. |
| `npm run verify:harness` | PASS | In combined `npm run verify`: `harness-check passed: 16 required files, round 9, next_role generator, verdict pass, scripts/state/contract markers OK`. |
| `npm run test` | PASS | Vitest: `src/game/__tests__/simulation.test.ts` passed, `23 tests` passed. |
| `npm run lint` | PASS | `tsc --noEmit` exited 0. |
| `npm run build` | PASS | Vite built `dist/` successfully in `1.40s`; known non-fatal chunk-size warning remains (`745.92 kB`, gzip `203.40 kB`). |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview path | PASS | Port `4199` was already in use, so evaluator used allowed alternate strict port `4200`; `http://127.0.0.1:4200/roblox-game-site/?cron=20260711-round9` loaded successfully. |
| Browser marker/canvas | PASS | `data-ui-pass="puppy-frontier-rts"` exists; `canvas[data-game-canvas="rts-three"]` exists at `1280 x 633`. |
| Selection summary smoke | PASS | `selectWorkers()` selected `worker-3`, `worker-4`, `worker-5`; selection panel rendered `data-selection-count="3"`; `data-selection-kind="worker"` chip rendered `일꾼 퍼피 ×3 · 120/120`; `selectionSummary()` returned `{ count: 3, hp: 120, maxHp: 120, groups: [{ kind: 'worker', count: 3, hp: 120, maxHp: 120 }] }`. |
| Gather/build/train/attack smoke | PASS | Smart gather against a gold node plus `advanceSeconds(20)` changed gold `120 → 240`; `build('barracks')` returned true; `train()` returned true; after `advanceSeconds(5)`, one player soldier existed; attack command against the enemy camp changed camp HP `400 → 256`. |
| Browser console | PASS | Fatal JavaScript errors: 0; console messages: 0 during smoke checks. |
| Rendered visual QA | PASS | Browser-rendered output inspected after selecting all workers. Bottom-left panel clearly showed `선택 부대 ×3`, aggregate HP `120/120`, and `일꾼 퍼피 ×3 · 120/120`; selected rings, battlefield, base, resources, enemy camp, HUD, and minimap remained readable. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | The battlefield, base, resource nodes, enemy camp, HUD, command card, and minimap still read as an isometric RTS. |
| Battlefield readability (base/resources/enemy) | 2 | Low-poly terrain, river/bridge, player base, resources, and enemy camp were visible in the rendered preview. |
| Control loop readability | 2 | Selection rings appeared for all selected workers; the HUD now summarizes the group and aggregate HP. |
| Economy/production loop readability | 2 | Browser smoke verified resource gain, barracks build, soldier training, and camp damage through commands. |
| HUD/minimap readability | 2 | The new composition chips fit the compact HUD without obscuring the command card or minimap. |
| Screenshot desirability | 2 | The selected-worker group panel makes the RTS command state clearer and more game-like. |

Total: **12/12**

## What Changed

- `src/game/types.ts`, `src/game/simulation.ts`
  - Added pure selection summary types and `selectionSummary(state)` for count, aggregate HP, and per-kind grouping.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.selectionSummary()` for browser smoke.
- `src/components/RtsHud.tsx`, `src/styles.css`
  - Multi-selections now show `선택 부대`, aggregate HP, and compact per-kind composition chips with smoke-friendly data attributes.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic coverage for mixed worker/base selection grouping and aggregate HP.

## Known Warnings / Follow-ups

- Vite chunk-size warning remains and is still accepted as out-of-scope.
- If future slices add box-select or control groups, reuse `selectionSummary()` for those panels rather than duplicating selection aggregation in React.

## Instruction Integrity

- Required goal, harness, verification, state, contract, instruction-integrity, latest feedback, handoff, and changed source files were read/inspected before acceptance.
- Claude's session-limit output and partial diff were not accepted as proof; evaluator completed and reran gates/browser checks independently.
- Visual PASS used rendered browser output inspected through `browser_vision`; no repo screenshot path is claimed.
- `.hermes/` scratch files were not staged.

## Next Role Recommendation

Commit `feat(game): summarize selected squads`, push to `origin main`, optionally verify GitHub Pages after propagation, then let the scheduled 48-hour loop continue with Round 10.
