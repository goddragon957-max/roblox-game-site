# Visual QA — Hero Readability Pass

Date: 2026-06-23

Scope: follow-up visual recovery slice after the Kenney asset pass. Goal was not to add more props, but to improve first-screen character readability, enemy threat readability, and screenshot appeal.

## Changes

- Tightened camera framing slightly without returning to low-resolution rendering.
- Removed competing decorative puppy clutter.
- Kept one large staged hero puppy on a readable spotlight/banner position instead of several small mascots.
- Made custom blob GLBs the primary raider/enemy rendering path, with HP bars and danger rings.
- Swapped build-phase threat preview from UFO-first to blob-first while keeping Kenney UFO fallback.
- Reduced curved lane ribbon thickness/count after screenshot QA showed yellow path ribbons were overpowering the board.

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

- local `vite preview --host 0.0.0.0 --port 4191 --strictPort` served the correct Puppy Guard build;
- marker: `toon-gltf-boardgame`;
- bundle: `index-DfXjyKIr.js`;
- canvas: 1280×633 client and 1280×633 buffer, `image-rendering: auto`;
- 30 model resources loaded, including Kenney model/texture resources;
- `Textures/colormap.png` was present in the resource list;
- `Start Raid` clicked and raid state rendered;
- console JS errors: 0.

## First-screen scorecard

| Criterion | Score | Notes |
|---|---:|---|
| First 3 seconds: game genre obvious? | 2 | Tower-defense board, lanes, towers, raider preview, and build controls are clear. |
| Character reads as character? | 2 | The staged hero puppy is larger and less hidden than the previous pass. Still not final mascot quality, but no longer lost in clutter. |
| Enemy reads as enemy? | 2 | Blob GLBs and danger rings read more clearly than the UFO-only preview. |
| Map reads as board/stage? | 2 | Authored tiles and reduced path ribbons keep the board readable. |
| UI reads as game HUD? | 2 | HUD and build palette still read as game controls. |
| Screenshot makes someone want to play? | 1 | Improved, but still visually busy and not yet polished/marketable. |

Total: **11 / 12**

Pass level: **ship_candidate_increment**

## Weakest next target

The next slice should improve overall composition/polish rather than adding more assets: reduce visual busyness, refine color hierarchy, and make the mascot/enemy silhouettes charming enough for a marketing screenshot.
