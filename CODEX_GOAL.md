# CODEX GOAL — High Quality Toon GLTF Asset Pass

Repo: `/home/sy/projects/roblox-game-site`

Latest user feedback, acceptance-critical:

> “넌 눈이 없구나 해상도 너무 떨어져 구려보여 너무 구리다 Blender/GLTF 캐릭터 에셋, 손그림 스타일 텍스처, toon outline shader, projectile / hit / coin pop 애니메이션, 타일을 정사각 격자 말고 더 곡선형/보드게임형 path로 교체 이거 까지 해보자 go 모드로”

Interpretation:

The previous low-res arcade pass was wrong. It made the game look cheap. Do **not** pixelate or downscale the canvas. The goal now is a high-quality stylized 3D game-art pass:

- crisp/high-resolution rendering;
- actual GLTF/GLB game assets in the repo;
- hand-painted/toon material feel;
- toon outline shader/effect;
- projectile, hit, coin-pop animations;
- a curved board-game style path instead of square-grid visual tiles.

## Hard no-go list

- No pixelated/canvas downscaling. Remove/disable `engine.setHardwareScalingLevel(2.75)` and CSS `image-rendering: crisp-edges/pixelated` from the main WebGL canvas.
- No claiming GLTF assets without actual `.glb` or `.gltf` files committed under the project.
- No tiny primitive-only puppy/blob characters as the primary look.
- No square grid path as the visible dominant path. The simulation can still use grid cells internally, but the rendered path should look like a smooth board-game ribbon.
- No giant HUD/dashboard panels hiding the board.
- No committing or pushing; Hermes will verify and ship.

## Tooling constraints

Check whether `blender` is available. If Blender is available, use a headless Blender Python script to generate/export GLB assets.

If Blender is NOT available, do **not** stop. Create a local asset-generation script that directly writes GLB files using Node or Python. The output must still be real `.glb` files loaded by Babylon. Procedural GLB generation is acceptable if it produces stylized chibi assets with multiple meshes/materials.

## Required files / assets

Create a durable asset pipeline, for example:

- `scripts/generate-gltf-assets.mjs` or `scripts/generate_gltf_assets.py`
- `public/assets/models/puppy_guard.glb`
- `public/assets/models/blob_grunt.glb`
- `public/assets/models/blob_runner.glb`
- `public/assets/models/blob_brute.glb`
- `public/assets/models/pup_tower.glb`
- `public/assets/models/crystal_core.glb`
- optional texture files under `public/assets/textures/`
- a short `docs/visual-targets/toon-gltf-asset-pass.md` documenting the asset approach and how to regenerate

The assets should be original and simple but visibly more game-like than raw scene primitives:

- Puppy: chibi head/body, big eyes, ears, helmet/scarf/shield, cute silhouette.
- Blobs: rounded pastel slime bodies, eyes, mouth/shine/horns; separate color variants for grunt/runner/brute.
- Tower: chunky wooden puppy tower with large bolt cannon/flag.
- Core: large heart/crystal shrine.

## Babylon integration

Install/load any required Babylon loader dependency if missing, likely:

```bash
npm install @babylonjs/loaders
```

Then in `src/render/BlockholdScene.tsx` or a helper module:

- import `@babylonjs/loaders/glTF`;
- load GLB assets once with `SceneLoader.ImportMeshAsync` / `AssetsManager` or equivalent;
- clone/instance loaded asset roots into board positions;
- keep procedural fallback if loading fails, but the normal path must use GLB assets;
- add a visible loading-safe path so the scene does not crash before assets finish.

Add a smoke-testable marker such as:

```tsx
data-ui-pass="toon-gltf-boardgame"
```

## Rendering quality

- Restore high-resolution rendering; no low-res pixel scaling.
- Keep orthographic/isometric camera if it improves board readability, but make it crisp and polished.
- Add toon outline effect:
  - use Babylon edges renderer, mesh clone outline shell, HighlightLayer, or a small custom ShaderMaterial; choose the simplest stable approach;
  - outlines should be visible around characters/core/towers/blobs, not just terrain.
- Use flat/toon materials with high saturation and soft shadows.
- Add hand-painted texture feel via either generated texture files or Babylon DynamicTexture/canvas textures with brush/noise/pastel strokes. The result should look intentionally illustrated, not plain plastic.

## Curved board-game path

The internal simulation may remain grid-based. The visual path must change:

- render a smooth, thick, golden curved ribbon from spawn lanes to the crystal core;
- add rounded stepping stones / board-game dots along the curve;
- hide or de-emphasize visible square path tiles so the user no longer sees a boring square grid as the main path;
- build placement cells can remain subtly visible, but terrain should not scream “debug grid.”

## Animations/effects

Add visible game feedback:

- turret projectile/bolt animation from tower/guard to nearby raider or along lane when combat markers appear;
- hit flash/star burst on enemies;
- kill coin pop animation (coin/star rises and fades);
- core sparkle/pulse;
- raider idle/move bounce.

Use existing `combatMarkers` if possible and derive projectile visuals from marker/cell state. It is acceptable to create approximate arcade feedback if exact shooter-target mapping is not in state yet.

## HUD/control constraints

- Keep compact HUD from previous pass, but remove anything that makes it look low-res/cheap.
- Build controls can stay bottom overlay but should not hide the board.
- Preserve all interactions: Start Raid, Pause/Resume, Next Day, Restart, build selection, canvas place/remove, keyboard shortcuts.

## Verification required before finishing

Run:

```bash
npm run test
npm run lint
npm run build
```

Also run a local browser smoke when feasible:

- app marker is `toon-gltf-boardgame`;
- the main WebGL canvas is high-resolution, not pixel-upscaled;
- GLB assets are requested/loaded from `/assets/models/*.glb`;
- first screen shows chibi GLTF puppy/tower/core assets, toon outlines, and a curved golden path;
- Start Raid works;
- raid screen shows blob GLTF enemies, projectile/hit/coin-pop effects, and no console errors.

Report changed files and exact command results. Do not commit or push.
