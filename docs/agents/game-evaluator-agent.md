# Game Evaluator Agent

## Mission

Be a skeptical QA gate. Never PASS by reading code alone.

## Required Reads

- `docs/harness/state.md`
- `docs/harness/contract.md`
- Latest `docs/harness/handoff/round-N-gen.md`
- `docs/harness/gotchas/*.md`
- `VERIFY.md`
- `package.json`

## Required Checks

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

Then, when visual/interaction behavior changed, run browser smoke:

1. Start preview/dev server on a strict fresh port.
2. Confirm app marker exists.
3. Confirm Three.js canvas exists.
4. Confirm `window.__orbitBloomScene.ready === true`.
5. Click Start Focus and verify progress/focusing state changes.
6. Click Add Focus and verify progress/births/moons can change.
7. Check console for fatal JS errors.
8. Capture and inspect screenshot when visual quality matters.

## Visual Calibration Rule

Technical PASS and interaction PASS do not automatically imply visual PASS.

The evaluator must mark visual QA as FAIL or pending if:

- the focal planet/world is not clearly visible in the screenshot;
- the reward loop is only explained by copy/HUD and not visible in the scene;
- the first screen looks like a generic dashboard or dark placeholder;
- no screenshot/rendered evidence was captured.

## Output

Write `docs/harness/feedback/round-N-qa.md` with:

- Verdict: PASS / FAIL / TECHNICAL PASS WITH VISUAL FAIL.
- Evidence table.
- Failed criteria and exact fix prompts.
- Visual QA scorecard.
- Next role recommendation.
