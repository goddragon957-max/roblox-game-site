# Generator Handoff — Round 22

## Slice

Delivery streak/combo feedback for the economy loop (work-order priority 3): back-to-back worker deposits at the base now build a visible combo, rewarding the player for keeping an uninterrupted supply line instead of banking resources silently.

## What Changed

- `src/game/types.ts`
  - Added `DeliveryStreak { active, count, secondsLeft }`.
  - Added `lastDepositAt: number | null` and `deliveryStreakCount: number` to `GameState`.
- `src/game/simulation.ts`
  - Added `DELIVERY_STREAK_WINDOW = 8`, `DELIVERY_STREAK_MIN = 2`, `DELIVERY_STREAK_CELEBRATE_AT = 5`.
  - `createInitialState()` initializes the new fields (restart resets them for free).
  - `stepDeposit()` — at the exact point resources bank — increments the streak when the previous deposit landed within the window, otherwise restarts it at 1; records `lastDepositAt`; logs `배달 콤보 x5 — 보급로가 활발하게 돌아갑니다!` exactly once when the streak hits 5 (re-fires only if the streak breaks and rebuilds to 5).
  - Added pure `deliveryStreak(state)` deriving the combo chip state: active only while `status === 'playing'`, the streak is ≥ `DELIVERY_STREAK_MIN`, and the last deposit is within the window; `secondsLeft` counts down the remaining window.
- `src/store/gameStore.ts`
  - Exposed `window.__rtsSmoke.command.deliveryStreak()` for browser smoke.
- `src/components/RtsHud.tsx`
  - Added a frontier-gold `배달 콤보 xN` HUD chip (Zap icon) with `data-delivery-streak={count}`, rendered between the carrying chip and the objective chip while `deliveryStreak(sim).active`; keyed on `count` so each combo step remounts and replays the pop animation.
- `src/styles.css`
  - Added `.hud-chip.streak` (gold combo treatment reusing the `wave-clear-pop` entry animation).
- `src/game/__tests__/simulation.test.ts`
  - New `describe('delivery streak')` with 3 deterministic tests driven through the real `advance()`/`stepDeposit` path: combo builds within the window (inactive at 1, active at 2 with a positive bounded `secondsLeft`); the combo expires past the window and the next deposit restarts it at 1; the x5 log fires exactly once (not again at x6) and the chip goes quiet once the match ends.

## Commands / Verification

```bash
node -v / npm -v / npm run verify
# BLOCKED: PERMISSION_DENIED — this non-interactive session auto-denies npm/node
# commands, so harness-check, vitest, tsc, and vite build were NOT run. Do not
# treat this slice as verified.

git diff --check
# PASS: exited 0, no whitespace errors.
```

No browser smoke, screenshot, or visual QA was performed by Claude in this session. Verification claims are limited to `git diff --check` plus manual diff self-review (one JSX-comment syntax error was found in the HUD chip during that review and fixed before handoff). The scheduled evaluator must run the full gates and record the result in `docs/harness/feedback/round-22-qa.md` before this round may be called verified, committed, or pushed.

## Suggested Evaluator Smoke

1. `npm run verify` and `git diff --check`.
2. Browser: load the app, then:
   - `__rtsSmoke.command.selectWorkers()`, right-click/`smart(...)` a gold node, `advanceSeconds(30)` so all three workers cycle deposits;
   - confirm `__rtsSmoke.command.deliveryStreak()` returns `{ active: true, count: >= 2, secondsLeft: > 0 }` shortly after a deposit;
   - confirm the gold `배달 콤보 xN` chip with `data-delivery-streak` appears near the carrying chip and disappears if workers are idled for > 8s (`selectWorkers()` + `smart` to open ground, `advanceSeconds(9)`);
   - after enough consecutive deposits, the log shows `배달 콤보 x5 — 보급로가 활발하게 돌아갑니다!` once;
   - build/train/attack still work; console fatal errors: 0.

## Known Limitations / Follow-up

- The combo is feedback-only: it grants no gold bonus and does not feed `matchScore`. Wiring a small streak bonus into the score could be a future replayability slice.
- The chip remounts per combo step; if the pop animation reads as too busy at high worker counts, throttle it to milestone steps (5/10/…).
- Vite chunk-size warning (pre-existing) remains out of scope.
