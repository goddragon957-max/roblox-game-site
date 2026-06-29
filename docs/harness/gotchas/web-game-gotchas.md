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

## First 3 Seconds Matter

If a user cannot tell what the product/game is within three seconds, the round is not visually verified. Prefer one strong readable focal point over scattered effects.

## Avoid Placeholder Drift

Procedural visuals are acceptable only when they read as intentional art direction. Abstract shapes, generic dashboard cards, or unlabeled effects should be treated as placeholders unless the contract explicitly allows them.

## Strict Port Preview

Use a strict, fresh preview port when performing screenshot QA. A stale Vite server on a reused port can show the wrong app and produce false confidence.

## State Markers

Expose stable smoke-test markers for browser verification, e.g. `data-ui-pass` and a small `window.__projectScene` object. These should not contain secrets.

## Interaction Gate

Every visible primary control should either mutate state or be clearly disabled. For game-like apps, at least one interaction must drive the reward/progress loop.
