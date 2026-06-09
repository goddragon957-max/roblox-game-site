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

0. Current user critique to address first: "이게 게임이냐, 캐릭터/디자인/화면이 이상하다." Stop adding mechanics until the screen looks intentional and game-like. First improve character readability, camera/composition, HUD, tiles, lane/path visibility, selected/build states, and basic game feel.
1. Make gameplay easier to understand visually:
   - replace ugly placeholder cube characters with readable Roblox/voxel-style silhouettes or use a 2D/isometric board if that looks better,
   - clear lanes/path preview,
   - build tiles/highlight selected block,
   - enemy HP readability,
   - obvious win/lose state,
   - cleaner camera angle and board framing.
2. Upgrade the UI/design system before adding complexity:
   - use shadcn/ui-style components and 21st.dev component references for panels, buttons, badges, dialogs, reward/shop panels, tabs, toasts,
   - consider a Linear/Vercel-style dark tactical HUD: restrained surfaces, crisp typography, not glassy AI slop,
   - keep UI compact and readable like a game overlay, not a SaaS landing page.
3. Add satisfying tower-defense progression only after the screen is acceptable:
   - per-day reward choices or shop,
   - upgrades for tower/trap/wall/frost,
   - increasing waves with enemy mix.
4. Improve moment-to-moment fun:
   - faster feedback on hits/kills,
   - projectiles or attack flashes,
   - better wave pacing,
   - simple score/star rating.
5. Improve reliability and UX:
   - responsive controls,
   - keyboard shortcuts,
   - mobile-friendly basic actions,
   - no console errors.
6. Keep scope simple. Avoid large rewrites, multiplayer, accounts, backend, or overly complex AI.

## UI Component Reference

Use `https://21st.dev/community/components` as an approved UI source/reference when improving HUD, menus, onboarding overlays, reward/shop panels, buttons, cards, inputs, dialogs, tabs, tables, badges, toasts, and other interface pieces.

Guidelines:

- Prefer components that fit the existing stack: React + TypeScript + Tailwind CSS + shadcn/ui-style patterns.
- Use 21st.dev as source inspiration and code reference, but adapt every component to Blockhold Siege's actual game context.
- Do not leave generic copied demos in the app. Replace placeholder examples with game-specific content such as day/raid state, core HP, wave rewards, tower upgrades, enemy stats, build palette controls, logs, and win/lose feedback.
- Keep the visual language readable and game-like: dark tactical panels, strong selected states, clear hover/disabled states, compact HUD density, and fast feedback animations.
- When using animated/community components, verify they do not hurt gameplay clarity, performance, or mobile/basic controls.
- Good 21st.dev categories to inspect first: `Buttons`, `Cards`, `Badges`, `Dialogs / Modals`, `Tabs`, `Toasts`, `Sliders`, `Number`, `Animation`, `Heroes`, `Features`, and `AI Chats` only if a future assistant/tutorial panel is added.

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
