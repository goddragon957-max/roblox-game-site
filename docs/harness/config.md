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
  adopted_from: flutter-flame-harness review
  mode: contract_first_generator_evaluator
  strict_visual_gate: true
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
  no_static_landing_page: true
```
