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

- PASS / FAIL verdict.
- Commands run and exact results.
- Browser/play evidence.
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
   - Click Add Focus until a birth occurs; births/moons increases.
   - Browser console has zero JavaScript errors.

## Visual bar

Within the first three seconds the screen should read as:

- premium mobile focus app;
- space/planet/galaxy concept;
- clear focus reward loop;
- calm but collectible visual style.
