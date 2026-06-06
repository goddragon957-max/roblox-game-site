import type { BlockType, BuildReadiness, Cell, ClearGrade, GameState, Raider, RaiderKind, RaidPlan, Resources, RewardChoice, RewardOption, SupplyChoice, SupplyOption, UpgradeChoice, UpgradeOption } from './types';
import { inside, key, same } from './grid';
import { findPath, nearestWallTowardCore } from './pathfinding';

const BLOCKS: Record<BlockType, { hp: number; label: string }> = {
  wall: { hp: 5, label: 'Stone Wall' },
  trap: { hp: 1, label: 'Spike Trap' },
  turret: { hp: 2, label: 'Bolt Tower' },
  frost: { hp: 1, label: 'Frost Rune' },
};
const RAIDER_STATS: Record<RaiderKind, { hp: number; speed: number; bounty: number }> = {
  grunt: { hp: 3, speed: 1, bounty: 1 },
  runner: { hp: 2, speed: 2, bounty: 1 },
  brute: { hp: 8, speed: 1, bounty: 3 },
};
const LANES = [1, 3, 5, 7, 9];

export const REWARD_OPTIONS: RewardOption[] = [
  {
    id: 'repair',
    title: 'Core Patch',
    description: '안전하게 코어를 더 수리하고 벽을 보강합니다.',
    resources: { wall: 3, trap: 1 },
    coreRepair: 18,
  },
  {
    id: 'turret',
    title: 'Tower Crate',
    description: '다음 웨이브용 Bolt Tower와 스파이크를 추가합니다.',
    resources: { turret: 1, trap: 2 },
    coreRepair: 8,
  },
  {
    id: 'frost',
    title: 'Frost Cache',
    description: '킬존 유지용 Frost Rune과 방벽 재료를 받습니다.',
    resources: { frost: 2, wall: 1 },
    coreRepair: 10,
  },
];

export const SUPPLY_OPTIONS: SupplyOption[] = [
  {
    id: 'wall-pack',
    title: 'Wall Pack',
    description: 'Coins → extra stone walls for maze bends.',
    cost: 2,
    resources: { wall: 3 },
  },
  {
    id: 'trap-bundle',
    title: 'Trap Bundle',
    description: 'Restock a compact spike kill-zone.',
    cost: 3,
    resources: { trap: 2 },
  },
  {
    id: 'tower-kit',
    title: 'Tower Kit',
    description: 'Buy one Bolt Tower for late-wave pressure.',
    cost: 5,
    resources: { turret: 1 },
  },
  {
    id: 'frost-kit',
    title: 'Frost Kit',
    description: 'Add two slows to hold enemies in range.',
    cost: 4,
    resources: { frost: 2 },
  },
];

export const UPGRADE_OPTIONS: UpgradeOption[] = [
  {
    id: 'tower-damage',
    title: 'Tower Bolts I-III',
    description: 'Bolt Towers deal +1 damage per level, making kill zones finish brutes faster.',
    cost: 4,
    maxLevel: 3,
  },
  {
    id: 'trap-damage',
    title: 'Sharper Spikes I-III',
    description: 'Spike Traps deal +1 burst damage per level for clearer one-shot feedback.',
    cost: 3,
    maxLevel: 3,
  },
  {
    id: 'frost-duration',
    title: 'Deep Freeze I-II',
    description: 'Frost Runes slow for +1 tick per level so towers have longer to fire.',
    cost: 3,
    maxLevel: 2,
  },
];

function resourcesForDay(day: number): Resources {
  return {
    wall: 8 + (day - 1) * 2,
    trap: 5 + Math.floor((day - 1) * 1.5),
    turret: 2 + Math.floor((day - 1) / 2),
    frost: 2 + Math.floor((day - 1) / 2),
  };
}

export function getRaidPlan(day: number): RaidPlan {
  const total = 4 + day * 4;
  const mix: Record<RaiderKind, number> = { grunt: 0, runner: 0, brute: 0 };
  for (let i = 0; i < total; i += 1) {
    const kind: RaiderKind = i % 7 === 6 ? 'brute' : i % 3 === 2 ? 'runner' : 'grunt';
    mix[kind] += 1;
  }
  const score = mix.grunt + mix.runner * 2 + mix.brute * 4;
  const label = score >= 26 ? 'Severe' : score >= 18 ? 'High' : score >= 12 ? 'Rising' : 'Low';
  const advice = mix.brute >= 2
    ? 'Brutes incoming: double-wall the lane bend and keep a tower behind it.'
    : mix.runner >= mix.grunt
      ? 'Runner-heavy raid: add frost runes before traps to hold them in the kill zone.'
      : 'Balanced raid: bend the danger lane through traps and one Bolt Tower.';
  return {
    day,
    total,
    dangerLane: LANES[day % LANES.length],
    mix,
    threat: { score, label, advice },
    rewardPreview: resourcesForDay(day + 1),
  };
}

export function getRaidBreakdown(state: GameState): { alive: number; cleared: number; mix: Record<RaiderKind, number>; mostThreatening?: RaiderKind } {
  const mix: Record<RaiderKind, number> = { grunt: 0, runner: 0, brute: 0 };
  state.raiders.forEach((raider) => {
    if (raider.resolved || raider.hp <= 0) return;
    mix[raider.kind] += 1;
  });
  const alive = mix.grunt + mix.runner + mix.brute;
  const priority: RaiderKind[] = ['brute', 'runner', 'grunt'];
  return {
    alive,
    cleared: Math.max(0, state.totalRaiders - alive),
    mix,
    mostThreatening: priority.find((kind) => mix[kind] > 0),
  };
}

export function getBuildReadiness(state: GameState): BuildReadiness {
  const plan = getRaidPlan(state.day);
  const recommended: Resources = {
    wall: Math.min(12, 4 + Math.ceil(plan.threat.score / 5)),
    trap: 2 + plan.mix.runner + Math.ceil(plan.mix.brute / 2),
    turret: 1 + Math.floor(plan.threat.score / 14),
    frost: plan.mix.runner > 0 || plan.mix.brute > 0 ? 1 + Math.floor(plan.mix.runner / 3) : 1,
  };
  const missing: Partial<Resources> = {};
  (Object.keys(recommended) as BlockType[]).forEach((type) => {
    const placed = Object.values(state.blocks).filter((block) => block.type === type).length;
    const available = placed + state.resources[type];
    if (available < recommended[type]) missing[type] = recommended[type] - available;
  });
  const missingEntries = Object.entries(missing).filter(([, amount]) => (amount ?? 0) > 0);
  if (missingEntries.length === 0) {
    return {
      ready: true,
      label: 'Ready Hold',
      advice: `Lane X${plan.dangerLane} has enough walls, slows, traps, and tower pressure for this forecast.`,
      recommended,
      missing,
    };
  }
  const topMissing = missingEntries
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0][0] as BlockType;
  const tips: Record<BlockType, string> = {
    wall: 'buy/keep more Stone Walls so the danger lane bends before the core.',
    trap: 'add Spike Traps on the lane bend for visible burst kills.',
    turret: 'save for at least one Bolt Tower behind the choke.',
    frost: 'place Frost Runes before traps to hold runners and brutes in the kill zone.',
  };
  return {
    ready: false,
    label: 'Needs Prep',
    advice: `Priority: ${tips[topMissing]}`,
    recommended,
    missing,
  };
}

export function createInitialState(): GameState {
  return {
    day: 1,
    phase: 'build',
    paused: false,
    size: 11,
    core: { x: 5, z: 8 },
    coreHp: 100,
    maxCoreHp: 100,
    resources: { wall: 8, trap: 5, turret: 2, frost: 2 },
    selected: 'wall',
    blocks: {},
    raiders: [],
    totalRaiders: 0,
    coins: 0,
    upgrades: { towerDamage: 0, trapDamage: 0, frostDuration: 0 },
    kills: 0,
    coreHits: 0,
    combo: 0,
    lastClearGrade: undefined,
    combatLog: ['Build phase: place walls to bend lanes, then stack traps/towers into a kill zone.'],
    dangerLane: 5,
    message: 'Build to Survive + Tower Defense식으로 길목을 막고, 함정/타워 킬존을 만드세요.',
  };
}

function logEvent(state: GameState, event: string): string[] {
  return [event, ...state.combatLog].slice(0, 4);
}

function comboBonus(nextCombo: number): number {
  return nextCombo > 0 && nextCombo % 3 === 0 ? 1 : 0;
}

export function placeBlock(state: GameState, cell: Cell, type = state.selected): GameState {
  if (state.phase !== 'build' || !inside(state, cell) || same(cell, state.core) || state.blocks[key(cell)] || state.resources[type] <= 0) return state;
  if (cell.z === 0) return { ...state, message: '스폰 줄에는 설치할 수 없습니다.' };
  return {
    ...state,
    resources: { ...state.resources, [type]: state.resources[type] - 1 },
    blocks: { ...state.blocks, [key(cell)]: { type, hp: BLOCKS[type].hp, cooldown: 0 } },
    message: `${BLOCKS[type].label} 배치 완료 · Kill zone을 만들어보세요.`,
  };
}

export function removeBlock(state: GameState, cell: Cell): GameState {
  if (state.phase !== 'build') return state;
  const k = key(cell);
  const b = state.blocks[k];
  if (!b) return state;
  const blocks = { ...state.blocks };
  delete blocks[k];
  return { ...state, blocks, resources: { ...state.resources, [b.type]: state.resources[b.type] + 1 }, message: 'Block removed' };
}

function spawnRaiders(state: GameState): Raider[] {
  const { total, dangerLane } = getRaidPlan(state.day);
  return Array.from({ length: total }, (_, i) => {
    const kind: RaiderKind = i % 7 === 6 ? 'brute' : i % 3 === 2 ? 'runner' : 'grunt';
    const stats = RAIDER_STATS[kind];
    const lane = i % 2 === 0 ? dangerLane : LANES[(i + state.day) % LANES.length];
    return {
      id: `d${state.day}-${i}`,
      kind,
      cell: { x: lane, z: 0 },
      hp: stats.hp + Math.floor(state.day / 3),
      maxHp: stats.hp + Math.floor(state.day / 3),
      speed: stats.speed,
      bounty: stats.bounty,
      path: [],
      pathIndex: 0,
      attackCooldown: 0,
    };
  });
}

export function startRaid(state: GameState): GameState {
  if (state.phase !== 'build') return state;
  const raiders = spawnRaiders(state).map((r) => ({ ...r, path: findPath(state, r.cell) ?? [] }));
  const dangerLane = raiders[0]?.cell.x ?? state.dangerLane;
  return {
    ...state,
    phase: 'raid',
    raiders,
    totalRaiders: raiders.length,
    dangerLane,
    combo: 0,
    lastClearGrade: undefined,
    combatLog: logEvent(state, `Raid started: ${raiders.length} raiders are pushing lane X${dangerLane}.`),
    message: `Night raid: ${raiders.length} enemies · ${getRaidPlan(state.day).threat.label} threat · main lane X${dangerLane} · 타워/함정 킬존을 지켜보세요!`,
  };
}

export function nextDay(state: GameState, rewardId: RewardChoice = 'repair'): GameState {
  const baseResources = resourcesForDay(state.day + 1);
  const reward = REWARD_OPTIONS.find((option) => option.id === rewardId) ?? REWARD_OPTIONS[0];
  const resources = { ...baseResources };
  Object.entries(reward.resources).forEach(([type, amount]) => {
    resources[type as BlockType] += amount ?? 0;
  });
  return {
    ...state,
    day: state.day + 1,
    phase: 'build',
    resources,
    coreHp: Math.min(state.maxCoreHp, state.coreHp + 12 + reward.coreRepair),
    raiders: [],
    totalRaiders: 0,
    selected: 'wall',
    coreHits: 0,
    lastClearGrade: undefined,
    combatLog: logEvent(state, `Reward chosen: ${reward.title} · bonus supplies delivered for Day ${state.day + 1}.`),
    message: `Day ${state.day + 1} 준비 시간 · ${reward.title} 보상 적용 완료.`,
  };
}

export function buySupply(state: GameState, supplyId: SupplyChoice): GameState {
  if (state.phase !== 'build') return state;
  const supply = SUPPLY_OPTIONS.find((option) => option.id === supplyId);
  if (!supply) return state;
  if (state.coins < supply.cost) {
    return { ...state, message: `${supply.title} requires ${supply.cost} coins · clear raids to earn more.` };
  }
  const resources = { ...state.resources };
  Object.entries(supply.resources).forEach(([type, amount]) => {
    resources[type as BlockType] += amount ?? 0;
  });
  return {
    ...state,
    coins: state.coins - supply.cost,
    resources,
    combatLog: logEvent(state, `Purchased ${supply.title} for ${supply.cost} coins.`),
    message: `${supply.title} purchased · reinforce your kill zone before Start Raid.`,
  };
}

const upgradeKey: Record<UpgradeChoice, keyof GameState['upgrades']> = {
  'tower-damage': 'towerDamage',
  'trap-damage': 'trapDamage',
  'frost-duration': 'frostDuration',
};

export function buyUpgrade(state: GameState, upgradeId: UpgradeChoice): GameState {
  if (state.phase !== 'build') return state;
  const upgrade = UPGRADE_OPTIONS.find((option) => option.id === upgradeId);
  if (!upgrade) return state;
  const keyName = upgradeKey[upgradeId];
  const currentLevel = state.upgrades[keyName];
  if (currentLevel >= upgrade.maxLevel) {
    return { ...state, message: `${upgrade.title} is already max level.` };
  }
  if (state.coins < upgrade.cost) {
    return { ...state, message: `${upgrade.title} requires ${upgrade.cost} coins · earn kills or clear bonuses first.` };
  }
  const nextLevel = currentLevel + 1;
  return {
    ...state,
    coins: state.coins - upgrade.cost,
    upgrades: { ...state.upgrades, [keyName]: nextLevel },
    combatLog: logEvent(state, `Upgraded ${upgrade.title} to Lv ${nextLevel}/${upgrade.maxLevel}.`),
    message: `${upgrade.title} Lv ${nextLevel} unlocked · permanent kill-zone power increased.`,
  };
}

export function restart(): GameState {
  return createInitialState();
}

function damageRaider(state: GameState, targetId: string, amount: number, slow = 0): GameState {
  let kills = 0;
  let bounty = 0;
  let killedKind: RaiderKind | undefined;
  const raiders = state.raiders.map((r) => {
    if (r.id !== targetId || r.resolved || r.hp <= 0) return r;
    const hp = r.hp - amount;
    if (hp <= 0) {
      kills += 1;
      bounty += r.bounty;
      killedKind = r.kind;
      return { ...r, hp: 0, resolved: true };
    }
    return { ...r, hp, slowed: Math.max(r.slowed ?? 0, slow) };
  });
  if (kills) {
    const nextCombo = state.combo + kills;
    const streakBonus = comboBonus(nextCombo);
    const bonusText = streakBonus ? ` · streak bonus +${streakBonus}` : '';
    return {
      ...state,
      raiders,
      kills: state.kills + kills,
      coins: state.coins + bounty + streakBonus,
      combo: nextCombo,
      combatLog: logEvent(state, `Bolt tower eliminated ${killedKind ?? 'raider'} · +${bounty} coins${bonusText} · combo x${nextCombo}.`),
    };
  }
  return { ...state, raiders };
}

function runTowers(state: GameState): GameState {
  let next = { ...state, blocks: { ...state.blocks } };
  for (const [blockKey, block] of Object.entries(state.blocks)) {
    if (block.type !== 'turret') continue;
    const [x, z] = blockKey.split(',').map(Number);
    const target = next.raiders
      .filter((r) => !r.resolved && r.hp > 0)
      .map((r) => ({ r, d: Math.abs(r.cell.x - x) + Math.abs(r.cell.z - z) }))
      .filter(({ d }) => d <= 3)
      .sort((a, b) => a.d - b.d || b.r.cell.z - a.r.cell.z)[0]?.r;
    if (target) next = damageRaider(next, target.id, 1 + next.upgrades.towerDamage);
  }
  return next;
}

function gradeClear(state: GameState): ClearGrade {
  if (state.coreHits === 0 && state.coreHp >= Math.ceil(state.maxCoreHp * 0.75)) {
    return { stars: 3, label: 'Flawless Hold', bonusCoins: 3 };
  }
  if (state.coreHits <= 2 && state.coreHp >= Math.ceil(state.maxCoreHp * 0.4)) {
    return { stars: 2, label: 'Solid Hold', bonusCoins: 2 };
  }
  return { stars: 1, label: 'Last Stand', bonusCoins: 1 };
}

function resolveTrap(state: GameState, r: Raider, dest: Cell): { state: GameState; raider: Raider } {
  const k = key(dest);
  const block = state.blocks[k];
  if (!block || block.type === 'wall' || block.type === 'turret') return { state, raider: r };
  const blocks = { ...state.blocks };
  delete blocks[k];
  const damage = block.type === 'trap' ? 3 + state.upgrades.trapDamage : 1;
  const slow = block.type === 'frost' ? 2 + state.upgrades.frostDuration : 0;
  const hp = r.hp - damage;
  if (hp <= 0) {
    const nextCombo = state.combo + 1;
    const streakBonus = comboBonus(nextCombo);
    const bonusText = streakBonus ? ` · streak bonus +${streakBonus}` : '';
    return {
      state: { ...state, blocks, kills: state.kills + 1, coins: state.coins + r.bounty + streakBonus, combo: nextCombo, combatLog: logEvent(state, `${block.type === 'trap' ? 'Spike trap' : 'Frost rune'} stopped ${r.kind} · +${r.bounty} coins${bonusText} · combo x${nextCombo}.`) },
      raider: { ...r, hp: 0, resolved: true, cell: dest },
    };
  }
  return { state: block.type === 'frost' ? { ...state, blocks, combatLog: logEvent(state, `Frost rune slowed ${r.kind} in the kill zone.`) } : { ...state, blocks }, raider: { ...r, hp, slowed: Math.max(r.slowed ?? 0, slow), cell: dest } };
}

export function tick(state: GameState): GameState {
  if (state.phase !== 'raid' || state.paused) return state;
  let next: GameState = {
    ...state,
    blocks: { ...state.blocks },
    raiders: state.raiders.map((r) => ({ ...r, cell: { ...r.cell }, path: [...r.path] })),
  };

  next = runTowers(next);

  const moved: Raider[] = [];
  for (const original of next.raiders) {
    let r = { ...original, cell: { ...original.cell } };
    if (r.resolved || r.hp <= 0) {
      moved.push({ ...r, resolved: true });
      continue;
    }
    if (same(r.cell, next.core)) {
      const damage = r.kind === 'brute' ? 18 : 10;
      next.coreHp = Math.max(0, next.coreHp - damage);
      next.coreHits += 1;
      next.combo = 0;
      next.combatLog = logEvent(next, `${r.kind} breached the core · -${damage} HP · combo reset.`);
      moved.push({ ...r, resolved: true });
      continue;
    }

    const steps = r.slowed && r.slowed > 0 ? 1 : r.speed;
    let resolvedThisStep = false;
    for (let step = 0; step < steps && !resolvedThisStep; step += 1) {
      const path = findPath(next, r.cell);
      if (!path) {
        const wallKey = nearestWallTowardCore(next, r.cell);
        if (wallKey && next.blocks[wallKey]) {
          const wallDamage = r.kind === 'brute' ? 2 : 1;
          const remainingHp = next.blocks[wallKey].hp - wallDamage;
          if (remainingHp <= 0) {
            delete next.blocks[wallKey];
            next.combatLog = logEvent(next, `${r.kind} smashed wall ${wallKey} open · rebuild the choke before the next raid.`);
          } else {
            next.blocks[wallKey] = { ...next.blocks[wallKey], hp: remainingHp };
            next.combatLog = logEvent(next, `${r.kind} is battering wall ${wallKey} · wall HP ${remainingHp}.`);
          }
          resolvedThisStep = true;
          break;
        }
        next.coreHp = Math.max(0, next.coreHp - 5);
        next.coreHits += 1;
        next.combo = 0;
        next.combatLog = logEvent(next, `${r.kind} found a breach path · core -5 HP.`);
        r = { ...r, resolved: true };
        resolvedThisStep = true;
        break;
      }
      const dest = path[1] ?? path[0];
      const trapResult = resolveTrap(next, r, dest);
      next = trapResult.state;
      r = { ...trapResult.raider, path };
      if (r.resolved || same(r.cell, next.core)) resolvedThisStep = true;
    }
    r.slowed = Math.max(0, (r.slowed ?? 0) - 1);
    moved.push(r);
  }
  next.raiders = moved;

  if (next.coreHp <= 0) return { ...next, phase: 'defeat', combatLog: logEvent(next, 'Defeat: the core collapsed under the raid.'), message: '코어가 파괴되었습니다. Restart로 다시 도전하세요.' };
  if (next.raiders.every((r) => r.resolved || r.hp <= 0)) {
    const grade = gradeClear(next);
    return {
      ...next,
      phase: 'victory',
      coins: next.coins + grade.bonusCoins,
      lastClearGrade: grade,
      combatLog: logEvent(next, `${grade.label}: ${grade.stars}★ clear · +${grade.bonusCoins} bonus coins · choose a reward.`),
      message: `Raid cleared! ${grade.stars}★ ${grade.label} · ${next.kills} kills · +${grade.bonusCoins} bonus coins.`,
    };
  }
  const alive = next.raiders.filter((r) => !r.resolved && r.hp > 0).length;
  const cleared = next.totalRaiders - alive;
  return { ...next, message: `Raid in progress · ${cleared}/${next.totalRaiders} cleared · ${next.kills} kills · ${next.coreHits} core hits · combo x${Math.max(1, next.combo)}` };
}
