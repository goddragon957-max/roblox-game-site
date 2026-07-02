# Orbit Bloom Agent Brief

## Current Direction

This project has been reset from the previous Moonleaf/Roblox game direction into **Orbit Bloom**, a space-focus app where focused time births planets and grows a personal galaxy.

Preserved backup: `pre-orbit-bloom-rebuild-20260625-163721`.

## Stack

- Vite + React + TypeScript
- Zustand for product state
- Three.js for the animated planet/galaxy scene
- Tailwind/shadcn-style design judgment, implemented with local semantic CSS for this slice
- Lucide Icons available for UI icons

## Product Requirements

- First screen should feel like a premium mobile focus app, not a generic landing page.
- The central experience is visual: a living planet, rings, stars, comets, and orbiting born planets.
- Focus progress must be real state, not decorative:
  - Start/pause toggles focus session.
  - Progress increases over time while focusing.
  - Plus/add button simulates a focus boost.
  - Completion births the next planet and appends it to the galaxy.
- The app should clearly communicate: “집중하면 행성이 태어나고 은하가 성장한다.”
- No copied assets from Threads, Orbis, or any third-party app. Build original visuals procedurally or with explicitly approved assets.

## StyleSeed UI Standard

Use StyleSeed as the default design judgment layer for this project.
Read https://styleseed-demo.vercel.app/llms.txt before major UI changes.
Apply StyleSeed rules to every screen, empty/loading/success state, and motion detail.

Golden rules:

- Premium mobile shell first; no dashboard slabs.
- One coherent cosmic accent system: warm gold + violet/cyan support.
- Use semantic CSS tokens and avoid random hardcoded component colors when expanding.
- Content belongs in glass/cards/surfaces with clear hierarchy.
- Buttons must be at least 44×44px and visibly wired to state.
- Motion should reinforce focus/growth, not distract.

## Harness Operating Contract

This project uses the repo-local game harness in `docs/harness/` plus agent role briefs in `docs/agents/`.

Before any non-trivial implementation, read:

- `docs/harness/config.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/flutter-flame-harness-review.md`
- `docs/harness/gotchas/web-game-gotchas.md`
- `docs/harness/gotchas/orbit-bloom-gotchas.md`
- latest `docs/harness/feedback/*.md` if present
- the relevant role brief in `docs/agents/`

The active loop is:

```text
contract → generator → handoff → evaluator → visual QA → feedback → next round / human approval
```

Non-negotiables:

- Do not call work done from code review alone.
- Do not report success without deterministic verification and browser/play evidence when behavior changed.
- Do not claim visual PASS without screenshot/rendered-output inspection.
- Do not revive Moonleaf/Roblox/Pixi/game code unless the user explicitly asks to restore the backup tag.
- Do not replace the current Orbit Bloom direction, externally deploy, or push major direction changes without human approval.
- Visual QA is a hard gate: first-screen/product readability must have no zero scores.

## Current Round 2 Goal

Round 2 is visual-first. The next generator should make Orbit Bloom’s first screen unmistakably read as a premium cosmic focus/reward game-like app.

See `CODEX_GOAL.md` for the exact work order.

## Verification Per Slice

```bash
npm run verify:harness
npm run test
npm run lint
npm run build
```

Or run the combined gate:

```bash
npm run verify
```

For visual changes, run a local browser smoke:

- marker `data-ui-pass="orbit-bloom-focus-app"` exists;
- Three.js canvas exists;
- `window.__orbitBloomScene.ready === true`;
- Start focus changes progress/focusing state;
- Add focus can increase births/moons;
- console errors are zero;
- screenshot/rendered output supports the visual QA score.

Every generator round must write `docs/harness/handoff/round-N-gen.md`. Every evaluator round must write `docs/harness/feedback/round-N-qa.md`.
