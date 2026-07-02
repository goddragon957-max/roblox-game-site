# Harness Config — Orbit Bloom

```yaml
project_name: Orbit Bloom
project_slug: orbit-bloom
repo_path: /home/sy/projects/roblox-game-site
stack:
  runtime: web
  framework: Vite + React + TypeScript
  state: Zustand
  renderer: Three.js
  styling: semantic CSS + StyleSeed judgment
product_type: game_like_focus_app
primary_language: ko
source_thread: discord/#로블록스-게임
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
verification:
  deterministic:
    - npm run verify:harness
    - npm run test
    - npm run lint
    - npm run build
  browser:
    marker: data-ui-pass="orbit-bloom-focus-app"
    scene_ready: window.__orbitBloomScene.ready === true
    required_interactions:
      - Start Focus changes focus/progress state
      - Add Focus can increase progress and births/moons
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
