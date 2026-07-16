# Planet Forge Prototype

Planet Forge is a branch prototype spun out from the Puppy Frontier RTS repo. It explores the user's revived planet-making direction as a playable 3D browser toy/game: hand-shape a small planet, seed oceans/forests/crystals/settlements, and defend the surface from meteor events.

Branch: `planet-forge-prototype`

## Product concept

A fullscreen Three.js planet sandbox, not a landing page: the player clicks the rotating planet surface to paint biomes and build a tiny living world. The loop should be instantly visible:

```text
paint surface → resources change → planet becomes more alive → meteor warning appears → shield the impact zone
```

## Current slice

- Vite + React + TypeScript + Three.js.
- Pure deterministic planet state in `src/planet/planetSim.ts` with Vitest coverage.
- Three.js fullscreen planet renderer in `src/planet/PlanetForgeApp.tsx`.
- Tools: water, forest, crystal, settlement, shield.
- Controls: click or drag across surface patches to paint; right-drag or drag empty space to rotate the planet.
- Real resources: energy, water, biomass, minerals, population, stability, shield.
- Real threat loop: timed meteor event with impact marker; shield blocks it and leaves collectible star debris, ignoring it burns a crater into the target cell.
- Living weather/milestone system: `planetWeather(state)` derives cloud cover, aurora strength, and storm intensity from biome mix, craters, and stability; a stored `phase` (`dormant` → `breathing` → `blooming`, or `shielded` once 4+ cells are protected) drives a visible aurora ring + cloud shell in the 3D scene and a compact HUD phase chip that flashes on transition.
- Living-surface feedback: `planetLifeSignal(state)` turns habitability and living/protected cells into orbiting life motes, while brush streaks escalate through compact combo chips (`연속 손길`/`리듬 콤보`/`메가 콤보`).
- Meteor spectacle/progression: active meteors gain a hotter trail and pulsing impact beacon; resolved impacts leave a short shield/crater flash, and 8+ protected cells unlock a glowing 수호자 위성망 with a one-time resource bonus.
- Objective loop + win beat: a compact rotating goal chip (`숲 6개 만들기` → `방어막 5개 완성` → `운석 1회 막기` → `거주 가능성 60% 달성`, then loops) tracks live progress against planet totals. Completing a goal grants a resource bonus, pops a gold trophy banner, and triggers an expanding golden shockwave ring around the planet, then advances to the next goal without ending the sandbox.
- Crater restoration reward: repainting an ignored meteor crater with water or forest records one deterministic recovery, grants a bounded stability/biomass/water bonus, shows a compact recovery chip, and emits an emerald world-space regrowth ring; `getRestoration()` exposes activation, persistent count, cell, and tool for smoke tests.
- Smoke markers: `data-ui-pass="planet-forge-prototype"`, `canvas[data-game-canvas="planet-three"]`, and `window.__planetForgeSmoke` command helpers (`getWeather()` exposes the live weather readout; `getLifeSignal()` exposes the life-mote signal; `getGuardian()` exposes the guardian unlock signal; `getObjective()` exposes the current objective/progress/completion state).

## Run

```bash
npm install
npm run verify
npm run dev
```

Open the dev server URL. The first screen should read as a polished space/planet sandbox: dark galaxy, central living planet, compact glass HUD, tool palette, meteor warning panel, and clickable surface patches.

## Branch notes

- `main` still preserves the Puppy Frontier RTS direction.
- The pre-RTS Orbit Bloom focus-app state remains available at tag `pre-rts-rebuild-20260709-203351`.
- This branch is a new planet-making prototype line, not a direct restore of the old focus timer.
