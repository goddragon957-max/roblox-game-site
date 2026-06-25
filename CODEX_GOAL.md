# Codex Goal — Orbit Bloom

Rebuild this repo as **Orbit Bloom**, a premium space-focus app prototype.

## Goal

Create a polished interactive mobile web prototype where focus time births planets and grows a personal galaxy.

## Must-have behaviors

1. Start/pause focus session.
2. Progress increases while focusing.
3. Add/boost button increases progress and reward metrics.
4. When progress completes, a planet birth animation/state transition occurs.
5. Newly born planet appears in the user’s galaxy list and the Three.js scene.
6. No old Moonleaf/Roblox/Pixi/game code remains in active source.

## Visual target

- Dark cosmic mobile shell.
- Saturn-like procedural planet with rings.
- Stars, orbiting planets/moons, comet trails, energy glow.
- Premium Korean consumer app feel: calm, collectible, rewarding.

## Stack

Vite + React + TypeScript + Zustand + Three.js. Keep StyleSeed UI principles in all UI work.

## Verification

Run:

```bash
npm run test
npm run lint
npm run build
```

Then browser-smoke the app and verify `window.__orbitBloomScene` state changes after user interactions.
