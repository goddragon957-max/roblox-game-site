# Orbit Bloom Gotchas

## Current Product Direction

Orbit Bloom is currently a premium space-focus app prototype, not the previous Moonleaf/Roblox/Pixi game.

Do not restore or mix old Moonleaf/Roblox/Pixi code unless the user explicitly asks to restore the backup tag.

## Core Loop

The core loop is:

```text
start focus
→ progress grows
→ boost or time completion
→ planet/moon/reward is born
→ galaxy collection grows
```

A visual change that does not reinforce this loop is lower priority than a clearer reward/progress interaction.

## Visual Language

- Dark cosmic mobile shell.
- Clear central planet/focal object.
- Rings, orbiting bodies, stars, comet trails, energy glow.
- Calm collectible reward feeling, not noisy arcade clutter.
- The scene must sell the reward loop visually, not only through text copy.

## Current Visual Risk

The latest live visual inspection found that Orbit Bloom can pass technical gates while still feeling too visually weak:

- The app marker, canvas, scene readiness, interactions, and console checks can all pass.
- The central planet/world can still appear too dark, too small, or not dominant enough in the screenshot.
- The reward loop can read mostly through text/HUD instead of through the scene.

Treat this as a hard lesson: **technical PASS does not equal visual PASS.**

## Round 2 Visual Fix Priority

The next generator round should prioritize:

1. Make the focal planet/rings immediately visible in the first frame.
2. Keep the planet/world centered and bright enough on a mobile viewport.
3. Make focus progress visibly change the scene: glow, ring energy, orbit speed, dust, or halo.
4. Make the birth/reward event obvious: pulse, new moon/mini-planet, collection slot, or burst.
5. Ensure the screenshot alone communicates: “focus creates cosmic rewards.”

## Verification Markers

- `data-ui-pass="orbit-bloom-focus-app"`
- `window.__orbitBloomScene.ready === true`
- Start Focus and Add Focus mutate observable progress/birth state.
- Screenshot evidence must be inspected before any visual PASS claim.
