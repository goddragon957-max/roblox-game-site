import { describe, expect, it } from 'vitest';
import {
  applyTool,
  brushComboTier,
  createInitialPlanetState,
  getLogs,
  OBJECTIVE_COUNT,
  planetGuardianSignal,
  planetLifeSignal,
  planetObjective,
  planetTotals,
  planetWeather,
  selectTool,
  tickPlanet,
  triggerMeteor
} from '../planetSim';

describe('planet forge simulation', () => {
  it('starts as a living primitive planet with deterministic cells', () => {
    const state = createInitialPlanetState();
    const totals = planetTotals(state);

    expect(state.cells).toHaveLength(132);
    expect(totals.ocean).toBeGreaterThan(0);
    expect(totals.forest).toBeGreaterThan(0);
    expect(totals.crystal).toBeGreaterThan(0);
    expect(totals.habitability).toBeGreaterThan(20);
    expect(totals.craters).toBe(0);
    expect(state.brushStreak).toBe(0);
    expect(getLogs(state)[0].text).toContain('원시 행성');
  });

  it('paints a clicked surface with the selected terraforming tool', () => {
    let state = createInitialPlanetState();
    const target = state.cells.find((cell) => cell.biome === 'barren');
    expect(target).toBeTruthy();

    state = selectTool(state, 'water');
    state = applyTool({ ...state, selectedCellId: target!.id });

    const painted = state.cells.find((cell) => cell.id === target!.id);
    expect(painted?.biome).toBe('ocean');
    expect(painted?.pulse).toBe(1);
    expect(painted?.scar).toBe('none');
    expect(state.water).toBeGreaterThan(26);
    expect(state.energy).toBeLessThan(88);
  });

  it('tracks brush streaks when multiple cells are painted quickly', () => {
    let state = createInitialPlanetState();
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 3);

    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }

    expect(state.brushStreak).toBe(3);
    expect(getLogs(state)[0].text).toContain('브러시 3연속');
  });

  it('uses forest and settlement tools to increase living planet score', () => {
    let state = createInitialPlanetState();
    const before = planetTotals(state).habitability;
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 2);

    state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: targets[0].id }, 'forest', targets[0].id);
    state = applyTool({ ...state, selectedTool: 'settlement', selectedCellId: targets[1].id }, 'settlement', targets[1].id);

    expect(planetTotals(state).settlement).toBeGreaterThan(0);
    expect(planetTotals(state).habitability).toBeGreaterThan(before);
    expect(state.population).toBeGreaterThan(12);
  });

  it('blocks a meteor when a shield is prepared', () => {
    let state = createInitialPlanetState();
    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;
    state = applyTool({ ...state, selectedTool: 'shield', selectedCellId: impactCellId }, 'shield', impactCellId);
    const stabilityBefore = state.stability;

    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);

    expect(state.activeEvent).toBeNull();
    expect(state.stability).toBeGreaterThanOrEqual(stabilityBefore);
    expect(state.cells.find((cell) => cell.id === impactCellId)?.scar).toBe('debris');
    expect(planetTotals(state).debrisFields).toBe(1);
    expect(getLogs(state)[0].text).toContain('튕겨냈고');
    expect(state.lastImpactKind).toBe('shield');
    expect(state.lastImpactCellId).toBe(impactCellId);
  });

  it('derives a milestone phase and living weather signal from planet totals', () => {
    const state = createInitialPlanetState();
    const weather = planetWeather(state);

    expect(['dormant', 'breathing', 'blooming', 'shielded']).toContain(state.phase);
    expect(weather.phase).toBe(state.phase);
    expect(weather.cloudCover).toBeGreaterThanOrEqual(0);
    expect(weather.cloudCover).toBeLessThanOrEqual(1);
    expect(weather.auroraStrength).toBeGreaterThanOrEqual(0);
    expect(weather.auroraStrength).toBeLessThanOrEqual(1);
    expect(weather.stormIntensity).toBeGreaterThanOrEqual(0);
    expect(weather.stormIntensity).toBeLessThanOrEqual(1);
  });

  it('reaches the shielded milestone once enough surface is protected and logs the phase change', () => {
    let state = createInitialPlanetState();
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 4);

    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'shield', selectedCellId: target.id }, 'shield', target.id);
    }
    state = tickPlanet(state, 0);

    expect(planetTotals(state).protectedCells).toBeGreaterThanOrEqual(4);
    expect(state.phase).toBe('shielded');
    expect(planetWeather(state).phase).toBe('shielded');
    expect(getLogs(state)[0].text).toContain('방어막 네트워크');
  });

  it('derives brush combo tiers from streak length', () => {
    expect(brushComboTier(0)).toBe('none');
    expect(brushComboTier(2)).toBe('none');
    expect(brushComboTier(3)).toBe('streak');
    expect(brushComboTier(4)).toBe('streak');
    expect(brushComboTier(5)).toBe('combo');
    expect(brushComboTier(7)).toBe('combo');
    expect(brushComboTier(8)).toBe('mega');
    expect(brushComboTier(20)).toBe('mega');
  });

  it('tracks brush combo tier and its since-timestamp as a stroke escalates', () => {
    let state = createInitialPlanetState();
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);

    for (const target of targets.slice(0, 2)) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }
    expect(state.brushComboTier).toBe('none');

    state = applyTool({ ...state, selectedTool: 'water', selectedCellId: targets[2].id }, 'water', targets[2].id);
    expect(state.brushStreak).toBe(3);
    expect(state.brushComboTier).toBe('streak');
    const streakSince = state.brushComboSince;

    state = tickPlanet(state, 0.5);
    state = applyTool({ ...state, selectedTool: 'water', selectedCellId: targets[3].id }, 'water', targets[3].id);
    expect(state.brushComboTier).toBe('streak');
    expect(state.brushComboSince).toBe(streakSince);

    for (const target of targets.slice(4, 7)) {
      state = tickPlanet(state, 0.5);
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }
    expect(state.brushStreak).toBe(7);
    expect(state.brushComboTier).toBe('combo');
    expect(state.brushComboSince).toBeGreaterThan(streakSince);
  });

  it('grows the living-surface life signal as biomes and shields fill in', () => {
    let state = createInitialPlanetState();
    const before = planetLifeSignal(state);
    expect(before.moteCount).toBeGreaterThanOrEqual(0);
    expect(before.moteIntensity).toBeGreaterThanOrEqual(0);
    expect(before.moteIntensity).toBeLessThanOrEqual(1);

    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 6);
    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: target.id }, 'forest', target.id);
    }
    const after = planetLifeSignal(state);

    expect(after.moteCount).toBeGreaterThan(before.moteCount);
    expect(after.moteIntensity).toBeGreaterThan(before.moteIntensity);
  });

  it('damages the impact cell when a meteor is ignored', () => {
    let state = createInitialPlanetState();
    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;

    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);

    expect(state.activeEvent).toBeNull();
    expect(state.cells.find((cell) => cell.id === impactCellId)?.biome).toBe('barren');
    expect(state.cells.find((cell) => cell.id === impactCellId)?.scar).toBe('crater');
    expect(planetTotals(state).craters).toBe(1);
    expect(state.stability).toBeLessThan(72);
    expect(getLogs(state)[0].text).toContain('운석이 표면');
    expect(state.lastImpactKind).toBe('crater');
    expect(state.lastImpactCellId).toBe(impactCellId);
  });

  it('unlocks the guardian satellite network once enough surface is shielded, granting a one-time resource bonus', () => {
    let state = createInitialPlanetState();
    const before = planetGuardianSignal(state);
    expect(before.active).toBe(false);
    expect(before.strength).toBe(0);

    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);
    for (const target of targets) {
      state = tickPlanet(state, 5);
      state = applyTool({ ...state, selectedTool: 'shield', selectedCellId: target.id }, 'shield', target.id);
    }
    const energyBeforeTick = state.energy;
    const mineralsBeforeTick = state.minerals;
    state = tickPlanet(state, 0);

    const after = planetGuardianSignal(state);
    expect(after.active).toBe(true);
    expect(after.strength).toBe(1);
    expect(state.guardianActive).toBe(true);
    expect(state.energy).toBeGreaterThan(energyBeforeTick);
    expect(state.minerals).toBeGreaterThan(mineralsBeforeTick);
    expect(getLogs(state)[0].text).toContain('수호자 위성망이 완성');
  });

  it('keeps the guardian signal building but inactive below the protected-cell threshold', () => {
    let state = createInitialPlanetState();
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 3);
    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'shield', selectedCellId: target.id }, 'shield', target.id);
    }
    state = tickPlanet(state, 0);

    const signal = planetGuardianSignal(state);
    expect(signal.active).toBe(false);
    expect(signal.strength).toBeGreaterThan(0);
    expect(signal.strength).toBeLessThan(1);
  });

  it('starts on the first objective in the loop and reports live progress', () => {
    const state = createInitialPlanetState();
    const objective = planetObjective(state);

    expect(objective.kind).toBe('forest');
    expect(objective.target).toBe(6);
    expect(objective.progress).toBe(0);
    expect(objective.completed).toBe(false);
  });

  it('completes the current objective, grants a reward, and advances to the next goal', () => {
    let state = createInitialPlanetState();
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 6);

    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: target.id }, 'forest', target.id);
    }
    expect(planetObjective(state).completed).toBe(true);

    const energyBefore = state.energy;
    const mineralsBefore = state.minerals;
    const stabilityBefore = state.stability;
    state = tickPlanet(state, 0);

    expect(state.objectiveIndex).toBe(1);
    expect(state.lastObjectiveLabel).toContain('숲');
    expect(state.objectiveCompletedAt).toBe(state.time);
    expect(state.energy).toBeGreaterThan(energyBefore);
    expect(state.minerals).toBeGreaterThan(mineralsBefore);
    expect(state.stability).toBeGreaterThan(stabilityBefore);
    expect(getLogs(state)[0].text).toContain('목표 달성');
    expect(planetObjective(state).kind).toBe('shield');
    expect(planetObjective(state).progress).toBe(0);
  });

  it('counts a shield-blocked meteor toward the meteor-block objective', () => {
    let state = createInitialPlanetState();
    state = { ...state, objectiveIndex: 2, objectiveBaseline: 0 };
    expect(planetObjective(state).kind).toBe('meteorBlock');
    expect(planetObjective(state).completed).toBe(false);

    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;
    state = applyTool({ ...state, selectedTool: 'shield', selectedCellId: impactCellId }, 'shield', impactCellId);
    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);

    expect(state.meteorsBlocked).toBe(1);
    expect(state.lastObjectiveLabel).toContain('운석');
    expect(planetObjective(state).kind).toBe('habitability');
  });

  it('wraps the objective index with modulo so it always resolves a valid goal', () => {
    const state = { ...createInitialPlanetState(), objectiveIndex: OBJECTIVE_COUNT, objectiveBaseline: 0 };
    expect(planetObjective(state).kind).toBe('forest');
  });
});
