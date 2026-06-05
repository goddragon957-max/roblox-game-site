# Blockhold Defense — Codex /GOAL Brief

## Product Direction

Build **Blockhold Defense** as a small, playable browser 3D tower-defense / voxel-fortress prototype.

Current deployed URL checked by Hermes: https://roblox-game-site.vercel.app/
Current state: Babylon.js scene + HUD only. It renders, but the game does not progress: no block placement, no raid start, no enemies, no win/loss loop.

The task is to turn this into a real playable vertical slice, not another static landing/demo page.

## One-line Pitch

A compact Minecraft/Roblox-inspired fortress defense game: during the day, place voxel blocks/traps around a glowing core; at night, raiders follow lanes, attack defenses, and try to destroy the core.

## Target Feel

- Quick session: 2–5 minutes.
- Immediately understandable: build → start raid → survive → upgrade next day.
- Toy-like voxel readability, not photorealism.
- “One more wave” loop.

## Recommended Stack

Use the user’s default web/app stack unless an existing scaffold strongly dictates otherwise:

- Vite
- React
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui-compatible primitives where useful
- Lucide Icons
- Babylon.js for the 3D scene
- Vitest for pure game-logic tests

Important architecture rule: keep pure game simulation separate from rendering so tests can verify placement, pathing, enemy movement, damage, phase transitions, and victory/loss without a browser.

## MVP Scope — Must Build Now

### 1. Game State / Core Loop

Implement a deterministic game state with:

- `day`: starts at 1
- `phase`: `build | raid | victory | defeat`
- `coreHp` / `maxCoreHp`
- resources:
  - wall blocks
  - trap blocks
  - optional lantern/slow block if time allows
- grid dimensions around 8x8 or 10x10
- placed blocks keyed by grid position
- raider list with position, hp, speed, target path index
- raid plan generated from day and defense strength

Loop:

1. Build phase: player places/removes blocks using limited resources.
2. Player presses **Start Raid**.
3. Raiders spawn at entry cells and move toward the core.
4. Walls block/redirect; if path is fully blocked, raiders attack nearest blocking wall or breach slowly.
5. Traps damage/slow raiders when crossed.
6. Raiders reaching core reduce HP.
7. If all raiders are dead or finished and core HP > 0: victory for the day, grant resources, advance to next build phase.
8. If core HP <= 0: defeat state with restart button.

### 2. Controls

Desktop controls:

- Left click grid cell: place selected block.
- Right click or Erase mode: remove eligible placed block and refund if reasonable.
- Number keys or UI buttons:
  - 1 Wall
  - 2 Spike Trap
  - 3 Gate or Lantern if implemented
- R: reset camera.
- Space: pause/unpause during raid only.
- Start Raid button in HUD.
- Restart button on defeat.

Do not rely on hidden keyboard-only controls. The UI must visibly tell the player what to do.

### 3. Visual Requirements

- Retain/improve the dark neon voxel fortress style from the deployed prototype.
- Show a grid floor.
- Show the core clearly in center.
- Render walls as chunky blocks.
- Render traps as red/orange low plates or spikes.
- Render raiders as small hostile colored cubes/capsules with readable movement.
- Add simple animation: core pulse, raider movement, trap flash, hit flash.
- HUD must show:
  - Day
  - Phase
  - Core HP
  - Remaining resources
  - Selected block
  - Raid status: enemies alive / total
  - Clear instructions

### 4. Pathing / Simulation

MVP pathing can be simple but must work:

- Use grid-based BFS/A* from raider spawn to core.
- Treat walls as blocked.
- Traps are passable and apply damage/slow.
- If no path exists, raiders should attack or damage a blocking wall rather than freezing forever.
- Movement can be discrete step-per-tick or interpolated; correctness matters more than visual smoothness.

### 5. Tests

Add Vitest tests for pure logic:

- placing a wall consumes wall resource and updates grid
- cannot place outside bounds
- cannot place on core
- cannot place when resource is 0
- trap damages raider when crossed
- BFS returns a path when open
- no-path case triggers wall attack/breach behavior, not a frozen raid
- victory when all raiders are resolved and core survives
- defeat when core HP reaches 0
- next day grants resources and increases raid pressure

### 6. Verification

Codex must run and report:

```bash
npm install
npm run test
npm run build
```

If a lint script exists, run it too. If no lint script exists, do not invent a failing requirement; mention it.

## Non-goals for This Pass

Do not build:

- multiplayer
- login/accounts
- Roblox integration
- server backend
- procedural infinite worlds
- save files/cloud persistence
- complex asset pipeline
- mobile-perfect controls
- payment/monetization
- large open-world Minecraft clone

Keep it a playable vertical slice.

## Suggested File Structure

If creating from scratch:

```txt
package.json
index.html
src/
  main.tsx
  App.tsx
  styles.css
  game/
    types.ts
    constants.ts
    grid.ts
    pathfinding.ts
    simulation.ts
    createInitialState.ts
    selectors.ts
    __tests__/
      simulation.test.ts
      pathfinding.test.ts
  store/
    gameStore.ts
  render/
    BlockholdScene.tsx
    babylonMaterials.ts
    gridPicking.ts
  components/
    Hud.tsx
    BuildPalette.tsx
    GameOverlay.tsx
  lib/
    utils.ts
README.md
```

If adapting existing files, keep equivalent separation between `game/`, `store/`, `render/`, and `components/`.

## UX Acceptance Criteria

A first-time player should be able to:

1. Open the app.
2. Understand it is Day 1 Build Phase.
3. Place at least one wall/trap using visible controls.
4. Press Start Raid.
5. Watch at least 5 raiders move toward the core.
6. See traps/walls affect the raiders.
7. Either win Day 1 and advance to Day 2, or lose and restart.

## Quality Bar

- Do not leave a static-only scene.
- Do not fake progress with only text changes.
- Do not hard-code a single animation that always wins.
- The game must have real state transitions and visible player agency.
- Prefer simple but complete mechanics over many incomplete mechanics.
- Keep code readable and testable.

## Exact Codex `/goal` Prompt

/goal Build Blockhold Defense into a playable browser 3D tower-defense vertical slice. Use Vite + React + TypeScript + Zustand + Tailwind + Babylon.js + Vitest. The existing deployed reference is https://roblox-game-site.vercel.app/ but it is only a static Babylon scene; create or adapt a local app so the game actually progresses. Implement the core loop: build phase with visible UI and grid placement, Start Raid button, raiders spawning and pathing toward the core, wall/trap interactions, core HP damage, victory advancing to next day, defeat/restart. Keep pure game logic separate from Babylon rendering and add Vitest tests for placement, pathfinding, trap damage, no-path breach behavior, victory/defeat, and next-day scaling. Verify with npm install, npm run test, npm run build, and lint if available. Do not build multiplayer, backend, accounts, or a static landing page. Make the vertical slice playable and report exact commands run plus remaining limitations.
