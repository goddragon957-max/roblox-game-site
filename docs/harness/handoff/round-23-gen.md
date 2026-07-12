# Generator Handoff — Round 23

## Slice

Renewable lumber / wood-regrowth feedback for Puppy Frontier RTS.

## Agent outcome

Claude Code was launched from the scheduled 48-hour goal-mode prompt, but its visible output was only:

```text
You've reached your Fable 5 limit. Run /usage-credits to continue or switch models with /model.
```

Despite that limit line, the worktree contained a coherent source diff for Round 23. The scheduled Hermes evaluator treated the Claude output as data, inspected the diff, and completed the required verification/docs before commit.

## Changed files

- `src/game/types.ts`
  - Added `ResourceNode.regrowAt` and the `NodeRegrowth` smoke/preview type.
- `src/game/simulation.ts`
  - Added `WOOD_REGROW_TIME`, renewable wood depletion handling, `nodeRegrowth(state)`, and `stepRegrowth(state)`.
  - Wood nodes now set a cooldown when depleted, then refill to `maxAmount`; idle workers whose last gathered node regrows are sent back to gather.
  - Gold nodes remain finite and never regrow.
- `src/store/gameStore.ts`
  - Exposed `__rtsSmoke.command.nodeRegrowth()`.
- `src/render/ThreeRtsScene.tsx`
  - Renders depleted/regrowing wood as a scaling sapling instead of deleting the visual until the tree is ready.
- `src/components/RtsHud.tsx`
  - Minimap draws a subtle green regrowth ring for depleted/regrowing wood nodes.
- `src/game/__tests__/simulation.test.ts`
  - Added deterministic tests for wood regrowth progress/refill logs, non-regrowing depleted gold, and idle woodcutter reassignment.

## Verification status

The evaluator ran and recorded verification in `docs/harness/feedback/round-23-qa.md`:

- `npm run verify` — PASS (`70 tests`, lint and build passed; Vite chunk-size warning remains non-fatal).
- `git diff --check` — PASS.
- Browser smoke on strict alternate port `4203` because `4199` was occupied — PASS.
- Visual QA via browser-rendered frame — PASS, 12/12.

## Known limitations / follow-up

- The regrowth indicator is deliberately subtle: small sapling in the world plus minimap ring. A future slice could add an optional HUD chip for depleted/regrowing nodes if the economy needs stronger planning feedback.
- Port `4199` was occupied during evaluator preview, so the allowed alternate strict port `4203` was used.
