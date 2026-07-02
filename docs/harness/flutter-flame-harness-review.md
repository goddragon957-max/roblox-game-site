# Flutter/Flame Harness Review — GeekNews 30918

Source:

- GeekNews: <https://news.hada.io/topic?id=30918>
- GitHub: <https://github.com/tjdrhs90/flutter-flame-harness>
- Reviewed commit: `4f25f5d`
- Reviewed version: `0.15.0`
- Review time UTC: `2026-07-02T07:18:47Z`

## Summary

`flutter-flame-harness` is valuable because it delegates the **process**, not just the code. It turns game creation into a gated pipeline:

```text
idea
→ research
→ plan
→ design
→ completion contract
→ generator/evaluator loop
→ run/play QA
→ human approval
→ AdMob/build/screenshots/submit
→ retro
```

For Orbit Bloom and future game-like projects, the key lesson is not Flutter or Flame. The key lesson is the harness discipline: **contract first, generate second, verify by running, then record the result.**

## Adopted Patterns

1. **Contract before code**
   - Do not let a generator start from a vague prompt.
   - Define hard gates and observable functional criteria first.

2. **Generator/evaluator split**
   - Generator implements the smallest slice.
   - Evaluator is skeptical and never passes by code review alone.

3. **File handoff protocol**
   - Generator writes `docs/harness/handoff/round-N-gen.md`.
   - Evaluator writes `docs/harness/feedback/round-N-qa.md`.
   - Orchestrator updates `docs/harness/state.md` and `docs/harness/pipeline-log.md`.

4. **Run the app, then judge**
   - Build/test success is not enough.
   - Browser/app must be loaded and interacted with.
   - Screenshots are required for visual pass/fail.

5. **Gotcha database**
   - Capture recurring failures in `docs/harness/gotchas/` so later agents do not rediscover them.

6. **Human approval gate**
   - Major direction changes, external deploys, destructive rewrites, store submission, and paid/real-user-impacting changes pause for human approval.

7. **Retro after loop**
   - After a meaningful pass/fail cycle, update gotchas and the next contract instead of treating the run as a one-off.

## Not Adopted Directly

The reference is optimized for Flutter/Flame 2D mobile store games. Orbit Bloom is currently a Vite/React/Three.js mobile-web game-like focus app, so these are not adopted as-is:

- Flutter/Flame project generation.
- AdMob/store submission pipeline before a strong visual/playable slice exists.
- Code-drawn placeholder visuals as acceptable final quality.
- 2D casual-game assumptions.

## Orbit Bloom-Specific Adjustment

The user values strong 3D/systemic/voxel/sandbox/game-like first impressions. For this repo, the harness therefore adds a stricter visual policy:

```text
reference-first
asset/style-first
visual-first
first 3 seconds must read clearly
screenshot evidence required
procedural visuals must look intentional, not placeholder
```

## Immediate Next Project Goal

Round 2 should not add more features first. It should fix the visual/product gate:

```text
Make Orbit Bloom's first screen unmistakably read as a premium cosmic focus/reward game-like app.
```

The generator must make the focal planet/world/reward loop visible in the first screenshot, then hand off to evaluator/visual QA.
