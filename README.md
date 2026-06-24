# Moonleaf Trail

Original 2D side-scrolling action RPG prototype built with Vite, React, TypeScript, Zustand, and Pixi.js.

The first playable slice is a side-view forest village/field: a cute readable hero, platforms and terrain, three original enemies, WASD/arrow movement, jump, attack, hit sparks, damage numbers, HP/MP/EXP/level HUD, quest progress, coins/pickups, win feedback, and death/respawn.

## Run

```bash
npm install
npm run dev
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

## Controls

- A/D or Left/Right: move
- W, Up, or Space: jump
- J, K, or X: attack
- Start Adventure button or any movement key begins play

## Visual Direction

Moonleaf Trail is inspired by the readable feel of classic Korean side-scrolling MMORPGs, but all names, characters, enemies, stage art, UI, and assets are original. Do not copy MapleStory assets, names, maps, mobs, UI, silhouettes, or copyrighted designs.

The first three seconds must show the genre, hero, enemy, side-scrolling stage, compact game HUD, and screenshot appeal. The HUD follows StyleSeed as a compact game overlay with one leaf/gold accent system, not dashboard slabs.

## Verification

Run the static gates before handoff:

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

For visible changes, also browser-smoke `vite preview`: verify the canvas marker exists, keyboard or Start changes state, attack damages an enemy, and console errors are zero.
