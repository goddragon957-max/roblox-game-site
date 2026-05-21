export function createInitialState() {
  return {
    camera: { x: 0, y: 3.2, z: 8 },
    rotationSpeed: 0.012,
    orbitRadius: 2.4,
    paused: false,
    angle: 0,
  };
}

export function createSceneObjects() {
  return [
    {
      id: 'core-cube',
      geometry: 'box',
      size: 1.35,
      color: '#7c3aed',
      emissive: '#1e104f',
      position: { x: 0, y: 1.25, z: 0 },
    },
    {
      id: 'orbit-sphere',
      geometry: 'sphere',
      radius: 0.32,
      color: '#22d3ee',
      emissive: '#0e7490',
      position: { x: 2.4, y: 1.2, z: 0 },
    },
    {
      id: 'grid-floor',
      geometry: 'grid',
      size: 12,
      divisions: 24,
      color: '#475569',
      position: { x: 0, y: 0, z: 0 },
    },
  ];
}

export function updateOrbitalState(previous, deltaAngle) {
  const angle = previous.angle + deltaAngle;
  const radius = previous.orbitRadius ?? 2.4;

  return {
    ...previous,
    angle,
    position: {
      x: Math.cos(angle) * radius,
      y: 1.2,
      z: Math.sin(angle) * radius,
    },
  };
}

export function clampZoom(distance) {
  return Math.min(12, Math.max(3, distance));
}
