# Kenney Tower Defense Kit Asset Slice

This visual recovery slice uses selected authored GLB assets from Kenney Tower Defense Kit to make the first screen read as a tower-defense board/stage instead of procedural placeholder art.

Source: https://kenney.nl/media/pages/assets/tower-defense-kit/a402493eaa-1726471567/kenney_tower-defense-kit.zip

License: CC0 1.0 Universal. The extracted upstream `License.txt` is preserved at `public/assets/models/kenney/License.txt`.

Regeneration:

```bash
npm run generate:assets
```

The generator downloads the zip into `.tmp/kenney/`, extracts only this GLB subset into `public/assets/models/kenney/`, and writes `manifest.json` with the source URL, license, zip SHA-256, and selected files:

- `tile.glb`
- `tile-spawn.glb`
- `tile-wide-straight.glb`
- `tile-wide-corner.glb`
- `tower-round-base.glb`
- `tower-round-build-a.glb`
- `weapon-cannon.glb`
- `weapon-turret.glb`
- `enemy-ufo-a.glb`
- `detail-tree.glb`
- `detail-rocks.glb`
- `detail-crystal.glb`

Runtime usage:

- Babylon loads these files from `/assets/models/kenney/`.
- The board uses Kenney grass/path/spawn tile silhouettes on top of the existing interactive grid.
- Tower blocks and decorative stage towers use Kenney tower base/build/weapon pieces.
- Raider previews and active raiders use the Kenney UFO enemy silhouette with HP/effect overlays.
- Trees, rocks, and crystals use Kenney prop models where loaded, with the existing primitives kept as fallback.
