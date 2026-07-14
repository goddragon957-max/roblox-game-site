# QA Feedback — Round 36

## Verdict

**PASS** — Round 36 world-space under-siege emergency feedback is independently verified.

Codex `gpt-5.6-sol` with ultra reasoning implemented a renderer-only signal over the existing deterministic threat selector and exited `124` after useful source/browser work. The evaluator independently inspected the diff, reran all deterministic gates, exercised the normal gather/build/train/attack loop, created a natural first-wave headquarters hit, confirmed exact hit-position/state/DOM coupling, inspected the rendered active-alert frame, and found no fatal browser errors or regressions.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read the active Codex goal, `AGENT.md`, `VERIFY.md`, `DESIGN.md`, `CODEX_GOAL.md`, `package.json`, harness state/contract/instruction-integrity, Round 35 handoff/feedback, role briefs, gotchas, and target source before judgement. |
| Generator handoff | PASS | `docs/harness/handoff/round-36-gen.md` truthfully records Codex exit `124`, the single renderer file, commands, browser evidence, and limitations. |
| Codex model/effort | PASS | CLI header reported `model: gpt-5.6-sol`, `reasoning effort: ultra`, `sandbox: danger-full-access`, approval `never`. |
| `npm run verify` | PASS | Harness check passed for the Round 36 baseline; Vitest passed `75 tests`; `tsc --noEmit` passed; Vite production build passed. Existing chunk-size warning remains non-fatal/out-of-scope. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview | PASS | Strict preview served `http://127.0.0.1:4206/roblox-game-site/?round36=evaluator-cdp`; expected HTML returned HTTP 200. |
| Marker/canvas/smoke | PASS | App marker present; Three.js canvas present at `1280×720`; WebGL available; `window.__rtsSmoke` and command keys available. |
| Core interaction smoke | PASS | Workers selected; gold gathered `120→240`; barracks built; soldier trained; natural soldier hit reduced `raider-6` HP `60→48`; `combatHits()` exposed `hit-1`. |
| Natural headquarters hit | PASS | Workers were ordered away after restart; first-wave `raider-16` naturally attacked `base-1` at `time≈57.8`; headquarters HP changed `500→491`. |
| Threat-state/render coupling | PASS | `threatAlert()` was active at exact headquarters position `{x:-13.5,z:11.5}`; after two render frames `data-threat-alert` was visible with the expected Korean warning and the active signal remained anchored there. |
| Browser console | PASS | Fatal JavaScript errors `0`; `console.error` calls `0`. |
| Rendered visual QA | PASS | Active-alert frame showed a clear shield/exclamation badge above the puppy headquarters plus large red/orange ground pulses, distinct from the enemy camp/wave and short combat-hit effects, without obscuring the world or controls. |
| Independent code review | PASS | Final separate Codex review found no blocking correctness, lifecycle/disposal, regression, or instruction-integrity issue. It confirmed threat snapshot rendering/cleanup and the Round 37 state trail are sound. An earlier pre-artifact review's missing-handoff finding was resolved by creating the required docs; its moving-unit concern was rejected against the explicit event-position snapshot contract. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Fullscreen isometric battlefield, economy HUD, bases, road/bridge, units, and minimap immediately read as RTS. |
| Hero/focal object readability | 2 | The friendly headquarters remains visually authored and becomes the unmistakable focal object during the alert. |
| Threat/challenge readability | 2 | Red/orange badge, ground pulses, top warning chip, log, and minimap make the active base attack immediately legible. |
| Stage/world readability | 2 | Friendly outpost, resources, bridge/river route, and raccoon camp remain spatially coherent. |
| HUD/controls readability | 2 | Compact overlays remain readable; the signal does not cover command buttons or tactical controls. |
| Screenshot desirability | 2 | The active emergency cue adds battle tension and a strong 3-second beat without dashboard clutter. |

Total: **12/12**

## What Changed

- `src/render/ThreeRtsScene.tsx`
  - Added renderer-only 3D emergency pulses and shield/exclamation badge driven by the existing `threatAlert` selector and duration.
  - Added building-aware scale/height and cleanup disposal.

## Known Warnings / Follow-ups

- Vite's chunk-size warning is existing/non-fatal.
- The signal marks the latest real damage position for the selector's four-second lifetime. For moving units this is intentionally an event-location marker rather than a tracking icon; the headquarters acceptance path is stationary.
- Generator exit `124` did not invalidate the coherent diff; evaluator completed verification and docs from independent evidence.
- The transient evaluator PNG under `/tmp` is not a repository artifact and is not claimed as durable evidence.

## Instruction Integrity

- Codex self-report was treated as data, not completion proof.
- The evaluator independently reran deterministic/browser/visual gates and corrected its own first browser probe after discovering an obsolete `sim.nodes` field assumption; the valid probe used the live `sim.resources` schema.
- Target source/harness files were read before judgement.
- `.hermes/`, `node_modules/`, `dist`, logs, and transient screenshots remain excluded from the commit.

## Next Role Recommendation

Advance to Round 37 generator under the active Codex goal-mode authorization. Prefer one small visible slice that preserves the new under-siege signal and improves unit movement/action animation, compact minimap combat affordances, or another high-impact world/combat readability gap.
