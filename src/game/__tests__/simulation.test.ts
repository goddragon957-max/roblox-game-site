import { describe, expect, it } from 'vitest';
import {
  COSTS,
  FIRST_WAVE_AT,
  MISSION_SOLDIER_TARGET,
  SOLDIER_AGGRO_RANGE,
  THREAT_ALERT_DURATION,
  WAVE_INTERVAL,
  WAVE_WARNING_LEAD,
  advance,
  commandSmart,
  createInitialState,
  dist,
  idleWorkerIds,
  matchScore,
  missionHint,
  placeBuilding,
  playerUnitIdsInRect,
  selectionSummary,
  setSelection,
  threatAlert,
  towerRangePreviews,
  trainSoldier,
  waveForecast,
  waveSize
} from '../simulation';
import type { GameState } from '../types';

const TRAIN_ALL_SECONDS = 4 * 4 + 1;

function firstWorker(state: GameState) {
  const worker = state.units.find((unit) => unit.kind === 'worker' && unit.faction === 'player');
  if (!worker) throw new Error('expected a starting worker');
  return worker;
}

function enemyCamp(state: GameState) {
  const camp = state.buildings.find((building) => building.kind === 'enemyCamp');
  if (!camp) throw new Error('expected enemy camp');
  return camp;
}

function playerBase(state: GameState) {
  const base = state.buildings.find((building) => building.kind === 'base' && building.faction === 'player');
  if (!base) throw new Error('expected player base');
  return base;
}

describe('initial state', () => {
  it('spawns an RTS opening: base, workers, enemy camp, gold and wood nodes', () => {
    const state = createInitialState();
    expect(state.status).toBe('playing');
    expect(playerBase(state).hp).toBeGreaterThan(0);
    expect(enemyCamp(state).faction).toBe('enemy');
    expect(state.units.filter((unit) => unit.kind === 'worker').length).toBeGreaterThanOrEqual(2);
    expect(state.resources.some((node) => node.type === 'gold')).toBe(true);
    expect(state.resources.some((node) => node.type === 'wood')).toBe(true);
  });
});

describe('selection and movement', () => {
  it('selects a worker and moves it with a smart ground command', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    setSelection(state, [worker.id]);
    expect(state.selectedIds).toEqual([worker.id]);

    const target = { x: worker.pos.x + 5, z: worker.pos.z - 4 };
    commandSmart(state, state.selectedIds, { point: target, entityId: null });
    expect(worker.order.type).toBe('move');

    advance(state, 6);
    expect(dist(worker.pos, target)).toBeLessThan(0.3);
    expect(worker.order.type).toBe('idle');
  });

  it('ignores commands issued to enemy units', () => {
    const state = createInitialState();
    const raider = state.units.find((unit) => unit.kind === 'raider');
    if (!raider) throw new Error('expected raider');
    commandSmart(state, [raider.id], { point: { x: 0, z: 0 }, entityId: null });
    expect(raider.order.type).toBe('idle');
  });

  it('summarizes mixed selections by kind with aggregate HP', () => {
    const state = createInitialState();
    const workers = state.units.filter((unit) => unit.kind === 'worker' && unit.faction === 'player');
    const base = playerBase(state);
    workers[0].hp = 21;
    base.hp = 455;

    setSelection(state, [...workers.map((unit) => unit.id), base.id]);
    const summary = selectionSummary(state);

    expect(summary.count).toBe(workers.length + 1);
    expect(summary.hp).toBe(21 + 40 + 40 + 455);
    expect(summary.maxHp).toBe(40 * workers.length + 500);
    expect(summary.groups).toEqual([
      { kind: 'worker', count: workers.length, hp: 21 + 40 + 40, maxHp: 40 * workers.length },
      { kind: 'base', count: 1, hp: 455, maxHp: 500 }
    ]);
  });
});

describe('economy', () => {
  it('gathers gold with a worker and deposits it at the base', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    const goldNode = state.resources.find((node) => node.type === 'gold');
    if (!goldNode) throw new Error('expected gold node');
    const goldBefore = state.gold;

    commandSmart(state, [worker.id], { point: { ...goldNode.pos }, entityId: goldNode.id });
    expect(worker.order.type).toBe('gather');

    advance(state, 20);
    expect(state.gold).toBeGreaterThan(goldBefore);
    expect(goldNode.amountLeft).toBeLessThan(goldNode.maxAmount);
  });

  it('gathers wood the same way', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    const woodNode = state.resources.find((node) => node.type === 'wood');
    if (!woodNode) throw new Error('expected wood node');
    const woodBefore = state.wood;

    commandSmart(state, [worker.id], { point: { ...woodNode.pos }, entityId: woodNode.id });
    advance(state, 20);
    expect(state.wood).toBeGreaterThan(woodBefore);
  });
});

describe('build and production', () => {
  it('builds a barracks, subtracts resources, and trains a soldier over time', () => {
    const state = createInitialState();
    const goldBefore = state.gold;
    const woodBefore = state.wood;

    const barracks = placeBuilding(state, 'barracks');
    expect(barracks).not.toBeNull();
    expect(state.gold).toBe(goldBefore - COSTS.barracks.gold);
    expect(state.wood).toBe(woodBefore - COSTS.barracks.wood);

    state.gold = COSTS.soldier.gold;
    expect(trainSoldier(state)).toBe(true);
    expect(state.gold).toBe(0);

    const soldiersBefore = state.units.filter((unit) => unit.kind === 'soldier').length;
    advance(state, 5);
    const soldiersAfter = state.units.filter((unit) => unit.kind === 'soldier').length;
    expect(soldiersAfter).toBe(soldiersBefore + 1);
  });

  it('refuses to build or train without enough resources', () => {
    const state = createInitialState();
    state.gold = 0;
    state.wood = 0;
    expect(placeBuilding(state, 'tower')).toBeNull();
    expect(trainSoldier(state)).toBe(false);
    expect(state.gold).toBe(0);
    expect(state.wood).toBe(0);
  });
});

describe('combat and win/loss', () => {
  it('lets soldiers destroy the enemy camp and win', () => {
    const state = createInitialState();
    // Clear camp guards so the test isolates camp destruction.
    state.units = state.units.filter((unit) => unit.faction !== 'enemy');
    const camp = enemyCamp(state);

    state.gold = 1000;
    state.wood = 1000;
    const barracks = placeBuilding(state, 'barracks');
    expect(barracks).not.toBeNull();
    for (let i = 0; i < 4; i += 1) expect(trainSoldier(state)).toBe(true);
    advance(state, TRAIN_ALL_SECONDS);

    const soldiers = state.units.filter((unit) => unit.kind === 'soldier');
    expect(soldiers.length).toBe(4);
    const campHpBefore = camp.hp;
    commandSmart(
      state,
      soldiers.map((unit) => unit.id),
      { point: { ...camp.pos }, entityId: camp.id }
    );

    advance(state, 10);
    expect(camp.hp).toBeLessThan(campHpBefore);

    advance(state, 60);
    expect(state.status).toBe('won');
    expect(state.buildings.some((building) => building.kind === 'enemyCamp')).toBe(false);
  });

  it('loses when raiders destroy the player base', () => {
    const state = createInitialState();
    const base = playerBase(state);
    base.hp = 30;
    // Remove workers so nothing distracts the assault.
    state.units = state.units.filter((unit) => unit.faction !== 'player');
    for (const raider of state.units) {
      raider.pos = { x: base.pos.x + 3, z: base.pos.z };
      raider.order = { type: 'assault' };
    }

    advance(state, 30);
    expect(state.status).toBe('lost');
    expect(state.buildings.some((building) => building.kind === 'base')).toBe(false);
  });

  it('delays the first wave and keeps it small so the opening is survivable', () => {
    const state = createInitialState();
    const raidersBefore = state.units.filter((unit) => unit.kind === 'raider').length;

    advance(state, FIRST_WAVE_AT - 1);
    expect(state.waveNumber).toBe(0);

    advance(state, 2);
    expect(state.waveNumber).toBe(1);
    const raidersAfter = state.units.filter((unit) => unit.kind === 'raider').length;
    expect(raidersAfter).toBe(raidersBefore + waveSize(1));
    expect(waveSize(1)).toBe(1);
  });

  it('warns in the log with the incoming raider count before a wave arrives', () => {
    const state = createInitialState();
    advance(state, FIRST_WAVE_AT - WAVE_WARNING_LEAD + 1);
    expect(state.waveNumber).toBe(0);
    expect(state.log.some((entry) => entry.text.includes(`라쿤 습격대 ${waveSize(1)}기가 다가옵니다`))).toBe(true);
  });

  it('scales later waves up to the cap', () => {
    expect(waveSize(2)).toBe(2);
    expect(waveSize(4)).toBe(3);
    expect(waveSize(20)).toBe(5);
  });
});

describe('soldier auto-defense', () => {
  function stateWithSoldier() {
    const state = createInitialState();
    state.gold = 1000;
    state.wood = 1000;
    expect(placeBuilding(state, 'barracks')).not.toBeNull();
    expect(trainSoldier(state)).toBe(true);
    advance(state, 5);
    const soldier = state.units.find((unit) => unit.kind === 'soldier' && unit.faction === 'player');
    if (!soldier) throw new Error('expected trained soldier');
    expect(soldier.order.type).toBe('idle');
    return { state, soldier };
  }

  it('engages a raider that enters aggro range and returns to idle after the kill', () => {
    const { state, soldier } = stateWithSoldier();
    const raider = state.units.find((unit) => unit.kind === 'raider');
    if (!raider) throw new Error('expected raider');
    raider.pos = { x: soldier.pos.x + SOLDIER_AGGRO_RANGE - 1, z: soldier.pos.z };
    raider.order = { type: 'idle' };

    advance(state, 0.1);
    expect(soldier.order).toEqual({ type: 'attack', targetId: raider.id });

    advance(state, 12);
    expect(state.units.some((unit) => unit.id === raider.id)).toBe(false);
    expect(state.stats.raidersDefeated).toBeGreaterThanOrEqual(1);
    expect(soldier.order.type).toBe('idle');
  });

  it('protects the base from the first assault wave without an explicit attack command', () => {
    const { state, soldier } = stateWithSoldier();
    const defeatedBefore = state.stats.raidersDefeated;

    advance(state, FIRST_WAVE_AT + 25);

    expect(state.status).toBe('playing');
    expect(state.stats.raidersDefeated).toBeGreaterThan(defeatedBefore);
    expect(state.units.some((unit) => unit.id === soldier.id)).toBe(true);
  });

  it('stays idle while every enemy is beyond aggro range', () => {
    const { state, soldier } = stateWithSoldier();
    for (const raider of state.units.filter((unit) => unit.faction === 'enemy')) {
      raider.pos = { x: soldier.pos.x + SOLDIER_AGGRO_RANGE + 2, z: soldier.pos.z };
      raider.order = { type: 'idle' };
    }
    const posBefore = { ...soldier.pos };

    advance(state, 1);
    expect(soldier.order.type).toBe('idle');
    expect(soldier.pos).toEqual(posBefore);
  });

  it('never makes idle workers auto-engage nearby raiders', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    const raider = state.units.find((unit) => unit.kind === 'raider');
    if (!raider) throw new Error('expected raider');
    raider.pos = { x: worker.pos.x + 2, z: worker.pos.z };
    raider.order = { type: 'idle' };

    advance(state, 1);
    expect(worker.order.type).toBe('idle');
    expect(raider.hp).toBe(raider.maxHp);
  });
});

describe('wave forecast', () => {
  it('previews the first wave size and countdown from the start', () => {
    const state = createInitialState();
    expect(waveForecast(state)).toEqual({
      waveNumber: 1,
      size: waveSize(1),
      secondsLeft: FIRST_WAVE_AT,
      imminent: false
    });
  });

  it('turns imminent inside the warning window', () => {
    const state = createInitialState();
    advance(state, FIRST_WAVE_AT - WAVE_WARNING_LEAD + 1);
    const forecast = waveForecast(state);
    expect(forecast.imminent).toBe(true);
    expect(forecast.secondsLeft).toBeLessThanOrEqual(WAVE_WARNING_LEAD);
  });

  it('rolls over to the next wave after one spawns', () => {
    const state = createInitialState();
    advance(state, FIRST_WAVE_AT + 1);
    expect(state.waveNumber).toBe(1);
    const forecast = waveForecast(state);
    expect(forecast.waveNumber).toBe(2);
    expect(forecast.size).toBe(waveSize(2));
    expect(forecast.secondsLeft).toBeLessThanOrEqual(WAVE_INTERVAL);
    expect(forecast.imminent).toBe(false);
  });
});

describe('threat alert', () => {
  function stateWithRaidersAtBase() {
    const state = createInitialState();
    const base = playerBase(state);
    // Remove player units so raiders hit the base itself.
    state.units = state.units.filter((unit) => unit.faction !== 'player');
    for (const raider of state.units) {
      raider.pos = { x: base.pos.x + 1, z: base.pos.z };
      raider.order = { type: 'attack', targetId: base.id };
    }
    return { state, base };
  }

  it('stays inactive until something of the player takes damage', () => {
    const state = createInitialState();
    expect(threatAlert(state)).toEqual({ active: false, pos: null, secondsAgo: null });

    advance(state, 5);
    expect(threatAlert(state).active).toBe(false);
  });

  it('activates at the hit position when raiders damage the base', () => {
    const { state, base } = stateWithRaidersAtBase();
    advance(state, 2);

    expect(base.hp).toBeLessThan(base.maxHp);
    const alert = threatAlert(state);
    expect(alert.active).toBe(true);
    expect(alert.pos).toEqual(base.pos);
    expect(alert.secondsAgo).toBeLessThanOrEqual(THREAT_ALERT_DURATION);
    expect(state.log.some((entry) => entry.text.includes('본부가 공격받고 있습니다'))).toBe(true);
  });

  it('logs one warning per attack episode, not one per hit', () => {
    const { state } = stateWithRaidersAtBase();
    advance(state, 10);

    const warnings = state.log.filter((entry) => entry.text.includes('공격받고 있습니다'));
    expect(warnings.length).toBe(1);
  });

  it('expires once the damage stops', () => {
    const { state } = stateWithRaidersAtBase();
    advance(state, 2);
    expect(threatAlert(state).active).toBe(true);

    for (const raider of state.units) raider.hp = 0;
    advance(state, THREAT_ALERT_DURATION + 1);

    const alert = threatAlert(state);
    expect(alert.active).toBe(false);
    expect(alert.pos).not.toBeNull();
  });
});

describe('drag selection', () => {
  it('finds player units inside the box in either corner order', () => {
    const state = createInitialState();
    const workers = state.units.filter((unit) => unit.kind === 'worker' && unit.faction === 'player');

    const ids = playerUnitIdsInRect(state, { x: -16, z: 14 }, { x: -11, z: 9 });
    expect(new Set(ids)).toEqual(new Set(workers.map((unit) => unit.id)));

    const flipped = playerUnitIdsInRect(state, { x: -11, z: 9 }, { x: -16, z: 14 });
    expect(flipped).toEqual(ids);
  });

  it('excludes enemy units even when the box covers them', () => {
    const state = createInitialState();
    const raiders = state.units.filter((unit) => unit.kind === 'raider');
    expect(raiders.length).toBeGreaterThan(0);
    expect(playerUnitIdsInRect(state, { x: 12, z: -12 }, { x: 20, z: -8 })).toEqual([]);
  });

  it('feeds setSelection so a drag becomes a real multi-unit selection', () => {
    const state = createInitialState();
    const ids = playerUnitIdsInRect(state, { x: -16, z: 9 }, { x: -11, z: 14 });
    expect(ids.length).toBe(3);

    setSelection(state, ids);
    expect(state.selectedIds).toEqual(ids);
    expect(selectionSummary(state).groups).toEqual([{ kind: 'worker', count: 3, hp: 120, maxHp: 120 }]);

    setSelection(state, playerUnitIdsInRect(state, { x: 5, z: 5 }, { x: 8, z: 8 }));
    expect(state.selectedIds).toEqual([]);
  });
});

describe('idle worker alert', () => {
  it('flags every starting worker as idle and drops one once it gathers', () => {
    const state = createInitialState();
    const workers = state.units.filter((unit) => unit.kind === 'worker' && unit.faction === 'player');
    expect(new Set(idleWorkerIds(state))).toEqual(new Set(workers.map((unit) => unit.id)));

    const goldNode = state.resources.find((node) => node.type === 'gold');
    if (!goldNode) throw new Error('expected gold node');
    commandSmart(state, [workers[0].id], { point: { ...goldNode.pos }, entityId: goldNode.id });

    const idle = idleWorkerIds(state);
    expect(idle).not.toContain(workers[0].id);
    expect(idle).toHaveLength(workers.length - 1);
  });

  it('never lists soldiers or enemy units even when they are idle', () => {
    const state = createInitialState();
    state.gold = 1000;
    state.wood = 1000;
    expect(placeBuilding(state, 'barracks')).not.toBeNull();
    expect(trainSoldier(state)).toBe(true);
    advance(state, 5);

    const soldier = state.units.find((unit) => unit.kind === 'soldier');
    const raider = state.units.find((unit) => unit.kind === 'raider');
    if (!soldier || !raider) throw new Error('expected soldier and raider');
    expect(soldier.order.type).toBe('idle');
    expect(raider.order.type).toBe('idle');

    const idle = idleWorkerIds(state);
    expect(idle).not.toContain(soldier.id);
    expect(idle).not.toContain(raider.id);
  });

  it('re-lists a worker when its job ends and feeds a real selection', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    commandSmart(state, [worker.id], { point: { x: worker.pos.x + 3, z: worker.pos.z }, entityId: null });
    expect(idleWorkerIds(state)).not.toContain(worker.id);

    advance(state, 5);
    expect(worker.order.type).toBe('idle');
    expect(idleWorkerIds(state)).toContain(worker.id);

    setSelection(state, idleWorkerIds(state));
    expect(state.selectedIds).toEqual(idleWorkerIds(state));
    expect(state.selectedIds.length).toBeGreaterThan(0);
  });
});

describe('tower range preview', () => {
  function stateWithTower() {
    const state = createInitialState();
    state.gold = 1000;
    state.wood = 1000;
    const tower = placeBuilding(state, 'tower');
    if (!tower) throw new Error('expected tower placement to succeed');
    return { state, tower };
  }

  it('is empty when nothing or only non-attacking entities are selected', () => {
    const state = createInitialState();
    expect(towerRangePreviews(state)).toEqual([]);

    setSelection(state, [playerBase(state).id, firstWorker(state).id, enemyCamp(state).id]);
    expect(towerRangePreviews(state)).toEqual([]);
  });

  it('previews the selected tower at its position with its real attack radius', () => {
    const { state, tower } = stateWithTower();
    setSelection(state, [tower.id]);

    expect(towerRangePreviews(state)).toEqual([{ id: tower.id, pos: tower.pos, radius: tower.attackRange }]);
    expect(tower.attackRange).toBeGreaterThan(0);
  });

  it('keeps only towers from a mixed selection and clears when the tower falls', () => {
    const { state, tower } = stateWithTower();
    setSelection(state, [tower.id, playerBase(state).id, firstWorker(state).id]);

    const previews = towerRangePreviews(state);
    expect(previews).toHaveLength(1);
    expect(previews[0].id).toBe(tower.id);

    tower.hp = 0;
    advance(state, 0.1);
    expect(towerRangePreviews(state)).toEqual([]);
  });
});

describe('match summary stats', () => {
  it('tracks gathered gold through base deposits', () => {
    const state = createInitialState();
    const worker = firstWorker(state);
    const goldNode = state.resources.find((node) => node.type === 'gold');
    if (!goldNode) throw new Error('expected gold node');
    const goldBefore = state.gold;

    commandSmart(state, [worker.id], { point: { ...goldNode.pos }, entityId: goldNode.id });
    advance(state, 20);

    expect(state.stats.goldGathered).toBeGreaterThan(0);
    expect(state.stats.goldGathered).toBe(state.gold - goldBefore);
    expect(state.stats.woodGathered).toBe(0);
  });

  it('counts soldiers as they finish training', () => {
    const state = createInitialState();
    state.gold = 1000;
    state.wood = 1000;
    expect(placeBuilding(state, 'barracks')).not.toBeNull();
    expect(trainSoldier(state)).toBe(true);
    expect(state.stats.soldiersTrained).toBe(0);

    advance(state, 5);
    expect(state.stats.soldiersTrained).toBe(1);
  });

  it('counts defeated raiders and lost player units', () => {
    const state = createInitialState();
    const raider = state.units.find((unit) => unit.kind === 'raider');
    const worker = firstWorker(state);
    if (!raider) throw new Error('expected raider');

    raider.hp = 0;
    worker.hp = 0;
    advance(state, 0.1);

    expect(state.stats.raidersDefeated).toBe(1);
    expect(state.stats.unitsLost).toBe(1);
    expect(state.units.some((unit) => unit.id === raider.id)).toBe(false);
    expect(state.units.some((unit) => unit.id === worker.id)).toBe(false);
  });
});

describe('match score rating', () => {
  it('rates an untouched run as zero with the lowest grade', () => {
    const state = createInitialState();
    expect(matchScore(state)).toEqual({ score: 0, grade: 'C' });
  });

  it('rewards wins with a speed bonus so faster wins outscore slower ones', () => {
    const state = createInitialState();
    state.stats = { goldGathered: 200, woodGathered: 100, soldiersTrained: 3, raidersDefeated: 4, unitsLost: 1 };

    state.status = 'lost';
    const lost = matchScore(state);

    state.status = 'won';
    state.time = 120;
    const fastWin = matchScore(state);
    state.time = 400;
    const slowWin = matchScore(state);

    expect(fastWin.score).toBeGreaterThan(slowWin.score);
    expect(slowWin.score).toBeGreaterThan(lost.score);
    expect(fastWin.grade).toBe('S');
    expect(lost.grade).toBe('B');
  });

  it('penalizes lost units without dropping the score below zero', () => {
    const state = createInitialState();
    state.stats.goldGathered = 50;
    state.stats.unitsLost = 1;
    const light = matchScore(state);
    expect(light.score).toBe(20);

    state.stats.unitsLost = 50;
    const heavy = matchScore(state);
    expect(heavy.score).toBe(0);
    expect(heavy.grade).toBe('C');
  });
});

describe('mission onboarding', () => {
  it('advances mission hints as the player progresses the core loop', () => {
    const state = createInitialState();
    expect(missionHint(state).step).toBe(1);

    const worker = firstWorker(state);
    const goldNode = state.resources.find((node) => node.type === 'gold');
    if (!goldNode) throw new Error('expected gold node');
    commandSmart(state, [worker.id], { point: { ...goldNode.pos }, entityId: goldNode.id });
    expect(missionHint(state).step).toBe(2);

    expect(placeBuilding(state, 'barracks')).not.toBeNull();
    expect(missionHint(state).step).toBe(3);

    state.gold = COSTS.soldier.gold * MISSION_SOLDIER_TARGET;
    for (let i = 0; i < MISSION_SOLDIER_TARGET; i += 1) expect(trainSoldier(state)).toBe(true);
    advance(state, TRAIN_ALL_SECONDS);
    expect(missionHint(state).step).toBe(4);
  });
});
