import type {
  BuildableKind,
  Building,
  BuildingKind,
  GameState,
  MatchGrade,
  MatchScore,
  MissionHint,
  RallyPreview,
  RangePreview,
  ResourceNode,
  ResourceType,
  SelectionGroup,
  SelectionSummary,
  SmartTarget,
  ThreatAlert,
  TowerShot,
  Unit,
  UnitKind,
  UnitOrder,
  Vec2,
  WaveForecast
} from './types';

export const MAP_HALF = 24;

// Visual-only terrain layout shared by the 3D scene and the minimap.
export const TERRAIN = {
  river: { centerX: 4.5, width: 4 },
  bridge: { centerZ: -1, length: 5 }
};

export const COSTS: Record<BuildableKind | 'soldier', { gold: number; wood: number }> = {
  barracks: { gold: 100, wood: 60 },
  tower: { gold: 60, wood: 80 },
  soldier: { gold: 60, wood: 0 }
};

export const WORKER_CARRY_CAP = 10;
export const GATHER_TIME = 2.2;
export const DEPOSIT_RANGE = 2.4;
export const GATHER_RANGE = 1.7;
export const TRAIN_TIME = 4;
export const FIRST_WAVE_AT = 50;
export const WAVE_INTERVAL = 40;
export const WAVE_WARNING_LEAD = 10;
export const RAIDER_AGGRO_RANGE = 8;
export const SOLDIER_AGGRO_RANGE = 10;
export const MISSION_SOLDIER_TARGET = 3;
export const THREAT_ALERT_DURATION = 4;
export const TOWER_SHOT_DURATION = 0.35;

const UNIT_STATS: Record<UnitKind, Pick<Unit, 'maxHp' | 'speed' | 'attackDamage' | 'attackRange' | 'attackCooldown'>> = {
  worker: { maxHp: 40, speed: 4.2, attackDamage: 2, attackRange: 1.3, attackCooldown: 1.2 },
  soldier: { maxHp: 90, speed: 4.8, attackDamage: 12, attackRange: 1.8, attackCooldown: 0.9 },
  raider: { maxHp: 60, speed: 4.4, attackDamage: 9, attackRange: 1.6, attackCooldown: 1.0 }
};

const BUILDING_STATS: Record<BuildingKind, { maxHp: number; attackDamage: number; attackRange: number; attackCooldown: number }> = {
  base: { maxHp: 500, attackDamage: 0, attackRange: 0, attackCooldown: 0 },
  barracks: { maxHp: 300, attackDamage: 0, attackRange: 0, attackCooldown: 0 },
  tower: { maxHp: 220, attackDamage: 10, attackRange: 8, attackCooldown: 1.2 },
  enemyCamp: { maxHp: 400, attackDamage: 0, attackRange: 0, attackCooldown: 0 }
};

const BUILD_SLOTS: Vec2[] = [
  { x: -10, z: 14.5 },
  { x: -17.5, z: 15.5 },
  { x: -10.5, z: 8 },
  { x: -16.5, z: 6.5 },
  { x: -7, z: 11.5 },
  { x: -13, z: 17.5 }
];

function nextId(state: GameState, prefix: string): string {
  state.seq += 1;
  return `${prefix}-${state.seq}`;
}

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function makeUnit(state: GameState, kind: UnitKind, faction: Unit['faction'], pos: Vec2, order: UnitOrder = { type: 'idle' }): Unit {
  const stats = UNIT_STATS[kind];
  return {
    id: nextId(state, kind),
    kind,
    faction,
    pos: { ...pos },
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    speed: stats.speed,
    attackDamage: stats.attackDamage,
    attackRange: stats.attackRange,
    attackCooldown: stats.attackCooldown,
    cooldownLeft: 0,
    order,
    carry: null,
    gatherProgress: 0,
    lastGatherNodeId: null
  };
}

function makeBuilding(state: GameState, kind: BuildingKind, faction: Building['faction'], pos: Vec2): Building {
  const stats = BUILDING_STATS[kind];
  return {
    id: nextId(state, kind),
    kind,
    faction,
    pos: { ...pos },
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    attackDamage: stats.attackDamage,
    attackRange: stats.attackRange,
    attackCooldown: stats.attackCooldown,
    cooldownLeft: 0,
    trainQueue: 0,
    trainProgress: 0,
    rallyPoint: null,
    lastShotAt: null,
    lastShotTarget: null
  };
}

function makeNode(state: GameState, type: ResourceType, pos: Vec2, amount: number): ResourceNode {
  return { id: nextId(state, type), type, pos: { ...pos }, amountLeft: amount, maxAmount: amount };
}

function pushLog(state: GameState, text: string) {
  state.log.push({ time: state.time, text });
  if (state.log.length > 40) state.log.splice(0, state.log.length - 40);
}

export function createInitialState(): GameState {
  const state: GameState = {
    time: 0,
    seq: 0,
    gold: 120,
    wood: 80,
    units: [],
    buildings: [],
    resources: [],
    selectedIds: [],
    waveNumber: 0,
    nextWaveAt: FIRST_WAVE_AT,
    waveWarned: false,
    lastPlayerHitAt: null,
    lastPlayerHitPos: null,
    status: 'playing',
    log: [],
    stats: {
      goldGathered: 0,
      woodGathered: 0,
      soldiersTrained: 0,
      raidersDefeated: 0,
      unitsLost: 0
    }
  };

  state.buildings.push(makeBuilding(state, 'base', 'player', { x: -13.5, z: 11.5 }));
  state.buildings.push(makeBuilding(state, 'enemyCamp', 'enemy', { x: 16, z: -12 }));

  state.units.push(makeUnit(state, 'worker', 'player', { x: -11.5, z: 13.5 }));
  state.units.push(makeUnit(state, 'worker', 'player', { x: -15.5, z: 13 }));
  state.units.push(makeUnit(state, 'worker', 'player', { x: -12, z: 9.5 }));
  state.units.push(makeUnit(state, 'raider', 'enemy', { x: 14, z: -9.5 }));
  state.units.push(makeUnit(state, 'raider', 'enemy', { x: 18, z: -10 }));

  state.resources.push(makeNode(state, 'gold', { x: -19.5, z: 6.5 }, 500));
  state.resources.push(makeNode(state, 'gold', { x: -18, z: 2.5 }, 500));
  state.resources.push(makeNode(state, 'wood', { x: -7.5, z: 19 }, 140));
  state.resources.push(makeNode(state, 'wood', { x: -4.5, z: 17.5 }, 140));
  state.resources.push(makeNode(state, 'wood', { x: -6, z: 15.5 }, 140));
  state.resources.push(makeNode(state, 'wood', { x: -2.5, z: 19.5 }, 140));
  state.resources.push(makeNode(state, 'wood', { x: -9.5, z: 21 }, 140));
  state.resources.push(makeNode(state, 'wood', { x: -1.5, z: 16 }, 140));

  pushLog(state, '퍼피 프론티어 개척 시작 — 골드와 나무를 모으세요');
  return state;
}

export function findUnit(state: GameState, id: string): Unit | undefined {
  return state.units.find((unit) => unit.id === id);
}

export function findBuilding(state: GameState, id: string): Building | undefined {
  return state.buildings.find((building) => building.id === id);
}

export function findNode(state: GameState, id: string): ResourceNode | undefined {
  return state.resources.find((node) => node.id === id);
}

function playerBase(state: GameState): Building | undefined {
  return state.buildings.find((building) => building.kind === 'base' && building.faction === 'player');
}

export function setSelection(state: GameState, ids: string[]) {
  const valid = new Set([...state.units.map((u) => u.id), ...state.buildings.map((b) => b.id)]);
  state.selectedIds = ids.filter((id) => valid.has(id));
}

export function selectedPlayerUnits(state: GameState): Unit[] {
  return state.selectedIds
    .map((id) => findUnit(state, id))
    .filter((unit): unit is Unit => Boolean(unit && unit.faction === 'player'));
}

// Selection readability: aggregate the current selection into per-kind groups
// with summed HP so the HUD panel can show what a mixed group actually is.
export function selectionSummary(state: GameState): SelectionSummary {
  const groups: SelectionGroup[] = [];
  let hp = 0;
  let maxHp = 0;
  let count = 0;
  for (const id of state.selectedIds) {
    const entity = findUnit(state, id) ?? findBuilding(state, id);
    if (!entity) continue;
    count += 1;
    hp += Math.max(0, entity.hp);
    maxHp += entity.maxHp;
    const group = groups.find((entry) => entry.kind === entity.kind);
    if (group) {
      group.count += 1;
      group.hp += Math.max(0, entity.hp);
      group.maxHp += entity.maxHp;
    } else {
      groups.push({ kind: entity.kind, count: 1, hp: Math.max(0, entity.hp), maxHp: entity.maxHp });
    }
  }
  return { count, hp, maxHp, groups };
}

// Defense readability: expose the attack radius of each selected player tower
// so the scene and minimap range rings always match real tower stats.
export function towerRangePreviews(state: GameState): RangePreview[] {
  const previews: RangePreview[] = [];
  for (const id of state.selectedIds) {
    const building = findBuilding(state, id);
    if (!building || building.faction !== 'player' || building.attackRange <= 0) continue;
    previews.push({ id: building.id, pos: { ...building.pos }, radius: building.attackRange });
  }
  return previews;
}

// Production readability: expose each selected player barracks' rally point so
// the scene flag and minimap marker always match the real muster target.
export function rallyPreviews(state: GameState): RallyPreview[] {
  const previews: RallyPreview[] = [];
  for (const id of state.selectedIds) {
    const building = findBuilding(state, id);
    if (!building || building.faction !== 'player' || building.kind !== 'barracks' || !building.rallyPoint) continue;
    previews.push({ id: building.id, from: { ...building.pos }, point: { ...building.rallyPoint } });
  }
  return previews;
}

// Combat readability: expose each player tower's most recent shot so the 3D
// tracer and the minimap line always point at the raider that was actually
// hit. Shots older than TOWER_SHOT_DURATION (or after the match ends) vanish.
export function towerShots(state: GameState): TowerShot[] {
  const shots: TowerShot[] = [];
  if (state.status !== 'playing') return shots;
  for (const building of state.buildings) {
    if (building.kind !== 'tower' || building.faction !== 'player') continue;
    if (building.lastShotAt === null || building.lastShotTarget === null) continue;
    const age = state.time - building.lastShotAt;
    if (age > TOWER_SHOT_DURATION) continue;
    shots.push({ id: building.id, from: { ...building.pos }, to: { ...building.lastShotTarget }, age });
  }
  return shots;
}

// Economy readability: surface worker puppies that are doing nothing so the
// HUD can offer a one-click "put them back to work" selection.
export function idleWorkerIds(state: GameState): string[] {
  return state.units
    .filter((unit) => unit.kind === 'worker' && unit.faction === 'player' && unit.order.type === 'idle')
    .map((unit) => unit.id);
}

export const DRAG_SELECT_PADDING = 0.35;

// Drag-select: player units inside the world-space box spanned by two ground
// points, in either corner order, padded so units right on the edge count.
export function playerUnitIdsInRect(state: GameState, a: Vec2, b: Vec2): string[] {
  const minX = Math.min(a.x, b.x) - DRAG_SELECT_PADDING;
  const maxX = Math.max(a.x, b.x) + DRAG_SELECT_PADDING;
  const minZ = Math.min(a.z, b.z) - DRAG_SELECT_PADDING;
  const maxZ = Math.max(a.z, b.z) + DRAG_SELECT_PADDING;
  return state.units
    .filter(
      (unit) =>
        unit.faction === 'player' &&
        unit.pos.x >= minX &&
        unit.pos.x <= maxX &&
        unit.pos.z >= minZ &&
        unit.pos.z <= maxZ
    )
    .map((unit) => unit.id);
}

export function canAfford(state: GameState, kind: BuildableKind | 'soldier'): boolean {
  const cost = COSTS[kind];
  return state.gold >= cost.gold && state.wood >= cost.wood;
}

function spend(state: GameState, kind: BuildableKind | 'soldier') {
  const cost = COSTS[kind];
  state.gold -= cost.gold;
  state.wood -= cost.wood;
}

function slotIsFree(state: GameState, slot: Vec2): boolean {
  return state.buildings.every((building) => dist(building.pos, slot) > 3);
}

export function placeBuilding(state: GameState, kind: BuildableKind): Building | null {
  if (state.status !== 'playing' || !canAfford(state, kind)) return null;
  const slot = BUILD_SLOTS.find((candidate) => slotIsFree(state, candidate));
  if (!slot) return null;
  spend(state, kind);
  const building = makeBuilding(state, kind, 'player', slot);
  state.buildings.push(building);
  pushLog(state, kind === 'barracks' ? '막사 건설 완료' : '방어 타워 건설 완료');
  return building;
}

export function trainSoldier(state: GameState): boolean {
  if (state.status !== 'playing' || !canAfford(state, 'soldier')) return false;
  const barracks = state.buildings.find((building) => building.kind === 'barracks' && building.faction === 'player');
  if (!barracks) return false;
  spend(state, 'soldier');
  barracks.trainQueue += 1;
  pushLog(state, '병사 훈련 시작');
  return true;
}

export function commandSmart(state: GameState, unitIds: string[], target: SmartTarget) {
  if (state.status !== 'playing') return;
  const units = unitIds
    .map((id) => findUnit(state, id))
    .filter((unit): unit is Unit => Boolean(unit && unit.faction === 'player'));

  const node = target.entityId ? findNode(state, target.entityId) : undefined;
  const enemyUnit = target.entityId ? findUnit(state, target.entityId) : undefined;
  const enemyBuilding = target.entityId ? findBuilding(state, target.entityId) : undefined;
  const hostileId =
    enemyUnit && enemyUnit.faction === 'enemy'
      ? enemyUnit.id
      : enemyBuilding && enemyBuilding.faction === 'enemy'
        ? enemyBuilding.id
        : null;

  // Rally point: a smart command on open ground with a barracks selected moves
  // its muster point, so freshly trained soldiers walk to the front instead of
  // idling at the barracks door. Gather/attack targets never move the rally.
  if (!node && !hostileId) {
    let rallied = false;
    for (const id of unitIds) {
      const building = findBuilding(state, id);
      if (!building || building.faction !== 'player' || building.kind !== 'barracks') continue;
      building.rallyPoint = { ...target.point };
      rallied = true;
    }
    if (rallied) pushLog(state, '집결 지점 지정 — 새로 훈련된 병사가 그곳으로 이동합니다');
  }

  for (const unit of units) {
    if (node && unit.kind === 'worker') {
      unit.order = { type: 'gather', nodeId: node.id };
      unit.lastGatherNodeId = node.id;
      unit.gatherProgress = 0;
    } else if (hostileId) {
      unit.order = { type: 'attack', targetId: hostileId };
    } else {
      unit.order = { type: 'move', target: { ...target.point } };
    }
  }
}

function clampToMap(pos: Vec2) {
  pos.x = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, pos.x));
  pos.z = Math.max(-MAP_HALF + 0.5, Math.min(MAP_HALF - 0.5, pos.z));
}

function moveToward(unit: Unit, target: Vec2, dt: number): number {
  const distance = dist(unit.pos, target);
  if (distance < 1e-6) return 0;
  const step = Math.min(distance, unit.speed * dt);
  unit.pos.x += ((target.x - unit.pos.x) / distance) * step;
  unit.pos.z += ((target.z - unit.pos.z) / distance) * step;
  clampToMap(unit.pos);
  return distance - step;
}

function findTargetEntity(state: GameState, id: string): { pos: Vec2; hp: number } | undefined {
  return findUnit(state, id) ?? findBuilding(state, id);
}

// Under-attack telegraph: only enemy attacks reach player-faction targets, so a
// player-faction hit here is always hostile damage worth alerting on.
function recordPlayerHit(state: GameState, pos: Vec2, isBase: boolean) {
  const quiet = state.lastPlayerHitAt === null || state.time - state.lastPlayerHitAt > THREAT_ALERT_DURATION;
  if (quiet) {
    pushLog(state, isBase ? '본부가 공격받고 있습니다 — 방어하세요!' : '아군이 공격받고 있습니다 — 미니맵을 확인하세요!');
  }
  state.lastPlayerHitAt = state.time;
  state.lastPlayerHitPos = { ...pos };
}

// Threat alert: derive the HUD alarm and minimap pulse from the last hostile
// hit so the alert always points at real, recent damage.
export function threatAlert(state: GameState): ThreatAlert {
  if (state.lastPlayerHitAt === null || state.lastPlayerHitPos === null) {
    return { active: false, pos: null, secondsAgo: null };
  }
  const secondsAgo = Math.max(0, state.time - state.lastPlayerHitAt);
  return {
    active: state.status === 'playing' && secondsAgo <= THREAT_ALERT_DURATION,
    pos: { ...state.lastPlayerHitPos },
    secondsAgo
  };
}

function damageTarget(state: GameState, id: string, amount: number) {
  const unit = findUnit(state, id);
  if (unit) {
    unit.hp -= amount;
    if (unit.faction === 'player') recordPlayerHit(state, unit.pos, false);
    return;
  }
  const building = findBuilding(state, id);
  if (building) {
    building.hp -= amount;
    if (building.faction === 'player') recordPlayerHit(state, building.pos, building.kind === 'base');
  }
}

function nearestPlayerTarget(state: GameState, from: Vec2, maxRange: number): { id: string; distance: number } | null {
  let best: { id: string; distance: number } | null = null;
  for (const unit of state.units) {
    if (unit.faction !== 'player') continue;
    const distance = dist(from, unit.pos);
    if (distance <= maxRange && (!best || distance < best.distance)) best = { id: unit.id, distance };
  }
  for (const building of state.buildings) {
    if (building.faction !== 'player') continue;
    const distance = dist(from, building.pos);
    if (distance <= maxRange && (!best || distance < best.distance)) best = { id: building.id, distance };
  }
  return best;
}

function nearestEnemyUnit(state: GameState, from: Vec2, maxRange: number): Unit | null {
  let best: Unit | null = null;
  let bestDistance = Infinity;
  for (const unit of state.units) {
    if (unit.faction !== 'enemy') continue;
    const distance = dist(from, unit.pos);
    if (distance <= maxRange && distance < bestDistance) {
      best = unit;
      bestDistance = distance;
    }
  }
  return best;
}

function nearestNodeOfType(state: GameState, from: Vec2, type: ResourceType): ResourceNode | null {
  let best: ResourceNode | null = null;
  let bestDistance = Infinity;
  for (const node of state.resources) {
    if (node.type !== type || node.amountLeft <= 0) continue;
    const distance = dist(from, node.pos);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return best;
}

function stepGather(state: GameState, unit: Unit, dt: number) {
  if (unit.order.type !== 'gather') return;
  const node = findNode(state, unit.order.nodeId);
  if (!node || node.amountLeft <= 0) {
    const fallbackType = node?.type ?? (unit.carry?.type ?? 'gold');
    const replacement = nearestNodeOfType(state, unit.pos, fallbackType);
    if (replacement) {
      unit.order = { type: 'gather', nodeId: replacement.id };
      unit.lastGatherNodeId = replacement.id;
    } else {
      unit.order = unit.carry ? { type: 'deposit' } : { type: 'idle' };
    }
    return;
  }
  if (unit.carry && unit.carry.amount >= WORKER_CARRY_CAP) {
    unit.order = { type: 'deposit' };
    return;
  }
  if (dist(unit.pos, node.pos) > GATHER_RANGE) {
    moveToward(unit, node.pos, dt);
    return;
  }
  unit.gatherProgress += dt;
  if (unit.gatherProgress >= GATHER_TIME) {
    unit.gatherProgress = 0;
    const amount = Math.min(WORKER_CARRY_CAP, node.amountLeft);
    node.amountLeft -= amount;
    unit.carry = { type: node.type, amount };
    unit.lastGatherNodeId = node.id;
    unit.order = { type: 'deposit' };
    if (node.amountLeft <= 0) {
      pushLog(state, node.type === 'gold' ? '금 광맥이 고갈되었습니다' : '나무가 모두 베어졌습니다');
    }
  }
}

function stepDeposit(state: GameState, unit: Unit, dt: number) {
  const base = playerBase(state);
  if (!base) {
    unit.order = { type: 'idle' };
    return;
  }
  if (!unit.carry) {
    unit.order = { type: 'idle' };
    return;
  }
  if (dist(unit.pos, base.pos) > DEPOSIT_RANGE) {
    moveToward(unit, base.pos, dt);
    return;
  }
  if (unit.carry.type === 'gold') {
    state.gold += unit.carry.amount;
    state.stats.goldGathered += unit.carry.amount;
  } else {
    state.wood += unit.carry.amount;
    state.stats.woodGathered += unit.carry.amount;
  }
  unit.carry = null;
  const backTo = unit.lastGatherNodeId ? findNode(state, unit.lastGatherNodeId) : undefined;
  if (backTo && backTo.amountLeft > 0) {
    unit.order = { type: 'gather', nodeId: backTo.id };
  } else {
    unit.order = { type: 'idle' };
  }
}

function stepAttack(state: GameState, unit: Unit, dt: number) {
  if (unit.order.type !== 'attack') return;
  const target = findTargetEntity(state, unit.order.targetId);
  if (!target || target.hp <= 0) {
    unit.order = unit.faction === 'enemy' ? { type: 'assault' } : { type: 'idle' };
    return;
  }
  if (dist(unit.pos, target.pos) > unit.attackRange) {
    moveToward(unit, target.pos, dt);
    return;
  }
  if (unit.cooldownLeft <= 0) {
    damageTarget(state, unit.order.targetId, unit.attackDamage);
    unit.cooldownLeft = unit.attackCooldown;
  }
}

function stepAssault(state: GameState, unit: Unit, dt: number) {
  const acquired = nearestPlayerTarget(state, unit.pos, RAIDER_AGGRO_RANGE);
  if (acquired) {
    unit.order = { type: 'attack', targetId: acquired.id };
    stepAttack(state, unit, dt);
    return;
  }
  const base = playerBase(state);
  if (base) {
    moveToward(unit, base.pos, dt);
    return;
  }
  const anyTarget = nearestPlayerTarget(state, unit.pos, Infinity);
  if (anyTarget) unit.order = { type: 'attack', targetId: anyTarget.id };
  else unit.order = { type: 'idle' };
}

function stepUnit(state: GameState, unit: Unit, dt: number) {
  unit.cooldownLeft = Math.max(0, unit.cooldownLeft - dt);
  switch (unit.order.type) {
    case 'idle':
      // Soldier auto-defense: an idle player soldier engages the nearest raider
      // in aggro range on its own, so the standing army actually defends the
      // base instead of watching raiders walk past. Workers never auto-engage,
      // and only enemy units (not the camp) trigger the aggro.
      if (unit.kind === 'soldier' && unit.faction === 'player') {
        const threat = nearestEnemyUnit(state, unit.pos, SOLDIER_AGGRO_RANGE);
        if (threat) {
          unit.order = { type: 'attack', targetId: threat.id };
          stepAttack(state, unit, dt);
        }
      }
      break;
    case 'move': {
      const remaining = moveToward(unit, unit.order.target, dt);
      if (remaining < 0.15) unit.order = { type: 'idle' };
      break;
    }
    case 'gather':
      stepGather(state, unit, dt);
      break;
    case 'deposit':
      stepDeposit(state, unit, dt);
      break;
    case 'attack':
      stepAttack(state, unit, dt);
      break;
    case 'assault':
      stepAssault(state, unit, dt);
      break;
  }
}

function stepBuilding(state: GameState, building: Building, dt: number) {
  building.cooldownLeft = Math.max(0, building.cooldownLeft - dt);

  if (building.kind === 'tower' && building.faction === 'player') {
    const target = nearestEnemyUnit(state, building.pos, building.attackRange);
    if (target && building.cooldownLeft <= 0) {
      target.hp -= building.attackDamage;
      building.cooldownLeft = building.attackCooldown;
      building.lastShotAt = state.time;
      building.lastShotTarget = { ...target.pos };
    }
  }

  if (building.kind === 'barracks' && building.trainQueue > 0) {
    building.trainProgress += dt;
    if (building.trainProgress >= TRAIN_TIME) {
      building.trainProgress = 0;
      building.trainQueue -= 1;
      const spawnPos = { x: building.pos.x + 2.2, z: building.pos.z + 1.6 };
      clampToMap(spawnPos);
      const spawnOrder: UnitOrder = building.rallyPoint
        ? { type: 'move', target: { ...building.rallyPoint } }
        : { type: 'idle' };
      state.units.push(makeUnit(state, 'soldier', 'player', spawnPos, spawnOrder));
      state.stats.soldiersTrained += 1;
      pushLog(state, '병사가 전열에 합류했습니다');
    }
  }
}

// Wave 1 sends a single raider so a first-time player can survive while learning
// the gather → build → train loop; later waves ramp up to the cap.
export function waveSize(waveNumber: number): number {
  return Math.min(1 + Math.floor(waveNumber / 2), 5);
}

// Wave preview: derive the incoming wave's number, size, and countdown from
// real state so the HUD chip and warning log telegraph the exact threat.
export function waveForecast(state: GameState): WaveForecast {
  const waveNumber = state.waveNumber + 1;
  return {
    waveNumber,
    size: waveSize(waveNumber),
    secondsLeft: Math.max(0, Math.ceil(state.nextWaveAt - state.time)),
    imminent: state.status === 'playing' && state.time >= state.nextWaveAt - WAVE_WARNING_LEAD
  };
}

function spawnWave(state: GameState) {
  const camp = state.buildings.find((building) => building.kind === 'enemyCamp' && building.hp > 0);
  if (!camp) return;
  state.waveNumber += 1;
  state.waveWarned = false;
  const count = waveSize(state.waveNumber);
  for (let i = 0; i < count; i += 1) {
    const spawnPos = { x: camp.pos.x - 2 - i * 1.4, z: camp.pos.z + 2 + (i % 2) * 1.6 };
    clampToMap(spawnPos);
    state.units.push(makeUnit(state, 'raider', 'enemy', spawnPos, { type: 'assault' }));
  }
  pushLog(state, `라쿤 습격대 ${state.waveNumber}차 웨이브 출격 (${count}기)`);
}

function removeDead(state: GameState) {
  const deadUnits = state.units.filter((unit) => unit.hp <= 0);
  if (deadUnits.length > 0) {
    state.units = state.units.filter((unit) => unit.hp > 0);
    state.selectedIds = state.selectedIds.filter((id) => !deadUnits.some((unit) => unit.id === id));
    for (const unit of deadUnits) {
      if (unit.faction === 'enemy') state.stats.raidersDefeated += 1;
      else state.stats.unitsLost += 1;
    }
  }

  const deadBuildings = state.buildings.filter((building) => building.hp <= 0);
  if (deadBuildings.length > 0) {
    state.buildings = state.buildings.filter((building) => building.hp > 0);
    state.selectedIds = state.selectedIds.filter((id) => !deadBuildings.some((building) => building.id === id));
    for (const building of deadBuildings) {
      if (building.kind === 'enemyCamp') {
        state.status = 'won';
        pushLog(state, '라쿤 캠프 파괴 — 승리!');
      } else if (building.kind === 'base') {
        state.status = 'lost';
        pushLog(state, '본부가 파괴되었습니다 — 패배');
      } else {
        pushLog(state, building.kind === 'barracks' ? '막사가 파괴되었습니다' : '타워가 파괴되었습니다');
      }
    }
  }
}

// Progressive onboarding: derive the next mission step from real simulation
// state so the HUD hint always matches what the player can actually do.
export function missionHint(state: GameState): MissionHint {
  const total = 4;
  const hasBarracks = state.buildings.some((building) => building.kind === 'barracks' && building.faction === 'player');
  const soldiers = state.units.filter((unit) => unit.kind === 'soldier' && unit.faction === 'player').length;

  if (!hasBarracks) {
    const gathering = state.units.some(
      (unit) =>
        unit.kind === 'worker' &&
        unit.faction === 'player' &&
        (unit.order.type === 'gather' || unit.order.type === 'deposit')
    );
    if (!gathering) {
      return {
        step: 1,
        total,
        title: '자원 채집',
        detail: '일꾼 퍼피를 좌클릭으로 선택하고 금광이나 나무를 우클릭하세요'
      };
    }
    return {
      step: 2,
      total,
      title: '막사 건설',
      detail: `자원이 모이면 막사 건설 버튼을 누르세요 (골드 ${COSTS.barracks.gold} · 나무 ${COSTS.barracks.wood})`
    };
  }

  if (soldiers < MISSION_SOLDIER_TARGET) {
    return {
      step: 3,
      total,
      title: '병사 훈련',
      detail: `병사 훈련 버튼으로 병사를 모으세요 (${soldiers}/${MISSION_SOLDIER_TARGET})`
    };
  }

  return {
    step: 4,
    total,
    title: '캠프 공격',
    detail: '병사를 선택하고 라쿤 캠프를 우클릭해 파괴하세요'
  };
}

// Post-run rating: score the whole run from MatchStats so the endgame overlay
// can show a number and grade that stay comparable across attempts.
export const SCORE_WEIGHTS = {
  resource: 1,
  soldierTrained: 40,
  raiderDefeated: 60,
  unitLost: 30,
  winBonus: 500,
  winSpeedWindow: 600
};

export const GRADE_THRESHOLDS: Record<Exclude<MatchGrade, 'C'>, number> = {
  S: 1200,
  A: 800,
  B: 400
};

export function matchScore(state: GameState): MatchScore {
  const { stats } = state;
  const economy = (stats.goldGathered + stats.woodGathered) * SCORE_WEIGHTS.resource;
  const military = stats.soldiersTrained * SCORE_WEIGHTS.soldierTrained + stats.raidersDefeated * SCORE_WEIGHTS.raiderDefeated;
  const penalty = stats.unitsLost * SCORE_WEIGHTS.unitLost;
  const winBonus =
    state.status === 'won'
      ? SCORE_WEIGHTS.winBonus + Math.max(0, SCORE_WEIGHTS.winSpeedWindow - Math.floor(state.time))
      : 0;
  const score = Math.max(0, Math.round(economy + military - penalty + winBonus));
  const grade: MatchGrade =
    score >= GRADE_THRESHOLDS.S ? 'S' : score >= GRADE_THRESHOLDS.A ? 'A' : score >= GRADE_THRESHOLDS.B ? 'B' : 'C';
  return { score, grade };
}

const MAX_STEP = 0.05;

export function advance(state: GameState, dtTotal: number) {
  if (state.status !== 'playing') return;
  let remaining = dtTotal;
  while (remaining > 1e-9 && state.status === 'playing') {
    const dt = Math.min(MAX_STEP, remaining);
    remaining -= dt;
    state.time += dt;

    if (!state.waveWarned && state.time >= state.nextWaveAt - WAVE_WARNING_LEAD) {
      state.waveWarned = true;
      pushLog(state, `라쿤 습격대 ${waveSize(state.waveNumber + 1)}기가 다가옵니다 — 방어를 준비하세요!`);
    }

    if (state.time >= state.nextWaveAt) {
      spawnWave(state);
      state.nextWaveAt += WAVE_INTERVAL;
    }

    for (const unit of state.units) stepUnit(state, unit, dt);
    for (const building of state.buildings) stepBuilding(state, building, dt);
    removeDead(state);
  }
}
