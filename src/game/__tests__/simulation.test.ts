import { describe, expect, it } from 'vitest';
import { buySupply, buyUpgrade, createInitialState, getRaidPlan, nextDay, placeBlock, REWARD_OPTIONS, startRaid, SUPPLY_OPTIONS, tick, UPGRADE_OPTIONS } from '../simulation';
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

  it('no-path case breaches a wall instead of freezing and logs wall damage', () => {
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
    expect(s.combatLog.some((entry) => entry.includes('is battering wall') || entry.includes('smashed wall'))).toBe(true);
  });

  it('turrets can kill raiders inside their range', () => {
    let s = placeBlock(createInitialState(), { x: 3, z: 2 }, 'turret');
    s = startRaid(s);
    for (let i = 0; i < 8 && s.phase === 'raid'; i += 1) s = tick(s);
    expect(s.kills).toBeGreaterThan(0);
  });

  it('awards a visible bonus coin on every third uninterrupted kill combo', () => {
    const raid = startRaid(createInitialState());
    const s = tick({
      ...raid,
      coins: 0,
      kills: 0,
      combo: 0,
      totalRaiders: 4,
      blocks: {
        '4,1': { type: 'turret', hp: 2, cooldown: 0 },
        '5,2': { type: 'turret', hp: 2, cooldown: 0 },
        '6,1': { type: 'turret', hp: 2, cooldown: 0 },
      },
      raiders: [
        { ...raid.raiders[0], id: 'combo-1', cell: { x: 5, z: 1 }, hp: 1, maxHp: 1, bounty: 1, speed: 0, resolved: false },
        { ...raid.raiders[1], id: 'combo-2', cell: { x: 5, z: 1 }, hp: 1, maxHp: 1, bounty: 1, speed: 0, resolved: false },
        { ...raid.raiders[2], id: 'combo-3', cell: { x: 5, z: 1 }, hp: 1, maxHp: 1, bounty: 1, speed: 0, resolved: false },
        { ...raid.raiders[3], id: 'combo-anchor', cell: { x: 1, z: 0 }, hp: 20, maxHp: 20, bounty: 1, speed: 0, resolved: false },
      ],
    });
    expect(s.phase).toBe('raid');
    expect(s.kills).toBe(3);
    expect(s.combo).toBe(3);
    expect(s.coins).toBe(4);
    expect(s.combatLog.some((entry) => entry.includes('streak bonus +1'))).toBe(true);
  });

  it('victory when all raiders are resolved and core survives', () => {
    let s = startRaid(createInitialState());
    s = { ...s, raiders: s.raiders.map((r) => ({ ...r, resolved: true })) };
    const won = tick(s);
    expect(won.phase).toBe('victory');
    expect(won.lastClearGrade?.stars).toBe(3);
    expect(won.coins).toBe(3);
    expect(won.combatLog[0]).toContain('Flawless Hold');
  });

  it('grades messy clears lower and grants a smaller bonus', () => {
    let s = startRaid(createInitialState());
    s = { ...s, coreHp: 35, coreHits: 4, raiders: s.raiders.map((r) => ({ ...r, resolved: true })) };
    const won = tick(s);
    expect(won.phase).toBe('victory');
    expect(won.lastClearGrade).toEqual({ stars: 1, label: 'Last Stand', bonusCoins: 1 });
    expect(won.coins).toBe(1);
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

  it('build-phase coin shop converts earned coins into targeted supplies', () => {
    const s = buySupply({ ...createInitialState(), coins: 5 }, 'tower-kit');
    expect(SUPPLY_OPTIONS).toHaveLength(4);
    expect(s.coins).toBe(0);
    expect(s.resources.turret).toBe(3);
    expect(s.combatLog[0]).toContain('Purchased Tower Kit');
  });

  it('coin shop blocks purchases outside build phase or without enough coins', () => {
    const build = buySupply({ ...createInitialState(), coins: 1 }, 'wall-pack');
    const raid = buySupply({ ...createInitialState(), phase: 'raid', coins: 10 }, 'wall-pack');
    expect(build.resources.wall).toBe(8);
    expect(build.message).toContain('requires 2 coins');
    expect(raid.resources.wall).toBe(8);
  });

  it('upgrade bench spends coins on persistent kill-zone levels and enforces caps', () => {
    const upgraded = buyUpgrade({ ...createInitialState(), coins: 8 }, 'tower-damage');
    expect(UPGRADE_OPTIONS).toHaveLength(3);
    expect(upgraded.coins).toBe(4);
    expect(upgraded.upgrades.towerDamage).toBe(1);
    expect(upgraded.combatLog[0]).toContain('Upgraded Tower Bolts');

    const capped = buyUpgrade({ ...upgraded, upgrades: { ...upgraded.upgrades, towerDamage: 3 } }, 'tower-damage');
    expect(capped.upgrades.towerDamage).toBe(3);
    expect(capped.message).toContain('max level');

    const raid = buyUpgrade({ ...createInitialState(), phase: 'raid', coins: 8 }, 'trap-damage');
    expect(raid.upgrades.trapDamage).toBe(0);
  });

  it('upgrades improve tower damage and trap burst values', () => {
    const towerBase = startRaid(placeBlock(createInitialState(), { x: 3, z: 2 }, 'turret'));
    const towerUpgraded = startRaid(placeBlock({ ...createInitialState(), upgrades: { towerDamage: 2, trapDamage: 0, frostDuration: 0 } }, { x: 3, z: 2 }, 'turret'));
    const baseAfter = tick(towerBase);
    const upgradedAfter = tick(towerUpgraded);
    const baseTarget = baseAfter.raiders.find((r) => r.id === 'd1-0');
    const upgradedTarget = upgradedAfter.raiders.find((r) => r.id === 'd1-0');
    expect(upgradedTarget?.hp).toBeLessThan(baseTarget?.hp ?? 99);

    let trapState = placeBlock({ ...createInitialState(), upgrades: { towerDamage: 0, trapDamage: 1, frostDuration: 0 } }, { x: 5, z: 1 }, 'trap');
    trapState = startRaid(trapState);
    trapState = tick(trapState);
    expect(trapState.raiders.some((r) => r.resolved)).toBe(true);
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
    expect(plan.threat.label).toBe('High');
    expect(plan.threat.advice).toContain('Balanced raid');
    expect(s.message).toContain('High threat');
    expect(plan.rewardPreview).toEqual({ wall: 12, trap: 8, turret: 3, frost: 3 });
    expect(nextDay({ ...createInitialState(), day: 2, phase: 'victory' }).resources.wall).toBeGreaterThan(plan.rewardPreview.wall);
  });
});
