import { describe, expect, it } from 'vitest';
import { createInitialFocusState, addFocusBurst, tickFocus, completeBirth } from '../progression';

describe('orbit bloom focus progression', () => {
  it('starts with a seeded Saturn-like planet and no active focus session', () => {
    const state = createInitialFocusState();

    expect(state.currentPlanet.name).toBe('토성');
    expect(state.progress).toBe(0);
    expect(state.isFocusing).toBe(false);
    expect(state.galaxy.length).toBe(3);
  });

  it('adds focus bursts without exceeding completion', () => {
    const state = createInitialFocusState();

    const next = addFocusBurst(state, 0.35);

    expect(next.progress).toBeCloseTo(0.35);
    expect(next.energy).toBeGreaterThan(state.energy);
    expect(next.minutes).toBeGreaterThan(state.minutes);
  });

  it('ticks active focus time toward birth completion', () => {
    const state = { ...createInitialFocusState(), isFocusing: true };

    const next = tickFocus(state, 10);

    expect(next.progress).toBeGreaterThan(state.progress);
    expect(next.isFocusing).toBe(true);
  });

  it('births the next planet and appends it to the galaxy', () => {
    const state = { ...createInitialFocusState(), progress: 1 };

    const next = completeBirth(state);

    expect(next.progress).toBe(0);
    expect(next.births).toBe(state.births + 1);
    expect(next.galaxy).toHaveLength(state.galaxy.length + 1);
    expect(next.currentPlanet.name).not.toBe(state.currentPlanet.name);
  });
});
