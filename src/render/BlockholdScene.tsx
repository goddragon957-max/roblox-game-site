import { useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useGameStore } from '../store/gameStore';
import { getRaidPlan } from '../game/simulation';
import type { BlockType, Cell, RaiderKind } from '../game/types';

const mat = (scene: Scene, name: string, color: string, emissive = '#020617') => {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(color);
  m.emissiveColor = Color3.FromHexString(emissive);
  return m;
};

const ghostMat = (scene: Scene, name: string, color: string, emissive = '#020617') => {
  const m = mat(scene, name, color, emissive);
  m.alpha = 0.58;
  return m;
};

export function BlockholdScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useGameStore();
  const api = useGameStore.getState;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor.set(0.01, 0.014, 0.026, 1);

    const camera = new ArcRotateCamera('camera', -0.78, 0.96, 12.2, new Vector3(0, 0, 1.5), scene);
    camera.attachControl(canvas, true);
    camera.lowerBetaLimit = 0.82;
    camera.upperBetaLimit = 1.16;
    camera.lowerRadiusLimit = 9.5;
    camera.upperRadiusLimit = 15.5;
    camera.wheelPrecision = 55;

    new HemisphericLight('moon', new Vector3(-0.35, 1, 0.2), scene).intensity = 0.68;
    const coreLight = new PointLight('coreLight', new Vector3(0, 4.2, 3.2), scene);
    coreLight.diffuse = Color3.FromHexString('#38bdf8');
    coreLight.intensity = 1.75;

    const materials = {
      floor: mat(scene, 'floor', '#172033'),
      boardEdge: mat(scene, 'boardEdge', '#0f172a'),
      lane: mat(scene, 'lane', '#2d3a55', '#141c2f'),
      laneMark: mat(scene, 'laneMark', '#475569', '#1e293b'),
      forecast: mat(scene, 'forecast', '#9a5d12', '#422006'),
      danger: mat(scene, 'danger', '#8f1f1f', '#450a0a'),
      wall: mat(scene, 'wall', '#9aa7b8'),
      wallTop: mat(scene, 'wallTop', '#e2e8f0', '#334155'),
      trap: mat(scene, 'trap', '#f97316', '#451a03'),
      trapSpike: mat(scene, 'trapSpike', '#fed7aa', '#7c2d12'),
      turret: mat(scene, 'turret', '#8b5cf6', '#312e81'),
      turretTop: mat(scene, 'turretTop', '#ddd6fe', '#4c1d95'),
      turretBarrel: mat(scene, 'turretBarrel', '#c4b5fd', '#312e81'),
      frost: mat(scene, 'frost', '#67e8f9', '#083344'),
      frostGlow: mat(scene, 'frostGlow', '#cffafe', '#155e75'),
      core: mat(scene, 'core', '#38bdf8', '#075985'),
      coreBase: mat(scene, 'coreBase', '#0e7490', '#164e63'),
      spawn: mat(scene, 'spawn', '#ef4444', '#450a0a'),
      spawnGlow: mat(scene, 'spawnGlow', '#fca5a5', '#7f1d1d'),
      grunt: mat(scene, 'gruntBody', '#ef4444', '#450a0a'),
      runner: mat(scene, 'runnerBody', '#facc15', '#422006'),
      brute: mat(scene, 'bruteBody', '#fb7185', '#4c0519'),
      raiderHead: mat(scene, 'raiderHead', '#fecaca', '#7f1d1d'),
      runnerHead: mat(scene, 'runnerHead', '#fef08a', '#713f12'),
      bruteHead: mat(scene, 'bruteHead', '#ffe4e6', '#881337'),
      hp: mat(scene, 'hp', '#22c55e', '#052e16'),
      hpBack: mat(scene, 'hpBack', '#111827'),
      shadow: mat(scene, 'shadow', '#020617'),
      hit: mat(scene, 'hitMarker', '#facc15', '#713f12'),
      kill: mat(scene, 'killMarker', '#22c55e', '#052e16'),
      coreHit: mat(scene, 'coreHitMarker', '#ef4444', '#7f1d1d'),
      blocked: ghostMat(scene, 'blockedPreview', '#ef4444', '#450a0a'),
    };
    materials.shadow.alpha = 0.48;

    const previewMaterials: Record<BlockType, StandardMaterial> = {
      wall: ghostMat(scene, 'wallPreview', '#cbd5e1', '#334155'),
      trap: ghostMat(scene, 'trapPreview', '#fb923c', '#7c2d12'),
      turret: ghostMat(scene, 'turretPreview', '#c4b5fd', '#4c1d95'),
      frost: ghostMat(scene, 'frostPreview', '#a5f3fc', '#155e75'),
    };

    const meshes = new Map<string, Mesh>();
    let hoverCell: Cell | undefined;
    const center = () => (api().size - 1) / 2;
    const cellToVec = (x: number, z: number, y = 0.06) => new Vector3(x - center(), y, z - center());

    function box(id: string, w: number, h: number, d: number, pos: Vector3, material: StandardMaterial) {
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = MeshBuilder.CreateBox(id, { width: w, height: h, depth: d }, scene);
        meshes.set(id, mesh);
      }
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      mesh.material = material;
      return mesh;
    }

    function sphere(id: string, diameter: number, pos: Vector3, material: StandardMaterial, segments = 10) {
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = MeshBuilder.CreateSphere(id, { diameter, segments }, scene);
        meshes.set(id, mesh);
      }
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      mesh.material = material;
      return mesh;
    }

    function cylinder(id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation = 12) {
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = MeshBuilder.CreateCylinder(id, { diameter, height, tessellation }, scene);
        meshes.set(id, mesh);
      }
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      mesh.material = material;
      return mesh;
    }

    function cone(id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial) {
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = MeshBuilder.CreateCylinder(id, { diameterTop: 0, diameterBottom: diameter, height, tessellation: 4 }, scene);
        meshes.set(id, mesh);
      }
      mesh.position = pos;
      mesh.rotation.y = Math.PI / 4;
      mesh.material = material;
      return mesh;
    }

    const liveBox = (live: Set<string>, id: string, w: number, h: number, d: number, pos: Vector3, material: StandardMaterial) => {
      live.add(id);
      return box(id, w, h, d, pos, material);
    };
    const liveSphere = (live: Set<string>, id: string, diameter: number, pos: Vector3, material: StandardMaterial, segments?: number) => {
      live.add(id);
      return sphere(id, diameter, pos, material, segments);
    };
    const liveCylinder = (live: Set<string>, id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation?: number) => {
      live.add(id);
      return cylinder(id, diameter, height, pos, material, tessellation);
    };
    const liveCone = (live: Set<string>, id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial) => {
      live.add(id);
      return cone(id, diameter, height, pos, material);
    };

    function drawBlock(live: Set<string>, id: string, type: BlockType, x: number, z: number) {
      if (type === 'wall') {
        liveBox(live, `${id}-body`, 0.9, 0.92, 0.9, cellToVec(x, z, 0.5), materials.wall);
        liveBox(live, `${id}-cap`, 0.72, 0.16, 0.72, cellToVec(x, z, 1.02), materials.wallTop);
        return;
      }
      if (type === 'turret') {
        liveCylinder(live, `${id}-base`, 0.74, 0.72, cellToVec(x, z, 0.42), materials.turret, 8);
        liveBox(live, `${id}-head`, 0.62, 0.46, 0.62, cellToVec(x, z, 0.9), materials.turretTop);
        liveBox(live, `${id}-barrel`, 0.18, 0.18, 0.7, cellToVec(x, z - 0.35, 0.92), materials.turretBarrel);
        return;
      }
      if (type === 'trap') {
        liveBox(live, `${id}-pad`, 0.78, 0.13, 0.78, cellToVec(x, z, 0.13), materials.trap);
        [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([dx, dz], index) => {
          liveCone(live, `${id}-spike-${index}`, 0.18, 0.28, cellToVec(x + dx, z + dz, 0.33), materials.trapSpike);
        });
        return;
      }
      liveCylinder(live, `${id}-rune`, 0.82, 0.11, cellToVec(x, z, 0.1), materials.frost, 18);
      liveSphere(live, `${id}-glow`, 0.34, cellToVec(x, z, 0.32), materials.frostGlow, 12);
    }

    function drawRaider(live: Set<string>, id: string, kind: RaiderKind, x: number, z: number, hp: number, maxHp: number) {
      const scale: Record<RaiderKind, { body: [number, number, number]; head: number; y: number; material: StandardMaterial; headMaterial: StandardMaterial }> = {
        grunt: { body: [0.42, 0.48, 0.42], head: 0.26, y: 0.43, material: materials.grunt, headMaterial: materials.raiderHead },
        runner: { body: [0.34, 0.42, 0.34], head: 0.22, y: 0.38, material: materials.runner, headMaterial: materials.runnerHead },
        brute: { body: [0.68, 0.7, 0.68], head: 0.36, y: 0.55, material: materials.brute, headMaterial: materials.bruteHead },
      };
      const spec = scale[kind];
      liveCylinder(live, `${id}-shadow`, kind === 'brute' ? 0.8 : 0.54, 0.025, cellToVec(x, z, 0.08), materials.shadow, 16);
      liveBox(live, `${id}-body`, spec.body[0], spec.body[1], spec.body[2], cellToVec(x, z, spec.y), spec.material);
      liveSphere(live, `${id}-head`, spec.head, cellToVec(x, z - 0.02, spec.y + spec.body[1] / 2 + spec.head * 0.42), spec.headMaterial, 10);
      liveBox(live, `${id}-leg-l`, spec.body[0] * 0.28, 0.2, spec.body[2] * 0.26, cellToVec(x - spec.body[0] * 0.23, z, 0.22), spec.material);
      liveBox(live, `${id}-leg-r`, spec.body[0] * 0.28, 0.2, spec.body[2] * 0.26, cellToVec(x + spec.body[0] * 0.23, z, 0.22), spec.material);
      liveBox(live, `${id}-hp-back`, 0.58, 0.045, 0.08, cellToVec(x, z, 1.05), materials.hpBack);
      liveBox(live, `${id}-hp`, Math.max(0.08, 0.56 * (hp / maxHp)), 0.055, 0.09, cellToVec(x, z, 1.09), materials.hp);
    }

    function draw() {
      const s = api();
      const forecastLane = getRaidPlan(s.day).dangerLane;
      const live = new Set<string>();

      liveBox(live, 'board-base', s.size + 0.65, 0.18, s.size + 0.65, cellToVec(center(), center(), -0.08), materials.boardEdge);
      for (let x = 0; x < s.size; x += 1) {
        for (let z = 0; z < s.size; z += 1) {
          const id = `f-${x}-${z}`;
          const isLane = [1, 3, 5, 7, 9].includes(x) && z <= s.core.z;
          const isRaidDangerLane = s.phase === 'raid' && x === s.dangerLane && z <= s.core.z;
          const isBuildForecastLane = s.phase === 'build' && x === forecastLane && z <= s.core.z;
          const material = isRaidDangerLane ? materials.danger : isBuildForecastLane ? materials.forecast : isLane ? materials.lane : materials.floor;
          liveBox(live, id, 0.92, 0.08, 0.92, cellToVec(x, z, 0.02), material);
          if (isLane && z < s.core.z) liveBox(live, `lane-mark-${x}-${z}`, 0.16, 0.025, 0.45, cellToVec(x, z + 0.22, 0.09), materials.laneMark);
        }
      }

      [1, 3, 5, 7, 9].forEach((lane) => {
        liveBox(live, `spawn-pad-${lane}`, 0.82, 0.18, 0.82, cellToVec(lane, 0, 0.17), materials.spawn);
        liveCylinder(live, `spawn-beacon-${lane}`, 0.28, 0.62, cellToVec(lane, 0, 0.53), materials.spawnGlow, 8);
      });

      if (s.phase === 'build' && hoverCell) {
        const occupied = Boolean(s.blocks[`${hoverCell.x},${hoverCell.z}`]);
        const valid = hoverCell.x >= 0 && hoverCell.x < s.size && hoverCell.z >= 0 && hoverCell.z < s.size && hoverCell.z !== 0 && !(hoverCell.x === s.core.x && hoverCell.z === s.core.z) && !occupied && s.resources[s.selected] > 0;
        const dims = s.selected === 'wall' ? [0.9, 0.88, 0.9] : s.selected === 'turret' ? [0.68, 1, 0.68] : [0.82, 0.14, 0.82];
        liveBox(live, 'build-preview', dims[0], dims[1], dims[2], cellToVec(hoverCell.x, hoverCell.z, valid ? dims[1] / 2 + 0.08 : 0.1), valid ? previewMaterials[s.selected] : materials.blocked);
      }

      liveCylinder(live, 'core-base', 1.32, 0.42, cellToVec(s.core.x, s.core.z, 0.27), materials.coreBase, 16);
      liveBox(live, 'core-tower', 0.92, 1.18, 0.92, cellToVec(s.core.x, s.core.z, 0.88), materials.core);
      liveSphere(live, 'core-orb', 0.55, cellToVec(s.core.x, s.core.z, 1.58), materials.frostGlow, 16);

      Object.entries(s.blocks).forEach(([k, b]) => {
        const [x, z] = k.split(',').map(Number);
        drawBlock(live, `b-${k}`, b.type, x, z);
      });

      s.raiders.filter((r) => !r.resolved && r.hp > 0).forEach((r) => {
        drawRaider(live, `r-${r.id}`, r.kind, r.cell.x, r.cell.z, r.hp, r.maxHp);
      });

      s.combatMarkers.forEach((effect) => {
        const id = `fx-${effect.id}`;
        const size = effect.kind === 'kill' ? 0.42 : 0.28;
        const material = effect.kind === 'kill' ? materials.kill : effect.kind === 'core' ? materials.coreHit : materials.hit;
        liveSphere(live, id, size, cellToVec(effect.cell.x, effect.cell.z, 1.1 + effect.ticks * 0.14), material, 8);
      });

      for (const [id, m] of meshes) if (!live.has(id)) { m.dispose(); meshes.delete(id); }
      scene.render();
    }

    engine.runRenderLoop(draw);
    const onResize = () => engine.resize();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') api().select('wall');
      if (e.key === '2') api().select('trap');
      if (e.key === '3') api().select('turret');
      if (e.key === '4') api().select('frost');
      if (e.key.toLowerCase() === 'r') { camera.alpha = -0.78; camera.beta = 0.96; camera.radius = 12.2; }
      if (e.code === 'Space') api().togglePause();
    };
    const hover = () => {
      const picked = scene.pick(scene.pointerX, scene.pointerY);
      if (!picked?.pickedPoint) {
        hoverCell = undefined;
        return;
      }
      hoverCell = {
        x: Math.round(picked.pickedPoint.x + center()),
        z: Math.round(picked.pickedPoint.z + center()),
      };
    };
    const pick = (ev: PointerEvent) => {
      ev.preventDefault();
      const picked = scene.pick(scene.pointerX, scene.pointerY);
      if (!picked?.pickedPoint) return;
      const x = Math.round(picked.pickedPoint.x + center());
      const z = Math.round(picked.pickedPoint.z + center());
      if (ev.button === 2) api().remove({ x, z });
      else api().place({ x, z });
    };
    const clearHover = () => { hoverCell = undefined; };
    const blockContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointermove', hover);
    canvas.addEventListener('pointerleave', clearHover);
    canvas.addEventListener('pointerdown', pick);
    canvas.addEventListener('contextmenu', blockContextMenu);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointermove', hover);
      canvas.removeEventListener('pointerleave', clearHover);
      canvas.removeEventListener('pointerdown', pick);
      canvas.removeEventListener('contextmenu', blockContextMenu);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (state.phase !== 'raid' || state.paused) return;
    const t = setInterval(() => useGameStore.getState().step(), 520);
    return () => clearInterval(t);
  }, [state.phase, state.paused]);

  return <canvas ref={canvasRef} id="scene" aria-label="Blockhold Siege polished isometric tower defense board" />;
}
