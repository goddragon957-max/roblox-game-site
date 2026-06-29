# Orbit Bloom

Orbit Bloom is a new space-focus app prototype replacing the previous Moonleaf/Roblox game direction.

## Product concept

Focus time becomes gravity. When the user protects a focus session, a planet is born; repeated sessions grow a personal galaxy. The first slice is a polished mobile-style web prototype with a real Three.js scene and interactive focus state.

## Current slice

- Vite + React + TypeScript + Zustand + Three.js.
- Mobile app shell with dark cosmic StyleSeed-inspired UI.
- Saturn-like procedural planet, rings, starfield, comets, orbiting born planets, and animated energy glow.
- Focus progression state: start/pause, add focus burst, automatic birth completion, galaxy list growth.
- Browser state markers for smoke testing: `data-ui-pass="orbit-bloom-focus-app"` and `window.__orbitBloomScene`.

## Run

```bash
npm install
npm run test
npm run lint
npm run build
npm run dev
```

Open the dev server URL and verify the focus button increases progress, the plus button can birth a new planet, and the console has no JavaScript errors.

## Harness

This project now has a contract-first game/project harness:

```text
docs/harness/config.md
docs/harness/state.md
docs/harness/contract.md
docs/harness/handoff/
docs/harness/feedback/
docs/harness/gotchas/
docs/agents/
```

Run the harness gate:

```bash
npm run verify:harness
```

Run the full local verification gate:

```bash
npm run verify
```

The harness loop is: contract → generator → handoff → evaluator → visual QA → feedback → next round or human approval.

## Previous direction

The previous 2D side-scrolling RPG state was preserved with the git tag `pre-orbit-bloom-rebuild-20260625-163721` before this rebuild.
