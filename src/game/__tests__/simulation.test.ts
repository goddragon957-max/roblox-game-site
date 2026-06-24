import { describe, expect, it } from 'vitest';
import { createInitialState, startGame, stepGame } from '../simulation';
import type { InputState } from '../types';

const idle: InputState = { left: false, right: false, jump: false, attack: false };

describe('Moonleaf Trail action RPG slice', () => {
  it('starts with a readable first quest and three enemies', () => {
    const state = createInitialState();
    expect(state.status).toBe('ready');
    expect(state.quest.target).toBe(3);
    expect(state.enemies).toHaveLength(3);
    expect(state.hero.hp).toBe(state.hero.maxHp);
  });

  it('moves the hero with directional input', () => {
    const state = startGame(createInitialState());
    const next = stepGame(state, { ...idle, right: true }, 0.1);
    expect(next.hero.x).toBeGreaterThan(state.hero.x);
    expect(next.status).toBe('playing');
  });

  it('damages an enemy with an attack in range', () => {
    const state = startGame(createInitialState());
    const enemy = state.enemies[0];
    const close = {
      ...state,
      hero: { ...state.hero, x: enemy.x - 54, y: enemy.y, onGround: true, facing: 'right' as const },
    };
    const next = stepGame(close, { ...idle, attack: true }, 0.016);
    expect(next.enemies[0].hp).toBeLessThan(enemy.hp);
    expect(next.floatingTexts.some((text) => text.text.startsWith('-'))).toBe(true);
  });

  it('can win after defeating the objective enemies', () => {
    let state = startGame(createInitialState());
    for (const enemy of state.enemies) {
      state = {
        ...state,
        hero: { ...state.hero, x: enemy.x - 54, y: enemy.y, onGround: true, facing: 'right', mp: 999 },
        enemies: state.enemies.map((candidate) => (candidate.id === enemy.id ? { ...candidate, hp: 1 } : candidate)),
      };
      state = stepGame(state, { ...idle, attack: true }, 0.016);
      state = { ...state, hero: { ...state.hero, attackCooldownUntil: 0 } };
    }
    expect(state.status).toBe('won');
    expect(state.quest.defeated).toBe(3);
  });
});
