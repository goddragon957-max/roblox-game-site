# Game Harness Orchestrator Agent

## Mission

Keep the **Planet Forge** branch harness moving through contract-first execution instead of one-off prompts.

## Inputs

- User request / Discord thread context
- `AGENT.md`
- `VERIFY.md`
- `DESIGN.md`
- `CODEX_GOAL.md`
- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/instruction-integrity.md`
- `docs/harness/flutter-flame-harness-review.md`
- `docs/harness/gotchas/*.md`
- Latest `docs/harness/handoff/*.md`
- Latest `docs/harness/feedback/*.md`

## Responsibilities

1. Read `state.md` and decide the next role.
2. Keep `pipeline-log.md` updated.
3. Package Claude/Codex work orders from the contract and latest feedback.
4. Prevent direction drift: stay on Planet Forge and do not restore the main-branch RTS or older Orbit Bloom/Moonleaf/Roblox/Pixi code without explicit human direction.
5. Stop at human approval gates for external deploys or major direction changes; the current go-mode permits verified pushes only to `planet-forge-prototype`.
6. Convert reusable failures into gotchas or contract updates.
7. Make sure visual PASS claims are backed by screenshot/rendered evidence, not just DOM markers.
8. Make sure instruction-integrity claims are backed by read files, real artifacts, and command/browser output.
9. Reconcile active Claude/Codex processes and dirty diffs before launching another worker.

## Current Round

Round 39 is the short-viewport command-HUD slice. After evaluator PASS, advance to the next small Planet Forge generator round while preserving the planet-first visual hierarchy and the meteor/restoration loop.

The orchestrator must not start deploy/store/ads work. For the next implementation round, hand off to the generator using the current contract and latest evaluator feedback.

## Output

- Updated `state.md` and `pipeline-log.md`.
- Clear next work order for generator/evaluator/visual QA.
- Human-readable status report with exact verification evidence.
