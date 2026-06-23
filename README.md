# Puppy Guard: Crystal Siege

<!-- styleseed-default-ui:start -->
## StyleSeed UI Standard

This project uses [StyleSeed](https://github.com/bitjaru/styleseed) as the default UI/design-judgment layer for future UI work.
Agents and contributors should read https://styleseed-demo.vercel.app/llms.txt before changing UI and apply StyleSeed rules to pages, components, dashboards, mobile screens, HUDs, UI states, and motion details.

Core expectations:
- one coherent accent/radius/shadow/spacing/icon system;
- semantic tokens instead of random hardcoded colors;
- content inside cards/surfaces with clear hierarchy;
- real loading/empty/error/success states and wired interactions;
- no generic StyleSeed/library showcase left in place of product-specific UI.
<!-- styleseed-default-ui:end -->

Playable browser 3D toy-island tower-defense vertical slice. The current visual direction is a bright Roblox-inspired floating island with puppy guards, blob enemies, wooden pup towers, traps, frost runes, and a glowing crystal core.

Visual target/reference:

```txt
docs/visual-targets/blockhold-rebuild-reference.png
```

## Run

```bash
npm install
npm run dev
npm run generate:assets
npm run verify:visual
npm run test
npm run build
```

## Visual QA Gate

Visual/game-art changes must pass `VERIFY.md`, not only build/lint. The first-screen and raid-state screenshots are scored against six criteria: genre readability, character readability, enemy readability, board/stage readability, game-HUD readability, and screenshot desirability. Any `0` is a hard fail and the next iteration must target the weakest criterion.

## Controls

- Left click: place selected block
- Right click: remove block in build phase
- 1: select wall
- 2: select spike trap
- Start Raid: begin enemy wave
- Space: pause during raid
- R: reset camera

## MVP Mechanics

Build during the day, start the raid, watch cute blob enemies path toward the crystal core, use walls to redirect, spikes to burst damage, pup towers to shoot, and frost runes to slow. Survive to advance to the next day; lose if core HP reaches zero.

## UI Source Reference

`https://21st.dev/community/components` is an approved reference/source for future interface improvements. Use it for React + Tailwind component ideas such as buttons, cards, badges, dialogs, tabs, toasts, sliders, animated numbers, HUD panels, reward/shop overlays, and onboarding/help surfaces.

When adopting anything from 21st.dev, adapt it to Blockhold Defense gameplay instead of leaving generic demos: show day/raid state, wave rewards, core HP, tower upgrades, enemy stats, build controls, logs, and clear win/lose feedback.
