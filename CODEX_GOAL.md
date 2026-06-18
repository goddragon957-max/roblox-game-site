# CODEX GOAL — StyleSeed Game UI/UX Pass

Repo: `/home/sy/projects/roblox-game-site`

User request: apply StyleSeed (`https://github.com/bitjaru/styleseed`, `https://styleseed-demo.vercel.app/llms.txt`) and rework the game UI/UX so Blockhold Siege looks more like an intentional playable Roblox-style voxel tower-defense screen instead of a crowded AI dashboard.

## Must preserve

- Existing gameplay direction: build phase → place blocks → start raid → survive/reward/progression.
- Existing Zustand/simulation logic unless a tiny presentational helper is necessary.
- Existing uncommitted StyleSeed docs in `AGENT.md` and `README.md`; do not revert them.
- No backend, accounts, multiplayer, or large rewrite.
- Do not commit or push; Hermes will verify and commit after review.

## StyleSeed interpretation

Use StyleSeed as design judgment, not a generic demo. Read/apply the `llms.txt` principles manually:

- Linear/Vercel-like dark tactical game HUD aesthetic.
- One main accent system: cyan/teal. Danger/warning/health can be semantic exceptions only.
- Keep content inside restrained surfaces/cards.
- Reduce random gradients/glass; use crisp hierarchy, spacing, radius, subtle shadow, clear selected/disabled states.
- Avoid pure black; use semantic CSS variables for UI colors where feasible.
- Make touch targets at least 44px.
- Real game state must remain wired: Start Raid, Pause/Resume, reward choice, build palette, coin shop, upgrades.

## Visible UX goals

1. Board first: central Babylon board should feel framed and playable, not crushed by huge text panels.
2. Compact command HUD: replace oversized hero title/crowded dashboard feel with a game command panel and stat chips.
3. Better hierarchy: keep only the most important build objective and primary action above the fold; secondary forecast/coach/log cards can be compact scroll sections.
4. Build panel polish: keep selected block, resources, shop, and upgrades readable with coherent card/button states.
5. Phase feedback: build/raid/victory/defeat should have clear surface treatment; raid progress and breach alert should be easy to scan.
6. Mobile/responsive: panels should not fully hide the game; use compact scrollable regions.

## Suggested implementation scope

- Update `src/App.tsx` if needed to give the canvas-first shell a clearer layout marker.
- Rework `src/components/Hud.tsx` markup/classes for compact game HUD hierarchy.
- Rework `src/components/BuildPalette.tsx` markup/classes for StyleSeed card/buttons and resource counts.
- Rewrite/clean `src/styles.css` with tokens and coherent panel system.
- Optionally improve `BlockholdScene.tsx` camera/board framing slightly if obvious, but avoid a large render rewrite.

## Required verification

Run and pass:

```bash
npm run test
npm run lint
npm run build
```

Also run a local browser smoke test if possible:

- page loads with no console errors;
- StyleSeed pass marker/title/hud visible;
- Start Raid click changes phase/HUD;
- core gameplay controls remain clickable.
