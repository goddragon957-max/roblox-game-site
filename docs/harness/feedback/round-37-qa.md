# QA Feedback — Round 37

## Verdict

**PASS** — Planet Forge crater-restoration reward is independently verified on branch `planet-forge-prototype`.

Claude Sonnet/Opus produced a useful partial diff before exiting `143`. The evaluator independently inspected the source, completed concise branch docs and harness artifacts, corrected the transient-expiry test after lengthening the screenshot-visible signal, strengthened the world-space ring after rendered review, reran every deterministic gate, exercised normal shield/crater/restoration paths, verified activation/one-time reward/expiry, captured the active rendered beat, and found zero fatal browser errors.

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| Required files read | PASS | Operator/evaluator read the active goal, `AGENT.md`, `VERIFY.md`, `DESIGN.md`, `CODEX_GOAL.md`, `README.md`, package scripts, harness state/contract/instruction-integrity, prior QA context, and all changed source/test/style files before judgement. |
| Generator handoff | PASS | `docs/harness/handoff/round-37-gen.md` truthfully records Claude exit `143`, changed files, evaluator corrections, commands, browser evidence, and limitations. |
| `npm run verify` | PASS | Harness baseline passed; Vitest passed `96 tests`; `tsc --noEmit` passed; Vite production build passed with `/roblox-game-site/` base. Existing chunk-size warning is non-fatal. |
| `git diff --check` | PASS | Exited 0 with no whitespace errors. |
| Local preview | PASS | Strict preview served `http://127.0.0.1:4214/roblox-game-site/?cron=20260716-round7-final`; expected Planet Forge HTML returned HTTP 200 and loaded `index-BkoH2ION.js`. |
| Marker/canvas/hooks | PASS | Planet marker present; Three.js canvas `1280×633`; state/weather/life/guardian/objective/restoration hooks and command keys available. |
| Real UI interaction | PASS | Browser click on `바다 뿌리기` changed the visible selected button and live `selectedTool` to `water`. |
| Existing shield/debris path | PASS | Shielded meteor resolved at the exact impact cell with `lastImpactKind: "shield"`, `scar: "debris"`, and `meteorsBlocked: 1`. |
| Natural crater/restoration path | PASS | Ignored meteor produced a crater at `cell-57`; forest/water painting cleared it, recorded count/cell/tool/time, granted/logged the bounded reward once, and kept count `1` after repaint. |
| Activation and expiry | PASS | `getRestoration()` and `[data-crater-restoration-active]` became active with count/cell/tool; after 15 deterministic seconds they became inactive while count `1` and healed scar persisted. |
| Browser console | PASS | Fatal JavaScript errors `0`; one existing `THREE.Clock` deprecation warning only. |
| Rendered visual QA | PASS | Active green recovery chip and large surface-attached regrowth ring were clearly visible in the browser-rendered frame, distinct from the orbital ring and gold/red effects, without hiding the planet or tool controls. |
| Independent code review | PASS | Narrow read-only Codex `gpt-5.6-sol` review found two P2 issues: negative signal age could disagree with renderer visibility, and the non-restorative-tools test named three tools but exercised only shield. The evaluator added the non-negative age guard plus crystal/settlement coverage, then reran all gates. |

## Visual QA Scorecard

| Criterion | Score | Notes |
|---|---:|---|
| Product/genre read in 3 seconds | 2 | Fullscreen interactive globe, terraform tools, resources, and space framing immediately read as a planet-making sandbox. |
| Hero/focal object readability | 2 | The large 3D planet remains the dominant visual object. |
| Threat/challenge/reward readability | 2 | Meteor warning/crater language remains clear; active green recovery chip and emerald surface ring make the restorative reward unmistakable. |
| Stage/world readability | 2 | Biomes, trees, crystals, oceans, satellites, atmosphere, and orbital motion form a coherent manipulable world. |
| HUD/controls readability | 2 | Compact glass panels and the added pill stay integrated around the world rather than turning the screen into a page/dashboard. |
| Screenshot desirability | 2 | The active recovery ring provides an immediate satisfying 3-second beat and keeps the central planet readable. |

Total: **12/12**

## What Changed

- Added deterministic crater-restoration state/reward/signal and focused tests.
- Added stable smoke markers, active/inactive recovery chip, and a stronger surface regrowth ring.
- Added concise README/VERIFY/DESIGN documentation and the durable Round 7 goal.
- Advanced the global harness trail from Round 37 to Round 38 while keeping the branch identity explicit; the preserved main-branch RTS is not modified by this branch commit.

## Known Warnings / Follow-ups

- Vite's chunk-size warning is existing/non-fatal.
- The app still emits an existing `THREE.Clock` deprecation warning; no fatal errors occur.
- Non-living tools clear scars through legacy paint semantics but do not count/reward ecological restoration.
- The active-frame capture used a short repeating diagnostic restoration probe because browser-capture latency exceeds the transient duration; the probe was removed before the separate normal-loop and expiry smoke.

## Instruction Integrity

- Claude self-report was unavailable and never treated as completion proof.
- The evaluator independently read the diff, ran deterministic/browser/visual gates, and preserved only coherent work.
- The original expiry test was allowed to fail after the duration changed, then corrected to advance in legal `tickPlanet` increments before rerunning the full gate.
- A bounded independent review initially stalled in Codex orchestration, so the evaluator narrowed it to the exact source diff; its two P2 findings were fixed and reverified rather than ignored.
- `.hermes/`, `node_modules/`, `dist`, logs, and transient screenshots remain excluded from staging.

## Next Role Recommendation

Advance to Round 38 generator on `planet-forge-prototype`. Prefer one small, screenshot-visible Planet Forge slice such as a stronger impact-to-restoration particle arc, tactile brush trail, or progression unlock that preserves the compact HUD and existing smoke contract.
