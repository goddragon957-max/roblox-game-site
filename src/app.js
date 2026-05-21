import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

import { createBlockholdSceneState } from './renderAdapter.js';

const canvas = document.querySelector('#scene');
const eyebrow = document.querySelector('#eyebrow');
const title = document.querySelector('#title');
const help = document.querySelector('#help');
const status = document.querySelector('#status');
const state = createBlockholdSceneState({ size: { x: 8, y: 4, z: 8 }, coreHp: 100 });

const engine = new Engine(canvas, true, {
  antialias: true,
  preserveDrawingBuffer: true,
  stencil: true,
});

const scene = new Scene(engine);
scene.clearColor.set(0.006, 0.012, 0.026, 1);
scene.ambientColor = Color3.FromHexString('#172033');

const camera = new ArcRotateCamera(
  'blockhold-camera',
  state.camera.alpha,
  state.camera.beta,
  state.camera.radius,
  new Vector3(state.camera.target.x, state.camera.target.y, state.camera.target.z),
  scene,
);
camera.lowerRadiusLimit = 4;
camera.upperRadiusLimit = 14;
camera.wheelDeltaPercentage = 0.018;
camera.attachControl(canvas, true);

const hemi = new HemisphericLight('cold-moonlight', new Vector3(-0.35, 1, 0.2), scene);
hemi.intensity = state.lights.hemiIntensity;
hemi.diffuse = Color3.FromHexString('#bae6fd');
hemi.groundColor = Color3.FromHexString('#0f172a');

const keyLight = new PointLight('core-key-light', new Vector3(0, 3.4, 0), scene);
keyLight.intensity = state.lights.keyIntensity;
keyLight.diffuse = Color3.FromHexString('#38bdf8');

const rimLight = new PointLight('enemy-rim-light', new Vector3(-4.5, 1.7, -5.2), scene);
rimLight.intensity = state.lights.rimIntensity;
rimLight.diffuse = Color3.FromHexString('#f97316');

function makeMaterial(object) {
  const material = new StandardMaterial(`${object.id}-mat`, scene);
  material.diffuseColor = Color3.FromHexString(object.color);
  material.emissiveColor = Color3.FromHexString(object.emissive);
  material.specularColor = Color3.FromHexString(object.type === 'core' ? '#e0f2fe' : '#334155');
  return material;
}

const meshes = new Map();
for (const object of state.objects) {
  const mesh = MeshBuilder.CreateBox(object.id, object.size, scene);
  mesh.position = new Vector3(object.position.x, object.position.y, object.position.z);
  mesh.material = makeMaterial(object);
  meshes.set(object.id, mesh);
}

const boundaryLines = MeshBuilder.CreateLines('defense-boundary-lines', {
  points: buildBoundaryLinePoints(state.world.size.x, state.world.size.z),
  updatable: false,
}, scene);
boundaryLines.color = Color3.FromHexString('#334155');

const enemyApproach = MeshBuilder.CreateLines('enemy-approach-lane', {
  points: [
    new Vector3(-3.5, 0.16, -4.8),
    new Vector3(-2.1, 0.18, -3.4),
    new Vector3(-1.0, 0.18, -2.4),
    new Vector3(0, 0.18, -1.7),
  ],
  updatable: false,
}, scene);
enemyApproach.color = Color3.FromHexString('#fb923c');

function buildBoundaryLinePoints(width, depth) {
  const points = [];
  const halfX = width / 2;
  const halfZ = depth / 2;

  for (let x = -halfX; x <= halfX; x += 1) {
    points.push(new Vector3(x, 0.14, -halfZ), new Vector3(x, 0.14, halfZ));
  }

  for (let z = -halfZ; z <= halfZ; z += 1) {
    points.push(new Vector3(-halfX, 0.14, z), new Vector3(halfX, 0.14, z));
  }

  return points;
}

function resetCamera() {
  camera.alpha = state.camera.alpha;
  camera.beta = state.camera.beta;
  camera.radius = state.camera.radius;
  camera.target = new Vector3(state.camera.target.x, state.camera.target.y, state.camera.target.z);
}

function setHud() {
  eyebrow.textContent = state.hud.eyebrow;
  title.textContent = state.hud.title;
  help.textContent = state.hud.help;
  status.textContent = state.paused ? `${state.hud.status} · Paused` : state.hud.status;
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    state.paused = !state.paused;
    setHud();
  }

  if (event.key.toLowerCase() === 'r') {
    resetCamera();
  }
});

engine.runRenderLoop(() => {
  if (!state.paused) {
    const time = performance.now() * 0.001;
    const core = meshes.get(`block-core-${state.world.core.position.x}-${state.world.core.position.y}-${state.world.core.position.z}`);
    if (core) {
      const pulse = 1 + Math.sin(time * 2.4) * 0.035;
      core.scaling.set(pulse, pulse, pulse);
      keyLight.intensity = state.lights.keyIntensity + Math.sin(time * 2.4) * 0.32;
    }
  }

  scene.render();
});

window.addEventListener('resize', () => engine.resize());
setHud();
