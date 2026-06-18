# Blockhold Defense

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

Playable browser 3D voxel tower-defense vertical slice.

## Run

```bash
npm install
npm run dev
npm run test
npm run build
```

## Controls

- Left click: place selected block
- Right click: remove block in build phase
- 1: select wall
- 2: select spike trap
- Start Raid: begin enemy wave
- Space: pause during raid
- R: reset camera

## MVP Mechanics

Build during the day, start the night raid, watch raiders path to the core, use walls to redirect/breach and traps to damage. Survive to advance to the next day; lose if core HP reaches zero.

## UI Source Reference

`https://21st.dev/community/components` is an approved reference/source for future interface improvements. Use it for React + Tailwind component ideas such as buttons, cards, badges, dialogs, tabs, toasts, sliders, animated numbers, HUD panels, reward/shop overlays, and onboarding/help surfaces.

When adopting anything from 21st.dev, adapt it to Blockhold Defense gameplay instead of leaving generic demos: show day/raid state, wave rewards, core HP, tower upgrades, enemy stats, build controls, logs, and clear win/lose feedback.
