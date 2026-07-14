import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  TOOL_COSTS,
  TOOL_LABELS,
  applyTool,
  createInitialPlanetState,
  getLogs,
  planetTotals,
  selectTool,
  tickPlanet,
  triggerMeteor,
  type PlanetBiome,
  type PlanetCell,
  type PlanetState,
  type PlanetTool,
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
  command: {
    selectTool: (tool: PlanetTool) => PlanetState;
    paintCell: (cellId?: string, tool?: PlanetTool) => PlanetState;
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

function rebuildAdornment(group: THREE.Group, cell: PlanetCell) {
  if (group.userData.biome === cell.biome && group.userData.vitality === cell.vitality) return;
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
  group.scale.setScalar(0.82 + cell.vitality * 0.34);
  group.userData.biome = cell.biome;
  group.userData.vitality = cell.vitality;
}

interface CellVisual {
  patch: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
  adornment: THREE.Group;
}

interface SceneContext {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  planetGroup: THREE.Group;
  cloudShell: THREE.Mesh;
  meteor: THREE.Group;
  impactRing: THREE.Mesh;
  selectionRing: THREE.Mesh;
  cellVisuals: Map<string, CellVisual>;
  raycastTargets: THREE.Object3D[];
  frame: number;
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
  visual.patch.material.emissive.set(style.emissive);
  visual.patch.material.roughness = style.roughness;
  visual.patch.material.metalness = style.metalness;
  visual.patch.material.opacity = style.opacity ?? (cell.biome === 'barren' ? 0.78 : 0.92);
  visual.patch.scale.setScalar(0.76 + cell.vitality * 0.34 + (cell.id === selectedCellId ? 0.16 : 0));
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
    const raycastTargets: THREE.Object3D[] = [];
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
      planetGroup.add(patch, adornment);
      cellVisuals.set(cell.id, { patch, adornment });
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
    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(raycastTargets, false);
      const hit = hits.find((item) => typeof item.object.userData.cellId === 'string');
      if (hit) onPaint(hit.object.userData.cellId as string);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    const context: SceneContext = {
      renderer,
      camera,
      scene,
      planetGroup,
      cloudShell,
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
      orbitalRing.rotation.z += delta * 0.04;
      moon.position.set(Math.cos(current.time * 0.22) * 2.75, 0.36 + Math.sin(current.time * 0.15) * 0.18, Math.sin(current.time * 0.22) * 2.75);
      if (current.activeEvent) {
        const impact = current.cells.find((cell) => cell.id === current.activeEvent?.impactCellId);
        if (impact) {
          const normal = vec3(impact.normal);
          const progress = 1 - current.activeEvent.timer / current.activeEvent.duration;
          const distance = PLANET_RADIUS + 2.15 - progress * 1.72;
          setSurfaceTransform(meteor, normal, distance, 'y');
          meteor.visible = true;
          meteor.scale.setScalar(1 + Math.sin(current.time * 12) * 0.08);
          setSurfaceTransform(impactRing, normal, PLANET_RADIUS + 0.04, 'z');
          impactRing.visible = true;
          impactRing.scale.setScalar(0.85 + Math.sin(current.time * 7) * 0.09);
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
      command: {
        selectTool: (tool: PlanetTool) => handleSelectTool(tool),
        paintCell: (cellId?: string, tool?: PlanetTool) => {
          const current = planetRef.current;
          const targetCell = cellId ?? current.selectedCellId ?? current.cells.find((cell) => cell.biome === 'barren')?.id ?? current.cells[0]?.id;
          return commit((state) => applyTool({ ...state, selectedTool: tool ?? state.selectedTool, selectedCellId: targetCell }, tool ?? state.selectedTool, targetCell));
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
  const logs = getLogs(planet);
  const activeCell = planet.selectedCellId ? planet.cells.find((cell) => cell.id === planet.selectedCellId) : null;
  const eventProgress = planet.activeEvent ? Math.max(0, 1 - planet.activeEvent.timer / planet.activeEvent.duration) : 0;

  return (
    <main id="app" className="planet-app" data-ui-pass="planet-forge-prototype" data-demo="planet-forge-sandbox">
      <PlanetScene planet={planet} onPaint={handlePaint} />

      <section className="planet-title-panel" aria-label="planet mission">
        <span className="eyebrow">PLANET FORGE · BRANCH PROTOTYPE</span>
        <h1>작은 행성을 손으로 빚고 지켜라</h1>
        <p>표면을 클릭해서 바다·숲·수정·도시·방어막을 배치하세요. 운석이 오면 충돌 지점에 방어막을 씌워야 합니다.</p>
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

      <section className={`planet-alert ${planet.activeEvent ? 'active' : ''}`} aria-label="meteor alert" data-meteor-active={planet.activeEvent ? 'true' : 'false'}>
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
            <small>생명력 {Math.round(activeCell.vitality * 100)}% · 열 {Math.round(activeCell.heat * 100)}%</small>
          </>
        ) : (
          <>
            <b>행성 클릭</b>
            <small>표면 패치를 찍으면 현재 도구가 바로 적용됩니다.</small>
          </>
        )}
      </section>

      <section className="planet-log" aria-label="planet log">
        {logs.map((entry) => (
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
        <span>방어막 {Math.floor(planet.shield)}%</span>
        <span>안정도 {Math.floor(planet.stability)}%</span>
      </section>
    </main>
  );
}
