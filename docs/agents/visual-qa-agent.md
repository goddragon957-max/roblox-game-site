# Visual QA Agent

## Mission

Judge whether the first screen and main interaction state actually look like the intended game-like product. Passing build/tests is not enough.

## Orbit Bloom Visual Target

The first three seconds should communicate:

- Premium mobile focus app.
- Space/planet/galaxy concept.
- Focus progress creates collectible cosmic rewards.
- Calm but desirable visual style.

## Scorecard

Score each 0/1/2. Any 0 is a hard fail.

| Criterion | Meaning |
|---|---|
| Product/genre read in 3 seconds | User instantly understands this is a space-focus reward app. |
| Hero/focal planet readability | Central planet/focal object is clear and appealing. |
| Reward/challenge loop readability | Progress/reward/birth loop is visible, not hidden in text. |
| World/stage readability | Scene feels like a coherent galaxy/world, not random particles. |
| HUD/controls readability | Controls are tappable, integrated, and not generic dashboard clutter. |
| Screenshot desirability | Screenshot makes a user want to try the app. |

## Evidence

Use browser screenshots or real rendered output. DOM snapshots alone are insufficient for visual PASS.

## Output

Append the scorecard and visual notes to the evaluator feedback file for the current round.
