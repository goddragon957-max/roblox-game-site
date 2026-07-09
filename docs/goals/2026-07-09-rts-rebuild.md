# Goal: Replace current game with a playable 3D RTS prototype

## Operator decision

The user explicitly approved abandoning/deleting the current Orbit Bloom game-like app and rebuilding the canonical repo as a different game: **an RTS genre game**.

Canonical repo: `/home/sy/projects/roblox-game-site`

Safety backup already created before this destructive pivot:

```txt
pre-rts-rebuild-20260709-203351
```

Do not push to GitHub. Make a local commit only after verification passes.

## Product target

Build a playable browser RTS first slice, not a landing page and not a static showcase.

Working title suggestion: **Puppy Frontier RTS** or another original cute low-poly RTS name.

The first 3 seconds should clearly read as:

```txt
3D isometric RTS: base, workers, resources, units, enemy camp, HUD, minimap, selection rings.
```

Use the existing stack where sensible:

- Vite + React + TypeScript
- Zustand for game state
- Three.js for the isometric battlefield
- Lucide icons for HUD
- CSS/Tailwind-style local design
- StyleSeed judgment for compact game HUD, not dashboard slabs

## Required gameplay loop

Minimum satisfying RTS slice:

1. **3D battlefield**
   - Three.js WebGL scene with orthographic/isometric camera.
   - Procedural low-poly terrain with at least grass, forest/resource area, water/river or cliffs/path variation.
   - Visible player base, enemy camp, gold mine/crystal, trees/wood resource.
   - Shadows/lights and readable low-poly units/buildings.

2. **Player control**
   - Left-click select units/buildings.
   - Right-click ground to move selected unit(s).
   - Right-click resource with worker selected to gather.
   - Right-click enemy with combat unit selected to attack.
   - Selection rings and HP bars must appear in the 3D scene.

3. **Economy**
   - Resource counters: gold and wood.
   - At least two workers start near base.
   - Workers gather gold/wood and return resources to base over time.
   - Resource changes must be observable in HUD and in `window.__rtsSmoke.getState()`.

4. **Build/production**
   - Build at least one production building (Barracks/Workshop) and one defense tower OR build buttons that place them near base.
   - Produce at least one combat unit from the production building.
   - Costs must subtract resources; disabled/feedback when not enough resources.

5. **Combat/enemy pressure**
   - Enemy camp periodically spawns attackers or sends a small wave.
   - Units have HP, damage, range/cooldown, death/removal.
   - Win condition: destroy enemy camp.
   - Loss condition: player base destroyed.

6. **RTS HUD**
   - Compact overlay, not a SaaS dashboard.
   - Top resource bar, selection panel, build/produce buttons, objective log, wave timer/status.
   - Minimap or tactical radar in a corner.
   - Keyboard/camera pan affordance (WASD/arrow) and mouse interaction hints.

7. **Smoke-test hooks**
   - App root marker: `data-ui-pass="puppy-frontier-rts"` (or chosen title but keep this exact marker if possible).
   - Three canvas marker: `data-game-canvas="rts-three"`.
   - Expose a small non-secret smoke object on window:
     ```ts
     window.__rtsSmoke = {
       getState: useGameStore.getState,
       setState: useGameStore.setState,
       command: { ...optional safe command helpers... }
     }
     ```

## Files to rewrite/update

Because this is a destructive product pivot, remove stale Orbit Bloom/focus app direction from active source/docs.

Rewrite/update at minimum:

- `README.md`
- `AGENT.md`
- `CODEX_GOAL.md` (or replace with current RTS work order)
- `VERIFY.md`
- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/pipeline-log.md`
- `docs/harness/handoff/round-3-gen.md` (write what you changed and verification results)
- `src/App.tsx`
- `src/styles.css`
- `src/store/gameStore.ts`
- new/updated simulation files under `src/game/`
- new/updated renderer under `src/render/`
- tests under `src/game/__tests__/`
- verification scripts if needed

Remove or stop referencing stale Orbit Bloom names, markers, focus sessions, planet birth, galaxy lists, and old `window.__orbitBloomScene` smoke hooks from active app/source/docs.

## Suggested implementation shape

Keep simulation separate from renderer:

```txt
src/game/types.ts
src/game/simulation.ts
src/game/__tests__/simulation.test.ts
src/store/gameStore.ts
src/render/ThreeRtsScene.tsx
src/components/RtsHud.tsx
src/App.tsx
```

Simulation should support deterministic tests for:

- selecting worker / command move
- worker gathering gold or wood and depositing at base
- building or producing unit subtracts resources and changes state
- combat reduces HP and can destroy enemy camp / trigger win
- enemy wave can damage player base / trigger loss if base HP reaches 0

## Verification required before local commit

Run all deterministic gates:

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
npm run verify
```

If scripts change, keep `npm run verify` as the combined gate.

Then run a browser smoke on a strict port:

```bash
npx vite preview --host 0.0.0.0 --port 4199 --strictPort
```

Browser smoke must verify:

- `data-ui-pass="puppy-frontier-rts"` exists.
- `canvas[data-game-canvas="rts-three"]` exists and has non-zero size.
- `window.__rtsSmoke.getState()` is available.
- Selecting a worker changes selected entity state.
- Move/gather/produce/build or a safe smoke command changes resources/units/buildings.
- Combat or attack command reduces HP on an enemy/enemy camp.
- Console fatal JS errors are zero.
- Visual screenshot shows 3D isometric battlefield with base/workers/resources/enemy/HUD/minimap; do not pass a blank scene or dashboard-like page.

## Commit policy

If and only if verification passes:

```bash
git status --short
git add <intended files>
git commit -m "feat: rebuild as playable RTS prototype"
```

Do **not** push.

## What to report

In your final output, include:

- backup tag used;
- high-level files changed;
- commands run with pass/fail;
- browser smoke evidence;
- local commit SHA if created;
- any known limitations or next round recommendations.
