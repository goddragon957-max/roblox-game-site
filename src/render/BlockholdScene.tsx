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
import type { RaiderKind } from '../game/types';

const mat = (scene: Scene, name: string, color: string, emissive = '#020617') => {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(color);
  m.emissiveColor = Color3.FromHexString(emissive);
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
    scene.clearColor.set(0.005, 0.008, 0.018, 1);
    const camera = new ArcRotateCamera('camera', -0.72, 1.02, 13.5, new Vector3(0, 0, 1), scene);
    camera.attachControl(canvas, true);
    new HemisphericLight('moon', new Vector3(-0.35, 1, 0.2), scene).intensity = 0.75;
    const coreLight = new PointLight('coreLight', new Vector3(0, 3, 3), scene);
    coreLight.diffuse = Color3.FromHexString('#38bdf8');
    coreLight.intensity = 1.3;

    const materials = {
      floor: mat(scene, 'floor', '#1e293b'),
      lane: mat(scene, 'lane', '#334155', '#111827'),
      danger: mat(scene, 'danger', '#7f1d1d', '#3f1111'),
      wall: mat(scene, 'wall', '#94a3b8'),
      trap: mat(scene, 'trap', '#f97316', '#451a03'),
      turret: mat(scene, 'turret', '#a78bfa', '#312e81'),
      frost: mat(scene, 'frost', '#67e8f9', '#083344'),
      core: mat(scene, 'core', '#38bdf8', '#075985'),
      spawn: mat(scene, 'spawn', '#ef4444', '#450a0a'),
      grunt: mat(scene, 'grunt', '#ef4444', '#450a0a'),
      runner: mat(scene, 'runner', '#facc15', '#422006'),
      brute: mat(scene, 'brute', '#fb7185', '#4c0519'),
      hp: mat(scene, 'hp', '#22c55e', '#052e16'),
    };
    const meshes = new Map<string, Mesh>();
    const center = () => (api().size - 1) / 2;
    const cellToVec = (x: number, z: number, y = 0.06) => new Vector3(x - center(), y, z - center());
    function box(id: string, w: number, h: number, d: number, pos: Vector3, material: StandardMaterial) {
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = MeshBuilder.CreateBox(id, { width: w, height: h, depth: d }, scene);
        meshes.set(id, mesh);
      }
      mesh.position = pos;
      mesh.material = material;
      return mesh;
    }

    function draw() {
      const s = api();
      const live = new Set<string>();
      for (let x = 0; x < s.size; x += 1) {
        for (let z = 0; z < s.size; z += 1) {
          const id = `f-${x}-${z}`;
          live.add(id);
          const isLane = [1, 3, 5, 7, 9].includes(x) && z <= s.core.z;
          const material = x === s.dangerLane && s.phase === 'raid' ? materials.danger : isLane ? materials.lane : materials.floor;
          box(id, 0.96, 0.08, 0.96, cellToVec(x, z, 0.02), material);
        }
      }
      [1, 3, 5, 7, 9].forEach((lane) => {
        const id = `spawn-${lane}`;
        live.add(id);
        box(id, 0.72, 0.3, 0.72, cellToVec(lane, 0, 0.22), materials.spawn);
      });
      live.add('core');
      box('core', 1.15, 1.5, 1.15, cellToVec(s.core.x, s.core.z, 0.78), materials.core);

      Object.entries(s.blocks).forEach(([k, b]) => {
        const [x, z] = k.split(',').map(Number);
        const id = `b-${k}`;
        live.add(id);
        const dims = b.type === 'wall' ? [0.92, 1.05, 0.92] : b.type === 'turret' ? [0.72, 1.2, 0.72] : [0.72, 0.18, 0.72];
        box(id, dims[0], dims[1], dims[2], cellToVec(x, z, b.type === 'wall' ? 0.55 : b.type === 'turret' ? 0.66 : 0.13), materials[b.type]);
      });

      s.raiders.filter((r) => !r.resolved && r.hp > 0).forEach((r) => {
        const id = `r-${r.id}`;
        live.add(id);
        const scale: Record<RaiderKind, [number, number, number]> = { grunt: [0.48, 0.55, 0.48], runner: [0.38, 0.44, 0.38], brute: [0.74, 0.82, 0.74] };
        const [w, h, d] = scale[r.kind];
        box(id, w, h, d, cellToVec(r.cell.x, r.cell.z, 0.36 + h / 4), materials[r.kind]);
        const hpId = `hp-${r.id}`;
        live.add(hpId);
        box(hpId, Math.max(0.08, 0.5 * (r.hp / r.maxHp)), 0.05, 0.08, cellToVec(r.cell.x, r.cell.z, 0.88), materials.hp);
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
      if (e.key.toLowerCase() === 'r') { camera.alpha = -0.72; camera.beta = 1.02; camera.radius = 13.5; }
      if (e.code === 'Space') api().togglePause();
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
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', pick);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', pick);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (state.phase !== 'raid' || state.paused) return;
    const t = setInterval(() => useGameStore.getState().step(), 520);
    return () => clearInterval(t);
  }, [state.phase, state.paused]);

  return <canvas ref={canvasRef} id="scene" aria-label="Blockhold Siege playable tower defense voxel scene" />;
}
