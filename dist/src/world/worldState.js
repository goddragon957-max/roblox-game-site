import { createGridSpec, isInsideBounds, positionToKey } from './grid.js';

export function createEmptyWorld(options = {}) {
  const size = createGridSpec(options.size);
  const corePosition = options.corePosition ?? {
    x: Math.floor(size.x / 2),
    y: 1,
    z: Math.floor(size.z / 2),
  };

  return {
    size,
    mode: 'defense',
    phase: 'day',
    blocks: {},
    core: {
      position: corePosition,
      hp: options.coreHp ?? 100,
      maxHp: options.coreHp ?? 100,
    },
  };
}

export function getBlock(world, position) {
  return world.blocks[positionToKey(position)] ?? null;
}

export function hasBlock(world, position) {
  return getBlock(world, position) !== null;
}

export function placeBlock(world, position, type) {
  ensureInsideWorld(world, position);
  if (!type || typeof type !== 'string') {
    throw new Error('Block type must be a non-empty string');
  }

  return {
    ...world,
    blocks: {
      ...world.blocks,
      [positionToKey(position)]: type,
    },
  };
}

export function removeBlock(world, position) {
  ensureInsideWorld(world, position);
  const key = positionToKey(position);
  const blocks = { ...world.blocks };
  delete blocks[key];

  return {
    ...world,
    blocks,
  };
}

export function countBlocksByType(world) {
  return Object.values(world.blocks).reduce((counts, type) => {
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {});
}

export function createNightRaidPlan(world) {
  const counts = countBlocksByType(world);
  const day = world.day ?? 1;
  const wallDefense = counts.wall ?? 0;
  const enemyCount = Math.max(1, 2 + day * 3);
  const pressure = enemyCount - wallDefense * 2;
  const breachRisk = pressure >= 8 ? 'high' : pressure >= 4 ? 'medium' : 'low';
  const centerX = world.core.position.x;
  const entryLane = [-1, 0, 1].map((offset) => ({
    x: Math.max(0, Math.min(world.size.x - 1, centerX + offset)),
    y: 1,
    z: 0,
  }));

  return {
    day,
    enemyCount,
    wallDefense,
    breachRisk,
    entryLane,
    warning: breachRisk === 'high'
      ? '침입 위험 높음: 즉시 벽을 보강하고 진입로를 꺾어야 합니다.'
      : breachRisk === 'medium'
        ? '침입 위험 보통: 한 겹 더 막거나 유도 통로를 좁히세요.'
        : '방어벽이 버티겠지만, 밤에는 코어 주변을 계속 확인하세요.',
  };
}

export function createStarterArena(options = {}) {
  const world = createEmptyWorld(options);
  let next = world;

  for (let x = 0; x < world.size.x; x += 1) {
    for (let z = 0; z < world.size.z; z += 1) {
      next = placeBlock(next, { x, y: 0, z }, 'floor');
    }
  }

  const core = world.core.position;
  next = placeBlock(next, core, 'core');

  const wallZ = Math.max(1, core.z - 2);
  for (let x = Math.max(0, core.x - 1); x <= Math.min(world.size.x - 1, core.x + 1); x += 1) {
    next = placeBlock(next, { x, y: 1, z: wallZ }, 'wall');
  }

  return next;
}

function ensureInsideWorld(world, position) {
  if (!isInsideBounds(position, world.size)) {
    throw new Error(`Position ${positionToKey(position)} is outside world bounds`);
  }
}
