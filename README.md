# Puppy Frontier RTS

Puppy Frontier RTS is a playable 3D isometric RTS first slice, replacing the previous Orbit Bloom focus-app direction. Cute low-poly puppies gather gold and wood, build a war economy, and destroy the raccoon raider camp across the river.

## Product concept

A browser RTS prototype, not a landing page: a Three.js isometric battlefield with a player base, worker puppies, gold crystals, a forest, a raccoon enemy camp, waves of raiders, and a compact game HUD with a minimap.

## Current slice

- Vite + React + TypeScript + Zustand + Three.js + Lucide icons.
- Deterministic simulation (`src/game/simulation.ts`) separated from the renderer.
- Left-click select, right-click smart command: move / gather / attack, with selection rings, HP bars, and a command marker in the 3D scene.
- Economy: workers gather gold/wood, deposit at base, resource counters in the HUD.
- Build & production: barracks and defense tower placement, soldier training with costs and disabled-state feedback.
- Combat: enemy waves assault the base, towers auto-fire, win by destroying the raccoon camp, lose if the base falls.
- HUD: top resource bar, objective log, selection panel, build/train commands, tactical minimap, WASD/arrow camera pan.
- Smoke markers: `data-ui-pass="puppy-frontier-rts"`, `canvas[data-game-canvas="rts-three"]`, and `window.__rtsSmoke` command helpers.

## Run

```bash
npm install
npm run verify   # harness gate + tests + typecheck + build
npm run dev
```

Open the dev server URL: within three seconds the screen should read as an isometric RTS. Select a worker (left-click), right-click a gold crystal, and watch the gold counter climb.

## Harness

This project keeps the contract-first game/project harness:

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

The harness loop is: contract → generator → handoff → evaluator → visual QA → feedback → next round or human approval.

## Previous directions

- The Orbit Bloom focus-app state was preserved with the git tag `pre-rts-rebuild-20260709-203351` before this rebuild.
- The earlier 2D side-scrolling RPG state remains under `pre-orbit-bloom-rebuild-20260625-163721`.
