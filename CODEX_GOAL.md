# Codex Goal — Orbit Bloom Round 2

## Active Goal

Make Orbit Bloom's first screen unmistakably read as a **premium cosmic focus/reward game-like app**.

The current app has a working technical baseline. Round 2 is not about adding random features. It is about passing the visual/product gate:

```text
focus → visible energy/progress → obvious cosmic reward/birth → growing galaxy
```

## Why This Round Exists

The Flutter/Flame harness review confirmed the process we want:

```text
contract first → generator → evaluator → run/play/see app → feedback → next round
```

Our extra Orbit Bloom rule is stricter visual QA. The app must not merely compile or expose a canvas. The screenshot itself must sell the concept.

## Required Reads Before Editing

Read these files before changing code:

- `AGENT.md`
- `VERIFY.md`
- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/flutter-flame-harness-review.md`
- `docs/harness/gotchas/web-game-gotchas.md`
- `docs/harness/gotchas/orbit-bloom-gotchas.md`
- latest `docs/harness/feedback/*.md` if present
- `docs/agents/game-generator-agent.md`

## Round 2 Must-Have Outcomes

1. **Hero/focal planet readability**
   - The central planet/rings/world must be visible and appealing in the first screenshot.
   - It must not be too dark, too small, or visually lost behind copy/HUD.

2. **Scene-driven reward loop**
   - The scene itself must communicate that focus creates cosmic rewards.
   - Do not rely only on title/subtitle/counter text.

3. **Progress-reactive visuals**
   - Starting focus should visibly change scene energy: glow, halo, ring intensity, dust, orbit speed, or equivalent.
   - Progress should feel like energy accumulating.

4. **Birth/reward moment**
   - Add Focus or completion should create a noticeable visual event: pulse, new moon/mini-planet, orbital object, collection slot growth, or equivalent.

5. **Keep scope tight**
   - Do not add accounts, backend, store/ads, multiple pages, or unrelated game modes.
   - Do not restore Moonleaf/Roblox/Pixi.
   - Preserve Vite + React + TypeScript + Zustand + Three.js.

## Suggested Implementation Direction

Focus on `src/render/SpaceFocusScene.tsx`, `src/App.tsx`, `src/styles.css`, and the focus store/progression files only if needed.

Possible improvements:

- Reposition/camera/scale the planet so the focal object dominates the viewport.
- Increase planet/ring brightness and contrast while keeping a premium calm tone.
- Add a visible progress aura or ring-energy layer tied to `progress` and `isFocusing`.
- Add a birth pulse/new-orbit object tied to `births`/`galaxy.length`.
- Ensure the lower HUD does not cover or obscure the reward world.

## Handoff Requirement

After implementation, write:

```text
docs/harness/handoff/round-2-gen.md
```

Include:

- files changed;
- visual/product fixes made;
- commands run;
- known limitations;
- browser or screenshot evidence attempted.

## Verification

Run:

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

Or run the combined harness gate:

```bash
npm run verify
```

Then perform browser smoke:

- app marker exists;
- canvas exists;
- `window.__orbitBloomScene.ready === true`;
- Start Focus changes progress/focusing;
- Add Focus can increase progress or births/moons;
- browser console errors are zero;
- screenshot/rendered visual evidence supports a no-zero visual QA score.
