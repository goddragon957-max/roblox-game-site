# Orbit Bloom Verification

## Static gates

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

Combined gate:

```bash
npm run verify
```

## Harness evaluator output

After each verified round, write `docs/harness/feedback/round-N-qa.md` with:

- PASS / FAIL / TECHNICAL PASS WITH VISUAL FAIL verdict.
- Commands run and exact results.
- Browser/play evidence.
- Screenshot or rendered-output evidence for visual claims.
- Visual QA scorecard.
- Failed criteria and fix prompt for the next generator round.

## Browser smoke

1. Start dev server: `npm run dev -- --host 0.0.0.0 --port 5180 --strictPort`.
2. Open the app.
3. Confirm:
   - `document.querySelector('[data-ui-pass="orbit-bloom-focus-app"]')` exists.
   - `document.querySelector('canvas')` exists.
   - `window.__orbitBloomScene.ready === true`.
   - Click Start Focus; progress becomes > 0 and focusing is true.
   - Click Add Focus until progress visibly changes; births/moons should be able to increase when the reward threshold is crossed.
   - Browser console has zero JavaScript errors.

## Visual bar

Within the first three seconds the screen should read as:

- premium mobile focus app;
- space/planet/galaxy concept;
- clear focus reward loop;
- calm but collectible visual style.

Score each criterion 0/1/2. Any 0 is a hard fail:

| Criterion | Required Evidence |
|---|---|
| Product/genre read in 3 seconds | screenshot/browser visual capture |
| Hero/focal planet readability | visible, appealing planet/rings/world |
| Reward/challenge loop readability | scene and HUD communicate focus → reward |
| World/stage readability | coherent cosmic world, not random darkness/particles |
| HUD/controls readability | controls are integrated and state-wired |
| Screenshot desirability | screenshot makes the app worth trying |

DOM snapshots alone are insufficient for visual PASS.
