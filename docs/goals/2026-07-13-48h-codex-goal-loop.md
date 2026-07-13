# 48-hour Codex Goal-Mode Loop — Puppy Frontier RTS

Created: 2026-07-13 16:55 KST
Repo: `/home/sy/projects/roblox-game-site`
Live URL: https://goddragon957-max.github.io/roblox-game-site/
Supersedes active worker assignment: `docs/goals/2026-07-11-48h-claude-goal-loop.md`

## Operator instruction

The user explicitly moved all active Claude/Fable assignments for this autonomous loop to **Codex** because the Claude Pro/Fable budget is exhausted:

- Continue the current **Puppy Frontier RTS** direction.
- Use **Codex CLI goal-mode / agentic execution** for one focused product slice at a time.
- Preferred Codex mode: `gpt-5.6-sol` with `model_reasoning_effort="ultra"`.
- At the end of each verified slice, commit and push to `origin main`.
- Do not ask for confirmation for normal small product slices during the authorized loop window.
- Stop only for a real blocker, destructive product pivot, credential failure, failed verification that cannot be fixed safely, or explicit user stop.
- Design quality is first-class: the user explicitly said **디자인도 신경써줘**. Do not optimize only for hidden state/test coverage; keep improving the game-like visual impression.

This file is the durable Codex task spec. Future scheduled automation should point Codex here instead of launching Claude/Fable.

## Product direction

Puppy Frontier RTS is a playable 3D isometric RTS first slice:

- puppy workers gather resources;
- the player builds production/defense;
- soldiers and towers defend the base;
- raccoon raider waves pressure the base;
- the game can be won or lost;
- the first three seconds must read as a game, not a dashboard.

Preserve the current RTS direction. Do **not** revive Orbit Bloom/Moonleaf or older directions unless the user explicitly asks.

## Design direction

Read root `DESIGN.md` before UI/renderer/HUD/game-feedback work. Default visual target: **cute low-poly puppy frontier RTS**, not a dashboard. Every autonomous slice should either improve visible design directly or preserve the current visual quality while explaining why the slice is mostly internal.

Design acceptance rules:

- The battlefield remains fullscreen and primary; HUD panels are compact overlays.
- Puppy workers/soldiers, raccoon threats, base, resources, and enemy camp must stay readable in a screenshot.
- Prefer visible world feedback for every mechanic: props, silhouettes, animations, pings, path/impact markers, minimap icons, or compact HUD chips.
- Reject generic web-dashboard slabs, oversized text panels, mismatched colors, and abstract unreadable dots.
- Visual QA must use rendered browser output, not only DOM/state assertions.

## Per-session Codex goal

Each Codex run should complete **one small, high-impact slice** that can be implemented and verified in the same session. Prefer slices that improve the first 2 minutes of play, visual readability, controls, feedback, replayability, or screenshot desirability.

Good next-slice examples, in priority order:

1. Visual/world richness without copied assets: low-poly props, terrain landmarks, clearer base/resource/enemy silhouettes, minimap icons, first-screen composition.
2. Character/readability polish: stronger puppy worker/soldier silhouettes, carried-resource props, raccoon masks/threat readability, faction colors.
3. Stronger RTS control/readability: selection panel, command path/target markers, selected unit HP/status, better smart-command feedback.
4. Defense loop polish: clearer tower/build placement feedback, tower range preview, visible projectile/impact feedback, better raider telegraph.
5. Economy loop polish: resource node depletion/regrowth feedback, worker carried-resource visuals, delivery streak/combo feedback.
6. Wave/replay loop: wave preview, difficulty ramp, win/loss/restart scoring, post-run summary.
7. Tests/harness hardening if a product slice exposes weak coverage.

Avoid giant rewrites. One verified slice per run is better than half-finishing multiple ideas.

## Required files to read before editing

- `AGENT.md`
- `VERIFY.md`
- `package.json`
- `DESIGN.md`
- `docs/harness/state.md`
- `docs/harness/contract.md`
- `docs/harness/instruction-integrity.md`
- latest `docs/harness/feedback/*.md`
- relevant source files before editing them

## Codex launch requirements

Scheduled runners should launch Codex with explicit model/effort evidence, for example:

```bash
codex --ask-for-approval never \
  --sandbox danger-full-access \
  -m gpt-5.6-sol \
  -c 'model_reasoning_effort="ultra"' \
  -C /home/sy/projects/roblox-game-site \
  exec - < .hermes/tmp/codex-48h-prompt.txt
```

If workspace-write/bubblewrap sandboxing blocks the run before commands execute, use `--sandbox danger-full-access` from the trusted repo and keep the prompt bounded to this project.

Do not leave sleeping Claude/Fable retry loops in place. Do not run Claude Desktop/CLI as the generator for this loop unless the user explicitly reassigns it.

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
   - screenshot/rendered output supports visual QA;
   - the first-3-seconds design bar from `DESIGN.md` still passes: game-like screenshot, readable characters/threats/world, compact HUD, no dashboard regression.
3. Write/update a truthful generator handoff under `docs/harness/handoff/round-N-gen.md` and evaluator note under `docs/harness/feedback/round-N-qa.md` for each verified round.
4. Update `docs/harness/state.md` and pipeline notes as needed.

If Codex cannot run or cannot verify due auth/tool/sandbox limits, it must write or leave a truthful blocker/handoff instead of claiming completion. The Hermes scheduled evaluator/controller should inspect any dirty diff and either finish safely or report a hard blocker.

## Git policy

- User has authorized normal commits and pushes for this loop.
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

- Codex auth/model/rate limits prevent a code slice from completing;
- GitHub auth or push fails and cannot be recovered safely;
- `npm run verify` fails and cannot be fixed in the same run;
- browser smoke or visual QA fails after a visual/behavior slice;
- the next useful action would be a destructive pivot, external publication beyond the existing GitHub Pages flow, or a major architecture rewrite.
