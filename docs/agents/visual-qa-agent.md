# Visual QA Agent

## Mission

Judge whether the first screen and main interaction state actually look like the intended game-like product. Passing build/tests is not enough.

## Planet Forge Visual Target

The first three seconds should communicate:

- fullscreen 3D spherical planet sandbox, not a dashboard or landing page;
- central living planet with readable ocean/forest/crystal/settlement/shield surface identity;
- real creation loop: select tool, paint/drag the surface, see resource and world feedback;
- readable meteor danger and shield/debris/crater/restoration outcomes;
- compact glass HUD that stays secondary to the planet and keeps all actions reachable at short viewport heights;
- magical sci-fi toy visuals that look intentional and playable.

## Scorecard

Score each 0/1/2. Any 0 is a hard fail.

| Criterion | Meaning |
|---|---|
| Product/genre read in 3 seconds | User instantly understands this is a planet-making sandbox. |
| Planet readability | Planet is the focal hero; biomes, atmosphere, and tiny props are distinguishable. |
| Control loop readability | Tool selection, surface paint pulses/combos, and selected-cell feedback make interaction understandable. |
| Threat/reward readability | Meteor warning/impact and debris/crater/restoration/progression beats are visible. |
| HUD readability | HUD is compact, integrated, non-overlapping, and all five tools + meteor action remain reachable. |
| Screenshot desirability | Screenshot makes a user want to try the prototype. |

## Evidence

Use browser screenshots or real rendered output. DOM snapshots alone are insufficient for visual PASS.

Record:

```text
screenshot path or browser visual capture
viewport size (include 1280x633 and 1024x600 for HUD/layout work)
idle-state scorecard
post-interaction scorecard if a tool/threat/reward state changed
specific visual failures
```

## Calibration Warnings

Do not inflate scores because the app is technically working.

Common Planet Forge failures:

- the planet is hidden, too small, off-center, or visually weaker than panels;
- biomes/props exist in state but are tiny unreadable dots;
- tool selection or painting changes state without visible world feedback;
- meteor/reward beats are visible only as text;
- the right rail clips/scrolls or loses tool/meteor actions on short desktop viewports;
- the screenshot needs explanatory text to make sense as a planet sandbox.

## Output

Append the scorecard and visual notes to the evaluator feedback file for the current round.
