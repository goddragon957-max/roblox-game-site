# CODEX GOAL - Original 2D Side-Scrolling RPG Slice

Repo: `/home/sy/projects/roblox-game-site`

Acceptance-critical direction: the previous Babylon/3D tower-defense prototype was rejected and preserved as tag `failed-3d-blockhold-31c83e3`. Rebuild forward as a 2D side-scrolling action RPG inspired by the feel of classic Korean side-scrolling MMORPGs without copying MapleStory assets, names, maps, mobs, UI, or copyrighted designs.

## Goal

Ship a playable first slice, not a landing page:

- side-view forest village/field;
- cute readable hero;
- platforms/terrain;
- WASD/arrow movement;
- jump;
- attack;
- at least 3 enemies;
- hit effects and damage numbers;
- HP/MP/EXP/level HUD;
- quest/objective;
- coins or pickups;
- death/respawn or win/progress feedback.

## Technical Direction

- Vite + React + TypeScript + Zustand.
- Pixi.js renders the game scene.
- React renders the compact HUD overlay.
- Assets must be original vector/canvas/Pixi shapes or generated original 2D descriptors.
- `generate:assets` may be a no-op or generate original 2D sprite metadata.
- `verify:visual` must validate 2D markers/assets and no Babylon/Kenney/GLB/tower-defense leftovers.

## Visual QA

The first 3 seconds must communicate:

- genre;
- playable character;
- enemy;
- side-scrolling stage;
- compact game HUD;
- screenshot desire.

StyleSeed applies to HUD and UI: one coherent accent system, compact overlay, no dashboard slabs, no generic web landing composition.

## Required Commands

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

Browser smoke when feasible:

- run Vite preview;
- verify canvas exists;
- verify Start/controls or keyboard interaction changes state;
- verify attack damages enemy;
- verify console errors 0.

Do not commit or push; Hermes will verify and ship.
