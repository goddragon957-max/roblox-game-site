# Web Game / Interactive Prototype Gotchas

These are mandatory lessons for Vite/React/Three.js or browser-based game-like projects.

## Build Is Not Playability

A green `npm run build` only proves the bundle compiles. It does not prove the canvas renders, state mutates, or the experience feels like a game/app.

Required extra evidence:

- Real browser load.
- Canvas or primary game surface exists.
- Console has zero fatal errors.
- A user action changes state.
- Visual scorecard has no zeroes.
- Screenshot evidence is captured for any visual PASS claim.

## Run the App, See the App, Then Judge

Adopt the reference harness rule: **never PASS on code review alone**.

For browser game-like projects, the evaluator must at minimum record:

```text
URL loaded
document title
app marker
canvas size
scene readiness marker
interaction before/after state
console error count
screenshot or visual evidence path
```

If the app cannot be visually inspected, visual QA remains `pending` or `fail` even when tests pass.

## First 3 Seconds Matter

If a user cannot tell what the product/game is within three seconds, the round is not visually verified. Prefer one strong readable focal point over scattered effects.

For this user, game-like projects should bias toward:

- reference-first art direction;
- asset/style-first execution;
- a cinematic or collectible first impression;
- strong focal object readability;
- obvious reward/challenge loop readability.

## Avoid Placeholder Drift

Procedural visuals are acceptable only when they read as intentional art direction. Abstract shapes, generic dashboard cards, unlabeled particles, or hidden 3D objects should be treated as placeholders unless the contract explicitly allows them.

A procedural scene can still fail the visual gate if the focal object/world/reward loop is too dark, too small, off-camera, or only described by text.

## Visual QA Calibration

Do not copy forward an old scorecard when the live screenshot contradicts it.

A round can have:

```text
deterministic gates: PASS
browser interaction: PASS
visual QA: FAIL
```

When that happens, mark the round as a technical baseline only and carry the visual failures into the next generator goal.

## Strict Port Preview

Use a strict, fresh preview port when performing screenshot QA. A stale Vite server on a reused port can show the wrong app and produce false confidence.

## State Markers

Expose stable smoke-test markers for browser verification, e.g. `data-ui-pass` and a small `window.__projectScene` object. These should not contain secrets.

## Interaction Gate

Every visible primary control should either mutate state or be clearly disabled. For game-like apps, at least one interaction must drive the reward/progress loop.

## Documentation Is Part of the Product

The harness is only useful if later agents can resume from files. Each meaningful loop should update:

- `docs/harness/state.md`
- `docs/harness/pipeline-log.md`
- `docs/harness/handoff/round-N-gen.md`
- `docs/harness/feedback/round-N-qa.md`
- `docs/harness/gotchas/*.md` when a reusable failure is discovered
