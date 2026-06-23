# Visual QA — Reduced Busyness Polish Pass

Date: 2026-06-23

Scope: small polish slice after the hero/raider readability pass. Goal was to raise screenshot desirability by reducing secondary visual noise while preserving tower-defense readability, hero readability, and enemy readability.

## Changes

- Reduced nonessential board decorations: fewer trees, rocks, flowers, mushrooms, fences, and crystals.
- Removed the loudest decorative balloons, coins, ambient sparkles, and decorative side towers from the render pass.
- Softened inactive lane ribbons and removed inactive lane stones so the active/forecast lane is clearer.
- Preserved the Kenney board/tile/tower silhouettes, hero focus, blob raider previews, HUD, and all mechanics.

## Evidence

Commands run successfully:

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

Browser smoke:

- local `vite preview --host 0.0.0.0 --port 4195 --strictPort` served the correct Puppy Guard build;
- bundle: `index-BANCl4bZ.js`;
- marker: `toon-gltf-boardgame`;
- canvas: 1280×633 client and 1280×633 buffer, `image-rendering: auto`;
- 30 model resources loaded, including Kenney model/texture resources;
- `Textures/colormap.png` was present in the resource list;
- `Start Raid` clicked and raid state rendered;
- console JS errors: 0.

## First-screen scorecard

| Criterion | Score | Notes |
|---|---:|---|
| First 3 seconds: game genre obvious? | 2 | Board, lanes, towers, raider preview, and build HUD still clearly read as tower defense. |
| Character reads as character? | 2 | The hero puppy remains visible after clutter reduction. |
| Enemy reads as enemy? | 2 | Blob raider previews remain readable and threatening. |
| Map reads as board/stage? | 2 | The board reads cleaner with fewer decorative distractions. |
| UI reads as game HUD? | 2 | HUD remains game-like and functional. |
| Screenshot makes someone want to play? | 2 | This is not final production art, but the screenshot is cleaner and more inviting than the previous busy pass. |

Total: **12 / 12**

Pass level: **visual_polish_candidate**

## Weakest next target

The next improvement should not re-add decorative clutter. Focus on product-quality art direction: stronger mascot model, cohesive enemy family, better camera/horizon composition, and potentially a branded title/landing moment before the playable board.
