import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createGridSpec,
  isInsideBounds,
  positionToKey,
  keyToPosition,
  getCardinalNeighbors,
} from '../src/world/grid.js';

test('positionToKey and keyToPosition round-trip integer grid positions', () => {
  const position = { x: 3, y: 2, z: -4 };

  assert.equal(positionToKey(position), '3,2,-4');
  assert.deepEqual(keyToPosition('3,2,-4'), position);
});

test('createGridSpec defines default Blockhold arena dimensions', () => {
  assert.deepEqual(createGridSpec(), { x: 16, y: 8, z: 16 });
});

test('isInsideBounds accepts positions inside the grid and rejects out-of-bounds positions', () => {
  const grid = createGridSpec({ x: 4, y: 3, z: 5 });

  assert.equal(isInsideBounds({ x: 0, y: 0, z: 0 }, grid), true);
  assert.equal(isInsideBounds({ x: 3, y: 2, z: 4 }, grid), true);
  assert.equal(isInsideBounds({ x: -1, y: 0, z: 0 }, grid), false);
  assert.equal(isInsideBounds({ x: 4, y: 0, z: 0 }, grid), false);
  assert.equal(isInsideBounds({ x: 0, y: 3, z: 0 }, grid), false);
  assert.equal(isInsideBounds({ x: 0, y: 0, z: 5 }, grid), false);
});

test('getCardinalNeighbors returns four horizontal neighbor positions', () => {
  assert.deepEqual(getCardinalNeighbors({ x: 2, y: 0, z: 2 }), [
    { x: 3, y: 0, z: 2 },
    { x: 1, y: 0, z: 2 },
    { x: 2, y: 0, z: 3 },
    { x: 2, y: 0, z: 1 },
  ]);
});
