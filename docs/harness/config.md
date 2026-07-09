# Harness Config — Puppy Frontier RTS

```yaml
project_name: Puppy Frontier RTS
project_slug: puppy-frontier-rts
repo_path: /home/sy/projects/roblox-game-site
stack:
  runtime: web
  framework: Vite + React + TypeScript
  state: Zustand
  simulation: deterministic TS module (src/game/)
  renderer: Three.js isometric battlefield
  styling: semantic CSS + StyleSeed judgment (compact game HUD)
product_type: rts_game_prototype
primary_language: ko
source_thread: discord/#로블록스-게임
previous_direction:
  name: Orbit Bloom (space-focus app)
  backup_tag: pre-rts-rebuild-20260709-203351
  replaced_with_user_approval: true
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
    - git_push
    - project_direction_change
    - deleting_or_replacing_current_app
verification:
  deterministic:
    - npm run verify:harness
    - npm run test
    - npm run lint
    - npm run build
  browser:
    marker: data-ui-pass="puppy-frontier-rts"
    canvas: canvas[data-game-canvas="rts-three"]
    smoke_object: window.__rtsSmoke.getState()
    required_interactions:
      - selecting a worker changes sim.selectedIds
      - gather command increases gold/wood over advanced time
      - build/train subtracts costs and adds buildings/units
      - attack command reduces enemy camp HP
    console_errors_allowed: 0
visual_policy:
  reference_first: true
  asset_or_style_first: true
  first_three_seconds_scorecard_required: true
  screenshot_required_for_visual_pass: true
  dom_snapshot_never_enough_for_visual_pass: true
  no_static_landing_page: true
  no_placeholder_procedural_final: true
```
