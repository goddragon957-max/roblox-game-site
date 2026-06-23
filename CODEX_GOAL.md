# CODEX GOAL — Adorable Colorful Diorama Pass

Repo: `/home/sy/projects/roblox-game-site`

User feedback to treat as acceptance-critical:

> “좀 더 아기자기하게 못만드냐 그리고 이미지 처럼 화려하지도 않은데. 골모드로 진행해.”

Previous rebuild removed the dark dashboard, but it is still too sparse and not cute/colorful enough compared with the generated image reference. This pass must make the first screen feel like a polished, adorable, saturated toy-diorama tower defense game.

## Visual references

Use these as style targets:

- Existing reference: `docs/visual-targets/blockhold-rebuild-reference.png`
- New stronger reference: `docs/visual-targets/puppy-guard-cute-diorama-reference.png`

The new reference is the stricter target: bright cyan sky, golden winding paths, dense flowers/mushrooms/fences/balloons/confetti, chubby puppy knights with big heads, colorful slime blobs, glowing pink/blue heart crystal core, chunky toy towers, lots of sparkle/particle accents, and minimal cute HUD.

## Hard acceptance bar

The screenshot should no longer read as “empty bright island.” It must read as:

> a cute colorful mobile/toy tower-defense diorama with clear characters and rich props.

Before finishing, visually check the first screen and Start Raid screen against these questions:

- Are puppy defenders/towers large and cute enough to identify immediately?
- Are enemies visibly expressive pastel blob characters, not small colored dots?
- Does the island feel decorated/dense: flowers, mushrooms, fences, balloons, flags, sparkles, clouds, crystals?
- Is the path more golden and playful, closer to the reference image?
- Is the core more magical and eye-catching, ideally heart/crystal-like rather than just a generic shard?
- Is the HUD still minimal and not covering the board?

## Required implementation changes

### 1. World / scene richness

In `src/render/BlockholdScene.tsx`, make the Babylon scene richer and more colorful:

- More saturated sky and warm sun rays feel.
- Add many small procedural decorative props: flowers, mushrooms, fences, balloons, puppy flags, coin tokens, clouds, sparkles/confetti, and extra crystals.
- Add a few floating side islands/clouds in the background if feasible.
- Make the path golden/yellow, thicker, and more clearly winding/playful.
- Add more height/layers to the island edges so it feels like a chunky toy diorama.
- Keep performance reasonable; procedural primitives are fine.

### 2. Character cuteness / scale

- Puppy defenders/towers must be much more visible and cute:
  - bigger heads, round eyes, helmet, scarf, shield/sword/flag;
  - at least several visible puppy guards/towers in first view;
  - chibi proportions, not tiny props.
- Blob enemies must be larger and more expressive:
  - pastel green/pink/blue/purple variants;
  - eyes, horns/ears, little shine spots;
  - visible at raid start without zooming.
- Add at least one decorative puppy near the core or tower so the first screen has a mascot focal point even before building.

### 3. Core / effects

- Upgrade core into a strong magical centerpiece:
  - pink/blue heart-like crystal or clustered crystal shrine;
  - glow layer/sparkle accents around it;
  - surrounding fence/flowers/crystals.
- Add visible sparkle/coin/hit/frost effects using simple mesh markers or small animated props.
- If no true animation is added, at least use clear static sparkles and combat markers.

### 4. HUD / controls

- Keep HUD cute and minimal:
  - top-left hearts/coins/wave like mobile game chips;
  - bottom build bar with cute rounded cards;
  - avoid long paragraphs and dashboard slabs.
- Do not hide the board/action. During raid, the build bar should stay compact or collapsed.
- Preserve Start Raid, Pause/Resume, Next Day, Restart, build buttons, keyboard shortcuts, and canvas place/remove behavior.

### 5. Optional CSS fallback

If the WebGL fallback exists, make it more colorful too, but prioritize the actual Babylon scene.

## Hard no-go list

- No return to dark tactical/dashboard style.
- No giant scroll panels.
- No tiny unreadable enemies.
- No sparse empty island.
- No copyrighted Roblox/TDS assets or names.
- No grotesque characters.
- Do not commit or push. Hermes will verify and ship.

## Verification required before finishing

Run:

```bash
npm run test
npm run lint
npm run build
```

Also run/enable browser smoke assumptions:

- first screen loads without console errors;
- Start Raid changes state visibly;
- first screen and raid screen look more colorful/dense/cute than commit `abf2c72`;
- HUD/build bar does not obscure the main action.

Report changed files and command results only after verification.
