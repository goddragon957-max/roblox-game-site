# Planet Forge Design Brief

## Design Priority

This branch should prove the revived planet idea with a screenshot-worthy 3D toy/game, not a generic WebGL demo or old focus-timer poster. The first impression must be: **I can make and protect a tiny living planet.**

## Product Read

Within 3 seconds, the screen should read as:

```text
fullscreen 3D planet sandbox: central living planet, colored biomes, starfield, compact glass controls, meteor danger loop
```

## Visual Identity

- **Tone:** magical sci-fi toy, cozy god-game, premium dark space app.
- **Player fantasy:** use a hand/tool palette to terraform a small planet and keep it alive.
- **Threat fantasy:** meteors and cosmic hazards are clear, visible, and urgent but not grim.
- **Camera:** fullscreen planet first; HUD overlays are secondary and compact.
- **Color system:** deep navy/black background; cyan atmosphere; violet crystals; green forests; warm gold settlements/shields; red/orange only for danger.
- **Shapes/materials:** smooth planet, chunky low-poly patches, tiny trees/crystals/domes, glowing rings, soft bloom-like emissive colors without relying on postprocessing.
- **Typography/HUD:** compact glass panels, strong numeric hierarchy, short Korean labels that can be scanned while playing.

## Default Slice Quality Bar

A slice is not done unless it answers at least one of these:

1. What did the player visibly create on the planet?
2. What world/camera/HUD detail made the planet more desirable to touch?
3. What feedback connects a click/tool to a visible surface result?
4. What threat/reward beat happened in the first minute?
5. What browser/screenshot evidence proves it still looks like a planet game, not a dashboard?

## Preferred Future Design Slices

1. **Surface richness:** better patch shapes, terrain elevation, oceans wrapping together, clouds/weather bands. Shipped a first pass: `planetWeather(state)` (cloud cover/aurora/storm) drives a modulated cloud shell, an aurora ring colored per milestone phase, and a storm halo tint; the HUD title panel shows a compact phase chip (`dormant`/`breathing`/`blooming`/`shielded`) that flashes on transition.
2. **Creation feedback:** brush particles, birth flashes, growing trees/cities, biome spreading. Shipped a first tactile pass: living/protected cells feed orbiting life motes, and drag strokes escalate into compact combo chips plus a surface flare.
3. **Threat feedback:** meteor trails, impact craters, shield ripples, debris rewards. Shipped a stronger spectacle pass: the meteor tail heats up as impact nears, the impact beacon pulses faster, and shield/crater resolution emits a short surface flash. Shipped the recovery close: restoring a crater with water/forest grants a bounded reward and emits an emerald surface regrowth ring plus compact recovery chip.
4. **Progression:** unlock moons/rings/species when habitability crosses thresholds. Shipped a first unlock: 8+ protected cells activate a glowing 수호자 위성망 ring/chip and a one-time energy/mineral bonus. Shipped a follow-up objective loop: a compact goal chip cycles through short targets (forest count → shield count → meteor block → habitability), each completion pops a gold trophy banner plus an expanding golden shockwave ring and a resource reward, then advances to the next goal so the sandbox never permanently ends.
5. **Controls:** drag-to-paint, rotate/orbit camera, tool cooldowns, tactile sound-ready feedback.
6. **Mobile shell option:** if the product becomes app-like, frame it as a premium space garden/focus companion without losing the real interactive planet.

## Hard Rejection Patterns

Reject or revise work that:

- hides the planet behind large panels;
- only changes text/state without visible surface feedback;
- removes drag-to-paint, pulse rings, crater scars, or debris rewards without replacing them with stronger visible feedback;
- uses generic dashboard cards as the main impression;
- leaves biomes as tiny unreadable dots;
- claims visual PASS without browser-rendered screenshot/vision evidence;
- turns the concept back into a passive focus timer unless explicitly asked.

## Verification Notes

For every visual/behavior slice:

- run deterministic gates (`npm run verify`, `git diff --check`);
- run browser smoke from `VERIFY.md`;
- capture/inspect rendered output with the first-3-seconds scorecard;
- score honestly: product read, planet read, control loop read, threat/reward read, HUD read, screenshot desirability.
