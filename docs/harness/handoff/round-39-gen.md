# Generator Handoff — Round 39

## Summary

Round 39 implements Planet Forge Round 9 on branch `planet-forge-prototype`: desktop viewports at or below `700px` height now collapse the top-right status and terraforming tools into one compact command rail. The rail uses denser stats, a two-column five-tool grid, and a full-width meteor action so every gameplay action remains visible and touchable without panel/body scrolling while the planet stays the visual hero.

The first Claude Sonnet/Opus delegation completed with no source edits and an empty log. The evaluator/controller preserved the durable goal and relaunched the same bounded work order. That retry left a coherent `PlanetForgeApp.tsx` + CSS diff; its separate retry log/final status was not present during final reconciliation, so this handoff does not claim worker commands or an exit code. Hermes inspected the exact source diff and independently completed all deterministic, browser, exact-viewport, and visual gates.

## Files Changed

- `src/planet/PlanetForgeApp.tsx`
  - Wraps the existing status and terraforming sections in `.planet-right-rail` without changing simulation hooks or controls.
- `src/styles.css`
  - Adds the exact `max-height: 700px` desktop command-rail layout, denser status grid, two-column tools, hidden long hints, bounded button heights, and full-width fifth tool/meteor placement.
- `README.md`, `VERIFY.md`, `DESIGN.md`
  - Document the short-viewport behavior, exact browser criteria, and design rule.
- `docs/goals/2026-07-16-planet-forge-claude-sonnet-round9.md`
  - Durable delegated work order.
- `docs/harness/config.md`, `docs/harness/contract.md`, `docs/agents/*.md`
  - Correct stale active RTS semantics so future workers/evaluators remain on Planet Forge and use the real marker/canvas/smoke contract.
- `docs/harness/handoff/round-39-gen.md`, `docs/harness/feedback/round-39-qa.md`, `docs/harness/state.md`, `docs/harness/pipeline-log.md`
  - Truthful generator/evaluator trail and Round 40 handoff.

## Delegation / Coordination Evidence

The first no-op attempt log exists and is empty:

```text
/home/sy/.hermes/logs/planet-forge-claude-sonnet-round9-20260716T1315.log
```

The durable Sonnet work order exists at:

```text
docs/goals/2026-07-16-planet-forge-claude-sonnet-round9.md
```

The later source diff was treated as a blocked-but-useful delegated handoff and verified from repository state rather than worker self-report. No separate retry log path is claimed because it was absent during final reconciliation.

During final reconciliation, the evaluator found and terminated a stale delayed Fable retry wrapper targeting 18:12 KST, then removed its untracked Fable goal and launcher script. This enforces the current user instruction that Fable is exhausted/forbidden. Its scheduling log remains under `/home/sy/.hermes/logs/planet-forge-claude-fable-round9-retry-after-reset-20260716.log` as provenance.

## Evaluator Commands

```text
npm run verify          # PASS: harness, 104 tests, tsc, Vite build
npm run verify:harness  # PASS via npm run verify
npm run test            # PASS, 104 tests via npm run verify
npm run lint            # PASS via npm run verify
npm run build           # PASS via npm run verify, /roblox-game-site/ base
git diff --check        # PASS
```

The existing non-fatal Vite chunk-size warning remains. No new simulation helper was introduced, so existing deterministic simulation coverage plus real production-browser geometry/interaction proof is the appropriate test path.

## Browser / Viewport Evidence

Strict production preview:

```text
http://127.0.0.1:4214/roblox-game-site/
```

A dependency-free Chrome DevTools Protocol audit used exact viewport emulation and captured transient screenshots at:

```text
/tmp/planet-hud-1440x900.png
/tmp/planet-hud-1280x633.png
/tmp/planet-hud-1024x600.png
```

Verified at all three sizes:

- requested viewport equals actual viewport;
- document/body client and scroll sizes match, with body overflow hidden;
- Three.js canvas fills the exact viewport with matching backing dimensions;
- all five tools are fully inside the viewport and at least `44px` high;
- meteor action is fully inside the viewport and `44px` high;
- compact toolbox has equal client/scroll height (`284/284`) at `1280×633` and `1024×600`;
- fatal runtime problems: `0`.

At exact `1024×600`, a real browser tool click changed `selectedTool` from `water` to `forest`; a real canvas pointer interaction painted `cell-54` to forest, selected it, reduced energy/water, raised biomass, and advanced brush streak `0→1`.

Independent browser regression smoke also proved:

- marker present and canvas `1280×633`;
- eight distinct water paints activated Terraform Surge count `1` with matching DOM markers;
- shielded meteor impact produced `lastImpactKind: "shield"` and `scar: "debris"`;
- ignored meteor impact produced `lastImpactKind: "crater"` and `scar: "crater"`;
- water restoration cleared the scar, advanced restoration count to `1`, and activated matching DOM state;
- browser fatal JavaScript errors: `0` (existing `THREE.Clock` deprecation warning only).

## Visual Notes

Rendered `1280×633` and exact `1024×600` frames were inspected. In both, the spherical planet remains the central focal object, the right command rail reads as compact game HUD rather than a dashboard, all five tools plus meteor are visible without clipping, and the active world feedback remains readable.

No repository screenshot artifact is claimed; captures are transient evaluator evidence.

## Known Limitations

- `THREE.Clock` emits its existing deprecation warning; there are no fatal browser errors.
- The compact `1024×600` frame is intentionally dense, but actions retain `44px` minimum height and no scrolling/clipping occurs.
- The retry worker log/final exit code was not durably present during final reconciliation, so only repository diff and evaluator output are claimed.
- No external deployment was requested or performed; the authorized branch push follows evaluator PASS only.
