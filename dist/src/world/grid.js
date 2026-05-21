export function createGridSpec(size = {}) {
  return {
    x: size.x ?? 16,
    y: size.y ?? 8,
    z: size.z ?? 16,
  };
}

export function positionToKey(position) {
  assertIntegerPosition(position);
  return `${position.x},${position.y},${position.z}`;
}

export function keyToPosition(key) {
  const parts = String(key).split(',').map((value) => Number.parseInt(value, 10));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid grid key: ${key}`);
  }

  const [x, y, z] = parts;
  return { x, y, z };
}

export function isInsideBounds(position, grid = createGridSpec()) {
  assertIntegerPosition(position);
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.z >= 0 &&
    position.x < grid.x &&
    position.y < grid.y &&
    position.z < grid.z
  );
}

export function getCardinalNeighbors(position) {
  assertIntegerPosition(position);
  return [
    { x: position.x + 1, y: position.y, z: position.z },
    { x: position.x - 1, y: position.y, z: position.z },
    { x: position.x, y: position.y, z: position.z + 1 },
    { x: position.x, y: position.y, z: position.z - 1 },
  ];
}

function assertIntegerPosition(position) {
  if (!position || !['x', 'y', 'z'].every((axis) => Number.isInteger(position[axis]))) {
    throw new Error('Grid position must contain integer x, y, and z values');
  }
}
