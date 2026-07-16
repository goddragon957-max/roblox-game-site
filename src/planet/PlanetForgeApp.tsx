import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  BRUSH_COMBO_LABELS,
  MAX_LIFE_MOTES,
  PHASE_LABELS,
  TOOL_COSTS,
  TOOL_LABELS,
  applyTool,
  createInitialPlanetState,
  getLogs,
  nearestCellId,
  planetGuardianSignal,
  planetLifeSignal,
  planetObjective,
  planetRestorationSignal,
  planetTotals,
  planetWeather,
  RESTORATION_SIGNAL_DURATION,
  selectTool,
  tickPlanet,
  triggerMeteor,
  type BrushComboTier,
  type PlanetBiome,
  type PlanetCell,
  type PlanetGuardian,
  type PlanetLifeSignal,
  type PlanetObjective,
  type PlanetRestoration,
  type PlanetScar,
  type PlanetState,
  type PlanetTool,
  type PlanetWeather,
  type Vec3
} from './planetSim';

const TOOL_ORDER: PlanetTool[] = ['water', 'forest', 'crystal', 'settlement', 'shield'];
const PLANET_RADIUS = 1.72;

const BIOME_COLORS: Record<PlanetBiome, { color: string; emissive: string; roughness: number; metalness: number; opacity?: number }> = {
  barren: { color: '#8e7350', emissive: '#120806', roughness: 0.95, metalness: 0.02 },
  ocean: { color: '#2f8cff', emissive: '#06385e', roughness: 0.48, metalness: 0.08 },
  forest: { color: '#54d978', emissive: '#0b3b1d', roughness: 0.86, metalness: 0.03 },
  crystal: { color: '#c57bff', emissive: '#452166', roughness: 0.38, metalness: 0.3 },
  settlement: { color: '#ffd06b', emissive: '#4c3005', roughness: 0.58, metalness: 0.12 },
  shield: { color: '#79f4ff', emissive: '#12606c', roughness: 0.26, metalness: 0.18, opacity: 0.86 }
};

const PHASE_AURORA_COLOR: Record<PlanetState['phase'], string> = {
  dormant: '#5c7bb0',
  breathing: '#8ff8ff',
  blooming: '#ffd06b',
  shielded: '#79f4ff'
};

const COMBO_TIER_COLOR: Record<BrushComboTier, string> = {
  none: '#8ff8ff',
  streak: '#8ff8ff',
  combo: '#ffd06b',
  mega: '#c57bff'
};

const TOOL_HINTS: Record<PlanetTool, string> = {
  water: '뜨거운 황무지를 바다로 바꿔 안정도를 올립니다.',
  forest: '바다 근처에 산소 숲을 심어 생명력을 키웁니다.',
  crystal: '보라 수정으로 에너지와 광물을 회수합니다.',
  settlement: '생명권이 열린 곳에 작은 돔 마을을 세웁니다.',
  shield: '운석 충돌 지점을 막는 황금 방어막을 씌웁니다.'
};

interface PlanetSmokeApi {
  ready: boolean;
  getState: () => PlanetState;
  getWeather: () => PlanetWeather;
  getLifeSignal: () => PlanetLifeSignal;
  getGuardian: () => PlanetGuardian;
  getObjective: () => PlanetObjective;
  getRestoration: () => PlanetRestoration;
  command: {
    selectTool: (tool: PlanetTool) => PlanetState;
    paintCell: (cellId?: string, tool?: PlanetTool) => PlanetState;
    paintCells: (cellIds?: string[], tool?: PlanetTool) => PlanetState;
    tick: (seconds: number) => PlanetState;
    triggerMeteor: () => PlanetState;
    reset: () => PlanetState;
  };
}

declare global {
  interface Window {
    __planetForgeSmoke?: PlanetSmokeApi;
  }
}

function vec3(normal: Vec3) {
  return new THREE.Vector3(normal.x, normal.y, normal.z).normalize();
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else if (material) material.dispose();
  });
}

function clearGroup(group: THREE.Group) {
  for (const child of [...group.children]) {
    group.remove(child);
    disposeObject(child);
  }
}

function seedFromId(id: string) {
  const number = Number(id.replace(/\D/g, '')) || 1;
  return Math.sin(number * 91.7) * 10000;
}

function localOffset(seed: number, scale = 1) {
  const x = (Math.sin(seed * 2.13) * 0.5 + Math.cos(seed * 0.91) * 0.5) * 0.08 * scale;
  const z = (Math.cos(seed * 1.77) * 0.5 + Math.sin(seed * 0.57) * 0.5) * 0.08 * scale;
  return { x, z };
}

function makeTree(seed: number) {
  const root = new THREE.Group();
  const { x, z } = localOffset(seed, 1.2);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.026, 0.11, 5),
    new THREE.MeshStandardMaterial({ color: '#7a4a26', roughness: 0.9 })
  );
  trunk.position.set(x, 0.055, z);
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, 0.17, 7),
    new THREE.MeshStandardMaterial({ color: '#45df72', emissive: '#0b3a1a', roughness: 0.8 })
  );
  crown.position.set(x, 0.18, z);
  root.add(trunk, crown);
  return root;
}

function makeCrystal(seed: number) {
  const root = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const { x, z } = localOffset(seed + i * 3.7, 1.4);
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.055 + i * 0.012, 0),
      new THREE.MeshStandardMaterial({ color: '#d08cff', emissive: '#5b1e88', roughness: 0.28, metalness: 0.25 })
    );
    shard.position.set(x, 0.07 + i * 0.016, z);
    shard.rotation.set(seed * 0.2, seed * 0.31 + i, seed * 0.17);
    root.add(shard);
  }
  return root;
}

function makeSettlement(seed: number) {
  const root = new THREE.Group();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.54),
    new THREE.MeshStandardMaterial({ color: '#ffd783', emissive: '#5a3106', roughness: 0.55, metalness: 0.16 })
  );
  dome.position.y = 0.045;
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.19, 6),
    new THREE.MeshStandardMaterial({ color: '#f7fbff', emissive: '#285577', roughness: 0.5 })
  );
  antenna.position.set(0.055, 0.18, 0.025);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.027, 10, 8),
    new THREE.MeshStandardMaterial({ color: '#8ff8ff', emissive: '#40e8ff', roughness: 0.25 })
  );
  beacon.position.set(0.055, 0.292, 0.025);
  root.rotation.y = seed;
  root.add(dome, antenna, beacon);
  return root;
}

function makeShieldDome() {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({
      color: '#9dfcff',
      emissive: '#29dfff',
      transparent: true,
      opacity: 0.38,
      roughness: 0.18,
      metalness: 0.08,
      depthWrite: false
    })
  );
  dome.position.y = 0.035;
  return dome;
}

function makeCrater(seed: number) {
  const root = new THREE.Group();
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.018, 6, 36),
    new THREE.MeshStandardMaterial({ color: '#2a1715', emissive: '#5b160f', roughness: 0.98, metalness: 0.02 })
  );
  rim.position.y = 0.018;
  rim.rotation.x = Math.PI / 2;
  const ash = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 18),
    new THREE.MeshStandardMaterial({ color: '#19120f', emissive: '#3a0d08', roughness: 0.98, metalness: 0.01, side: THREE.DoubleSide })
  );
  ash.rotation.x = -Math.PI / 2;
  ash.position.y = 0.012;
  root.rotation.y = seed;
  root.add(ash, rim);
  return root;
}

function makeDebris(seed: number) {
  const root = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const { x, z } = localOffset(seed + i * 6.11, 1.7);
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.035 + (i % 2) * 0.012, 0),
      new THREE.MeshStandardMaterial({ color: '#ffd783', emissive: '#ff9d3b', roughness: 0.36, metalness: 0.18 })
    );
    shard.position.set(x, 0.055 + i * 0.006, z);
    shard.rotation.set(seed * 0.13 + i, seed * 0.27, seed * 0.39 + i * 0.4);
    root.add(shard);
  }
  return root;
}

function rebuildAdornment(group: THREE.Group, cell: PlanetCell) {
  if (group.userData.biome === cell.biome && group.userData.vitality === cell.vitality && group.userData.scar === cell.scar) return;
  clearGroup(group);
  const seed = seedFromId(cell.id);
  if (cell.biome === 'forest') {
    group.add(makeTree(seed));
    group.add(makeTree(seed + 5.1));
  } else if (cell.biome === 'crystal') {
    group.add(makeCrystal(seed));
  } else if (cell.biome === 'settlement') {
    group.add(makeSettlement(seed));
  } else if (cell.biome === 'shield') {
    group.add(makeShieldDome());
  }
  if (cell.scar === 'crater') group.add(makeCrater(seed + 2.9));
  if (cell.scar === 'debris') group.add(makeDebris(seed + 4.3));
  group.scale.setScalar(0.82 + cell.vitality * 0.34);
  group.userData.biome = cell.biome;
  group.userData.vitality = cell.vitality;
  group.userData.scar = cell.scar;
}

interface CellVisual {
  patch: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
  adornment: THREE.Group;
  pulseRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
}

const SCAR_LABELS: Record<PlanetScar, string> = {
  none: '깨끗함',
  crater: '운석 크레이터',
  debris: '별빛 파편'
};

interface SceneContext {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  planetGroup: THREE.Group;
  cloudShell: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  auroraRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  stormHalo: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  lifeMotes: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  comboFlare: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  guardianRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  impactFlash: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  objectiveBurst: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  restorationRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  meteor: THREE.Group;
  impactRing: THREE.Mesh;
  selectionRing: THREE.Mesh;
  cellVisuals: Map<string, CellVisual>;
  raycastTargets: THREE.Object3D[];
  frame: number;
}

function makeLifeMotes(maxCount: number) {
  const positions = new Float32Array(maxCount * 3);
  const colors = new Float32Array(maxCount * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
}

function updateLifeMotes(points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>, signal: PlanetLifeSignal, time: number) {
  const positions = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const colors = points.geometry.getAttribute('color') as THREE.BufferAttribute;
  const tint = 0.5 + signal.moteIntensity * 0.5;
  for (let i = 0; i < positions.count; i += 1) {
    if (i >= signal.moteCount) {
      positions.setXYZ(i, 0, 0, 0);
      colors.setXYZ(i, 0, 0, 0);
      continue;
    }
    const seed = i * 12.9898 + 4.11;
    const theta = seed + time * (0.16 + (i % 5) * 0.02);
    const phi = 0.58 + Math.sin(seed * 0.71) * 0.92;
    const radius = PLANET_RADIUS + 0.15 + Math.sin(time * 1.3 + seed) * 0.05;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * 0.62 + Math.sin(time * 0.85 + seed) * 0.05;
    const z = radius * Math.sin(phi) * Math.sin(theta);
    positions.setXYZ(i, x, y, z);
    colors.setXYZ(i, tint * 0.92, tint, tint * 0.5 + signal.moteIntensity * 0.4);
  }
  positions.needsUpdate = true;
  colors.needsUpdate = true;
  points.material.opacity = 0.3 + signal.moteIntensity * 0.55;
  points.material.size = 0.038 + signal.moteIntensity * 0.032;
}

function makeStars() {
  const count = 950;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 10 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 18;
    const theta = i * 2.399963;
    const y = Math.sin(i * 0.73) * 8.5;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
    const tint = 0.72 + (Math.sin(i * 1.37) * 0.5 + 0.5) * 0.28;
    colors[i * 3] = tint * 0.75;
    colors[i * 3 + 1] = tint * 0.86;
    colors[i * 3 + 2] = tint;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.036, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
  );
}

function updateCellVisual(visual: CellVisual, cell: PlanetCell, selectedCellId: string | null) {
  const style = BIOME_COLORS[cell.biome];
  visual.patch.material.color.set(style.color);
  visual.patch.material.emissive.set(cell.scar === 'crater' ? '#5b160f' : style.emissive);
  visual.patch.material.roughness = style.roughness;
  visual.patch.material.metalness = style.metalness;
  visual.patch.material.opacity = style.opacity ?? (cell.biome === 'barren' ? 0.78 : 0.92);
  visual.patch.scale.setScalar(0.76 + cell.vitality * 0.34 + (cell.id === selectedCellId ? 0.16 : 0) + cell.pulse * 0.12);
  visual.pulseRing.visible = cell.pulse > 0.02;
  visual.pulseRing.scale.setScalar(0.78 + cell.pulse * 0.95);
  visual.pulseRing.material.opacity = cell.pulse * 0.72;
  visual.pulseRing.material.color.set(cell.scar === 'crater' ? '#ff6b33' : cell.scar === 'debris' ? '#ffd783' : style.color);
  visual.pulseRing.material.emissive.set(cell.scar === 'crater' ? '#ff2c1b' : cell.scar === 'debris' ? '#ff9d3b' : style.emissive);
  rebuildAdornment(visual.adornment, cell);
}

function setSurfaceTransform(object: THREE.Object3D, normal: THREE.Vector3, radius: number, upAxis: 'z' | 'y') {
  object.position.copy(normal.clone().multiplyScalar(radius));
  const from = upAxis === 'z' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  object.quaternion.setFromUnitVectors(from, normal);
}

function PlanetScene({ planet, onPaint }: { planet: PlanetState; onPaint: (cellId: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<SceneContext | null>(null);
  const planetRef = useRef(planet);
  planetRef.current = planet;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050716');
    scene.fog = new THREE.Fog('#050716', 9, 24);

    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 80);
    camera.position.set(0, 0.42, 5.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.dataset.gameCanvas = 'planet-three';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight('#b6d3ff', '#1c1230', 1.45);
    const sun = new THREE.DirectionalLight('#fff2c2', 3.2);
    sun.position.set(4.2, 3.1, 5.4);
    const rim = new THREE.DirectionalLight('#7ae8ff', 1.4);
    rim.position.set(-4.8, 1.5, -2.4);
    scene.add(ambient, sun, rim, makeStars());

    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS, 64, 36),
      new THREE.MeshStandardMaterial({ color: '#6d543e', emissive: '#100805', roughness: 0.9, metalness: 0.02 })
    );
    core.userData.planetPicker = true;
    planetGroup.add(core);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS * 1.045, 64, 32),
      new THREE.MeshStandardMaterial({ color: '#61ddff', emissive: '#1a6eff', transparent: true, opacity: 0.12, depthWrite: false })
    );
    planetGroup.add(atmosphere);

    const cloudShell = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS * 1.08, 48, 20),
      new THREE.MeshStandardMaterial({ color: '#eefaff', transparent: true, opacity: 0.12, roughness: 0.2, depthWrite: false })
    );
    planetGroup.add(cloudShell);

    const auroraRing = new THREE.Mesh(
      new THREE.TorusGeometry(PLANET_RADIUS * 1.14, 0.052, 8, 128),
      new THREE.MeshBasicMaterial({
        color: '#8ff8ff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    auroraRing.rotation.x = Math.PI / 2.5;
    planetGroup.add(auroraRing);

    const stormHalo = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_RADIUS * 1.12, 40, 20),
      new THREE.MeshBasicMaterial({ color: '#ff6b33', transparent: true, opacity: 0, depthWrite: false })
    );
    planetGroup.add(stormHalo);

    const lifeMotes = makeLifeMotes(MAX_LIFE_MOTES);
    planetGroup.add(lifeMotes);

    const comboFlare = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.02, 8, 56),
      new THREE.MeshBasicMaterial({ color: '#8ff8ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    comboFlare.visible = false;
    planetGroup.add(comboFlare);

    const guardianRing = new THREE.Mesh(
      new THREE.TorusGeometry(PLANET_RADIUS * 1.5, 0.026, 8, 140),
      new THREE.MeshBasicMaterial({
        color: '#ffe27a',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    guardianRing.rotation.x = Math.PI / 2.15;
    planetGroup.add(guardianRing);

    const impactFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 20, 14),
      new THREE.MeshBasicMaterial({ color: '#8ff8ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    impactFlash.visible = false;
    planetGroup.add(impactFlash);

    const objectiveBurst = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.03, 10, 84),
      new THREE.MeshBasicMaterial({
        color: '#ffe27a',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    objectiveBurst.rotation.x = Math.PI / 2.2;
    objectiveBurst.visible = false;
    planetGroup.add(objectiveBurst);

    const restorationRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.034, 10, 72),
      new THREE.MeshBasicMaterial({
        color: '#4dffb0',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    restorationRing.visible = false;
    planetGroup.add(restorationRing);

    const orbitalRing = new THREE.Mesh(
      new THREE.TorusGeometry(PLANET_RADIUS * 1.34, 0.014, 8, 160),
      new THREE.MeshStandardMaterial({ color: '#6fe8ff', emissive: '#1788b8', transparent: true, opacity: 0.5, roughness: 0.35 })
    );
    orbitalRing.rotation.set(Math.PI / 2.4, 0, Math.PI / 7);
    planetGroup.add(orbitalRing);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 18, 12),
      new THREE.MeshStandardMaterial({ color: '#e6edff', emissive: '#1c315f', roughness: 0.65 })
    );
    moon.position.set(2.8, 0.5, 0.2);
    planetGroup.add(moon);

    const patchGeometry = new THREE.CircleGeometry(0.16, 7);
    const cellVisuals = new Map<string, CellVisual>();
    const raycastTargets: THREE.Object3D[] = [core];
    for (const cell of planetRef.current.cells) {
      const normal = vec3(cell.normal);
      const style = BIOME_COLORS[cell.biome];
      const patch = new THREE.Mesh(
        patchGeometry.clone(),
        new THREE.MeshStandardMaterial({
          color: style.color,
          emissive: style.emissive,
          roughness: style.roughness,
          metalness: style.metalness,
          transparent: true,
          opacity: style.opacity ?? 0.9,
          side: THREE.DoubleSide
        })
      );
      patch.userData.cellId = cell.id;
      setSurfaceTransform(patch, normal, PLANET_RADIUS + 0.018, 'z');
      const adornment = new THREE.Group();
      adornment.userData.cellId = cell.id;
      setSurfaceTransform(adornment, normal, PLANET_RADIUS + 0.075, 'y');
      const pulseRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.012, 6, 44),
        new THREE.MeshStandardMaterial({ color: style.color, emissive: style.emissive, transparent: true, opacity: 0, roughness: 0.28, metalness: 0.08, depthWrite: false })
      );
      pulseRing.visible = false;
      setSurfaceTransform(pulseRing, normal, PLANET_RADIUS + 0.05, 'z');
      planetGroup.add(patch, pulseRing, adornment);
      cellVisuals.set(cell.id, { patch, adornment, pulseRing });
      raycastTargets.push(patch);
    }

    const selectionRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.011, 8, 56),
      new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#8ff8ff', transparent: true, opacity: 0.95 })
    );
    selectionRing.visible = false;
    planetGroup.add(selectionRing);

    const impactRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.018, 8, 72),
      new THREE.MeshStandardMaterial({ color: '#ff5a4a', emissive: '#ff2c1b', transparent: true, opacity: 0.9 })
    );
    impactRing.visible = false;
    planetGroup.add(impactRing);

    const meteor = new THREE.Group();
    const meteorRock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.115, 1),
      new THREE.MeshStandardMaterial({ color: '#ffb06a', emissive: '#ff3d1f', roughness: 0.45, metalness: 0.08 })
    );
    const meteorTail = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.46, 9),
      new THREE.MeshBasicMaterial({ color: '#ff6b33', transparent: true, opacity: 0.45, depthWrite: false })
    );
    meteorTail.position.y = 0.28;
    meteorTail.rotation.x = Math.PI;
    meteor.add(meteorRock, meteorTail);
    meteor.visible = false;
    planetGroup.add(meteor);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const drag = { mode: 'idle' as 'idle' | 'paint' | 'rotate', lastCellId: null as string | null };
    const pickCellId = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(raycastTargets, false);
      const hit = hits.find((item) => typeof item.object.userData.cellId === 'string' || item.object.userData.planetPicker === true);
      if (!hit) return null;
      if (typeof hit.object.userData.cellId === 'string') return hit.object.userData.cellId as string;
      const localPoint = planetGroup.worldToLocal(hit.point.clone()).normalize();
      return nearestCellId(planetRef.current, { x: localPoint.x, y: localPoint.y, z: localPoint.z });
    };
    const rotatePlanet = (event: PointerEvent) => {
      planetGroup.rotation.y += event.movementX * 0.007;
      planetGroup.rotation.x = THREE.MathUtils.clamp(planetGroup.rotation.x + event.movementY * 0.004, -0.55, 0.55);
    };
    const handlePointerDown = (event: PointerEvent) => {
      try {
        renderer.domElement.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer smoke events do not always register an active pointer.
      }
      const cellId = pickCellId(event);
      if (event.button === 2 || event.altKey || !cellId) {
        drag.mode = 'rotate';
        drag.lastCellId = null;
        rotatePlanet(event);
        return;
      }
      drag.mode = 'paint';
      drag.lastCellId = cellId;
      onPaint(cellId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (drag.mode === 'rotate') {
        event.preventDefault();
        rotatePlanet(event);
        return;
      }
      if (drag.mode !== 'paint' || (event.buttons & 1) !== 1) return;
      const cellId = pickCellId(event);
      if (cellId && cellId !== drag.lastCellId) {
        drag.lastCellId = cellId;
        onPaint(cellId);
      }
    };
    const handlePointerUp = (event: PointerEvent) => {
      drag.mode = 'idle';
      drag.lastCellId = null;
      try {
        if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer smoke events may not own pointer capture.
      }
    };
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerUp);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);

    const context: SceneContext = {
      renderer,
      camera,
      scene,
      planetGroup,
      cloudShell,
      auroraRing,
      stormHalo,
      lifeMotes,
      comboFlare,
      guardianRing,
      impactFlash,
      objectiveBurst,
      restorationRing,
      meteor,
      impactRing,
      selectionRing,
      cellVisuals,
      raycastTargets,
      frame: 0
    };
    contextRef.current = context;

    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const current = planetRef.current;
      planetGroup.rotation.y += delta * 0.1;
      cloudShell.rotation.y += delta * 0.08;
      auroraRing.rotation.z += delta * 0.14;
      stormHalo.rotation.y -= delta * 0.05;
      orbitalRing.rotation.z += delta * 0.04;
      moon.position.set(Math.cos(current.time * 0.22) * 2.75, 0.36 + Math.sin(current.time * 0.15) * 0.18, Math.sin(current.time * 0.22) * 2.75);
      updateLifeMotes(lifeMotes, planetLifeSignal(current), current.time);

      const guardian = planetGuardianSignal(current);
      guardianRing.rotation.z += delta * 0.06;
      guardianRing.material.opacity = guardian.active
        ? 0.42 + Math.sin(current.time * 2.4) * 0.12
        : guardian.strength * 0.12;
      guardianRing.scale.setScalar(guardian.active ? 1 + Math.sin(current.time * 1.6) * 0.02 : 1);

      const impactAge = current.time - current.lastImpactAt;
      if (current.lastImpactKind !== 'none' && current.lastImpactCellId && impactAge >= 0 && impactAge < 1.1) {
        const flashCell = current.cells.find((cell) => cell.id === current.lastImpactCellId);
        if (flashCell) {
          const normal = vec3(flashCell.normal);
          const fade = 1 - impactAge / 1.1;
          setSurfaceTransform(impactFlash, normal, PLANET_RADIUS + 0.1, 'y');
          impactFlash.visible = true;
          impactFlash.material.color.set(current.lastImpactKind === 'shield' ? '#8ff8ff' : '#ff5a4a');
          impactFlash.material.opacity = fade * 0.85;
          impactFlash.scale.setScalar(0.6 + (1 - fade) * 2.4);
        }
      } else {
        impactFlash.visible = false;
      }

      const objectiveAge = current.time - current.objectiveCompletedAt;
      if (current.lastObjectiveLabel && objectiveAge >= 0 && objectiveAge < 18) {
        const fade = 1 - objectiveAge / 18;
        objectiveBurst.visible = true;
        objectiveBurst.rotation.z += delta * 0.6;
        objectiveBurst.scale.setScalar(PLANET_RADIUS * (1.05 + (1 - fade) * 2.6));
        objectiveBurst.material.opacity = fade * 0.9;
      } else {
        objectiveBurst.visible = false;
      }

      const restoration = planetRestorationSignal(current);
      const restorationAge = current.time - restoration.since;
      if (restoration.count > 0 && restoration.lastCellId && restorationAge >= 0 && restorationAge < RESTORATION_SIGNAL_DURATION) {
        const healedCell = current.cells.find((cell) => cell.id === restoration.lastCellId);
        if (healedCell) {
          const normal = vec3(healedCell.normal);
          const fade = 1 - restorationAge / RESTORATION_SIGNAL_DURATION;
          setSurfaceTransform(restorationRing, normal, PLANET_RADIUS + 0.09, 'z');
          restorationRing.visible = true;
          restorationRing.rotation.z += delta * 1.3;
          restorationRing.material.opacity = 0.18 + fade * 0.82;
          restorationRing.scale.setScalar(0.78 + (1 - fade) * 2.15 + Math.sin(current.time * 8) * 0.05);
        }
      } else {
        restorationRing.visible = false;
      }

      if (current.activeEvent) {
        const impact = current.cells.find((cell) => cell.id === current.activeEvent?.impactCellId);
        if (impact) {
          const normal = vec3(impact.normal);
          const progress = 1 - current.activeEvent.timer / current.activeEvent.duration;
          const distance = PLANET_RADIUS + 2.15 - progress * 1.72;
          setSurfaceTransform(meteor, normal, distance, 'y');
          meteor.visible = true;
          meteor.scale.setScalar(1 + Math.sin(current.time * 12) * 0.08 + progress * 0.35);
          meteorTail.scale.set(1, 1 + progress * 1.6, 1);
          meteorTail.material.opacity = 0.35 + progress * 0.5;
          setSurfaceTransform(impactRing, normal, PLANET_RADIUS + 0.04, 'z');
          impactRing.visible = true;
          const pulseSpeed = 7 + progress * 10;
          impactRing.scale.setScalar(0.85 + Math.sin(current.time * pulseSpeed) * (0.09 + progress * 0.12));
          impactRing.material.color.set('#ffd06b').lerp(new THREE.Color('#ff2c1b'), progress);
          impactRing.material.opacity = 0.7 + progress * 0.3;
        }
      } else {
        meteor.visible = false;
        impactRing.visible = false;
      }
      renderer.render(scene, camera);
      context.frame = requestAnimationFrame(animate);
    };
    context.frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(context.frame);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerUp);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      container.removeChild(renderer.domElement);
      disposeObject(scene);
      patchGeometry.dispose();
      renderer.dispose();
      contextRef.current = null;
    };
  }, [onPaint]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;
    for (const cell of planet.cells) {
      const visual = context.cellVisuals.get(cell.id);
      if (visual) updateCellVisual(visual, cell, planet.selectedCellId);
    }
    const selected = planet.selectedCellId ? planet.cells.find((cell) => cell.id === planet.selectedCellId) : null;
    if (selected) {
      const normal = vec3(selected.normal);
      setSurfaceTransform(context.selectionRing, normal, PLANET_RADIUS + 0.045, 'z');
      context.selectionRing.visible = true;
    } else {
      context.selectionRing.visible = false;
    }

    const weather = planetWeather(planet);
    context.cloudShell.material.opacity = 0.06 + weather.cloudCover * 0.4;
    context.cloudShell.material.color.set('#eefaff').lerp(new THREE.Color('#ffb98a'), weather.stormIntensity * 0.6);

    const auroraColor = PHASE_AURORA_COLOR[weather.phase];
    context.auroraRing.material.color.set(auroraColor);
    context.auroraRing.material.opacity = weather.auroraStrength * 0.85;

    context.stormHalo.material.opacity = weather.stormIntensity * 0.32;

    const comboRecent = planet.brushComboTier !== 'none' && planet.time - planet.brushComboSince < 1.3;
    const comboCell = comboRecent ? planet.cells.find((cell) => cell.id === planet.lastPaintedCellId) : null;
    if (comboCell) {
      const normal = vec3(comboCell.normal);
      setSurfaceTransform(context.comboFlare, normal, PLANET_RADIUS + 0.06, 'z');
      context.comboFlare.visible = true;
      context.comboFlare.material.color.set(COMBO_TIER_COLOR[planet.brushComboTier]);
      context.comboFlare.material.opacity = planet.brushComboTier === 'mega' ? 0.95 : planet.brushComboTier === 'combo' ? 0.78 : 0.58;
      context.comboFlare.scale.setScalar(planet.brushComboTier === 'mega' ? 1.35 : planet.brushComboTier === 'combo' ? 1.15 : 1);
    } else {
      context.comboFlare.visible = false;
    }
  }, [planet]);

  return <div ref={containerRef} className="planet-scene" aria-label="interactive planet forge scene" />;
}

function CostText({ tool }: { tool: PlanetTool }) {
  const cost = TOOL_COSTS[tool];
  const parts = [`⚡ ${cost.energy}`];
  if (cost.water) parts.push(`💧 ${cost.water}`);
  if (cost.biomass) parts.push(`🌿 ${cost.biomass}`);
  if (cost.minerals) parts.push(`◆ ${cost.minerals}`);
  return <span className="planet-tool-cost">{parts.join(' · ')}</span>;
}

export function PlanetForgeApp() {
  const [planet, setPlanet] = useState(createInitialPlanetState);
  const planetRef = useRef(planet);
  planetRef.current = planet;

  const commit = useCallback((recipe: (state: PlanetState) => PlanetState) => {
    const nextState = recipe(planetRef.current);
    planetRef.current = nextState;
    setPlanet(nextState);
    return nextState;
  }, []);

  const handleSelectTool = useCallback((tool: PlanetTool) => commit((state) => selectTool(state, tool)), [commit]);
  const handlePaint = useCallback(
    (cellId: string) => commit((state) => applyTool({ ...state, selectedCellId: cellId }, state.selectedTool, cellId)),
    [commit]
  );
  const handleTick = useCallback((seconds: number) => commit((state) => tickPlanet(state, seconds)), [commit]);
  const handleMeteor = useCallback(() => commit((state) => triggerMeteor(state)), [commit]);
  const handleReset = useCallback(() => commit(() => createInitialPlanetState()), [commit]);

  useEffect(() => {
    const timer = window.setInterval(() => handleTick(1), 1000);
    return () => window.clearInterval(timer);
  }, [handleTick]);

  useEffect(() => {
    window.__planetForgeSmoke = {
      ready: true,
      getState: () => planetRef.current,
      getWeather: () => planetWeather(planetRef.current),
      getLifeSignal: () => planetLifeSignal(planetRef.current),
      getGuardian: () => planetGuardianSignal(planetRef.current),
      getObjective: () => planetObjective(planetRef.current),
      getRestoration: () => planetRestorationSignal(planetRef.current),
      command: {
        selectTool: (tool: PlanetTool) => handleSelectTool(tool),
        paintCell: (cellId?: string, tool?: PlanetTool) => {
          const current = planetRef.current;
          const targetCell = cellId ?? current.selectedCellId ?? current.cells.find((cell) => cell.biome === 'barren')?.id ?? current.cells[0]?.id;
          return commit((state) => applyTool({ ...state, selectedTool: tool ?? state.selectedTool, selectedCellId: targetCell }, tool ?? state.selectedTool, targetCell));
        },
        paintCells: (cellIds?: string[], tool?: PlanetTool) => {
          const current = planetRef.current;
          const targets = cellIds && cellIds.length > 0 ? cellIds : current.cells.filter((cell) => cell.biome === 'barren').slice(0, 3).map((cell) => cell.id);
          return commit((state) => targets.reduce((next, targetCell) => applyTool({ ...next, selectedTool: tool ?? next.selectedTool, selectedCellId: targetCell }, tool ?? next.selectedTool, targetCell), state));
        },
        tick: (seconds: number) => handleTick(seconds),
        triggerMeteor: () => handleMeteor(),
        reset: () => handleReset()
      }
    };
    return () => {
      delete window.__planetForgeSmoke;
    };
  }, [commit, handleMeteor, handleReset, handleSelectTool, handleTick]);

  const totals = useMemo(() => planetTotals(planet), [planet]);
  const weather = useMemo(() => planetWeather(planet), [planet]);
  const lifeSignal = useMemo(() => planetLifeSignal(planet), [planet]);
  const guardian = useMemo(() => planetGuardianSignal(planet), [planet]);
  const objective = useMemo(() => planetObjective(planet), [planet]);
  const restoration = useMemo(() => planetRestorationSignal(planet), [planet]);
  const logs = getLogs(planet);
  const visibleLogs = logs.slice(0, 3);
  const activeCell = planet.selectedCellId ? planet.cells.find((cell) => cell.id === planet.selectedCellId) : null;
  const eventProgress = planet.activeEvent ? Math.max(0, 1 - planet.activeEvent.timer / planet.activeEvent.duration) : 0;
  const phaseRecent = planet.time - planet.phaseSince < 4;
  const comboRecent = planet.brushComboTier !== 'none' && planet.time - planet.brushComboSince < 1.3;
  const guardianRecent = planet.time - planet.guardianSince < 4;
  const objectiveJustCompleted = planet.lastObjectiveLabel !== '' && planet.time - planet.objectiveCompletedAt < 18;

  return (
    <main id="app" className="planet-app" data-ui-pass="planet-forge-prototype" data-demo="planet-forge-sandbox">
      <PlanetScene planet={planet} onPaint={handlePaint} />

      <section className="planet-title-panel" aria-label="planet mission">
        <span className="eyebrow">PLANET FORGE · BRANCH PROTOTYPE</span>
        <h1>작은 행성을 손으로 빚고 지켜라</h1>
        <p>클릭/드래그로 표면을 칠하고, 빈 우주나 우클릭 드래그로 행성을 돌리세요. 운석 뒤에는 크레이터나 별빛 파편이 남습니다.</p>
        <div
          className={`planet-phase-chip phase-${planet.phase}${phaseRecent ? ' flash' : ''}`}
          data-planet-phase={planet.phase}
          data-phase-recent={phaseRecent ? 'true' : 'false'}
          data-weather-cloud={weather.cloudCover}
          data-weather-aurora={weather.auroraStrength}
          data-weather-storm={weather.stormIntensity}
          data-life-motes={lifeSignal.moteCount}
          data-life-intensity={lifeSignal.moteIntensity}
        >
          <span className="planet-phase-dot" />
          {PHASE_LABELS[planet.phase]}
        </div>
        <div
          className={`planet-guardian-chip${guardian.active ? ' active' : ''}${guardianRecent ? ' flash' : ''}`}
          data-guardian-active={guardian.active ? 'true' : 'false'}
          data-guardian-strength={guardian.strength}
          data-guardian-recent={guardianRecent ? 'true' : 'false'}
        >
          <span className="planet-guardian-dot" />
          {guardian.active ? '수호자 위성망 가동' : `수호자 진행 ${Math.round(guardian.strength * 100)}%`}
        </div>
        <div
          className={`planet-objective-chip${objective.completed ? ' complete' : ''}`}
          data-objective-kind={objective.kind}
          data-objective-progress={objective.progress}
          data-objective-target={objective.target}
          data-objective-completed={objective.completed ? 'true' : 'false'}
        >
          <span className="planet-objective-dot" />
          🎯 {objective.label} ({objective.progress}/{objective.target})
        </div>
        <div
          className={`planet-restoration-chip${restoration.active ? ' active' : ''}${restoration.count === 0 ? ' empty' : ''}`}
          data-crater-restoration-active={restoration.active ? 'true' : 'false'}
          data-restoration-count={restoration.count}
          data-restoration-cell={restoration.lastCellId ?? ''}
          data-restoration-tool={restoration.lastTool ?? ''}
        >
          <span className="planet-restoration-dot" />
          {restoration.active
            ? '크레이터 복구됨! 생명이 돌아왔어요'
            : restoration.count > 0
              ? `복구된 크레이터 ${restoration.count}개`
              : '크레이터를 물/숲으로 복구해보세요'}
        </div>
      </section>

      <section
        className={`planet-win-beat${objectiveJustCompleted ? ' active' : ''}`}
        aria-label="objective reward beat"
        data-objective-win-beat={objectiveJustCompleted ? 'true' : 'false'}
      >
        <span className="win-beat-icon">🏆</span>
        <div className="win-beat-body">
          <b>{planet.lastObjectiveLabel ? `${planet.lastObjectiveLabel} 완료!` : '첫 목표를 향해 항해 중'}</b>
          <small>보상: 에너지 +12 · 광물 +8 · 안정도 +4</small>
        </div>
      </section>

      <section className="planet-stats" aria-label="planet status">
        <div className="planet-stat primary">
          <span>거주 가능성</span>
          <b data-planet-habitability>{totals.habitability}%</b>
        </div>
        <div className="planet-stat">
          <span>⚡ 에너지</span>
          <b>{Math.floor(planet.energy)}</b>
        </div>
        <div className="planet-stat">
          <span>💧 물</span>
          <b>{Math.floor(planet.water)}</b>
        </div>
        <div className="planet-stat">
          <span>🌿 생물량</span>
          <b>{Math.floor(planet.biomass)}</b>
        </div>
        <div className="planet-stat">
          <span>◆ 광물</span>
          <b>{Math.floor(planet.minerals)}</b>
        </div>
        <div className="planet-stat">
          <span>👥 인구</span>
          <b>{Math.floor(planet.population)}</b>
        </div>
      </section>

      <section className="planet-toolbox" aria-label="terraforming tools">
        <div className="toolbox-head">
          <span>행성 도구</span>
          <button type="button" onClick={handleReset}>초기화</button>
        </div>
        {TOOL_ORDER.map((tool) => (
          <button
            key={tool}
            type="button"
            className={`planet-tool ${planet.selectedTool === tool ? 'active' : ''}`}
            onClick={() => handleSelectTool(tool)}
            data-selected-tool={planet.selectedTool === tool ? 'true' : 'false'}
          >
            <span className="planet-tool-label">{TOOL_LABELS[tool]}</span>
            <CostText tool={tool} />
            <small>{TOOL_HINTS[tool]}</small>
          </button>
        ))}
        <button type="button" className="meteor-button" onClick={handleMeteor} disabled={!!planet.activeEvent}>
          운석 테스트 호출
        </button>
      </section>

      <section
        className={`planet-alert ${planet.activeEvent ? 'active' : ''}`}
        aria-label="meteor alert"
        data-meteor-active={planet.activeEvent ? 'true' : 'false'}
        data-last-impact-kind={planet.lastImpactKind}
      >
        {planet.activeEvent ? (
          <>
            <span>운석 접근 중</span>
            <b>{planet.activeEvent.timer.toFixed(1)}s</b>
            <div className="meteor-meter"><i style={{ width: `${eventProgress * 100}%` }} /></div>
            <small>붉은 링 주변에 방어막을 찍으세요</small>
          </>
        ) : (
          <>
            <span>다음 우주 재난</span>
            <b>{Math.max(0, planet.nextMeteorAt - planet.time).toFixed(0)}s</b>
            <small>수정과 에너지를 모아두세요</small>
          </>
        )}
      </section>

      <section className="planet-cell-card" aria-label="selected surface">
        <span>선택 표면</span>
        {activeCell ? (
          <>
            <b>{activeCell.biome.toUpperCase()}</b>
            <small>생명력 {Math.round(activeCell.vitality * 100)}% · 열 {Math.round(activeCell.heat * 100)}% · {SCAR_LABELS[activeCell.scar]}</small>
          </>
        ) : (
          <>
            <b>행성 클릭</b>
            <small>표면 패치를 드래그하면 현재 도구가 연속 적용됩니다.</small>
          </>
        )}
        {planet.brushComboTier !== 'none' && (
          <div
            className={`planet-combo-chip tier-${planet.brushComboTier}${comboRecent ? ' flash' : ''}`}
            data-brush-combo-tier={planet.brushComboTier}
            data-combo-recent={comboRecent ? 'true' : 'false'}
          >
            <span className="planet-combo-dot" />
            {BRUSH_COMBO_LABELS[planet.brushComboTier]} ×{planet.brushStreak}
          </div>
        )}
      </section>

      <section className="planet-log" aria-label="planet log">
        {visibleLogs.map((entry) => (
          <p key={entry.id} className={entry.tone}>
            <span>{entry.time.toFixed(0)}s</span>
            {entry.text}
          </p>
        ))}
      </section>

      <section className="planet-score-strip" aria-label="biome counts">
        <span>바다 {totals.ocean}</span>
        <span>숲 {totals.forest}</span>
        <span>수정 {totals.crystal}</span>
        <span>도시 {totals.settlement}</span>
        <span>크레이터 {totals.craters}</span>
        <span>파편 {totals.debrisFields}</span>
        <span>브러시 {planet.brushStreak}연속</span>
        <span>방어막 {Math.floor(planet.shield)}%</span>
        <span>안정도 {Math.floor(planet.stability)}%</span>
      </section>
    </main>
  );
}
