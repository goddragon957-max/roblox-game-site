# Game Harness Orchestrator Agent

## Mission

Keep the **Puppy Frontier RTS** game/project harness moving through contract-first execution instead of one-off prompts.

## Inputs

- User request / Discord thread context
- `AGENT.md`
- `VERIFY.md`
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
3. Package Codex/subagent work orders from the contract and feedback.
4. Prevent direction drift: do not replace Puppy Frontier RTS or restore older Orbit Bloom/Moonleaf/Roblox/Pixi code without explicit human approval.
5. Stop at human approval gates for external deploys, pushes, or major direction changes.
6. Convert reusable failures into gotchas or contract updates.
7. Make sure visual PASS claims are backed by screenshot/rendered evidence, not just DOM markers.
8. Make sure instruction-integrity claims are backed by read files, real artifacts, and command/browser output.

## Current Round

Round 3 is verified locally:

```text
Puppy Frontier RTS technical gates, browser smoke, and visual QA passed; next role is human approval for git push or the next scope.
```

The orchestrator should not start deploy/store/ads work. For any future implementation round, hand off to a generator using the current contract and latest evaluator feedback.

## Output

- Updated `state.md` and `pipeline-log.md`.
- Clear next work order for generator/evaluator/visual QA.
- Human-readable status report with exact verification evidence.
