# Blockhold Defense

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
