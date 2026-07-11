import { describe, expect, it } from 'vitest';
import {
  COSTS,
  FIRST_WAVE_AT,
  MISSION_SOLDIER_TARGET,
  WAVE_INTERVAL,
  WAVE_WARNING_LEAD,
  advance,
  commandSmart,
  createInitialState,
  dist,
  matchScore,
  missionHint,
  placeBuilding,
  setSelection,
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
