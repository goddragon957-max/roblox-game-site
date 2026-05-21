import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  createSceneObjects,
  updateOrbitalState,
  clampZoom,
} from '../src/sceneConfig.js';

test('createInitialState returns stable camera and animation defaults', () => {
  const state = createInitialState();

  assert.deepEqual(state.camera, { x: 0, y: 3.2, z: 8 });
  assert.equal(state.rotationSpeed, 0.012);
  assert.equal(state.orbitRadius, 2.4);
  assert.equal(state.paused, false);
});

test('createSceneObjects defines a central cube, satellite, and floor grid', () => {
  const objects = createSceneObjects();

  assert.equal(objects.length, 3);
  assert.deepEqual(objects.map((object) => object.id), ['core-cube', 'orbit-sphere', 'grid-floor']);
  assert.equal(objects[0].geometry, 'box');
  assert.equal(objects[1].geometry, 'sphere');
  assert.equal(objects[2].geometry, 'grid');
});

test('updateOrbitalState advances angle and computes satellite position', () => {
  const next = updateOrbitalState({ angle: 0, orbitRadius: 2 }, Math.PI / 2);

  assert.equal(next.angle, Math.PI / 2);
  assert.ok(Math.abs(next.position.x - 0) < 1e-10);
  assert.equal(next.position.y, 1.2);
  assert.ok(Math.abs(next.position.z - 2) < 1e-10);
});

test('clampZoom keeps camera distance inside usable 3D viewing bounds', () => {
  assert.equal(clampZoom(1), 3);
  assert.equal(clampZoom(6), 6);
  assert.equal(clampZoom(20), 12);
});
