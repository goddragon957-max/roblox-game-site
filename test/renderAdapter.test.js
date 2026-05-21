import test from 'node:test';
import assert from 'node:assert/strict';

import { createStarterArena } from '../src/world/worldState.js';
import {
  createBlockholdSceneState,
  createHudModel,
  createRenderObjectsFromWorld,
} from '../src/renderAdapter.js';

test('createRenderObjectsFromWorld converts starter arena blocks into sorted voxel descriptors', () => {
  const world = createStarterArena({ size: { x: 4, y: 3, z: 4 } });
  const objects = createRenderObjectsFromWorld(world);

  assert.equal(objects.length, 20);
  assert.deepEqual(objects.map((object) => object.id).slice(0, 3), [
    'block-floor-0-0-0',
    'block-floor-0-0-1',
    'block-floor-0-0-2',
  ]);

  const core = objects.find((object) => object.type === 'core');
  assert.deepEqual(core, {
    id: 'block-core-2-1-2',
    type: 'core',
    geometry: 'box',
    size: { width: 0.92, height: 1.18, depth: 0.92 },
    position: { x: 0.5, y: 0.59, z: 0.5 },
    color: '#38bdf8',
    emissive: '#075985',
  });

  const wall = objects.find((object) => object.id === 'block-wall-1-1-1');
  assert.equal(wall.color, '#64748b');
  assert.equal(wall.position.x, -0.5);
  assert.equal(wall.position.y, 0.5);
  assert.equal(wall.position.z, -0.5);
});

test('createHudModel exposes Blockhold Defense phase, core HP, and raid pressure', () => {
  const world = createStarterArena({ size: { x: 4, y: 3, z: 4 }, coreHp: 75 });
  const hud = createHudModel(world);

  assert.equal(hud.title, 'Blockhold Defense');
  assert.equal(hud.eyebrow, 'Day 1 · Build Phase');
  assert.equal(hud.status, 'Core HP 75/75 · Floor 16 · Walls 3 · Raid low (5 raiders)');
  assert.match(hud.help, /밤이 오기 전/);
});

test('createBlockholdSceneState defines camera, lights, and renderable starter arena', () => {
  const state = createBlockholdSceneState({ size: { x: 4, y: 3, z: 4 } });

  assert.equal(state.paused, false);
  assert.deepEqual(state.camera, { alpha: -0.78, beta: 1.05, radius: 8.5, target: { x: 0, y: 0.4, z: 0 } });
  assert.equal(state.lights.hemiIntensity, 0.56);
  assert.equal(state.objects.length, 20);
  assert.equal(state.hud.title, 'Blockhold Defense');
  assert.deepEqual(state.raidPlan, {
    day: 1,
    enemyCount: 5,
    wallDefense: 3,
    breachRisk: 'low',
    entryLane: [
      { x: 1, y: 1, z: 0 },
      { x: 2, y: 1, z: 0 },
      { x: 3, y: 1, z: 0 },
    ],
    warning: '방어벽이 버티겠지만, 밤에는 코어 주변을 계속 확인하세요.',
  });
});
