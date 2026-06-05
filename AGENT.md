# Blockhold Siege Autonomous Build Brief

## Product Direction

Keep the existing tower-defense direction. The game should become a simple, readable Roblox-style voxel tower defense:

- Reference feel: Roblox Tower Defense Simulator + Bloons TD lane pressure + Orcs Must Die trap killzones.
- Core loop: build phase -> place defenses -> raid phase -> survive -> rewards/upgrades -> next day.
- User prefers fewer questions and autonomous progress. Make reasonable product decisions and keep shipping verified increments.

## Current Repo

- Path: `/home/sy/projects/roblox-game-site`
- Live URL: `https://roblox-game-site.vercel.app/`
- Stack: Vite + React + TypeScript + Zustand + Tailwind CSS + Babylon.js + Lucide Icons
- Main files:
  - `src/game/simulation.ts` game loop
  - `src/game/types.ts` state types
  - `src/render/BlockholdScene.tsx` Babylon scene
  - `src/components/Hud.tsx` HUD
  - `src/components/BuildPalette.tsx` build controls
  - `src/styles.css` UI
  - `src/game/__tests__/simulation.test.ts` simulation tests

## Autonomous 24h Goal

Improve the game in small verified slices. Do not ask the user for decisions unless blocked by credentials or destructive operations.

Prioritized roadmap:

1. Make gameplay easier to understand visually:
   - clear lanes/path preview,
   - build tiles/highlight selected block,
   - enemy HP readability,
   - obvious win/lose state.
2. Add satisfying tower-defense progression:
   - per-day reward choices or shop,
   - upgrades for tower/trap/wall/frost,
   - increasing waves with enemy mix.
3. Improve moment-to-moment fun:
   - faster feedback on hits/kills,
   - projectiles or attack flashes,
   - better wave pacing,
   - simple score/star rating.
4. Improve reliability and UX:
   - responsive controls,
   - keyboard shortcuts,
   - mobile-friendly basic actions,
   - no console errors.
5. Keep scope simple. Avoid large rewrites, multiplayer, accounts, backend, or overly complex AI.

## Required Verification Per Slice

Before committing/pushing:

```bash
npm run test
npm run lint
npm run build
```

For visible changes, run a local dev server and browser-smoke the app when feasible:

- confirm the new UI marker appears,
- click Start Raid,
- verify phase changes to raid/pause UI,
- check browser console for JS errors.

After push, verify Vercel with a cache-busting URL:

```txt
https://roblox-game-site.vercel.app/?v=<commit-or-run-marker>
```

## Git Rules

- Work on `main` unless there is a strong reason not to.
- Keep commits small and descriptive.
- Do not commit `node_modules/`, `dist/`, `.vercel/`, `.hermes/`, or unrelated generated files.
- If a run finds uncommitted user/agent changes, inspect before overwriting.

## Codex /goal Prompt

/go Maintain the Blockhold Siege tower-defense direction and improve it autonomously in one small, verified, shippable slice. Use the roadmap in AGENT.md. Prefer the highest-impact missing item visible in the current code. Implement the slice, update tests where appropriate, run `npm run test`, `npm run lint`, and `npm run build`. If visual, smoke test locally if tooling allows. Commit and push to main with a clear message. Do not ask the user for product decisions; choose sensible defaults. Avoid destructive rewrites and avoid overcomplicating the game.
