# CODEX GOAL — 3D Arcade Cute Style Reboot

Repo: `/home/sy/projects/roblox-game-site`

Latest user feedback, acceptance-critical:

> “전혀 다른데 좀더 아기자기하게 못만드냐 그리고 약간 아케이드 느낌으로 다가 해상도가 너무 큰가 이미지를 보고 따라하지 말고 저런거 못그리냐 3d로?”

Interpretation:

The previous pass tried to copy the generated reference by adding props, but the resulting Babylon scene still reads as sparse/high-res/generic WebGL primitives. The user is asking for a **real 3D arcade/toon art direction**, not more literal image-following. The problem is not just missing decorations; it is camera/projection/render resolution/shape language.

## New art direction

Make Puppy Guard feel like a cute arcade 3D toy game:

- Low-res arcade render: intentionally chunky/pixel-upscaled, not crisp high-resolution WebGL.
- Orthographic/isometric camera: board reads like a 3D arcade diorama/sprite, not perspective CAD/WebGL.
- Big chibi 3D characters: puppies and blobs must be the emotional center, not tiny props.
- Flat saturated toon colors: fewer muddy 3D gradients, more readable color blocks.
- Simple chunky shapes: rounded/squashed spheres/cylinders/boxes, thick outlines/shadows if feasible.
- Board fills screen but with tighter camera composition; HUD must stop feeling like a web overlay covering a tiny board.
- Arcade game feel: pixelated canvas, bounce/wobble animation, coin/star pops, playful path, big Start button/chips.

## Do NOT do this

- Do not keep adding tiny flowers/balloons as the main solution.
- Do not try to literally copy the generated image.
- Do not use a giant high-resolution crisp canvas look.
- Do not return to dark tactical dashboard style.
- Do not leave characters as small dots among too many props.
- Do not rewrite game mechanics unless needed for visual state.
- Do not commit or push; Hermes will verify and ship.

## Required implementation plan

### 1. Low-res arcade render

In `src/render/BlockholdScene.tsx` and CSS:

- Make the Babylon canvas render intentionally lower-res and upscale it:
  - use `engine.setHardwareScalingLevel(...)` with a value around `2` to `3`, or equivalent;
  - disable overly smooth antialiasing if appropriate;
  - add CSS `image-rendering: pixelated` or `crisp-edges` for the canvas/frame;
  - add `data-ui-pass="puppy-arcade-3d"` in `App.tsx` so smoke tests can identify the pass.
- Add a subtle arcade frame/vignette that does not hide the board.

### 2. Orthographic arcade camera

- Change the Babylon camera to orthographic/isometric mode.
- Keep the whole board playable, but zoom/composition should make characters and core much larger.
- On resize, update `orthoLeft`, `orthoRight`, `orthoTop`, `orthoBottom` so the board stays centered.
- The screenshot should feel like a 3D arcade board/sprite, not a perspective miniature.

### 3. Chibi 3D shape language

Rework the core helper shapes, especially `drawPuppy`, `drawTowerPuppy`, and `drawBlob`:

- Puppies:
  - much bigger head/body ratio;
  - huge eyes, cheeks, ears, scarf/helmet readable from isometric camera;
  - squat arcade silhouette;
  - at least one large mascot puppy near the core in the first screen.
- Blobs:
  - larger, rounder, pastel, expressive eyes/mouth/horns;
  - obvious bounce/wobble during raid using time-based scaling/position;
  - no tiny HP details if they make blobs visually noisy; use simple colored bars or none.
- Towers:
  - read as chunky puppy arcade towers, not detailed miniature structures;
  - flag/projectile/bolt should be large and colorful.

### 4. Simplify scene density into readable arcade composition

The current scene has many tiny props. Keep some, but prioritize readability:

- Fewer tiny scattered props if they create noise.
- Larger props at screen edges: oversized mushrooms, stars, clouds, candy fences, toy flags.
- Make the path a thick playful golden ribbon, not thin tile grid squares.
- Make the core a huge glowing heart/crystal arcade objective.
- Use shadows/ground discs under characters so they read as 3D pieces.

### 5. HUD should become arcade overlay, not web panel

In `src/components/Hud.tsx`, `src/components/BuildPalette.tsx`, and `src/styles.css`:

- Shrink the left HUD drastically or transform it into compact arcade chips.
- Keep critical info only: hearts/core, wave, coins, Start/Pause.
- Move/resize Start Raid into a colorful arcade button that does not block the board.
- Make build controls compact, maybe icon-first cards; do not cover the emotional center of the board.
- Keep all interactions working: Start Raid, Pause/Resume, Next Day, Restart, build selection, canvas place/remove, keyboard shortcuts.

### 6. Motion/effects

Add simple time-based visual motion inside the render loop:

- idle bob for puppy mascots/towers;
- bounce/wobble for blobs;
- sparkle/coin pulse around core;
- visible attack/kill pop markers if available.

This is important: static high-res primitives are why the scene feels wrong.

## Acceptance checklist before finishing

Run:

```bash
npm run test
npm run lint
npm run build
```

Then browser-smoke locally:

- first screen loads with `data-ui-pass="puppy-arcade-3d"`;
- canvas appears intentionally pixel/chunky/arcade, not high-res crisp;
- orthographic camera makes the board feel like a cute arcade diorama;
- puppy and blob characters are big/readable/emotional center;
- Start Raid changes to raid state;
- raid blobs visibly bounce/wobble and remain readable;
- console has no JS errors.

Report changed files and command results only after verification.
