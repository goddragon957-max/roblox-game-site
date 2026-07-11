# 48-hour Claude Goal-Mode Loop — Puppy Frontier RTS

Created: 2026-07-11 10:10 KST
Repo: `/home/sy/projects/roblox-game-site`
Live URL: https://goddragon957-max.github.io/roblox-game-site/

## Operator instruction

The user authorized a 48-hour autonomous continuation loop:

- Continue the current **Puppy Frontier RTS** direction.
- Use Claude Code goal-mode style work for one focused product slice at a time.
- At the end of each verified slice, commit and push to `origin main`.
- Do not ask for confirmation for normal small product slices during this 48-hour window.
- Stop only for a real blocker, destructive product pivot, credential failure, failed verification that cannot be fixed safely, or explicit user stop.

This file is the durable task spec. Keep the actual `/goal` condition short and point Claude here.

## Product direction

Puppy Frontier RTS is a playable 3D isometric RTS first slice:

- puppy workers gather resources;
- the player builds production/defense;
- soldiers and towers defend the base;
- raccoon raider waves pressure the base;
- the game can be won or lost;
- the first three seconds must read as a game, not a dashboard.

Preserve the current RTS direction. Do **not** revive Orbit Bloom/Moonleaf or older directions unless the user explicitly asks.

## Per-session goal

Each Claude run should complete **one small, high-impact slice** that can be implemented and verified in the same session. Prefer slices that improve the first 2 minutes of play, visual readability, controls, feedback, or replayability.

Good next-slice examples, in priority order:

1. Stronger RTS control/readability: selection panel, command path/target markers, selected unit HP/status, better smart-command feedback.
2. Defense loop polish: clearer tower/build placement feedback, tower range preview, visible projectile/impact feedback, better raider telegraph.
3. Economy loop polish: resource node depletion/regrowth feedback, worker carried-resource visuals, delivery streak/combo feedback.
4. Wave/replay loop: wave preview, difficulty ramp, win/loss/restart scoring, post-run summary.
5. Visual/world richness without copied assets: low-poly props, terrain landmarks, clearer base/resource/enemy silhouettes, minimap threat pulses.
6. Tests/harness hardening if a product slice exposes weak coverage.

Avoid giant rewrites. One verified slice per run is better than half-finishing multiple ideas.

## Required files to read before editing

- `AGENT.md`
- `VERIFY.md`
- `package.json`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/instruction-integrity.md`
- latest `docs/harness/feedback/*.md`
- relevant source files before editing them

## Verification gate

Before claiming completion or pushing:

1. Run deterministic verification:
   ```bash
   npm run verify
   git diff --check
   ```
2. For visual/behavior changes, run local preview on a strict port and browser/play smoke from `VERIFY.md`:
   - app marker exists;
   - Three.js canvas exists and has non-zero size;
   - `window.__rtsSmoke.getState()` works;
   - selection changes state;
   - at least one command changes resources/units/HP;
   - console fatal JS errors are zero;
   - screenshot/rendered output supports visual QA.
3. Write/update a truthful evaluator note under `docs/harness/feedback/round-N-qa.md` for each verified round.
4. Update `docs/harness/state.md` and pipeline notes as needed.

If Claude cannot run commands due permission/session limits, it must write a truthful handoff instead of claiming completion. The Hermes scheduled evaluator will inspect the diff and continue.

## Git policy

- User has authorized normal commits and pushes for this 48-hour loop.
- Commit message format: `feat(game): ...`, `fix(game): ...`, `test(game): ...`, or `chore(game): ...`.
- Push after each verified slice:
  ```bash
  git add -A ':!.hermes'
  git commit -m "feat(game): <slice summary>"
  git push origin HEAD:main
  ```
- Do not stage `.hermes/`, `node_modules/`, `dist/`, screenshots, or transient logs unless the repo intentionally tracks them.
- After push, verify branch sync with `git status --short --branch` and, when feasible, check the live GitHub Pages URL.

## Stop/blocker conditions

Report a blocker instead of pushing if:

- Claude reports subscription/session/rate/token limit and no code slice was completed;
- GitHub auth or push fails and cannot be recovered safely;
- `npm run verify` fails and cannot be fixed in the same run;
- browser smoke or visual QA fails after a visual/behavior slice;
- the next useful action would be a destructive pivot, external publication beyond the existing GitHub Pages flow, or a major architecture rewrite.
