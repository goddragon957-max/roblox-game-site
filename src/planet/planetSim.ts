export type PlanetTool = 'water' | 'forest' | 'crystal' | 'settlement' | 'shield';

export type PlanetBiome = 'barren' | 'ocean' | 'forest' | 'crystal' | 'settlement' | 'shield';

export type PlanetScar = 'none' | 'crater' | 'debris';

export type PlanetPhase = 'dormant' | 'breathing' | 'blooming' | 'shielded';

export type PlanetImpactKind = 'none' | 'shield' | 'crater';

export type BrushComboTier = 'none' | 'streak' | 'combo' | 'mega';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlanetCell {
  id: string;
  normal: Vec3;
  biome: PlanetBiome;
  vitality: number;
  heat: number;
  shielded: boolean;
  scar: PlanetScar;
  pulse: number;
}

export interface MeteorEvent {
  id: string;
  kind: 'meteor';
  impactCellId: string;
  timer: number;
  duration: number;
  resolved: boolean;
}

export interface PlanetLogEntry {
  id: string;
  time: number;
  text: string;
  tone: 'good' | 'warn' | 'danger' | 'neutral';
}

export interface PlanetState {
  time: number;
  cycle: number;
  energy: number;
  water: number;
  biomass: number;
  minerals: number;
  population: number;
  stability: number;
  shield: number;
  selectedTool: PlanetTool;
  selectedCellId: string | null;
  nextMeteorAt: number;
  eventSeq: number;
  logSeq: number;
  cells: PlanetCell[];
  activeEvent: MeteorEvent | null;
  lastBirthAt: number;
  lastPaintAt: number;
  lastPaintedCellId: string | null;
  brushStreak: number;
  brushComboTier: BrushComboTier;
  brushComboSince: number;
  logs: PlanetLogEntry[];
  phase: PlanetPhase;
  phaseSince: number;
  lastImpactAt: number;
  lastImpactKind: PlanetImpactKind;
  lastImpactCellId: string | null;
  guardianActive: boolean;
  guardianSince: number;
  meteorsBlocked: number;
  objectiveIndex: number;
  objectiveBaseline: number;
  objectiveCompletedAt: number;
  lastObjectiveLabel: string;
}

export interface PlanetWeather {
  phase: PlanetPhase;
  cloudCover: number;
  auroraStrength: number;
  stormIntensity: number;
}

export interface PlanetLifeSignal {
  moteCount: number;
  moteIntensity: number;
}

export interface PlanetGuardian {
  active: boolean;
  strength: number;
}

export type ObjectiveKind = 'forest' | 'shield' | 'meteorBlock' | 'habitability';

export interface PlanetObjective {
  kind: ObjectiveKind;
  label: string;
  target: number;
  progress: number;
  completed: boolean;
}

export interface PlanetTotals {
  barren: number;
  ocean: number;
  forest: number;
  crystal: number;
  settlement: number;
  shield: number;
  habitability: number;
  protectedCells: number;
  livingCells: number;
  craters: number;
  debrisFields: number;
}

export const TOOL_LABELS: Record<PlanetTool, string> = {
  water: '바다 뿌리기',
  forest: '숲 심기',
  crystal: '수정 광맥',
  settlement: '정착지 세우기',
  shield: '방어막 씌우기'
};

export const PHASE_LABELS: Record<PlanetPhase, string> = {
  dormant: '휴면 행성',
  breathing: '숨쉬는 행성',
  blooming: '만개한 행성',
  shielded: '방어 태세'
};

export const BRUSH_COMBO_LABELS: Record<BrushComboTier, string> = {
  none: '',
  streak: '연속 손길',
  combo: '리듬 콤보',
  mega: '메가 콤보'
};

export const TOOL_COSTS: Record<PlanetTool, { energy: number; minerals?: number; water?: number; biomass?: number }> = {
  water: { energy: 8 },
  forest: { energy: 10, water: 4 },
  crystal: { energy: 12 },
  settlement: { energy: 18, minerals: 4, biomass: 4 },
  shield: { energy: 14, minerals: 3 }
};

const CELL_COUNT = 132;
const METEOR_DURATION = 8;
export const MAX_LIFE_MOTES = 42;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalize(vec: Vec3): Vec3 {
  const length = Math.hypot(vec.x, vec.y, vec.z) || 1;
  return { x: vec.x / length, y: vec.y / length, z: vec.z / length };
}

function logEntry(state: PlanetState, text: string, tone: PlanetLogEntry['tone']): PlanetLogEntry {
  return { id: `log-${state.logSeq + 1}`, time: round(state.time, 1), text, tone };
}

function withLog(state: PlanetState, text: string, tone: PlanetLogEntry['tone']): PlanetState {
  const entry = logEntry(state, text, tone);
  const logs = [entry, ...getLogs(state)].slice(0, 6);
  return { ...state, logSeq: state.logSeq + 1, logs };
}

export function getLogs(state: PlanetState): PlanetLogEntry[] {
  return state.logs;
}

function makeCell(index: number, total: number): PlanetCell {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = golden * index;
  const normal = normalize({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  const latitude = Math.abs(normal.y);
  const wave = Math.sin(index * 2.17) + Math.cos(index * 0.73);
  let biome: PlanetBiome = 'barren';
  let vitality = 0.18;

  if (latitude < 0.34 && wave > 1.05) {
    biome = 'ocean';
    vitality = 0.66;
  } else if (latitude < 0.56 && wave < -1.05) {
    biome = 'forest';
    vitality = 0.72;
  } else if ((index * 17) % 29 < 4) {
    biome = 'crystal';
    vitality = 0.48;
  } else if (index === 64 || index === 78) {
    biome = 'settlement';
    vitality = 0.74;
  }

  return {
    id: `cell-${index + 1}`,
    normal,
    biome,
    vitality,
    heat: clamp(0.42 + latitude * 0.42 + Math.sin(index) * 0.08, 0, 1),
    shielded: false,
    scar: 'none',
    pulse: 0
  };
}

function nextImpactCell(state: PlanetState) {
  const index = (state.eventSeq * 37 + Math.floor(state.time * 3) + 19) % state.cells.length;
  return state.cells[index].id;
}

export function createInitialPlanetState(): PlanetState {
  const cells = Array.from({ length: CELL_COUNT }, (_, index) => makeCell(index, CELL_COUNT));
  let state: PlanetState = {
    time: 0,
    cycle: 1,
    energy: 88,
    water: 26,
    biomass: 18,
    minerals: 16,
    population: 12,
    stability: 72,
    shield: 0,
    selectedTool: 'water',
    selectedCellId: null,
    nextMeteorAt: 18,
    eventSeq: 0,
    logSeq: 0,
    cells,
    activeEvent: null,
    lastBirthAt: 0,
    lastPaintAt: -999,
    lastPaintedCellId: null,
    brushStreak: 0,
    brushComboTier: 'none',
    brushComboSince: 0,
    logs: [],
    phase: 'dormant',
    phaseSince: 0,
    lastImpactAt: -999,
    lastImpactKind: 'none',
    lastImpactCellId: null,
    guardianActive: false,
    guardianSince: 0,
    meteorsBlocked: 0,
    objectiveIndex: 0,
    objectiveBaseline: 0,
    objectiveCompletedAt: -999,
    lastObjectiveLabel: ''
  };
  state = { ...state, phase: deriveMilestonePhase(planetTotals(state)) };
  const initialDef = OBJECTIVE_SEQUENCE[0];
  state = { ...state, objectiveBaseline: initialDef.measure(state, planetTotals(state)) };
  return withLog(state, '작은 원시 행성이 깨어났어요. 바다·숲·수정으로 표면을 빚어보세요.', 'good');
}

export function planetTotals(state: PlanetState): PlanetTotals {
  const counts: PlanetTotals = {
    barren: 0,
    ocean: 0,
    forest: 0,
    crystal: 0,
    settlement: 0,
    shield: 0,
    habitability: 0,
    protectedCells: 0,
    livingCells: 0,
    craters: 0,
    debrisFields: 0
  };

  for (const cell of state.cells) {
    counts[cell.biome] += 1;
    if (cell.biome !== 'barren' && cell.biome !== 'crystal') counts.livingCells += 1;
    if (cell.shielded || cell.biome === 'shield') counts.protectedCells += 1;
    if (cell.scar === 'crater') counts.craters += 1;
    if (cell.scar === 'debris') counts.debrisFields += 1;
  }

  const livingScore = counts.ocean * 1.2 + counts.forest * 1.5 + counts.settlement * 2.4 + counts.shield * 0.8;
  const economyScore = state.water * 0.12 + state.biomass * 0.14 + state.population * 0.18 + state.minerals * 0.05;
  counts.habitability = clamp(Math.round(livingScore + economyScore + state.stability * 0.32), 0, 100);
  return counts;
}

const SHIELDED_PHASE_THRESHOLD = 4;
const BLOOMING_HABITABILITY = 55;
const BREATHING_HABITABILITY = 28;

function deriveMilestonePhase(totals: PlanetTotals): PlanetPhase {
  if (totals.protectedCells >= SHIELDED_PHASE_THRESHOLD) return 'shielded';
  if (totals.habitability >= BLOOMING_HABITABILITY) return 'blooming';
  if (totals.habitability >= BREATHING_HABITABILITY) return 'breathing';
  return 'dormant';
}

const PHASE_MESSAGES: Record<PlanetPhase, string> = {
  dormant: '행성이 다시 잠들었어요. 물과 숲을 더 채워보세요.',
  breathing: '행성이 숨을 쉬기 시작했어요! 대기가 옅게 빛나요.',
  blooming: '행성이 만개했어요! 오로라가 행성을 감쌉니다.',
  shielded: '방어막 네트워크가 완성돼 행성이 보호막을 둘렀어요.'
};

function syncPhase(state: PlanetState): PlanetState {
  const phase = deriveMilestonePhase(planetTotals(state));
  if (phase === state.phase) return state;
  const tone: PlanetLogEntry['tone'] = phase === 'dormant' ? 'warn' : 'good';
  return withLog({ ...state, phase, phaseSince: state.time }, PHASE_MESSAGES[phase], tone);
}

const GUARDIAN_PROTECTED_THRESHOLD = 8;
const GUARDIAN_ENERGY_BONUS = 24;
const GUARDIAN_MINERAL_BONUS = 16;

export function planetGuardianSignal(state: PlanetState): PlanetGuardian {
  const totals = planetTotals(state);
  const strength = clamp(totals.protectedCells / GUARDIAN_PROTECTED_THRESHOLD, 0, 1);
  return { active: state.guardianActive, strength: round(strength, 3) };
}

function syncGuardian(state: PlanetState): PlanetState {
  const totals = planetTotals(state);
  const active = totals.protectedCells >= GUARDIAN_PROTECTED_THRESHOLD;
  if (active === state.guardianActive) return state;

  if (active) {
    const rewarded: PlanetState = {
      ...state,
      guardianActive: true,
      guardianSince: state.time,
      energy: clamp(round(state.energy + GUARDIAN_ENERGY_BONUS, 1), 0, 180),
      minerals: clamp(round(state.minerals + GUARDIAN_MINERAL_BONUS, 1), 0, 160)
    };
    return withLog(rewarded, '수호자 위성망이 완성됐어요! 별빛 결정 보너스를 받았습니다.', 'good');
  }

  return withLog({ ...state, guardianActive: false, guardianSince: state.time }, '수호자 위성망이 흐려졌어요. 방어막을 더 늘려보세요.', 'warn');
}

interface ObjectiveDef {
  kind: ObjectiveKind;
  target: number;
  label: string;
  measure: (state: PlanetState, totals: PlanetTotals) => number;
}

const OBJECTIVE_SEQUENCE: ObjectiveDef[] = [
  { kind: 'forest', target: 6, label: '숲 6개 만들기', measure: (_state, totals) => totals.forest },
  { kind: 'shield', target: 5, label: '방어막 5개 완성', measure: (_state, totals) => totals.protectedCells },
  { kind: 'meteorBlock', target: 1, label: '운석 1회 막기', measure: (state) => state.meteorsBlocked },
  { kind: 'habitability', target: 60, label: '거주 가능성 60% 달성', measure: (_state, totals) => totals.habitability }
];

export const OBJECTIVE_COUNT = OBJECTIVE_SEQUENCE.length;

const OBJECTIVE_REWARD_ENERGY = 12;
const OBJECTIVE_REWARD_MINERALS = 8;
const OBJECTIVE_REWARD_STABILITY = 4;

export function planetObjective(state: PlanetState): PlanetObjective {
  const def = OBJECTIVE_SEQUENCE[state.objectiveIndex % OBJECTIVE_SEQUENCE.length];
  const totals = planetTotals(state);
  const raw = def.measure(state, totals);
  const progress = clamp(round(raw - state.objectiveBaseline), 0, def.target);
  return { kind: def.kind, label: def.label, target: def.target, progress, completed: progress >= def.target };
}

function syncObjective(state: PlanetState): PlanetState {
  const def = OBJECTIVE_SEQUENCE[state.objectiveIndex % OBJECTIVE_SEQUENCE.length];
  const totals = planetTotals(state);
  const raw = def.measure(state, totals);
  const progress = clamp(round(raw - state.objectiveBaseline), 0, def.target);
  if (progress < def.target) return state;

  const nextIndex = (state.objectiveIndex + 1) % OBJECTIVE_SEQUENCE.length;
  const rewarded: PlanetState = {
    ...state,
    objectiveIndex: nextIndex,
    objectiveCompletedAt: state.time,
    lastObjectiveLabel: def.label,
    energy: clamp(round(state.energy + OBJECTIVE_REWARD_ENERGY, 1), 0, 180),
    minerals: clamp(round(state.minerals + OBJECTIVE_REWARD_MINERALS, 1), 0, 160),
    stability: clamp(round(state.stability + OBJECTIVE_REWARD_STABILITY, 1), 0, 100)
  };
  const nextDef = OBJECTIVE_SEQUENCE[nextIndex];
  const baseline = nextDef.measure(rewarded, planetTotals(rewarded));
  return withLog(
    { ...rewarded, objectiveBaseline: baseline },
    `목표 달성: ${def.label}! 보상으로 에너지·광물·안정도를 얻었어요.`,
    'good'
  );
}

export function planetWeather(state: PlanetState): PlanetWeather {
  const totals = planetTotals(state);
  const cellCount = state.cells.length;
  const cloudCover = clamp((totals.ocean * 1.6 + totals.forest * 1.1) / cellCount, 0, 1);
  const auroraStrength = clamp((totals.crystal * 2.2 + totals.protectedCells * 1.6) / cellCount, 0, 1);
  const stormIntensity = clamp(
    (totals.craters * 3.4) / cellCount + (100 - state.stability) / 220 + (state.activeEvent ? 0.22 : 0),
    0,
    1
  );
  return {
    phase: state.phase,
    cloudCover: round(cloudCover, 3),
    auroraStrength: round(auroraStrength, 3),
    stormIntensity: round(stormIntensity, 3)
  };
}

export function brushComboTier(streak: number): BrushComboTier {
  if (streak >= 8) return 'mega';
  if (streak >= 5) return 'combo';
  if (streak >= 3) return 'streak';
  return 'none';
}

export function planetLifeSignal(state: PlanetState): PlanetLifeSignal {
  const totals = planetTotals(state);
  const cellCount = state.cells.length;
  const lifeDensity = (totals.livingCells * 1.4 + totals.protectedCells * 0.8) / cellCount;
  const moteCount = clamp(Math.round(lifeDensity * MAX_LIFE_MOTES + totals.habitability * 0.06), 0, MAX_LIFE_MOTES);
  const moteIntensity = clamp(totals.habitability / 100, 0.08, 1);
  return { moteCount, moteIntensity: round(moteIntensity, 3) };
}

export function selectTool(state: PlanetState, tool: PlanetTool): PlanetState {
  return { ...state, selectedTool: tool };
}

function canPay(state: PlanetState, tool: PlanetTool) {
  const cost = TOOL_COSTS[tool];
  return (
    state.energy >= cost.energy &&
    state.minerals >= (cost.minerals ?? 0) &&
    state.water >= (cost.water ?? 0) &&
    state.biomass >= (cost.biomass ?? 0)
  );
}

function pay(state: PlanetState, tool: PlanetTool): PlanetState {
  const cost = TOOL_COSTS[tool];
  return {
    ...state,
    energy: round(state.energy - cost.energy, 1),
    minerals: round(state.minerals - (cost.minerals ?? 0), 1),
    water: round(state.water - (cost.water ?? 0), 1),
    biomass: round(state.biomass - (cost.biomass ?? 0), 1)
  };
}

export function applyTool(state: PlanetState, tool: PlanetTool = state.selectedTool, cellId = state.selectedCellId): PlanetState {
  if (!cellId) return withLog({ ...state, selectedTool: tool }, '행성 표면을 먼저 찍어주세요.', 'warn');
  if (!canPay(state, tool)) return withLog({ ...state, selectedTool: tool, selectedCellId: cellId }, `${TOOL_LABELS[tool]}에 필요한 자원이 부족해요.`, 'warn');

  let touched = false;
  const continuingStroke = state.lastPaintedCellId !== null && state.lastPaintedCellId !== cellId && state.time - state.lastPaintAt <= 4;
  const brushStreak = continuingStroke ? clamp(state.brushStreak + 1, 1, 99) : 1;
  const comboTier = brushComboTier(brushStreak);
  const comboChanged = comboTier !== state.brushComboTier;
  let next = pay(
    {
      ...state,
      selectedTool: tool,
      selectedCellId: cellId,
      lastPaintAt: state.time,
      lastPaintedCellId: cellId,
      brushStreak,
      brushComboTier: comboTier,
      brushComboSince: comboChanged ? state.time : state.brushComboSince
    },
    tool
  );
  const cells: PlanetCell[] = next.cells.map((cell): PlanetCell => {
    if (cell.id !== cellId) return cell;
    touched = true;
    switch (tool) {
      case 'water':
        next = { ...next, water: round(next.water + 15, 1), stability: clamp(next.stability + 1.5, 0, 100) };
        return { ...cell, biome: 'ocean' as const, vitality: clamp(cell.vitality + 0.34, 0, 1), heat: clamp(cell.heat - 0.18, 0, 1), shielded: false, scar: 'none', pulse: 1 };
      case 'forest':
        next = { ...next, biomass: round(next.biomass + 14, 1), stability: clamp(next.stability + 2.5, 0, 100) };
        return { ...cell, biome: 'forest' as const, vitality: clamp(cell.vitality + 0.38, 0, 1), heat: clamp(cell.heat - 0.08, 0, 1), shielded: false, scar: 'none', pulse: 1 };
      case 'crystal':
        next = { ...next, minerals: round(next.minerals + 18, 1), energy: round(next.energy + 8, 1) };
        return { ...cell, biome: 'crystal' as const, vitality: clamp(cell.vitality + 0.16, 0, 1), shielded: false, scar: 'none', pulse: 1 };
      case 'settlement':
        next = { ...next, population: round(next.population + 10, 1), stability: clamp(next.stability + 1, 0, 100), lastBirthAt: next.time };
        return { ...cell, biome: 'settlement' as const, vitality: clamp(cell.vitality + 0.42, 0, 1), shielded: false, scar: 'none', pulse: 1 };
      case 'shield':
        next = { ...next, shield: clamp(next.shield + 34, 0, 100), stability: clamp(next.stability + 0.5, 0, 100) };
        return { ...cell, biome: 'shield' as const, vitality: clamp(cell.vitality + 0.25, 0, 1), shielded: true, scar: 'none', pulse: 1 };
      default:
        return cell;
    }
  });

  next = { ...next, cells };
  if (!touched) return withLog(next, '그 표면 좌표를 찾지 못했어요.', 'warn');

  const message: Record<PlanetTool, string> = {
    water: '푸른 바다가 패치처럼 번졌어요.',
    forest: '초록 숲이 산소를 뿜기 시작했어요.',
    crystal: '보라 수정 광맥이 별빛 에너지를 모읍니다.',
    settlement: '작은 돔 마을이 불을 밝혔어요.',
    shield: '황금 방어막 돔이 충격 지점을 감쌌어요.'
  };
  const streakText = brushStreak >= 3 ? ` 브러시 ${brushStreak}연속!` : '';
  return withLog(next, `${message[tool]}${streakText}`, tool === 'shield' || brushStreak >= 3 ? 'good' : 'neutral');
}

export function triggerMeteor(state: PlanetState): PlanetState {
  if (state.activeEvent) return state;
  const eventSeq = state.eventSeq + 1;
  const impactCellId = nextImpactCell({ ...state, eventSeq });
  const next: PlanetState = {
    ...state,
    eventSeq,
    activeEvent: {
      id: `meteor-${eventSeq}`,
      kind: 'meteor',
      impactCellId,
      timer: METEOR_DURATION,
      duration: METEOR_DURATION,
      resolved: false
    },
    nextMeteorAt: state.time + 24
  };
  return withLog(next, '운석 경보! 붉은 궤적이 행성으로 떨어집니다. 방어막을 준비하세요.', 'danger');
}

function resolveMeteor(state: PlanetState): PlanetState {
  const event = state.activeEvent;
  if (!event) return state;
  const target = state.cells.find((cell) => cell.id === event.impactCellId);
  const blocked = state.shield >= 20 || target?.shielded || target?.biome === 'shield';

  if (blocked) {
    const cells: PlanetCell[] = state.cells.map((cell): PlanetCell =>
      cell.id === event.impactCellId ? { ...cell, shielded: false, vitality: clamp(cell.vitality + 0.08, 0, 1), scar: 'debris', pulse: 1 } : cell
    );
    const next: PlanetState = {
      ...state,
      cells,
      energy: clamp(round(state.energy + 10, 1), 0, 180),
      minerals: clamp(round(state.minerals + 6, 1), 0, 160),
      shield: clamp(state.shield - 26, 0, 100),
      stability: clamp(state.stability + 3, 0, 100),
      activeEvent: null,
      lastImpactAt: state.time,
      lastImpactKind: 'shield',
      lastImpactCellId: event.impactCellId,
      meteorsBlocked: state.meteorsBlocked + 1
    };
    return withLog(next, '방어막이 운석을 튕겨냈고, 파편이 별빛 에너지로 변했어요.', 'good');
  }

  const cells: PlanetCell[] = state.cells.map((cell): PlanetCell =>
    cell.id === event.impactCellId
      ? { ...cell, biome: 'barren' as const, vitality: 0.06, heat: clamp(cell.heat + 0.22, 0, 1), shielded: false, scar: 'crater', pulse: 1 }
      : cell
  );
  const next: PlanetState = {
    ...state,
    cells,
    stability: clamp(state.stability - 18, 0, 100),
    population: clamp(round(state.population - 4, 1), 0, 999),
    activeEvent: null,
    lastImpactAt: state.time,
    lastImpactKind: 'crater',
    lastImpactCellId: event.impactCellId
  };
  return withLog(next, '운석이 표면을 태웠어요. 다시 물과 숲으로 복구해야 합니다.', 'danger');
}

export function tickPlanet(state: PlanetState, seconds: number): PlanetState {
  const delta = clamp(seconds, 0, 5);
  let next: PlanetState = {
    ...state,
    time: round(state.time + delta, 2),
    cycle: Math.floor((state.time + delta) / 30) + 1
  };

  const totals = planetTotals(next);
  const energyGain = delta * (0.58 + totals.crystal * 0.018 + totals.settlement * 0.012);
  const waterGain = delta * (totals.ocean * 0.018);
  const biomassGain = delta * (totals.forest * 0.024 + totals.ocean * 0.006);
  const mineralGain = delta * (totals.crystal * 0.03);
  const populationGain = delta * (totals.settlement * 0.018 + totals.forest * 0.004);
  const stabilityDrift = delta * ((totals.forest + totals.ocean) * 0.012 - (next.activeEvent ? 0.08 : 0));

  next = {
    ...next,
    energy: clamp(round(next.energy + energyGain, 1), 0, 180),
    water: clamp(round(next.water + waterGain, 1), 0, 160),
    biomass: clamp(round(next.biomass + biomassGain, 1), 0, 160),
    minerals: clamp(round(next.minerals + mineralGain, 1), 0, 160),
    population: clamp(round(next.population + populationGain, 1), 0, 260),
    stability: clamp(round(next.stability + stabilityDrift, 1), 0, 100),
    cells: next.cells.map((cell) => {
      const vitalityGain = cell.biome === 'forest' || cell.biome === 'ocean' ? 0.006 * delta : cell.biome === 'settlement' ? 0.003 * delta : 0;
      return { ...cell, vitality: clamp(round(cell.vitality + vitalityGain, 3), 0, 1), pulse: clamp(round(cell.pulse - delta * 0.36, 2), 0, 1) };
    })
  };

  if (!next.activeEvent && next.time >= next.nextMeteorAt) next = triggerMeteor(next);

  if (next.activeEvent) {
    const activeEvent = { ...next.activeEvent, timer: round(next.activeEvent.timer - delta, 2) };
    next = { ...next, activeEvent };
    if (activeEvent.timer <= 0) next = resolveMeteor(next);
  }

  return syncObjective(syncGuardian(syncPhase(next)));
}

export function nearestCellId(state: PlanetState, normal: Vec3): string {
  const target = normalize(normal);
  let best = state.cells[0];
  let bestDot = -Infinity;
  for (const cell of state.cells) {
    const dot = cell.normal.x * target.x + cell.normal.y * target.y + cell.normal.z * target.z;
    if (dot > bestDot) {
      best = cell;
      bestDot = dot;
    }
  }
  return best.id;
}
