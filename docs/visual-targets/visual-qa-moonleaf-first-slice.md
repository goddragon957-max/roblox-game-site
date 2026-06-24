# Visual QA — Moonleaf 2D First Slice

Date: 2026-06-24

Scope: full rebuild from the rejected 3D/Babylon tower-defense prototype into an original 2D side-scrolling action RPG prototype. The preserved 3D build is tagged as `failed-3d-blockhold-31c83e3`.

## What changed

- Replaced the Babylon/GLB/Kenney tower-defense implementation with a Pixi.js 2D renderer.
- Added an original side-scrolling forest/village field with platforms, hero, enemies, pickups, hit sparks, and damage numbers.
- Added movement, jump, attack, enemy HP/damage, HP/MP/EXP/level, coins, quest progress, win/defeat/respawn flow.
- Replaced the old HUD with a compact StyleSeed-aligned RPG HUD.
- Removed obsolete 3D model assets and 3D visual gate references from active code.

## Evidence

Commands run successfully:

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

Browser smoke:

- local `vite preview --host 0.0.0.0 --port 4198 --strictPort` served the correct Moonleaf build;
- bundle: `index-D1U1bWUS.js`;
- marker: `data-ui-pass="moonleaf-2d-action-rpg"`;
- Pixi canvas marker: `data-game-canvas="moonleaf-2d"`;
- canvas: 1280×633 client and 1280×633 buffer;
- Start Adventure moved state from `ready` to `playing`;
- keyboard movement changed hero x from 120 to 146;
- attack smoke placed hero near first enemy and dispatched `J`; enemy HP changed from 28 to 6;
- floating hit text included `-22`;
- console JS errors: 0.

## First-screen scorecard

| Criterion | Score | Notes |
|---|---:|---|
| First 3 seconds: game genre obvious? | 2 | Side-view platform field, hero, enemy, objective, and controls are immediately visible. |
| Hero reads as cute playable character? | 2 | Hero is large with face/body/weapon silhouette and appears controllable. |
| Enemy reads as enemy? | 2 | Sprout/mushroom-like enemies have faces, HP bars, and clear target positioning. |
| Stage reads as side-scrolling field? | 2 | Forest/village foreground, platforms, pickups, and horizontal traversal read clearly. |
| UI reads as compact game HUD? | 1 | HUD is functional and game-like, but still a bit large and panel-heavy. |
| Screenshot makes someone want to play? | 2 | It is much more game-like and inviting than the 3D prototype; first slice is playable and clear. |

Total: **11 / 12**

Pass level: **ship_candidate_first_slice**

## Weakest next target

Reduce HUD footprint and improve moment-to-moment game feel: tighter bottom control overlay, stronger attack animation, enemy knockback/readable death, and more polished hero sprite proportions. Do not reintroduce copyrighted MapleStory assets or names.
