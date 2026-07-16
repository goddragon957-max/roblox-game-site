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
  planetRestorationSignal,
  planetSettlementBirthSignal,
  planetTerraformSurgeSignal,
  planetTotals,
  planetWeather,
  RESTORATION_SIGNAL_DURATION,
  selectTool,
  SETTLEMENT_BIRTH_SIGNAL_DURATION,
  TERRAFORM_SURGE_SIGNAL_DURATION,
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

  it('heals an ignored-meteor crater with a restorative tool and rewards exactly one restoration', () => {
    let state = createInitialPlanetState();
    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;

    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);
    expect(state.cells.find((cell) => cell.id === impactCellId)?.scar).toBe('crater');

    const before = planetRestorationSignal(state);
    expect(before.active).toBe(false);
    expect(before.count).toBe(0);

    const stabilityBefore = state.stability;
    const biomassBefore = state.biomass;
    const waterBefore = state.water;

    state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: impactCellId }, 'forest', impactCellId);

    const painted = state.cells.find((cell) => cell.id === impactCellId);
    expect(painted?.scar).toBe('none');
    expect(painted?.biome).toBe('forest');
    expect(state.craterRestorations).toBe(1);
    expect(state.lastRestorationCellId).toBe(impactCellId);
    expect(state.lastRestorationTool).toBe('forest');
    expect(state.stability).toBeGreaterThan(stabilityBefore);
    expect(state.biomass).toBeGreaterThan(biomassBefore);
    expect(state.water).toBeGreaterThan(waterBefore);
    expect(getLogs(state)[0].text).toContain('크레이터가 복구');

    const after = planetRestorationSignal(state);
    expect(after.active).toBe(true);
    expect(after.count).toBe(1);
    expect(after.lastCellId).toBe(impactCellId);
    expect(after.lastTool).toBe('forest');
  });

  it('does not reward repainting a non-crater cell or an already-healed crater again', () => {
    let state = createInitialPlanetState();
    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;
    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);

    state = applyTool({ ...state, selectedTool: 'water', selectedCellId: impactCellId }, 'water', impactCellId);
    expect(state.craterRestorations).toBe(1);

    state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: impactCellId }, 'forest', impactCellId);
    expect(state.craterRestorations).toBe(1);

    const barrenTarget = state.cells.find((cell) => cell.biome === 'barren');
    expect(barrenTarget).toBeTruthy();
    state = applyTool({ ...state, selectedTool: 'forest', selectedCellId: barrenTarget!.id }, 'forest', barrenTarget!.id);
    expect(state.craterRestorations).toBe(1);
  });

  it('does not count shield/crystal/settlement tools on a crater as ecological restoration', () => {
    for (const tool of ['shield', 'crystal', 'settlement'] as const) {
      let state = createInitialPlanetState();
      state = triggerMeteor(state);
      const impactCellId = state.activeEvent!.impactCellId;
      state = tickPlanet(state, 5);
      state = tickPlanet(state, 3.2);

      state = applyTool({ ...state, selectedTool: tool, selectedCellId: impactCellId }, tool, impactCellId);
      expect(state.craterRestorations).toBe(0);
      expect(planetRestorationSignal(state).active).toBe(false);
    }
  });

  it('expires the restoration active signal after the deterministic duration while keeping the count', () => {
    let state = createInitialPlanetState();
    state = triggerMeteor(state);
    const impactCellId = state.activeEvent!.impactCellId;
    state = tickPlanet(state, 5);
    state = tickPlanet(state, 3.2);
    state = applyTool({ ...state, selectedTool: 'water', selectedCellId: impactCellId }, 'water', impactCellId);

    expect(planetRestorationSignal(state).active).toBe(true);
    expect(planetRestorationSignal({ ...state, time: state.lastRestorationAt - 0.1 }).active).toBe(false);

    let remaining = RESTORATION_SIGNAL_DURATION + 0.1;
    while (remaining > 0) {
      const step = Math.min(5, remaining);
      state = tickPlanet(state, step);
      remaining -= step;
    }

    const signal = planetRestorationSignal(state);
    expect(signal.active).toBe(false);
    expect(signal.count).toBe(1);
  });

  it('starts with an inactive terraform surge signal and zero count', () => {
    const state = createInitialPlanetState();
    const signal = planetTerraformSurgeSignal(state);

    expect(signal.active).toBe(false);
    expect(signal.count).toBe(0);
    expect(signal.lastCellId).toBeNull();
    expect(signal.lastTool).toBeNull();
  });

  it('activates the terraform surge on the eighth distinct quick paint of a mega streak, rewarding exactly once', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 100 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);

    for (const target of targets.slice(0, 7)) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }
    expect(planetTerraformSurgeSignal(state).active).toBe(false);
    expect(planetTerraformSurgeSignal(state).count).toBe(0);

    const energyBefore = state.energy;
    const stabilityBefore = state.stability;
    state = applyTool({ ...state, selectedTool: 'water', selectedCellId: targets[7].id }, 'water', targets[7].id);

    expect(state.brushComboTier).toBe('mega');
    const signal = planetTerraformSurgeSignal(state);
    expect(signal.active).toBe(true);
    expect(signal.count).toBe(1);
    expect(signal.lastCellId).toBe(targets[7].id);
    expect(signal.lastTool).toBe('water');
    expect(state.energy).toBeGreaterThan(energyBefore);
    expect(state.stability).toBeGreaterThan(stabilityBefore);
    expect(getLogs(state)[0].text).toContain('테라포밍 서지');
  });

  it('does not retrigger the terraform surge on the ninth or tenth paint of the same stroke', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 100 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 10);

    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }

    expect(state.brushStreak).toBe(10);
    expect(planetTerraformSurgeSignal(state).count).toBe(1);
  });

  it('does not trigger the terraform surge when the eighth paint is unaffordable or repeats the previous cell', () => {
    const seed = () => {
      let state = { ...createInitialPlanetState(), energy: 100 };
      const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);
      for (const target of targets.slice(0, 7)) {
        state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
      }
      return { state, targets };
    };

    const insufficient = seed();
    const afterFailedPaint = applyTool(
      { ...insufficient.state, energy: 0, selectedCellId: insufficient.targets[7].id },
      'water',
      insufficient.targets[7].id
    );
    expect(afterFailedPaint.brushStreak).toBe(7);
    expect(planetTerraformSurgeSignal(afterFailedPaint).count).toBe(0);
    expect(getLogs(afterFailedPaint)[0].text).toContain('자원이 부족');

    const repeated = seed();
    const afterRepeatedCell = applyTool(
      { ...repeated.state, selectedCellId: repeated.targets[6].id },
      'water',
      repeated.targets[6].id
    );
    expect(afterRepeatedCell.brushStreak).toBe(1);
    expect(planetTerraformSurgeSignal(afterRepeatedCell).count).toBe(0);
  });

  it('caps the terraform surge reward at the energy and stability limits', () => {
    let state = { ...createInitialPlanetState(), energy: 100 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);
    for (const target of targets.slice(0, 7)) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }

    state = applyTool(
      { ...state, energy: 179, stability: 99, selectedTool: 'water', selectedCellId: targets[7].id },
      'water',
      targets[7].id
    );

    expect(state.energy).toBe(180);
    expect(state.stability).toBe(100);
    expect(planetTerraformSurgeSignal(state).count).toBe(1);
  });

  it('triggers a second terraform surge after the stroke window breaks and a fresh mega streak forms', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 300 };
    const firstTargets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);

    for (const target of firstTargets) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }
    expect(planetTerraformSurgeSignal(state).count).toBe(1);

    state = tickPlanet(state, 5);
    const secondTargets = state.cells.filter((cell) => cell.biome === 'barren').slice(8, 16);
    for (const target of secondTargets) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }

    expect(state.brushStreak).toBe(8);
    const signal = planetTerraformSurgeSignal(state);
    expect(signal.count).toBe(2);
    expect(signal.lastCellId).toBe(secondTargets[7].id);
  });

  it('expires the terraform surge active signal at the exact deterministic duration while keeping the count', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 100 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 8);

    for (const target of targets) {
      state = applyTool({ ...state, selectedTool: 'water', selectedCellId: target.id }, 'water', target.id);
    }
    expect(planetTerraformSurgeSignal(state).active).toBe(true);

    let remaining = TERRAFORM_SURGE_SIGNAL_DURATION - 0.1;
    while (remaining > 0) {
      const step = Math.min(5, remaining);
      state = tickPlanet(state, step);
      remaining -= step;
    }

    expect(planetTerraformSurgeSignal(state).active).toBe(true);
    state = tickPlanet(state, 0.1);

    const signal = planetTerraformSurgeSignal(state);
    expect(signal.active).toBe(false);
    expect(signal.count).toBe(1);
  });

  it('starts with an inactive settlement-birth signal and zero count', () => {
    const state = createInitialPlanetState();
    const signal = planetSettlementBirthSignal(state);

    expect(signal.active).toBe(false);
    expect(signal.count).toBe(0);
    expect(signal.lastCellId).toBeNull();
  });

  it('records a settlement birth with cell and timestamp when a settlement paint succeeds', () => {
    let state = createInitialPlanetState();
    state = tickPlanet(state, 2);
    const target = state.cells.find((cell) => cell.biome === 'barren');
    expect(target).toBeTruthy();

    state = applyTool({ ...state, selectedTool: 'settlement', selectedCellId: target!.id }, 'settlement', target!.id);

    const signal = planetSettlementBirthSignal(state);
    expect(signal.active).toBe(true);
    expect(signal.count).toBe(1);
    expect(signal.lastCellId).toBe(target!.id);
    expect(signal.since).toBe(state.time);
    expect(state.cells.find((cell) => cell.id === target!.id)?.biome).toBe('settlement');
  });

  it('increments the settlement-birth count per successful settlement and tracks the latest cell', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 120, minerals: 40, biomass: 40 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 2);

    state = applyTool({ ...state, selectedTool: 'settlement', selectedCellId: targets[0].id }, 'settlement', targets[0].id);
    state = applyTool({ ...state, selectedTool: 'settlement', selectedCellId: targets[1].id }, 'settlement', targets[1].id);

    const signal = planetSettlementBirthSignal(state);
    expect(signal.count).toBe(2);
    expect(signal.lastCellId).toBe(targets[1].id);
  });

  it('does not trigger a settlement birth from non-settlement tools', () => {
    let state = createInitialPlanetState();
    state = { ...state, energy: 120, minerals: 40, biomass: 40 };
    const targets = state.cells.filter((cell) => cell.biome === 'barren').slice(0, 4);
    const tools = ['water', 'forest', 'crystal', 'shield'] as const;

    tools.forEach((tool, index) => {
      state = applyTool({ ...state, selectedTool: tool, selectedCellId: targets[index].id }, tool, targets[index].id);
    });

    const signal = planetSettlementBirthSignal(state);
    expect(signal.active).toBe(false);
    expect(signal.count).toBe(0);
    expect(signal.lastCellId).toBeNull();
  });

  it('does not record a settlement birth for unaffordable, cell-less, or unknown-cell attempts', () => {
    const base = createInitialPlanetState();
    const target = base.cells.find((cell) => cell.biome === 'barren');
    expect(target).toBeTruthy();

    const unaffordable = applyTool({ ...base, energy: 0, selectedCellId: target!.id }, 'settlement', target!.id);
    expect(planetSettlementBirthSignal(unaffordable).count).toBe(0);
    expect(getLogs(unaffordable)[0].text).toContain('자원이 부족');

    const noCell = applyTool({ ...base, selectedCellId: null }, 'settlement', null);
    expect(planetSettlementBirthSignal(noCell).count).toBe(0);

    const unknownCell = applyTool(base, 'settlement', 'cell-9999');
    expect(planetSettlementBirthSignal(unknownCell).count).toBe(0);
    expect(getLogs(unknownCell)[0].text).toContain('좌표를 찾지');
  });

  it('expires the settlement-birth active signal at the exact deterministic duration while keeping the count', () => {
    let state = createInitialPlanetState();
    const target = state.cells.find((cell) => cell.biome === 'barren');
    state = applyTool({ ...state, selectedTool: 'settlement', selectedCellId: target!.id }, 'settlement', target!.id);
    expect(planetSettlementBirthSignal(state).active).toBe(true);

    let remaining = SETTLEMENT_BIRTH_SIGNAL_DURATION - 0.1;
    while (remaining > 0) {
      const step = Math.min(5, remaining);
      state = tickPlanet(state, step);
      remaining -= step;
    }
    expect(planetSettlementBirthSignal(state).active).toBe(true);

    state = tickPlanet(state, 0.1);
    const signal = planetSettlementBirthSignal(state);
    expect(signal.active).toBe(false);
    expect(signal.count).toBe(1);
    expect(signal.lastCellId).toBe(target!.id);
  });

  it('keeps a settlement birth inactive when its recorded timestamp is in the future', () => {
    const state = {
      ...createInitialPlanetState(),
      settlementBirths: 1,
      lastSettlementBirthAt: 5,
      lastSettlementBirthCellId: 'cell-1'
    };

    expect(planetSettlementBirthSignal(state).active).toBe(false);
  });

  it('keeps a terraform surge inactive when its recorded timestamp is in the future', () => {
    const state = {
      ...createInitialPlanetState(),
      terraformSurgeCount: 1,
      lastTerraformSurgeAt: 2,
      lastTerraformSurgeCellId: 'cell-0',
      lastTerraformSurgeTool: 'water' as const
    };

    expect(planetTerraformSurgeSignal(state).active).toBe(false);
  });
});
