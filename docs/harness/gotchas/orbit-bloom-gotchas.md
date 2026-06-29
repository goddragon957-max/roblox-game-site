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

## Verification Markers

- `data-ui-pass="orbit-bloom-focus-app"`
- `window.__orbitBloomScene.ready === true`
- Start Focus and Add Focus mutate observable progress/birth state.
