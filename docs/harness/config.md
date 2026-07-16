# Harness Config — Planet Forge

```yaml
project_name: Planet Forge
project_slug: planet-forge
repo_path: /home/sy/projects/roblox-game-site
branch: planet-forge-prototype
stack:
  runtime: web
  framework: Vite + React + TypeScript
  state: React state + deterministic TypeScript simulation
  simulation: src/planet/planetSim.ts
  renderer: fullscreen Three.js spherical planet
  styling: semantic CSS + StyleSeed judgment (compact game HUD)
product_type: planet_sandbox_game_prototype
primary_language: ko
source_thread: discord/#로블록스-게임
preserved_direction:
  name: Puppy Frontier RTS
  branch: main
  out_of_scope_without_user_switch: true
harness:
  mode: contract_first_generator_evaluator
  strict_visual_gate: true
  reviewed_reference:
    title: "GeekNews 30918 — Flutter/Flame 게임 출시 하네스"
    url: "https://news.hada.io/topic?id=30918"
    github: "https://github.com/tjdrhs90/flutter-flame-harness"
    reviewed_commit: "4f25f5d"
    reviewed_version: "0.15.0"
    reviewed_at_utc: "2026-07-02T07:18:47Z"
  imported_patterns:
    - contract_before_code
    - generator_evaluator_split
    - file_handoff_protocol
    - run_code_see_app_then_judge
    - gotchas_database
    - human_approval_gate
    - retrospective_after_loop
  explicitly_not_adopting:
    - Flutter/Flame-only stack
    - code-drawn placeholder visuals as final quality
    - store/ads pipeline before a strong playable/visual slice exists
  human_approval_required_for:
    - external_deploy
    - project_direction_change
    - deleting_or_replacing_current_app
  current_go_mode_authorization:
    branch_push: planet-forge-prototype
    enabled: true
verification:
  deterministic:
    - npm run verify:harness
    - npm run test
    - npm run lint
    - npm run build
  browser:
    marker: data-ui-pass="planet-forge-prototype"
    canvas: canvas[data-game-canvas="planet-three"]
    smoke_object: window.__planetForgeSmoke.getState()
    required_interactions:
      - selecting a tool changes selectedTool
      - painting a real surface cell changes biome/resources
      - meteor shield leaves debris and ignored meteor leaves a crater
      - repainting a crater with water/forest clears it and emits restoration feedback
      - all five tools and meteor action remain visible at short desktop viewports
    console_errors_allowed: 0
visual_policy:
  reference_first: true
  asset_or_style_first: true
  first_three_seconds_scorecard_required: true
  screenshot_required_for_visual_pass: true
  dom_snapshot_never_enough_for_visual_pass: true
  planet_must_remain_hero: true
  no_static_landing_page: true
  no_dashboard_shell: true
```
