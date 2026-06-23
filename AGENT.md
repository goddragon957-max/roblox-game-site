# Puppy Guard: Crystal Siege Autonomous Build Brief

<!-- styleseed-default-ui:start -->
## StyleSeed UI Standard

StyleSeed is the default design judgment layer for this project.
Before building or changing UI, read https://styleseed-demo.vercel.app/llms.txt and apply StyleSeed rules to every page, component, dashboard, mobile screen, game HUD, empty/loading/error/success state, and motion detail.

Golden rules to enforce:
- Keep content inside cards/surfaces, not bare page backgrounds.
- Use one accent color/brand token; everything else should be grayscale/system tokens.
- Avoid pure black and hardcoded hex in components; use semantic Tailwind/CSS tokens.
- Keep one coherent system for radius, spacing, shadows, icons, and accent usage.
- Use clear typography hierarchy; large numbers need smaller units with the right ratio.
- Build real UI states and feedback; do not leave static mockups or generic library demos.
- Touch targets should be at least 44×44px.
- Pick one StyleSeed skin/aesthetic per project and keep it coherent (Toss for Korean/consumer/mobile, Linear for tools/agent consoles, Stripe for SaaS/commerce analytics, Vercel for dev platforms, Notion for docs/workspaces).
- After generating a page, review it against StyleSeed rules or run `/ss-review` / `/ss-score` if those skills are available.
<!-- styleseed-default-ui:end -->

## Product Direction

Keep the existing tower-defense mechanics, but treat the current visuals as **not user-validated** until they pass `VERIFY.md`.

- Reference feel target: cute Roblox/Bloons-style tower-defense readability + authored board-game stage + satisfying hit/coin feedback.
- Core loop: build phase -> place defenses -> raid phase -> survive -> rewards/upgrades -> next day.
- User strongly rejected dark dashboards, low-res pixelation, cheap procedural art, and assistant-improvised design.
- Do not rely on taste claims like “looks better.” Every visual iteration must pass the first-3-seconds scorecard in `VERIFY.md`.
- User prefers fewer questions and autonomous progress. Make reasonable product decisions, but use references/assets/verification rather than improvising art direction.

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

0. Visual QA gate first:
   - read `VERIFY.md` before every visual/game-art change,
   - score the first screen and raid-state screenshots against the six first-3-seconds criteria,
   - if any score is `0`, do not ship; pick the weakest criterion as the next iteration,
   - prefer reference-matched licensed assets and authored composition over procedural decoration.
1. Improve character/game feel first:
   - make puppy defenders and blob enemies larger, more animated, and more readable,
   - add projectiles, hit flashes, trap pops, frost effects, coin pops,
   - keep the board dominant and avoid panels hiding the action,
   - clear lanes/path preview,
   - build tiles/highlight selected block,
   - enemy HP readability,
   - obvious win/lose state.
2. Upgrade the UI/design system before adding complexity:
   - use shadcn/ui-style components and 21st.dev component references for panels, buttons, badges, dialogs, reward/shop panels, tabs, toasts,
   - keep the current bright toy-game HUD: compact, rounded, warm, readable, not a SaaS/dashboard surface,
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
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

For visible changes, run a local dev server and browser-smoke the app when feasible:

- confirm the new UI marker appears,
- click Start Raid,
- verify phase changes to raid/pause UI,
- check browser console for JS errors,
- score the first-screen and raid-state screenshots using `VERIFY.md`; any `0` means the visual pass failed and must iterate again.

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

/go Maintain the tower-defense mechanics, but do not trust the current visuals as accepted. Read `VERIFY.md` and `docs/agents/visual-qa-agent.md` before changing UI/art. Improve one small, verified, shippable slice that raises the first-3-seconds visual QA score: genre readability, character readability, enemy readability, board/stage readability, game-HUD readability, and screenshot desirability. Prefer reference-matched licensed assets/authored composition over procedural decoration. Run `npm run generate:assets`, `npm run verify:visual`, `npm run test`, `npm run lint`, and `npm run build`. If visual, smoke test locally, click Start Raid, inspect screenshots, and report the scorecard. Commit and push only after the visual gate has no zero scores. Do not ask the user for product decisions; choose sensible defaults. Avoid destructive rewrites and avoid overcomplicating the game.
