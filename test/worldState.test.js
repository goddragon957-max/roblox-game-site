import test from 'node:test';
import assert from 'node:assert/strict';

import {
  countBlocksByType,
  createEmptyWorld,
  createNightRaidPlan,
  createStarterArena,
  getBlock,
  hasBlock,
  placeBlock,
  removeBlock,
} from '../src/world/worldState.js';

test('createEmptyWorld creates a sparse Blockhold world with core metadata', () => {
  const world = createEmptyWorld({ size: { x: 4, y: 3, z: 4 } });

  assert.deepEqual(world.size, { x: 4, y: 3, z: 4 });
  assert.equal(world.mode, 'defense');
  assert.deepEqual(world.core.position, { x: 2, y: 1, z: 2 });
  assert.deepEqual(world.blocks, {});
});

test('placeBlock returns a new world with a block when position is valid', () => {
  const world = createEmptyWorld({ size: { x: 4, y: 3, z: 4 } });
  const next = placeBlock(world, { x: 1, y: 1, z: 1 }, 'wall');

  assert.notEqual(next, world);
  assert.equal(getBlock(next, { x: 1, y: 1, z: 1 }), 'wall');
  assert.equal(hasBlock(world, { x: 1, y: 1, z: 1 }), false);
});

test('placeBlock rejects out-of-bounds positions', () => {
  const world = createEmptyWorld({ size: { x: 4, y: 3, z: 4 } });

  assert.throws(
    () => placeBlock(world, { x: 4, y: 0, z: 0 }, 'wall'),
    /outside world bounds/,
  );
});

test('removeBlock returns a new world without the targeted block', () => {
  const world = placeBlock(createEmptyWorld({ size: { x: 4, y: 3, z: 4 } }), { x: 1, y: 1, z: 1 }, 'wall');
  const next = removeBlock(world, { x: 1, y: 1, z: 1 });

  assert.equal(hasBlock(next, { x: 1, y: 1, z: 1 }), false);
  assert.equal(hasBlock(world, { x: 1, y: 1, z: 1 }), true);
});

test('createStarterArena creates a floor, core, and starter wall blocks', () => {
  const world = createStarterArena({ size: { x: 6, y: 4, z: 6 } });
  const counts = countBlocksByType(world);

  assert.equal(counts.floor, 36);
  assert.equal(counts.core, 1);
  assert.ok(counts.wall >= 3);
  assert.equal(getBlock(world, world.core.position), 'core');
});

test('createNightRaidPlan scales raiders with the current day and subtracts wall defense', () => {
  const dayOne = createStarterArena({ size: { x: 6, y: 4, z: 6 } });
  const dayThree = { ...dayOne, day: 3 };

  assert.deepEqual(createNightRaidPlan(dayOne), {
    day: 1,
    enemyCount: 5,
    wallDefense: 3,
    breachRisk: 'low',
    entryLane: [
      { x: 2, y: 1, z: 0 },
      { x: 3, y: 1, z: 0 },
      { x: 4, y: 1, z: 0 },
    ],
    warning: '방어벽이 버티겠지만, 밤에는 코어 주변을 계속 확인하세요.',
  });
  assert.equal(createNightRaidPlan(dayThree).enemyCount, 11);
});

test('createNightRaidPlan marks high breach risk when walls are missing', () => {
  const bareWorld = createEmptyWorld({ size: { x: 5, y: 3, z: 5 } });
  const worldWithCore = placeBlock(bareWorld, bareWorld.core.position, 'core');
  const plan = createNightRaidPlan({ ...worldWithCore, day: 2 });

  assert.equal(plan.wallDefense, 0);
  assert.equal(plan.enemyCount, 8);
  assert.equal(plan.breachRisk, 'high');
  assert.match(plan.warning, /즉시 벽을 보강/);
});
