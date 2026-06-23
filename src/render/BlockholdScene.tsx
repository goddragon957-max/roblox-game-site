import { useEffect, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  Engine,
  GlowLayer,
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

const mat = (scene: Scene, name: string, color: string, emissive = '#000000', alpha = 1) => {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.emissiveColor = Color3.FromHexString(emissive);
  material.specularColor = Color3.FromHexString('#ffffff').scale(0.08);
  material.alpha = alpha;
  return material;
};

export function BlockholdScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const state = useGameStore();
  const api = useGameStore.getState;

  useEffect(() => {
    const canvas = canvasRef.current!;
    let engine: Engine;
    try {
      engine = new Engine(canvas, true);
    } catch {
      setWebglFailed(true);
      return;
    }
    const scene = new Scene(engine);
    scene.clearColor.set(0.12, 0.78, 1, 1);

    const camera = new ArcRotateCamera('toy-camera', -0.78, 0.84, 11.4, new Vector3(0, 0, 1.2), scene);
    camera.attachControl(canvas, true);
    camera.lowerBetaLimit = 0.68;
    camera.upperBetaLimit = 1.08;
    camera.lowerRadiusLimit = 8.3;
    camera.upperRadiusLimit = 14.2;
    camera.wheelPrecision = 62;
    camera.panningSensibility = 80;

    new HemisphericLight('warm-sky', new Vector3(-0.4, 1, 0.3), scene).intensity = 1.02;
    const sun = new DirectionalLight('sun', new Vector3(-0.55, -0.85, 0.45), scene);
    sun.diffuse = Color3.FromHexString('#fff1c7');
    sun.intensity = 0.9;
    const coreLight = new PointLight('crystal-light', new Vector3(0, 3.2, 3.1), scene);
    coreLight.diffuse = Color3.FromHexString('#ff67d8');
    coreLight.intensity = 2.1;
    new GlowLayer('friendly-glow', scene).intensity = 0.48;

    const materials = {
      grass: mat(scene, 'blocky-grass', '#58c72e'),
      grassAlt: mat(scene, 'soft-grass', '#7bdd38'),
      dirt: mat(scene, 'chunky-dirt', '#ad6b3d'),
      dirtDark: mat(scene, 'dirt-shadow', '#784226'),
      cliffPink: mat(scene, 'candy-cliff', '#d88a77'),
      cliffLight: mat(scene, 'sunny-cliff', '#f2b08a'),
      sand: mat(scene, 'warm-path', '#ffd04f', '#8a5b00'),
      sandEdge: mat(scene, 'path-edge', '#f29d32'),
      pathPebble: mat(scene, 'path-pebbles', '#fff2a6'),
      forecast: mat(scene, 'sunny-forecast', '#ffb33f', '#9a4f00', 0.86),
      danger: mat(scene, 'candy-danger', '#ff6b5f', '#8b1f17', 0.82),
      valid: mat(scene, 'mint-preview', '#6ee7b7', '#057a55', 0.56),
      invalid: mat(scene, 'rose-preview', '#ff8a8a', '#982525', 0.56),
      selected: mat(scene, 'selected-ring', '#ffe066', '#ff9f1c', 0.72),
      wood: mat(scene, 'toy-wood', '#9a5f31'),
      woodLight: mat(scene, 'toy-wood-light', '#c9823f'),
      stone: mat(scene, 'friendly-stone', '#a8a29e'),
      stoneLight: mat(scene, 'stone-highlight', '#d6d3d1'),
      blue: mat(scene, 'guard-blue', '#2563eb', '#102f8f'),
      blueLight: mat(scene, 'flag-blue', '#45a8ff', '#1357c8'),
      metal: mat(scene, 'helmet-metal', '#c7cdd8'),
      metalDark: mat(scene, 'metal-rim', '#7d8797'),
      puppy: mat(scene, 'puppy-fur', '#c9823f'),
      puppyCream: mat(scene, 'puppy-cream', '#fff0c7'),
      puppyEar: mat(scene, 'puppy-ear', '#6d3f22'),
      eye: mat(scene, 'button-eye', '#1d2430'),
      nose: mat(scene, 'puppy-nose', '#3a2418'),
      blush: mat(scene, 'puppy-blush', '#ff9bbb', '#5c1024'),
      wall: mat(scene, 'wall-stone', '#b9b4aa'),
      trap: mat(scene, 'trap-base', '#76503a'),
      trapSpike: mat(scene, 'trap-spike', '#f4f4f0'),
      turretBolt: mat(scene, 'tower-bolt', '#ffdb57', '#b36b00'),
      frost: mat(scene, 'frost-rune', '#53d9ff', '#0b74b8', 0.84),
      frostBright: mat(scene, 'frost-bright', '#c6f6ff', '#1bb7ff'),
      crystal: mat(scene, 'core-crystal', '#67e5ff', '#15bfff'),
      crystalPink: mat(scene, 'heart-crystal-pink', '#ff65d8', '#ff30c8'),
      crystalLavender: mat(scene, 'tiny-crystal-lavender', '#b77cff', '#7736ff'),
      crystalBase: mat(scene, 'core-base-stone', '#8b8a82'),
      torch: mat(scene, 'torch-flame', '#ffcf4d', '#ff7b00'),
      leaf: mat(scene, 'leaf-cubes', '#4e9f2d'),
      leafLight: mat(scene, 'leaf-light', '#75c84a'),
      flowerWhite: mat(scene, 'flower-white', '#fff7d6'),
      flowerPink: mat(scene, 'flower-pink', '#ff8ab3'),
      flowerYellow: mat(scene, 'flower-yellow', '#ffd84d'),
      flowerBlue: mat(scene, 'flower-blue', '#5ac8ff'),
      mushroomRed: mat(scene, 'mushroom-red', '#ff4d42', '#6e1212'),
      mushroomBlue: mat(scene, 'mushroom-blue', '#3fc7ff', '#0b6d9b'),
      balloonPink: mat(scene, 'balloon-pink', '#ff72bf', '#a31565'),
      balloonPurple: mat(scene, 'balloon-purple', '#9b5cff', '#5624bd'),
      balloonGold: mat(scene, 'balloon-gold', '#ffca39', '#a65d00'),
      flagPink: mat(scene, 'flag-pink', '#ff72bf', '#a31565'),
      coin: mat(scene, 'coin-token', '#ffd43b', '#c77700'),
      cloud: mat(scene, 'puffy-cloud', '#ffffff', '#bdefff', 0.93),
      sparkle: mat(scene, 'sparkle-pop', '#fff8a8', '#ffd400'),
      confettiA: mat(scene, 'confetti-a', '#ff5ab3', '#b20f66'),
      confettiB: mat(scene, 'confetti-b', '#49d6ff', '#0c78aa'),
      confettiC: mat(scene, 'confetti-c', '#ffd84d', '#b87500'),
      grunt: mat(scene, 'green-blob', '#79e65f', '#1e8c34'),
      runner: mat(scene, 'blue-blob', '#4edcff', '#0b8fca'),
      brute: mat(scene, 'berry-blob', '#e873dc', '#93268a'),
      blobPink: mat(scene, 'pink-blob', '#ff6fb3', '#b31966'),
      horn: mat(scene, 'tiny-horns', '#fff0a8'),
      hp: mat(scene, 'hp-fill', '#44d24a', '#0d7d22'),
      hpBack: mat(scene, 'hp-back', '#5b3f31'),
      hit: mat(scene, 'hit-pop', '#fff06a', '#ff9f1c'),
      kill: mat(scene, 'coin-pop', '#facc15', '#b45309'),
      coreHit: mat(scene, 'core-hit-pop', '#ff5b5b', '#9f1239'),
      shadow: mat(scene, 'soft-shadow', '#2f261d', '#000000', 0.23),
    };

    const previewMaterials: Record<BlockType, StandardMaterial> = {
      wall: materials.valid,
      trap: materials.valid,
      turret: materials.valid,
      frost: materials.frost,
    };

    const meshes = new Map<string, Mesh>();
    let hoverCell: Cell | undefined;
    const center = () => (api().size - 1) / 2;
    const cellToVec = (x: number, z: number, y = 0) => new Vector3(x - center(), y, z - center());

    function remember(id: string, mesh: Mesh, material: StandardMaterial, pickable = false) {
      mesh.material = material;
      mesh.isPickable = pickable;
      meshes.set(id, mesh);
      return mesh;
    }

    function box(id: string, w: number, h: number, d: number, pos: Vector3, material: StandardMaterial, pickable = false) {
      let mesh = meshes.get(id);
      if (!mesh) mesh = MeshBuilder.CreateBox(id, { width: w, height: h, depth: d }, scene);
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      return remember(id, mesh, material, pickable);
    }

    function sphere(id: string, diameter: number, pos: Vector3, material: StandardMaterial, segments = 12) {
      let mesh = meshes.get(id);
      if (!mesh) mesh = MeshBuilder.CreateSphere(id, { diameter, segments }, scene);
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      return remember(id, mesh, material);
    }

    function cylinder(id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation = 12) {
      let mesh = meshes.get(id);
      if (!mesh) mesh = MeshBuilder.CreateCylinder(id, { diameter, height, tessellation }, scene);
      mesh.position = pos;
      mesh.rotation.set(0, 0, 0);
      return remember(id, mesh, material);
    }

    function cone(id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation = 8) {
      let mesh = meshes.get(id);
      if (!mesh) mesh = MeshBuilder.CreateCylinder(id, { diameterTop: 0, diameterBottom: diameter, height, tessellation }, scene);
      mesh.position = pos;
      mesh.rotation.y = Math.PI / 4;
      return remember(id, mesh, material);
    }

    const liveBox = (live: Set<string>, id: string, w: number, h: number, d: number, pos: Vector3, material: StandardMaterial, pickable = false) => {
      live.add(id);
      return box(id, w, h, d, pos, material, pickable);
    };
    const liveSphere = (live: Set<string>, id: string, diameter: number, pos: Vector3, material: StandardMaterial, segments?: number) => {
      live.add(id);
      return sphere(id, diameter, pos, material, segments);
    };
    const liveCylinder = (live: Set<string>, id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation?: number) => {
      live.add(id);
      return cylinder(id, diameter, height, pos, material, tessellation);
    };
    const liveCone = (live: Set<string>, id: string, diameter: number, height: number, pos: Vector3, material: StandardMaterial, tessellation?: number) => {
      live.add(id);
      return cone(id, diameter, height, pos, material, tessellation);
    };

    function drawPuppy(live: Set<string>, id: string, x: number, z: number, y = 0.18, scale = 1) {
      liveCylinder(live, `${id}-shadow`, 0.92 * scale, 0.025, cellToVec(x, z, y + 0.02), materials.shadow, 18);
      liveSphere(live, `${id}-body`, 0.62 * scale, cellToVec(x, z, y + 0.43 * scale), materials.puppy, 14).scaling.y = 1.02;
      liveSphere(live, `${id}-head`, 0.62 * scale, cellToVec(x, z - 0.04 * scale, y + 0.82 * scale), materials.puppy, 16).scaling.y = 1.08;
      liveSphere(live, `${id}-muzzle`, 0.34 * scale, cellToVec(x, z - 0.36 * scale, y + 0.73 * scale), materials.puppyCream, 12);
      liveBox(live, `${id}-ear-l`, 0.2 * scale, 0.42 * scale, 0.16 * scale, cellToVec(x - 0.32 * scale, z, y + 0.78 * scale), materials.puppyEar);
      liveBox(live, `${id}-ear-r`, 0.2 * scale, 0.42 * scale, 0.16 * scale, cellToVec(x + 0.32 * scale, z, y + 0.78 * scale), materials.puppyEar);
      liveBox(live, `${id}-helmet`, 0.62 * scale, 0.18 * scale, 0.54 * scale, cellToVec(x, z - 0.02 * scale, y + 1.14 * scale), materials.metal);
      liveBox(live, `${id}-helmet-rim`, 0.72 * scale, 0.07 * scale, 0.6 * scale, cellToVec(x, z - 0.05 * scale, y + 1.03 * scale), materials.metalDark);
      liveSphere(live, `${id}-helmet-gem`, 0.12 * scale, cellToVec(x, z - 0.32 * scale, y + 1.17 * scale), materials.crystalPink, 8);
      liveBox(live, `${id}-scarf`, 0.78 * scale, 0.12 * scale, 0.56 * scale, cellToVec(x, z, y + 0.58 * scale), materials.blue);
      liveBox(live, `${id}-scarf-tail`, 0.12 * scale, 0.1 * scale, 0.48 * scale, cellToVec(x - 0.38 * scale, z + 0.2 * scale, y + 0.58 * scale), materials.blueLight);
      liveSphere(live, `${id}-eye-l`, 0.085 * scale, cellToVec(x - 0.15 * scale, z - 0.42 * scale, y + 0.88 * scale), materials.eye, 8);
      liveSphere(live, `${id}-eye-r`, 0.085 * scale, cellToVec(x + 0.15 * scale, z - 0.42 * scale, y + 0.88 * scale), materials.eye, 8);
      liveSphere(live, `${id}-shine-l`, 0.03 * scale, cellToVec(x - 0.17 * scale, z - 0.47 * scale, y + 0.92 * scale), materials.flowerWhite, 6);
      liveSphere(live, `${id}-shine-r`, 0.03 * scale, cellToVec(x + 0.13 * scale, z - 0.47 * scale, y + 0.92 * scale), materials.flowerWhite, 6);
      liveSphere(live, `${id}-blush-l`, 0.06 * scale, cellToVec(x - 0.24 * scale, z - 0.41 * scale, y + 0.76 * scale), materials.blush, 8);
      liveSphere(live, `${id}-blush-r`, 0.06 * scale, cellToVec(x + 0.24 * scale, z - 0.41 * scale, y + 0.76 * scale), materials.blush, 8);
      liveSphere(live, `${id}-nose`, 0.08 * scale, cellToVec(x, z - 0.51 * scale, y + 0.72 * scale), materials.nose, 8);
      liveBox(live, `${id}-shield`, 0.42 * scale, 0.52 * scale, 0.08 * scale, cellToVec(x + 0.42 * scale, z - 0.27 * scale, y + 0.48 * scale), materials.blueLight);
      liveBox(live, `${id}-shield-star`, 0.18 * scale, 0.18 * scale, 0.09 * scale, cellToVec(x + 0.42 * scale, z - 0.33 * scale, y + 0.52 * scale), materials.turretBolt);
      liveBox(live, `${id}-sword`, 0.08 * scale, 0.62 * scale, 0.08 * scale, cellToVec(x - 0.44 * scale, z - 0.28 * scale, y + 0.62 * scale), materials.metal);
    }

    function drawTowerPuppy(live: Set<string>, id: string, x: number, z: number) {
      liveBox(live, `${id}-base`, 0.92, 0.7, 0.92, cellToVec(x, z, 0.47), materials.wood);
      liveBox(live, `${id}-door`, 0.34, 0.42, 0.08, cellToVec(x, z - 0.48, 0.39), materials.metalDark);
      liveBox(live, `${id}-rail`, 1.08, 0.14, 1.08, cellToVec(x, z, 0.88), materials.woodLight);
      liveBox(live, `${id}-band`, 1.04, 0.14, 0.2, cellToVec(x, z - 0.43, 0.62), materials.blue);
      drawPuppy(live, `${id}-guard`, x, z - 0.02, 0.82, 0.75);
      liveBox(live, `${id}-bolt`, 0.18, 0.18, 0.78, cellToVec(x, z - 0.54, 1.52), materials.turretBolt);
      liveBox(live, `${id}-flag-pole`, 0.05, 0.82, 0.05, cellToVec(x - 0.42, z + 0.32, 1.15), materials.wood);
      liveBox(live, `${id}-flag`, 0.38, 0.22, 0.05, cellToVec(x - 0.25, z + 0.28, 1.38), materials.blueLight);
    }

    function drawBlock(live: Set<string>, id: string, type: BlockType, x: number, z: number) {
      liveBox(live, `${id}-selected`, 0.96, 0.045, 0.96, cellToVec(x, z, 0.18), materials.selected);
      if (type === 'wall') {
        liveBox(live, `${id}-body`, 0.78, 0.72, 0.78, cellToVec(x, z, 0.56), materials.wall);
        liveBox(live, `${id}-cap`, 0.62, 0.16, 0.62, cellToVec(x, z, 1), materials.stoneLight);
        [[-0.23, -0.23], [0.23, -0.23], [-0.23, 0.23], [0.23, 0.23]].forEach(([dx, dz], index) => {
          liveBox(live, `${id}-brick-${index}`, 0.2, 0.18, 0.2, cellToVec(x + dx, z + dz, 1.18), materials.stone);
        });
        return;
      }
      if (type === 'turret') {
        drawTowerPuppy(live, id, x, z);
        return;
      }
      if (type === 'trap') {
        liveBox(live, `${id}-pad`, 0.78, 0.16, 0.78, cellToVec(x, z, 0.22), materials.trap);
        [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22], [0, 0]].forEach(([dx, dz], index) => {
          liveCone(live, `${id}-spike-${index}`, 0.18, 0.34, cellToVec(x + dx, z + dz, 0.48), materials.trapSpike, 4);
        });
        return;
      }
      liveCylinder(live, `${id}-rune`, 0.82, 0.08, cellToVec(x, z, 0.18), materials.frost, 24);
      liveBox(live, `${id}-mark-a`, 0.54, 0.035, 0.12, cellToVec(x, z, 0.25), materials.frostBright);
      liveBox(live, `${id}-mark-b`, 0.12, 0.035, 0.54, cellToVec(x, z, 0.26), materials.frostBright);
      liveSphere(live, `${id}-snow`, 0.22, cellToVec(x, z, 0.5), materials.frostBright, 10);
    }

    function drawBlob(live: Set<string>, id: string, kind: RaiderKind, x: number, z: number, hp: number, maxHp: number) {
      const spec = {
        grunt: { body: 1, y: 0.66, material: materials.grunt },
        runner: { body: 0.9, y: 0.61, material: materials.runner },
        brute: { body: 1.24, y: 0.8, material: materials.brute },
      }[kind];
      liveCylinder(live, `${id}-shadow`, spec.body * 1.2, 0.025, cellToVec(x, z, 0.12), materials.shadow, 18);
      const body = liveSphere(live, `${id}-body`, spec.body, cellToVec(x, z, spec.y), spec.material, 14);
      body.scaling.y = kind === 'brute' ? 1.08 : 0.92;
      liveSphere(live, `${id}-shine`, 0.18, cellToVec(x - spec.body * 0.18, z - spec.body * 0.3, spec.y + spec.body * 0.23), materials.flowerWhite, 8);
      liveSphere(live, `${id}-eye-l`, 0.09, cellToVec(x - spec.body * 0.17, z - spec.body * 0.41, spec.y + 0.07), materials.eye, 8);
      liveSphere(live, `${id}-eye-r`, 0.09, cellToVec(x + spec.body * 0.17, z - spec.body * 0.41, spec.y + 0.07), materials.eye, 8);
      liveSphere(live, `${id}-smile-l`, 0.035, cellToVec(x - spec.body * 0.08, z - spec.body * 0.47, spec.y - 0.1), materials.eye, 6);
      liveSphere(live, `${id}-smile-r`, 0.035, cellToVec(x + spec.body * 0.08, z - spec.body * 0.47, spec.y - 0.1), materials.eye, 6);
      liveCone(live, `${id}-horn-l`, 0.18, 0.27, cellToVec(x - spec.body * 0.23, z - 0.02, spec.y + spec.body * 0.52), materials.horn, 6);
      liveCone(live, `${id}-horn-r`, 0.18, 0.27, cellToVec(x + spec.body * 0.23, z - 0.02, spec.y + spec.body * 0.52), materials.horn, 6);
      liveBox(live, `${id}-hp-back`, 0.72, 0.065, 0.09, cellToVec(x, z, 1.18), materials.hpBack);
      liveBox(live, `${id}-hp`, Math.max(0.08, 0.68 * (hp / maxHp)), 0.075, 0.1, cellToVec(x, z, 1.24), materials.hp);
    }

    function drawTree(live: Set<string>, id: string, x: number, z: number) {
      liveBox(live, `${id}-trunk`, 0.28, 0.78, 0.28, cellToVec(x, z, 0.58), materials.wood);
      liveBox(live, `${id}-leaf-a`, 0.74, 0.52, 0.74, cellToVec(x, z, 1.12), materials.leaf);
      liveBox(live, `${id}-leaf-b`, 0.55, 0.42, 0.55, cellToVec(x, z - 0.04, 1.52), materials.leafLight);
    }

    function drawFlower(live: Set<string>, id: string, x: number, z: number, material: StandardMaterial) {
      liveBox(live, `${id}-stem`, 0.045, 0.2, 0.045, cellToVec(x, z, 0.31), materials.leaf);
      [[0, -0.07], [0.07, 0], [0, 0.07], [-0.07, 0]].forEach(([dx, dz], index) => {
        liveSphere(live, `${id}-petal-${index}`, 0.09, cellToVec(x + dx, z + dz, 0.44), material, 8);
      });
      liveSphere(live, `${id}-center`, 0.06, cellToVec(x, z, 0.45), materials.flowerYellow, 8);
    }

    function drawMushroom(live: Set<string>, id: string, x: number, z: number, cap: StandardMaterial) {
      liveCylinder(live, `${id}-stem`, 0.13, 0.28, cellToVec(x, z, 0.36), materials.puppyCream, 8);
      liveSphere(live, `${id}-cap`, 0.34, cellToVec(x, z, 0.56), cap, 12).scaling.y = 0.48;
      liveSphere(live, `${id}-dot-a`, 0.06, cellToVec(x - 0.08, z - 0.08, 0.66), materials.flowerWhite, 6);
      liveSphere(live, `${id}-dot-b`, 0.05, cellToVec(x + 0.1, z, 0.65), materials.flowerWhite, 6);
    }

    function drawFence(live: Set<string>, id: string, x: number, z: number, horizontal = true) {
      const posts = horizontal ? [[-0.32, 0], [0.32, 0]] : [[0, -0.32], [0, 0.32]];
      posts.forEach(([dx, dz], index) => {
        liveBox(live, `${id}-post-${index}`, 0.12, 0.48, 0.12, cellToVec(x + dx, z + dz, 0.5), materials.woodLight);
        liveCone(live, `${id}-cap-${index}`, 0.16, 0.16, cellToVec(x + dx, z + dz, 0.84), materials.turretBolt, 4);
      });
      liveBox(live, `${id}-rail-a`, horizontal ? 0.78 : 0.1, 0.09, horizontal ? 0.1 : 0.78, cellToVec(x, z, 0.6), materials.wood);
      liveBox(live, `${id}-rail-b`, horizontal ? 0.72 : 0.1, 0.08, horizontal ? 0.1 : 0.72, cellToVec(x, z, 0.39), materials.wood);
    }

    function drawBalloon(live: Set<string>, id: string, x: number, z: number, material: StandardMaterial, height = 1.7) {
      liveBox(live, `${id}-string`, 0.025, height, 0.025, cellToVec(x, z, 0.54 + height / 2), materials.metal);
      liveSphere(live, `${id}-balloon`, 0.42, cellToVec(x, z, 0.58 + height), material, 14).scaling.y = 1.18;
      liveCone(live, `${id}-knot`, 0.12, 0.14, cellToVec(x, z, 0.36 + height), material, 6);
    }

    function drawSparkle(live: Set<string>, id: string, x: number, z: number, y: number, material = materials.sparkle) {
      const a = liveBox(live, `${id}-a`, 0.08, 0.34, 0.08, cellToVec(x, z, y), material);
      a.rotation.y = Math.PI / 4;
      const b = liveBox(live, `${id}-b`, 0.3, 0.07, 0.07, cellToVec(x, z, y), material);
      b.rotation.y = Math.PI / 4;
    }

    function drawCloud(live: Set<string>, id: string, x: number, z: number, y: number, scale = 1) {
      liveSphere(live, `${id}-a`, 0.78 * scale, new Vector3(x, y, z), materials.cloud, 12).scaling.y = 0.52;
      liveSphere(live, `${id}-b`, 0.58 * scale, new Vector3(x + 0.38 * scale, y + 0.05 * scale, z + 0.04 * scale), materials.cloud, 12).scaling.y = 0.5;
      liveSphere(live, `${id}-c`, 0.52 * scale, new Vector3(x - 0.38 * scale, y - 0.02 * scale, z), materials.cloud, 12).scaling.y = 0.48;
    }

    function drawSideIsland(live: Set<string>, id: string, x: number, z: number, y: number, scale = 1) {
      liveBox(live, `${id}-dirt`, 1.8 * scale, 0.5 * scale, 1.4 * scale, new Vector3(x, y, z), materials.dirtDark);
      liveBox(live, `${id}-top`, 1.65 * scale, 0.18 * scale, 1.25 * scale, new Vector3(x, y + 0.32 * scale, z), materials.grassAlt);
      liveBox(live, `${id}-house`, 0.44 * scale, 0.34 * scale, 0.44 * scale, new Vector3(x - 0.2 * scale, y + 0.6 * scale, z), materials.woodLight);
      liveCone(live, `${id}-tree`, 0.52 * scale, 0.7 * scale, new Vector3(x + 0.42 * scale, y + 0.86 * scale, z), materials.leafLight, 8);
    }

    function drawCoin(live: Set<string>, id: string, x: number, z: number) {
      const coin = liveCylinder(live, `${id}-coin`, 0.26, 0.06, cellToVec(x, z, 0.58), materials.coin, 20);
      coin.rotation.x = Math.PI / 2;
      liveSphere(live, `${id}-paw`, 0.08, cellToVec(x, z - 0.03, 0.59), materials.torch, 8);
    }

    function drawDecor(live: Set<string>) {
      [[0, 8], [1, 6], [2, 9], [3, 1], [7, 1], [9, 4], [10, 8], [8, 10], [0, 3], [10, 2]].forEach(([x, z], index) => drawTree(live, `tree-${index}`, x, z));
      [[0, 2], [0, 5], [2, 3], [4, 10], [7, 9], [9, 2], [10, 5], [10, 10]].forEach(([x, z], index) => {
        liveBox(live, `stone-${index}`, 0.32, 0.24, 0.32, cellToVec(x, z, 0.28), index % 2 ? materials.stone : materials.stoneLight);
      });
      [
        [1.2, 9.1], [2.3, 5.35], [3.35, 8.15], [4.15, 2.2], [6.25, 3.3], [7.25, 6.2], [8.3, 8.2], [9.3, 7.25],
        [0.55, 6.6], [1.6, 1.45], [2.6, 7.5], [3.65, 4.4], [4.8, 9.55], [6.2, 9.4], [7.7, 2.45], [8.6, 5.3],
        [9.7, 9.1], [5.6, 1.35], [0.8, 9.8], [10.1, 6.4], [3.1, 10.2], [6.7, 0.9],
      ].forEach(([x, z], index) => {
        const flower = [materials.flowerWhite, materials.flowerPink, materials.flowerYellow, materials.flowerBlue][index % 4];
        drawFlower(live, `flower-${index}`, x, z, flower);
      });
      [[0.9, 4.25], [2.15, 1.75], [2.85, 9.35], [6.95, 7.4], [8.75, 3.1], [9.65, 5.8], [10.2, 8.9]].forEach(([x, z], index) => {
        drawMushroom(live, `mushroom-${index}`, x, z, index % 2 ? materials.mushroomBlue : materials.mushroomRed);
      });
      [[1.5, 5.85, true], [2.55, 8.9, false], [4.35, 1.5, true], [6.85, 8.95, true], [7.9, 5.55, false], [9.35, 1.6, true], [9.5, 9.55, false], [0.7, 7.7, false]].forEach(([x, z, horizontal], index) => {
        drawFence(live, `fence-${index}`, Number(x), Number(z), Boolean(horizontal));
      });
      [[0.45, 1.15, materials.balloonPink], [0.75, 1.5, materials.balloonPurple], [9.75, 0.8, materials.balloonGold], [10.25, 1.25, materials.balloonPink], [10.2, 6.9, materials.balloonPurple]].forEach(([x, z, material], index) => {
        drawBalloon(live, `balloon-${index}`, Number(x), Number(z), material as StandardMaterial, 1.35 + (index % 2) * 0.35);
      });
      [[1.3, 7.5], [3.45, 2.6], [4.4, 6.7], [6.3, 2.15], [7.4, 9.75], [8.6, 7.25], [9.6, 3.45]].forEach(([x, z], index) => {
        drawCoin(live, `coin-${index}`, x, z);
      });
      [[1.7, 8.1], [2.6, 4.25], [4.4, 7.3], [6.7, 4.25], [7.9, 8.55], [9.15, 6.35], [3.75, 0.95], [5.1, 9.7]].forEach(([x, z], index) => {
        liveCone(live, `tiny-crystal-${index}`, 0.22, 0.5, cellToVec(x, z, 0.6), index % 2 ? materials.crystalLavender : materials.crystal, 4);
      });
      [[2.35, 6.6, 1.32], [4.85, 5.75, 1.72], [6.25, 6.65, 1.35], [8.35, 4.65, 1.45], [5.3, 8.9, 1.82], [1.1, 2.8, 1.25]].forEach(([x, z, y], index) => {
        drawSparkle(live, `sparkle-${index}`, x, z, y, [materials.sparkle, materials.confettiA, materials.confettiB, materials.confettiC][index % 4]);
      });
      [
        [-5.6, -4.8, 2.6, 0.9], [5.7, -3.9, 3.05, 1.05], [-6.25, 2.35, 2.45, 0.75], [6.1, 4.9, 2.75, 0.9],
      ].forEach(([x, z, y, scale], index) => drawCloud(live, `cloud-${index}`, x, z, y, scale));
      [
        [-6.4, -2.3, 0.55, 0.8], [6.2, -1.5, 0.9, 0.7], [-5.2, 4.8, 0.75, 0.62],
      ].forEach(([x, z, y, scale], index) => drawSideIsland(live, `side-island-${index}`, x, z, y, scale));
      [[0.2, 0.5], [10, 0.5], [1.1, 10], [9.4, 10]].forEach(([x, z], index) => {
        liveBox(live, `torch-post-${index}`, 0.13, 0.72, 0.13, cellToVec(x, z, 0.55), materials.wood);
        liveSphere(live, `torch-flame-${index}`, 0.22, cellToVec(x, z, 1), materials.torch, 8);
      });
      [[2, 7], [4, 6], [7, 4], [8, 6], [4.15, 8.85]].forEach(([x, z], index) => drawPuppy(live, `decor-puppy-${index}`, x, z, 0.18, index === 4 ? 0.82 : 0.74));
      [[1.25, 4.15], [8.8, 6.9], [9.55, 9.1]].forEach(([x, z], index) => drawTowerPuppy(live, `decor-tower-${index}`, x, z));
    }

    function drawCore(live: Set<string>, x: number, z: number) {
      liveBox(live, 'core-plaza', 2, 0.2, 2, cellToVec(x, z, 0.22), materials.stone);
      liveBox(live, 'core-step-a', 1.48, 0.18, 1.48, cellToVec(x, z, 0.43), materials.stoneLight);
      liveCylinder(live, 'core-plinth', 1.02, 0.34, cellToVec(x, z, 0.7), materials.crystalBase, 12);
      liveSphere(live, 'core-heart-left', 0.55, cellToVec(x - 0.21, z - 0.03, 1.5), materials.crystalPink, 16).scaling.y = 1.08;
      liveSphere(live, 'core-heart-right', 0.55, cellToVec(x + 0.21, z - 0.03, 1.5), materials.crystalPink, 16).scaling.y = 1.08;
      const point = liveCone(live, 'core-heart-point', 0.82, 0.82, cellToVec(x, z - 0.01, 1.18), materials.crystalPink, 4);
      point.rotation.y = Math.PI / 4;
      liveCone(live, 'core-blue-crystal-l', 0.32, 0.92, cellToVec(x - 0.65, z + 0.28, 1.08), materials.crystal, 4);
      liveCone(live, 'core-blue-crystal-r', 0.3, 0.82, cellToVec(x + 0.68, z + 0.18, 1.02), materials.crystal, 4);
      liveCone(live, 'core-lavender-crystal', 0.28, 0.72, cellToVec(x + 0.15, z + 0.76, 0.96), materials.crystalLavender, 4);
      [[-1.05, -1.05], [1.05, -1.05], [-1.05, 1.05], [1.05, 1.05]].forEach(([dx, dz], index) => {
        liveBox(live, `core-pillar-${index}`, 0.22, 0.62, 0.22, cellToVec(x + dx, z + dz, 0.58), materials.stone);
        liveSphere(live, `core-spark-${index}`, 0.2, cellToVec(x + dx, z + dz, 1.02), index % 2 ? materials.crystalPink : materials.crystal, 8);
        drawFence(live, `core-fence-${index}`, x + dx * 0.82, z + dz * 0.82, index < 2);
      });
      [[-0.75, -0.5], [0.72, -0.62], [-0.55, 0.72], [0.5, 0.62]].forEach(([dx, dz], index) => {
        drawFlower(live, `core-flower-${index}`, x + dx, z + dz, [materials.flowerPink, materials.flowerBlue, materials.flowerYellow, materials.flowerWhite][index]);
      });
      [[-0.9, 0.1, 1.55], [0.92, -0.22, 1.68], [0.08, -0.92, 1.45], [-0.16, 0.9, 1.78]].forEach(([dx, dz, y], index) => {
        drawSparkle(live, `core-twinkle-${index}`, x + dx, z + dz, y, index % 2 ? materials.crystal : materials.sparkle);
      });
    }

    function isPathCell(x: number, z: number, dangerLane: number) {
      const laneCells = [1, 3, 5, 7, 9].includes(x) && z <= 8;
      const coreRun = z === 8 && x >= Math.min(dangerLane, 5) && x <= Math.max(dangerLane, 5);
      const bridge = z === 2 && x >= 1 && x <= 9 && x % 2 === 1;
      return laneCells || coreRun || bridge;
    }

    function draw() {
      const s = api();
      const forecastLane = getRaidPlan(s.day).dangerLane;
      const activeLane = s.phase === 'raid' ? s.dangerLane : forecastLane;
      const live = new Set<string>();

      liveBox(live, 'island-dirt', s.size + 1.15, 1.45, s.size + 1.15, cellToVec(center(), center(), -0.66), materials.dirtDark);
      liveBox(live, 'island-cliff-mid', s.size + 0.95, 0.42, s.size + 0.95, cellToVec(center(), center(), -0.18), materials.cliffPink);
      liveBox(live, 'island-cliff-light', s.size + 0.75, 0.24, s.size + 0.75, cellToVec(center(), center(), 0.08), materials.cliffLight);
      liveBox(live, 'island-top', s.size + 0.6, 0.28, s.size + 0.6, cellToVec(center(), center(), 0.12), materials.dirt);
      liveBox(live, 'grass-cap', s.size + 0.35, 0.14, s.size + 0.35, cellToVec(center(), center(), 0.32), materials.grassAlt);

      for (let x = 0; x < s.size; x += 1) {
        for (let z = 0; z < s.size; z += 1) {
          const lane = isPathCell(x, z, activeLane);
          const danger = s.phase === 'raid' && x === s.dangerLane && z <= s.core.z;
          const forecast = s.phase === 'build' && x === forecastLane && z <= s.core.z;
          const material = danger ? materials.danger : forecast ? materials.forecast : lane ? materials.sand : (x + z) % 2 ? materials.grass : materials.grassAlt;
          liveBox(live, `tile-${x}-${z}`, lane ? 1.08 : 0.94, lane ? 0.16 : 0.1, lane ? 1.08 : 0.94, cellToVec(x, z, 0.4), material, true);
          if (lane) {
            liveBox(live, `tile-edge-${x}-${z}`, 0.92, 0.04, 0.92, cellToVec(x, z, 0.51), materials.sandEdge);
            if ((x + z) % 3 === 0) liveSphere(live, `path-dot-${x}-${z}`, 0.14, cellToVec(x + 0.24, z - 0.18, 0.57), materials.pathPebble, 8);
          }
        }
      }

      [1, 3, 5, 7, 9].forEach((lane) => {
        liveBox(live, `spawn-dock-${lane}`, 0.78, 0.18, 0.78, cellToVec(lane, 0, 0.48), lane === activeLane ? materials.danger : materials.sand);
        liveBox(live, `spawn-flag-post-${lane}`, 0.06, 0.74, 0.06, cellToVec(lane - 0.31, 0.22, 0.88), materials.wood);
        liveBox(live, `spawn-flag-${lane}`, 0.33, 0.2, 0.05, cellToVec(lane - 0.15, 0.2, 1.18), materials.blueLight);
      });

      drawDecor(live);

      if (s.phase === 'build' && hoverCell) {
        const occupied = Boolean(s.blocks[`${hoverCell.x},${hoverCell.z}`]);
        const valid = hoverCell.x >= 0 && hoverCell.x < s.size && hoverCell.z >= 0 && hoverCell.z < s.size && hoverCell.z !== 0 && !(hoverCell.x === s.core.x && hoverCell.z === s.core.z) && !occupied && s.resources[s.selected] > 0;
        const height = s.selected === 'turret' ? 1.1 : s.selected === 'wall' ? 0.75 : 0.18;
        liveBox(live, 'build-preview', 0.88, height, 0.88, cellToVec(hoverCell.x, hoverCell.z, 0.42 + height / 2), valid ? previewMaterials[s.selected] : materials.invalid);
      }

      drawCore(live, s.core.x, s.core.z);

      Object.entries(s.blocks).forEach(([k, b]) => {
        const [x, z] = k.split(',').map(Number);
        drawBlock(live, `block-${k}`, b.type, x, z);
      });

      s.raiders.filter((r) => !r.resolved && r.hp > 0).forEach((r) => {
        drawBlob(live, `blob-${r.id}`, r.kind, r.cell.x, r.cell.z, r.hp, r.maxHp);
      });

      s.combatMarkers.forEach((effect) => {
        const id = `fx-${effect.id}`;
        const size = effect.kind === 'kill' ? 0.42 : 0.3;
        const material = effect.kind === 'kill' ? materials.kill : effect.kind === 'core' ? materials.coreHit : materials.hit;
        liveSphere(live, id, size, cellToVec(effect.cell.x, effect.cell.z, 1.18 + effect.ticks * 0.17), material, 8);
        drawSparkle(live, `${id}-sparkle`, effect.cell.x + 0.24, effect.cell.z - 0.18, 1.22 + effect.ticks * 0.15, material);
      });

      for (const [id, mesh] of meshes) {
        if (!live.has(id)) {
          mesh.dispose();
          meshes.delete(id);
        }
      }
      scene.render();
    }

    engine.runRenderLoop(draw);
    const onResize = () => engine.resize();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') api().select('wall');
      if (e.key === '2') api().select('trap');
      if (e.key === '3') api().select('turret');
      if (e.key === '4') api().select('frost');
      if (e.key.toLowerCase() === 'r') {
        camera.alpha = -0.78;
        camera.beta = 0.86;
        camera.radius = 12.2;
        camera.target = new Vector3(0, 0, 1.1);
      }
      if (e.code === 'Space') api().togglePause();
    };
    const pointToCell = () => {
      const picked = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh.isPickable);
      if (!picked?.pickedPoint) return undefined;
      return {
        x: Math.round(picked.pickedPoint.x + center()),
        z: Math.round(picked.pickedPoint.z + center()),
      };
    };
    const hover = () => {
      hoverCell = pointToCell();
    };
    const pick = (ev: PointerEvent) => {
      ev.preventDefault();
      const cell = pointToCell();
      if (!cell) return;
      if (ev.button === 2) api().remove(cell);
      else api().place(cell);
    };
    const clearHover = () => {
      hoverCell = undefined;
    };
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

  const fallbackPlan = getRaidPlan(state.day);
  const fallbackLane = state.phase === 'raid' ? state.dangerLane : fallbackPlan.dangerLane;
  const cells = Array.from({ length: state.size * state.size }, (_, index) => {
    const x = index % state.size;
    const z = Math.floor(index / state.size);
    const block = state.blocks[`${x},${z}`];
    const raider = state.raiders.find((r) => !r.resolved && r.hp > 0 && r.cell.x === x && r.cell.z === z);
    const isCore = state.core.x === x && state.core.z === z;
    const isLane = [1, 3, 5, 7, 9].includes(x) && z <= state.core.z;
    const isActiveLane = x === fallbackLane && z <= state.core.z;
    return { x, z, block, raider, isCore, isLane, isActiveLane };
  });

  return (
    <>
      <canvas ref={canvasRef} id="scene" className={webglFailed ? 'scene-hidden' : ''} aria-label="Puppy Guard bright toy island tower defense board" />
      {webglFailed && (
        <div className="webgl-fallback" aria-label="Puppy Guard bright fallback tower defense board">
          <div className="fallback-island">
            <div className="fallback-grid">
              {cells.map((cell) => (
                <button
                  key={`${cell.x}-${cell.z}`}
                  className={[
                    'fallback-cell',
                    cell.isLane ? 'path' : 'grass',
                    cell.isActiveLane ? 'active-lane' : '',
                    cell.isCore ? 'core' : '',
                    cell.block?.type ?? '',
                    cell.raider?.kind ?? '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => api().place({ x: cell.x, z: cell.z })}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    api().remove({ x: cell.x, z: cell.z });
                  }}
                  aria-label={`Cell ${cell.x},${cell.z}`}
                >
                  {cell.isCore && <span className="fallback-crystal" />}
                  {cell.block && <span className="fallback-block" />}
                  {cell.raider && <span className="fallback-blob" />}
                </button>
              ))}
            </div>
            <span className="fallback-puppy puppy-a" />
            <span className="fallback-puppy puppy-b" />
            <span className="fallback-puppy puppy-c" />
          </div>
        </div>
      )}
    </>
  );
}
