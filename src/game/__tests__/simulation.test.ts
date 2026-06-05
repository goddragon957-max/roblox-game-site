import { describe, expect, it } from 'vitest';
import { createInitialState, getRaidPlan, nextDay, placeBlock, REWARD_OPTIONS, startRaid, tick } from '../simulation';
import { findPath } from '../pathfinding';

describe('Blockhold game logic', () => {
  it('placing wall consumes resource and updates grid', () => {
    const s = placeBlock(createInitialState(), { x: 1, z: 1 }, 'wall');
    expect(s.resources.wall).toBe(7);
    expect(s.blocks['1,1'].type).toBe('wall');
  });

  it('cannot place outside bounds, on core, spawn row, or without resource', () => {
    let s = createInitialState();
    expect(placeBlock(s, { x: -1, z: 0 }, 'wall')).toBe(s);
    expect(placeBlock(s, s.core, 'wall')).toBe(s);
    expect(placeBlock(s, { x: 1, z: 0 }, 'wall').blocks['1,0']).toBeUndefined();
    s = { ...s, resources: { ...s.resources, wall: 0 } };
    expect(placeBlock(s, { x: 1, z: 1 }, 'wall')).toBe(s);
  });

  it('BFS returns a path when open', () => {
    const s = createInitialState();
    expect(findPath(s, { x: 5, z: 0 })?.at(-1)).toEqual(s.core);
  });

  it('trap damages raider when crossed', () => {
    let s = placeBlock(createInitialState(), { x: 5, z: 1 }, 'trap');
    s = startRaid(s);
    s = tick(s);
    const damagedOrDead = s.raiders.some((r) => r.hp < r.maxHp || r.resolved);
    expect(damagedOrDead).toBe(true);
  });

  it('combat log records readable raid and kill feedback', () => {
    let s = placeBlock(createInitialState(), { x: 5, z: 1 }, 'trap');
    s = startRaid(s);
    expect(s.combatLog[0]).toContain('Raid started');
    s = tick(s);
    expect(s.combatLog.some((entry) => entry.includes('Spike trap') || entry.includes('Frost rune') || entry.includes('Bolt tower'))).toBe(true);
    expect(s.combatLog.length).toBeLessThanOrEqual(4);
  });

  it('no-path case breaches a wall instead of freezing', () => {
    let s = createInitialState();
    [{ x: 5, z: 7 }, { x: 5, z: 9 }, { x: 4, z: 8 }, { x: 6, z: 8 }].forEach((c) => {
      s = { ...s, resources: { ...s.resources, wall: 99 } };
      s = placeBlock(s, c, 'wall');
    });
    s = startRaid(s);
    const before = Object.values(s.blocks).reduce((a, b) => a + b.hp, 0);
    s = tick(s);
    const after = Object.values(s.blocks).reduce((a, b) => a + b.hp, 0);
    expect(after).toBeLessThan(before);
  });

  it('turrets can kill raiders inside their range', () => {
    let s = placeBlock(createInitialState(), { x: 3, z: 2 }, 'turret');
    s = startRaid(s);
    for (let i = 0; i < 8 && s.phase === 'raid'; i += 1) s = tick(s);
    expect(s.kills).toBeGreaterThan(0);
  });

  it('victory when all raiders are resolved and core survives', () => {
    let s = startRaid(createInitialState());
    s = { ...s, raiders: s.raiders.map((r) => ({ ...r, resolved: true })) };
    expect(tick(s).phase).toBe('victory');
  });

  it('defeat when core HP reaches 0', () => {
    let s = startRaid(createInitialState());
    s = { ...s, coreHp: 1, raiders: [{ ...s.raiders[0], cell: s.core, resolved: false }] };
    expect(tick(s).phase).toBe('defeat');
  });

  it('tracks core breaches and resets combo for raid clarity', () => {
    let s = startRaid(createInitialState());
    s = { ...s, combo: 3, raiders: [{ ...s.raiders[0], cell: s.core, resolved: false }] };
    s = tick(s);
    expect(s.coreHits).toBe(1);
    expect(s.combo).toBe(0);
    expect(s.combatLog.some((entry) => entry.includes('breached the core'))).toBe(true);
  });

  it('next day grants resources and increases raid pressure', () => {
    const s = nextDay({ ...createInitialState(), phase: 'victory' });
    expect(s.day).toBe(2);
    expect(s.resources.wall).toBeGreaterThan(8);
    expect(startRaid(s).totalRaiders).toBeGreaterThan(8);
  });

  it('clear reward choices apply distinct next-day bonuses', () => {
    const damaged = { ...createInitialState(), phase: 'victory' as const, coreHp: 50 };
    const repairReward = nextDay(damaged, 'repair');
    const turretReward = nextDay(damaged, 'turret');
    const frostReward = nextDay(damaged, 'frost');
    expect(REWARD_OPTIONS).toHaveLength(3);
    expect(turretReward.resources.turret).toBeGreaterThan(repairReward.resources.turret);
    expect(frostReward.resources.frost).toBeGreaterThan(turretReward.resources.frost);
    expect(repairReward.coreHp).toBeGreaterThan(turretReward.coreHp);
    expect(turretReward.combatLog[0]).toContain('Tower Crate');
  });

  it('raid forecast matches spawned wave and next-day rewards', () => {
    const plan = getRaidPlan(2);
    const s = startRaid({ ...createInitialState(), day: 2 });
    const spawnedMix = s.raiders.reduce(
      (mix, r) => ({ ...mix, [r.kind]: mix[r.kind] + 1 }),
      { grunt: 0, runner: 0, brute: 0 },
    );
    expect(s.totalRaiders).toBe(plan.total);
    expect(s.dangerLane).toBe(plan.dangerLane);
    expect(spawnedMix).toEqual(plan.mix);
    expect(plan.rewardPreview).toEqual({ wall: 12, trap: 8, turret: 3, frost: 3 });
    expect(nextDay({ ...createInitialState(), day: 2, phase: 'victory' }).resources.wall).toBeGreaterThan(plan.rewardPreview.wall);
  });
});
