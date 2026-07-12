# Puppy Frontier RTS Design Brief

## Design Priority

The user explicitly asked: **디자인도 신경써줘** — design quality is not optional polish. Every autonomous slice should improve or preserve the first-screen game impression, not just add a hidden state hook or another HUD counter.

## Product Read

Within 3 seconds, the screen should read as:

```text
cute low-poly puppy frontier RTS: cozy player base, readable puppy workers/soldiers, clear resources, raccoon threat, compact tactical HUD, minimap, and visible world feedback.
```

The game must never feel like a SaaS dashboard laid over a canvas.

## Visual Identity

- **Tone:** cute, tactical, cozy frontier, toy-diorama RTS.
- **Player fantasy:** puppy workers build and defend a small frontier outpost.
- **Enemy fantasy:** raccoon raiders are readable threats, not abstract dots.
- **Camera:** fullscreen isometric battlefield first; HUD overlays are compact and secondary.
- **Color system:** frontier green + warm gold as primary accents; danger red/orange only for threats; avoid random hardcoded accent colors in components.
- **Shapes/materials:** rounded low-poly forms, chunky readable silhouettes, soft shadows, terrain landmarks, and clear faction colors.
- **Typography/HUD:** compact game HUD chips/panels, 44px+ buttons, strong hierarchy, Korean copy short enough to scan while playing.

## Default Slice Quality Bar

A slice is not “done” unless it answers at least one of these:

1. What does the player see immediately that became more game-like?
2. What world/camera/HUD detail became clearer or prettier?
3. What feedback connects a command to a visible battlefield result?
4. What screenshot evidence proves the game still looks desirable?

If a slice is mostly simulation/test work, pair it with a small visible affordance or explicitly document why no visible change was safe.

## Preferred Future Design Slices

Prefer these when choosing new autonomous go-mode work:

1. **World richness:** denser low-poly frontier props, terrain landmarks, paths, flags, fences, camp details, resource-cluster silhouettes.
2. **Character readability:** puppy worker/soldier silhouettes, carried-resource props, soldier equipment, raccoon masks, stronger scale separation.
3. **Battle feedback:** readable projectiles, hit flashes, damage reactions, wave-clear celebration, base-under-siege visuals.
4. **Economy feedback:** deposit streak/combo, node depletion/regrowth visuals, worker route clarity, storage/stockpile cues.
5. **HUD integration:** fewer dashboard slabs, more compact RTS overlays, better minimap icons, short Korean labels, clearer disabled/active states.
6. **Camera/composition:** first-screen framing that shows base/resources/enemy direction without hiding the battlefield.

## Hard Rejection Patterns

Reject or revise work that:

- adds functional text without visible battlefield feedback;
- makes HUD panels bigger while the world becomes secondary;
- uses generic web-dashboard cards as the main impression;
- leaves units/resources/enemies tiny or unreadable;
- claims visual PASS without browser-rendered screenshot/vision evidence;
- introduces copied third-party assets or inconsistent art styles.

## Verification Notes

For every visual/behavior slice:

- run deterministic gates (`npm run verify`, `git diff --check`);
- run browser smoke from `VERIFY.md`;
- capture/inspect rendered output with the first-3-seconds scorecard;
- score game feel honestly: genre read, character read, enemy/threat read, stage/world read, HUD read, screenshot desirability.
