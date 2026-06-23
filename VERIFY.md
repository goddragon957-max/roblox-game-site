# VERIFY.md — Visual QA Gate

This project is not allowed to call a visual game-art pass “done” from build/lint alone.
The user’s latest correction is acceptance-critical: a screenshot must read as a real game in the first 3 seconds.

## Required command gates

Run these before every commit/push that changes gameplay, rendering, UI, or art direction:

```bash
npm run generate:assets
npm run verify:visual
npm run test
npm run lint
npm run build
```

For visible changes, also run a local browser smoke test:

- open the app in a browser;
- verify the main marker is present;
- verify the canvas is high-resolution, not pixel-upscaled;
- verify GLB/model assets load with 200 responses when model assets are used;
- click `Start Raid`;
- verify an observable state change and no fatal console errors;
- capture or inspect at least one first-screen screenshot and one raid-state screenshot.

## First-3-seconds visual scorecard

A visual pass fails if any criterion scores `0`. Do not ship a visual pass that fails this gate; pick the weakest criterion and iterate again.

Score each item:

- `0` = fails / unreadable / looks like a debug toy or web dashboard
- `1` = partially readable but still weak
- `2` = clearly readable and desirable in the first 3 seconds

| # | Criterion | Required evidence |
|---|---|---|
| 1 | First 3 seconds: is the game genre obvious? | A fresh viewer can tell this is a tower-defense / build-to-survive game from the first screen. |
| 2 | Does the character read as a character? | Defender/hero has a strong silhouette, face/body identity, scale, and readable role. |
| 3 | Does the enemy read as an enemy? | Enemy has a distinct silhouette, face/threat identity, lane position, and readable movement/combat role. |
| 4 | Does the map read as a board/stage? | The scene looks like an authored play space, not a debug grid, random toy pile, or SaaS illustration. |
| 5 | Does the UI read as a game HUD? | HUD communicates wave/core/build/action state and does not look like a web admin dashboard. |
| 6 | Would a screenshot alone make someone want to play? | One screenshot has a clear fantasy, charm, action promise, and polish hook. |

## Pass thresholds

- **Hard fail:** any item is `0`.
- **Minimum pass:** all items >= `1` and total >= `9 / 12`.
- **Ship-quality target:** all items >= `1`, total >= `10 / 12`, and item 6 >= `2`.

## Visual QA report format

Every visual iteration should report:

```yaml
visual_qa:
  url_or_local_preview: ""
  screenshots:
    first_screen: ""
    raid_state: ""
  scores:
    genre_first_3_seconds: 0
    character_reads_as_character: 0
    enemy_reads_as_enemy: 0
    map_reads_as_board_stage: 0
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
    start_raid_verified: false
    canvas_high_resolution: false
    model_assets_loaded: false
```

## Non-negotiables learned from failed passes

- Do not improvise art direction from procedural shapes and random colors.
- Do not lower resolution or add pixel/crisp scaling unless the user explicitly asks for pixel art.
- Do not claim “GLTF asset pass” unless actual `.glb`/`.gltf` files exist and the browser loads them.
- Do not let panels hide the board or make the project look like a SaaS dashboard.
- Do not trust the implementer’s self-review. A separate verifier or Hermes browser inspection must score the screenshot.
