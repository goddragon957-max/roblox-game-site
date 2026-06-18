# CODEX GOAL — Full Visual Rebuild: Make It Look Like a Real Game

Repo: `/home/sy/projects/roblox-game-site`

User feedback to treat as acceptance-critical:

> “이게 진짜 게임처럼 보이냐? 존나 기괴해. 다 갈아엎어. 캐릭터 디자인부터 codex image 쓰든 외부 3d 라이브러리 가져오든 해서 다시 만들어.”

This is not a polish pass. The previous dark tactical HUD/dashboard direction failed. Rebuild the visible game from art direction upward so the first screen looks like a charming playable game, not an AI/dashboard prototype.

## Visual target

A generated concept reference was saved here:

`docs/visual-targets/blockhold-rebuild-reference.png`

Use it as style direction, not as a mandatory background asset.

Concrete art direction:

- Bright Roblox/toy-like isometric voxel tower-defense.
- Floating grassy island with chunky terrain sides, flowers, trees, stones, path tiles, a glowing crystal core, and warm sky/soft depth.
- Cute readable defenders: puppy knight/guard silhouettes with helmets, blue scarves, shields, flags, or tower platforms.
- Cute readable enemies: round slime/goblin blobs with tiny horns/ears, clear color variants for grunt/runner/brute.
- Towers should look like cozy wooden/stone toy towers, not purple cylinders.
- Traps/frost runes should be visually iconic and readable.
- HUD should be minimal game HUD: top-left hearts/wave/coins, bottom build bar, tiny right objective panel only if needed.
- Board must dominate the screen. Avoid huge scroll panels, dashboards, glass slabs, long text blocks, and developer labels.

## Required product changes

1. Rename/retitle visible product if useful: “Puppy Guard: Crystal Siege” or similar is acceptable, but keep project/repo path unchanged.
2. Replace dark tactical scene with bright toy-island scene.
3. Rework `src/render/BlockholdScene.tsx` substantially:
   - camera framed lower/closer like an isometric toy game;
   - floating island base with grass top and dirt sides;
   - winding path tiles, not just repeated dark grid squares;
   - decorative trees/flowers/stones/fences/torches;
   - cute puppy defenders and towers built procedurally from Babylon meshes;
   - cute blob enemies with eyes/horns/color variants;
   - crystal core shrine with glow;
   - clear tile hover/build preview and selected cell feedback;
   - readable combat markers/projectile/trap/frost feedback if feasible.
4. Rework `src/components/Hud.tsx` and `src/components/BuildPalette.tsx` into minimal game HUD:
   - no giant dashboard blocks;
   - top-left compact stats/buttons;
   - bottom-centered build bar/cards;
   - action button looks like a game button;
   - text should be short and game-like.
5. Rework `src/styles.css` accordingly:
   - bright sky/soft toy palette;
   - rounded game UI surfaces;
   - one cohesive accent system, semantic danger/coin/health exceptions;
   - mobile layout still playable.
6. Keep gameplay wired:
   - Start Raid / Pause / Next Day / Restart;
   - build palette selects wall/trap/turret/frost;
   - coin shop/upgrades can be compact/hidden behind small panels but must remain accessible or at least not broken;
   - keyboard shortcuts continue.
7. If you choose to add an external runtime library or asset package, it must be MIT/permissive or procedural and must not require paid keys. Prefer procedural Babylon meshes if faster.

## Hard no-go list

- Do not leave the existing dark tactical dashboard look.
- Do not ship text-heavy panels that cover the board.
- Do not use copyrighted Roblox/Tower Defense Simulator assets/names.
- Do not make grotesque/horror characters.
- Do not leave enemies as plain cylinders/cubes.
- Do not claim “game-like” unless characters, board, and HUD are visibly game-like.

## Verification required before finishing

Run:

```bash
npm run test
npm run lint
npm run build
```

Then do/enable browser smoke assumptions:

- page loads without console errors;
- first screenshot shows a bright toy/island game scene with cute defenders/enemies/core/path;
- Start Raid changes visible state to raid;
- build controls remain clickable.

Do not commit or push. Hermes will verify, adjust, commit, and push.
