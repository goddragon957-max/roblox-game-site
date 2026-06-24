# Moonleaf Trail Agent Brief

## Current Direction

Rebuild and maintain this project as an original 2D side-scrolling action RPG slice. The preserved rejected 3D tower-defense prototype is tagged `failed-3d-blockhold-31c83e3`; do not revive Babylon, GLB, Kenney, tower-defense, or 3D-specific code/assets.

Stack: Vite + React + TypeScript + Zustand + Pixi.js.

## Product Requirements

- First screen is playable game, not a landing page.
- Side-view forest village/field with authored terrain and platforms.
- Cute readable original hero.
- At least three original enemies.
- WASD/arrow movement, jump, and attack.
- Hit effects, damage numbers, pickups/coins.
- HP/MP/EXP/level HUD.
- Quest/objective progress.
- Death/respawn or win/progress feedback.
- Use only original vector/canvas/Pixi shapes or original generated 2D assets.
- No copyrighted game assets, names, mobs, maps, UI, or copied silhouettes.

## StyleSeed HUD

Apply StyleSeed judgment to UI changes:

- compact game HUD overlay;
- one coherent leaf/gold accent system;
- semantic CSS tokens;
- no web dashboard slabs;
- no giant panels hiding the action;
- touch targets at least 44px where buttons appear;
- controls and game state must be wired, not decorative.

## Verification Per Slice

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

For visible changes, run a local browser smoke:

- marker `data-ui-pass="moonleaf-2d-action-rpg"` exists;
- Pixi canvas marker `data-game-canvas="moonleaf-2d"` exists;
- first 3 seconds show genre, hero, enemy, stage, HUD, and screenshot desire;
- Start or keyboard input changes state;
- attack damages an enemy and shows feedback;
- console errors are 0.

Do not commit or push unless explicitly asked.
