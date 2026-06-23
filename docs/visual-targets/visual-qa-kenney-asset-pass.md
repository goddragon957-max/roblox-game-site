# Visual QA — Kenney Asset Pass

Date: 2026-06-23

Scope: first visual recovery slice after the user rejected the procedural/toon pass. This pass adds selected CC0 Kenney Tower Defense Kit GLB assets and a first-3-seconds verification gate.

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

- local `vite preview` loaded;
- marker: `toon-gltf-boardgame`;
- canvas: 1280×633 client and 1280×633 buffer, `image-rendering: auto`;
- model resources: 30 `/assets/models/*` resources, including 24 Kenney model/texture requests;
- Kenney GLB/texture resources fetched with HTTP 200;
- `Start Raid` clicked and raid state rendered;
- console JS errors: 0.

## First-screen scorecard

| Criterion | Score | Notes |
|---|---:|---|
| First 3 seconds: game genre obvious? | 2 | The authored tile board, lanes, towers, enemy preview, and build controls now read as tower defense. |
| Character reads as character? | 1 | A larger guard/hero is visible, but it is still not cute/expressive enough and can blend into the busy board. |
| Enemy reads as enemy? | 1 | UFO/raider silhouettes and black/red lane threats read as enemies, but the enemy style is not yet charming/coherent. |
| Map reads as board/stage? | 2 | Kenney tiles/towers/props make the map much more like an authored stage than a debug grid. |
| UI reads as game HUD? | 2 | HUD/build/raid panels read as game controls and no longer dominate like a dashboard. |
| Screenshot makes someone want to play? | 1 | It is a real improvement, but still cluttered and not yet attractive enough for a polished teaser. |

Total: **9 / 12**

Pass level: **minimum_pass**

## Weakest next target

Improve screenshot desirability and character charm. The next loop should not add more random objects; it should reduce clutter, pick a more coherent color/style target, and make the hero/enemy silhouettes more charming and readable.
