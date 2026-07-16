import { describe, expect, it } from 'vitest';
import { applyTool, createInitialPlanetState, getLogs, planetTotals, planetWeather, selectTool, tickPlanet, triggerMeteor } from '../planetSim';

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
  });
});
