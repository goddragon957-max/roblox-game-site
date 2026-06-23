# Toon GLTF Asset Pass

This pass replaces the low-resolution arcade treatment with crisp Babylon GLB assets and a curved board-game path.

## Asset Pipeline

Blender was not available in this environment, so the repo uses the required fallback path:

```bash
npm run generate:assets
```

The generator is `scripts/generate-gltf-assets.mjs`. It writes real binary GLB files into `public/assets/models/`:

- `puppy_guard.glb`
- `blob_grunt.glb`
- `blob_runner.glb`
- `blob_brute.glb`
- `pup_tower.glb`
- `crystal_core.glb`

The GLBs are original procedural toon assets made from multiple meshes and materials. They use chibi proportions, separate eyes/highlights/helmets/scarves/shields/horns/brush patches, and rough non-metal PBR colors so Babylon can load and shade them consistently.

## Runtime Integration

`src/render/BlockholdScene.tsx` imports `@babylonjs/loaders/glTF` and loads the assets once from `/assets/models/*.glb` with `SceneLoader.ImportMeshAsync`. Loaded templates are cloned into board positions for guards, towers, blobs, and the crystal core. The previous primitive drawing remains as a loading/failure fallback.

Imported meshes get Babylon edge rendering for toon outlines. Combat feedback adds bolt projectiles, hit bursts, kill coin pops, and core sparkle/pulse effects.

## Board Path

The simulation still uses grid cells for pathfinding and placement. The rendered lane no longer relies on dominant square path tiles. Instead, the board draws a thick curved golden tube with rounded stepping stones from each spawn lane to the crystal core. Pickable cells remain under the art layer so placement/removal interactions are unchanged.
