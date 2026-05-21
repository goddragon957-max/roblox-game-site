import { keyToPosition } from './world/grid.js';
import { countBlocksByType, createNightRaidPlan, createStarterArena } from './world/worldState.js';

const BLOCK_STYLES = {
  floor: {
    size: { width: 0.96, height: 0.12, depth: 0.96 },
    color: '#1e293b',
    emissive: '#020617',
  },
  wall: {
    size: { width: 0.92, height: 1, depth: 0.92 },
    color: '#64748b',
    emissive: '#0f172a',
  },
  core: {
    size: { width: 0.92, height: 1.18, depth: 0.92 },
    color: '#38bdf8',
    emissive: '#075985',
  },
};

export function createRenderObjectsFromWorld(world) {
  return Object.entries(world.blocks)
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([key, type]) => {
      const gridPosition = keyToPosition(key);
      const style = BLOCK_STYLES[type] ?? BLOCK_STYLES.wall;
      const idPosition = key.replaceAll(',', '-');

      return {
        id: `block-${type}-${idPosition}`,
        type,
        geometry: 'box',
        size: style.size,
        position: toScenePosition(gridPosition, world.size, style.size),
        color: style.color,
        emissive: style.emissive,
      };
    });
}

export function createHudModel(world) {
  const counts = countBlocksByType(world);
  const raidPlan = createNightRaidPlan(world);
  const dayLabel = `Day ${world.day ?? 1}`;
  const phaseLabel = world.phase === 'night' ? 'Night Raid' : 'Build Phase';

  return {
    eyebrow: `${dayLabel} · ${phaseLabel}`,
    title: 'Blockhold Defense',
    help: '밤이 오기 전, 블록으로 코어 주변을 막고 적의 진입로를 설계하세요. 드래그 회전 · 휠 줌 · R 카메라 리셋.',
    status: `Core HP ${world.core.hp}/${world.core.maxHp} · Floor ${counts.floor ?? 0} · Walls ${counts.wall ?? 0} · Raid ${raidPlan.breachRisk} (${raidPlan.enemyCount} raiders)`,
  };
}

export function createBlockholdSceneState(options = {}) {
  const world = createStarterArena(options);
  const raidPlan = createNightRaidPlan(world);

  return {
    world,
    raidPlan,
    objects: createRenderObjectsFromWorld(world),
    hud: createHudModel(world),
    paused: false,
    camera: {
      alpha: -0.78,
      beta: 1.05,
      radius: 8.5,
      target: { x: 0, y: 0.4, z: 0 },
    },
    lights: {
      hemiIntensity: 0.56,
      keyIntensity: 1.8,
      rimIntensity: 0.9,
    },
  };
}

function toScenePosition(gridPosition, worldSize, renderSize) {
  return {
    x: gridPosition.x - (worldSize.x - 1) / 2,
    y: renderSize.height / 2,
    z: gridPosition.z - (worldSize.z - 1) / 2,
  };
}
