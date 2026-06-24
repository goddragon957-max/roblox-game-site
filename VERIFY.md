# VERIFY.md - 2D Visual QA Gate

This project is not allowed to call a visual game pass done from build/lint alone. A screenshot must read as an original 2D side-scrolling action RPG in the first 3 seconds.

## Required Command Gates

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

For visible changes, also run a local browser smoke test:

- open the app in a browser;
- verify `data-ui-pass="moonleaf-2d-action-rpg"`;
- verify Pixi canvas `data-game-canvas="moonleaf-2d"`;
- verify Start or keyboard movement changes game state;
- verify attack damages an enemy and shows hit feedback;
- verify console errors are 0;
- inspect first-screen and combat screenshots.

## First-3-Seconds Visual Scorecard

A visual pass fails if any criterion scores `0`.

- `0` = fails / unreadable / looks like a debug toy or web dashboard
- `1` = partially readable but still weak
- `2` = clearly readable and desirable in the first 3 seconds

| # | Criterion | Required evidence |
|---|---|---|
| 1 | First 3 seconds: is the game genre obvious? | Side-view movement space, hero, enemies, platform field, and action HUD are visible immediately. |
| 2 | Does the hero read as a cute playable character? | Hero has face/body/silhouette, readable weapon/role, and enough scale. |
| 3 | Does the enemy read as an enemy? | At least one enemy is visible with distinct face/threat identity and HP/readability. |
| 4 | Does the stage read as a side-scrolling field? | Forest village/field, platforms, ground, depth, and traversal path are clear. |
| 5 | Does the UI read as a compact game HUD? | HP/MP/EXP/level/objective are compact overlays, not web dashboard slabs. |
| 6 | Would a screenshot alone make someone want to play? | One screenshot has charm, action promise, readable fantasy, and polish hook. |

## Pass Thresholds

- Hard fail: any item is `0`.
- Minimum pass: all items >= `1` and total >= `9 / 12`.
- Ship-quality target: all items >= `1`, total >= `10 / 12`, and item 6 >= `2`.

## Visual QA Report Format

```yaml
visual_qa:
  url_or_local_preview: ""
  screenshots:
    first_screen: ""
    combat_state: ""
  scores:
    genre_first_3_seconds: 0
    hero_reads_as_character: 0
    enemy_reads_as_enemy: 0
    stage_reads_as_side_scroller: 0
    ui_reads_as_game_hud: 0
    screenshot_makes_you_want_to_play: 0
  total: 0
  pass_level: hard_fail | minimum_pass | ship_quality
  weakest_criterion: ""
  required_next_iteration: ""
  command_results:
    generate_assets: ""
    verify_visual: ""
    test: ""
    lint: ""
    build: ""
  browser_results:
    console_errors: 0
    canvas_exists: false
    start_or_keyboard_verified: false
    attack_damages_enemy: false
```

## Non-Negotiables

- No Babylon, GLB, Kenney, or 3D tower-defense leftovers.
- No copied MapleStory assets, names, maps, mobs, UI, or copyrighted designs.
- No landing page in place of the game.
- No giant dashboard panels hiding the stage.
- No claiming done without static gates and browser smoke for visual changes.
