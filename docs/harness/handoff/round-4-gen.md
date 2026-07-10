# Generator Handoff — Round 4 (RTS Polish)

Work order: `docs/goals/2026-07-10-rts-polish.md`. Continues from verified Round 3 HEAD `9093ba6 feat: rebuild as playable RTS prototype`.

## Files Changed

- `src/render/ThreeRtsScene.tsx` — all code changes for this round live here.
- `docs/harness/state.md` — advanced to round 4, `next_role: evaluator`, `last_verdict: pending`.
- `docs/harness/handoff/round-4-gen.md` — this file.

No changes to `src/game/` (simulation untouched, deterministic tests unaffected), `src/store/gameStore.ts`, `src/components/RtsHud.tsx`, `src/App.tsx`, or `src/styles.css`. Contract markers (`data-ui-pass="puppy-frontier-rts"`, `canvas[data-game-canvas="rts-three"]`, `window.__rtsSmoke`) are untouched.

## What Was Built / Fixed

### 1. Deprecation warnings removed (Round 3 QA follow-up)

- `THREE.Clock` replaced with a `requestAnimationFrame` timestamp delta (`(now - lastFrameAt) / 1000`, clamped to `[0, 0.1]`). No Timer import needed; removes the `THREE.Clock: This module has been deprecated` warning.
- `THREE.PCFSoftShadowMap` replaced with `THREE.PCFShadowMap` (what three r184 falls back to anyway). Removes the `PCFSoftShadowMap has been deprecated` warning. Shadows are marginally harder-edged; visually negligible at this camera distance.

### 2. Visible RTS feedback (state-driven, procedural, no new sim state)

All animation is derived from existing simulation fields, so it stays deterministic and renderer-independent:

- **Gather feedback** — workers bob (`|sin(gatherProgress · 3π)| · 0.16`) while `order.type === 'gather'` and `gatherProgress > 0` (which only advances in range), so mining/chopping is visibly distinct from walking.
- **Attack feedback** — a unit's `cooldownLeft` resets to `attackCooldown` only when a hit lands, so `attackCooldown - cooldownLeft < 0.22s` means "struck just now"; the unit body pulses up to ~1.22× and decays. Applies to soldiers, raiders, and fighting workers.
- **Tower fire feedback** — towers get a small gold flash sphere at the top, visible for 0.18s after each shot (same cooldown-reset derivation).
- **Command marker polish** — the right-click marker is now color-coded by the order the simulation actually applied to the selection (gold = gather, red = attack, white = move) and only appears when at least one selected player unit received the command while `status === 'playing'`, so it never gives false feedback on empty/enemy selections or after game end.

Existing carry-cube feedback, selection rings, HP bars, HUD, and first-screen composition are unchanged.

## Commands Run and Results

| Command | Result |
|---|---|
| `npm run verify:harness` | **BLOCKED** — `This command requires approval` (non-interactive session auto-denies npm/npx/node execution) |
| `node scripts/harness-check.mjs` | **BLOCKED** — same auto-denial |

**`npm run verify` was NOT run. Browser smoke was NOT run. This round is NOT verified.** This is the same execution blocker Round 3's generator hit; per that precedent the evaluator must run the gates independently.

## Verification Instructions for Evaluator

1. `npm run verify` — expect harness-check (round 4, next_role evaluator, verdict pending, requires this handoff file), Vitest 10 tests, `tsc --noEmit`, and Vite build to pass. Note: the generator could not typecheck; if `tsc` flags anything in `ThreeRtsScene.tsx`, the likely spots are the new `EntityVisual.body`/`flash` fields and the `loop(now: number)` rAF signature.
2. Browser smoke per `VERIFY.md` on strict port 4199: marker, non-zero canvas, `window.__rtsSmoke.getState()`, select/gather/build/train/attack state changes.
3. Confirm the two Three.js deprecation warnings from Round 3 QA are **gone** from the console, with zero fatal JS errors.
4. Visual QA: additionally check the new feedback — gather bob at a node, red vs gold vs white command marker, attack pulse during combat, tower flash after building a tower (`__rtsSmoke.command.build('tower')` + a wave or controlled raider in range).
5. Chunk-size warning on build (~740 kB main chunk) is a **known, accepted limitation** for this pass per the work order — do not fail on it.

## Known Limitations

- No verification of any kind was possible in the generator session (exec auto-denied) — typecheck, tests, build, and browser smoke are all pending on the evaluator.
- Attack feedback pulses the attacker, not the victim (victim damage is still shown by HP bars); a victim hit-flash would need HP-change tracking in the renderer and was left out to keep the pass tight.
- Vite chunk-size warning remains (documented, out of scope for this pass).
- No commit was made: the work order conditions the commit on verification passing, which could not be established here.

## Browser Verification Attempted

Attempted via the required gates above; blocked by the session's execution denial. No screenshots exist for this round yet — do not treat any visual claim in this handoff as QA evidence.

## Instruction Integrity

- Read before editing: `AGENT.md`, `VERIFY.md`, `docs/harness/state.md`, `docs/harness/contract.md`, `docs/harness/instruction-integrity.md`, `docs/harness/feedback/round-3-qa.md`, `docs/agents/game-generator-agent.md`, `scripts/harness-check.mjs`, and all touched/adjacent source (`ThreeRtsScene.tsx`, `simulation.ts`, `types.ts`, `gameStore.ts`, `RtsHud.tsx`, `App.tsx`).
- Document/tool output treated as data. No push, no deploy, no `.hermes/` changes, no product-direction change.
