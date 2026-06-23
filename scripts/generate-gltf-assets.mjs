import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import https from 'node:https';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'assets', 'models');
mkdirSync(outDir, { recursive: true });

const kenneyUrl = 'https://kenney.nl/media/pages/assets/tower-defense-kit/a402493eaa-1726471567/kenney_tower-defense-kit.zip';
const kenneyOutDir = join(outDir, 'kenney');
const kenneyTempDir = join(process.cwd(), '.tmp', 'kenney');
const kenneyZip = join(kenneyTempDir, 'kenney_tower-defense-kit.zip');
const kenneyFiles = [
  'tile.glb',
  'tile-spawn.glb',
  'tile-wide-straight.glb',
  'tile-wide-corner.glb',
  'tower-round-base.glb',
  'tower-round-build-a.glb',
  'weapon-cannon.glb',
  'weapon-turret.glb',
  'enemy-ufo-a.glb',
  'detail-tree.glb',
  'detail-rocks.glb',
  'detail-crystal.glb',
];
const kenneyTextureFiles = ['Textures/colormap.png'];

async function downloadFile(url, destination) {
  await new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        downloadFile(new URL(response.headers.location, url).toString(), destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with HTTP ${response.statusCode}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        writeFileSync(destination, Buffer.concat(chunks));
        resolve();
      });
    });
    request.on('error', reject);
  });
}

async function extractKenneyAssets() {
  mkdirSync(kenneyTempDir, { recursive: true });
  mkdirSync(kenneyOutDir, { recursive: true });
  if (!existsSync(kenneyZip)) await downloadFile(kenneyUrl, kenneyZip);
  for (const file of kenneyFiles) {
    const source = `Models/GLB format/${file}`;
    const data = execFileSync('unzip', ['-p', kenneyZip, source]);
    writeFileSync(join(kenneyOutDir, file), data);
  }
  for (const file of kenneyTextureFiles) {
    const source = `Models/GLB format/${file}`;
    const data = execFileSync('unzip', ['-p', kenneyZip, source]);
    const destination = join(kenneyOutDir, file);
    mkdirSync(join(kenneyOutDir, 'Textures'), { recursive: true });
    writeFileSync(destination, data);
  }
  const license = execFileSync('unzip', ['-p', kenneyZip, 'License.txt']);
  writeFileSync(join(kenneyOutDir, 'License.txt'), license);
  const zipHash = createHash('sha256').update(readFileSync(kenneyZip)).digest('hex');
  writeFileSync(join(kenneyOutDir, 'manifest.json'), `${JSON.stringify({
    source: 'Kenney Tower Defense Kit',
    url: kenneyUrl,
    license: 'CC0 1.0 Universal',
    zipSha256: zipHash,
    selectedFiles: kenneyFiles,
    selectedTextureFiles: kenneyTextureFiles,
  }, null, 2)}\n`);
}

const colors = {
  ink: [0.07, 0.06, 0.05, 1],
  white: [1, 0.98, 0.86, 1],
  cream: [1, 0.83, 0.48, 1],
  fur: [0.76, 0.43, 0.18, 1],
  ear: [0.35, 0.2, 0.1, 1],
  blue: [0.12, 0.43, 1, 1],
  sky: [0.27, 0.75, 1, 1],
  metal: [0.72, 0.75, 0.82, 1],
  metalDark: [0.38, 0.42, 0.49, 1],
  gold: [1, 0.72, 0.16, 1],
  wood: [0.52, 0.29, 0.13, 1],
  woodLight: [0.78, 0.47, 0.21, 1],
  stone: [0.56, 0.55, 0.5, 1],
  stoneLight: [0.82, 0.8, 0.72, 1],
  crystal: [0.2, 0.82, 1, 0.92],
  heart: [1, 0.22, 0.75, 1],
  grunt: [0.43, 0.9, 0.33, 1],
  runner: [0.22, 0.78, 1, 1],
  brute: [0.86, 0.28, 0.8, 1],
  blush: [1, 0.45, 0.68, 1],
};

const euler = (x = 0, y = 0, z = 0) => {
  const sx = Math.sin(x / 2), cx = Math.cos(x / 2);
  const sy = Math.sin(y / 2), cy = Math.cos(y / 2);
  const sz = Math.sin(z / 2), cz = Math.cos(z / 2);
  return [
    sx * cy * cz + cx * sy * sz,
    cx * sy * cz - sx * cy * sz,
    cx * cy * sz + sx * sy * cz,
    cx * cy * cz - sx * sy * sz,
  ];
};

function cube() {
  const p = [
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
  ];
  const n = [
    ...Array(4).fill([0, 0, 1]).flat(),
    ...Array(4).fill([0, 0, -1]).flat(),
    ...Array(4).fill([0, 1, 0]).flat(),
    ...Array(4).fill([0, -1, 0]).flat(),
    ...Array(4).fill([1, 0, 0]).flat(),
    ...Array(4).fill([-1, 0, 0]).flat(),
  ];
  const i = [];
  for (let f = 0; f < 6; f += 1) i.push(f * 4, f * 4 + 1, f * 4 + 2, f * 4, f * 4 + 2, f * 4 + 3);
  return { p, n, i };
}

function sphere(rows = 12, cols = 16) {
  const p = [], n = [], i = [];
  for (let y = 0; y <= rows; y += 1) {
    const v = y / rows;
    const phi = v * Math.PI;
    for (let x = 0; x <= cols; x += 1) {
      const u = x / cols;
      const theta = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      p.push(nx * 0.5, ny * 0.5, nz * 0.5);
      n.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const a = y * (cols + 1) + x;
      const b = a + cols + 1;
      i.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { p, n, i };
}

function cylinder(segments = 18, topRadius = 0.5, bottomRadius = 0.5) {
  const p = [], n = [], i = [];
  for (let s = 0; s <= segments; s += 1) {
    const a = (s / segments) * Math.PI * 2;
    const x = Math.cos(a), z = Math.sin(a);
    p.push(x * bottomRadius, -0.5, z * bottomRadius, x * topRadius, 0.5, z * topRadius);
    n.push(x, 0, z, x, 0, z);
  }
  for (let s = 0; s < segments; s += 1) {
    const a = s * 2;
    i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const bottomCenter = p.length / 3;
  p.push(0, -0.5, 0);
  n.push(0, -1, 0);
  const topCenter = p.length / 3;
  p.push(0, 0.5, 0);
  n.push(0, 1, 0);
  for (let s = 0; s < segments; s += 1) {
    const a = s * 2;
    i.push(bottomCenter, a + 2, a);
    i.push(topCenter, a + 1, a + 3);
  }
  return { p, n, i };
}

const primitives = {
  box: cube(),
  sphere: sphere(),
  lowSphere: sphere(8, 12),
  cylinder: cylinder(20),
  cone: cylinder(16, 0, 0.5),
  gem: cylinder(4, 0, 0.5),
};

function bounds(values) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < values.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], values[i + axis]);
      max[axis] = Math.max(max[axis], values[i + axis]);
    }
  }
  return { min, max };
}

function writeGlb(name, materialMap, nodes) {
  const buffers = [];
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const materials = Object.entries(materialMap).map(([matName, color]) => ({
    name: matName,
    pbrMetallicRoughness: { baseColorFactor: color, metallicFactor: 0, roughnessFactor: 0.92 },
    alphaMode: color[3] < 1 ? 'BLEND' : 'OPAQUE',
    doubleSided: true,
  }));
  const materialIndex = new Map(Object.keys(materialMap).map((matName, index) => [matName, index]));
  let byteOffset = 0;

  const push = (typedArray, target) => {
    const source = Buffer.from(typedArray.buffer);
    const padding = (4 - (byteOffset % 4)) % 4;
    if (padding) {
      buffers.push(Buffer.alloc(padding));
      byteOffset += padding;
    }
    const view = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: source.byteLength, target });
    buffers.push(source);
    byteOffset += source.byteLength;
    return view;
  };

  const meshCache = new Map();
  const getMesh = (shape, matName) => {
    const key = `${shape}:${matName}`;
    if (meshCache.has(key)) return meshCache.get(key);
    const source = primitives[shape];
    const pos = new Float32Array(source.p);
    const norm = new Float32Array(source.n);
    const idx = new Uint16Array(source.i);
    const positionView = push(pos, 34962);
    const normalView = push(norm, 34962);
    const indexView = push(idx, 34963);
    const positionAccessor = accessors.length;
    accessors.push({ bufferView: positionView, componentType: 5126, count: pos.length / 3, type: 'VEC3', ...bounds(source.p) });
    const normalAccessor = accessors.length;
    accessors.push({ bufferView: normalView, componentType: 5126, count: norm.length / 3, type: 'VEC3' });
    const indexAccessor = accessors.length;
    accessors.push({ bufferView: indexView, componentType: 5123, count: idx.length, type: 'SCALAR' });
    const meshIndex = meshes.length;
    meshes.push({
      name: key,
      primitives: [{ attributes: { POSITION: positionAccessor, NORMAL: normalAccessor }, indices: indexAccessor, material: materialIndex.get(matName) }],
    });
    meshCache.set(key, meshIndex);
    return meshIndex;
  };

  const gltfNodes = nodes.map((node) => ({
    name: node.name,
    mesh: getMesh(node.shape, node.material),
    translation: node.t ?? [0, 0, 0],
    rotation: node.r ?? [0, 0, 0, 1],
    scale: node.s ?? [1, 1, 1],
  }));
  const gltf = {
    asset: { version: '2.0', generator: 'Puppy Guard procedural toon GLB generator' },
    scene: 0,
    scenes: [{ nodes: gltfNodes.map((_, index) => index) }],
    nodes: gltfNodes,
    meshes,
    materials,
    buffers: [{ byteLength: byteOffset }],
    bufferViews,
    accessors,
  };

  const json = Buffer.from(JSON.stringify(gltf));
  const jsonPad = (4 - (json.byteLength % 4)) % 4;
  const bin = Buffer.concat(buffers);
  const binPad = (4 - (bin.byteLength % 4)) % 4;
  const totalLength = 12 + 8 + json.byteLength + jsonPad + 8 + bin.byteLength + binPad;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(json.byteLength + jsonPad, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.byteLength + binPad, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  writeFileSync(join(outDir, name), Buffer.concat([
    header,
    jsonHeader,
    json,
    Buffer.alloc(jsonPad, 0x20),
    binHeader,
    bin,
    Buffer.alloc(binPad),
  ]));
}

const n = (name, shape, material, t, s, r) => ({ name, shape, material, t, s, r });

function puppy() {
  return [
    n('soft-shadow', 'cylinder', 'shadow', [0, 0.02, 0], [1.15, 0.03, 0.9]),
    n('body', 'sphere', 'fur', [0, 0.45, 0], [0.82, 0.72, 0.76]),
    n('belly-brush', 'sphere', 'cream', [0, 0.4, -0.32], [0.42, 0.38, 0.12]),
    n('head', 'sphere', 'fur', [0, 1.03, -0.05], [0.9, 0.86, 0.82]),
    n('muzzle', 'sphere', 'cream', [0, 0.9, -0.43], [0.46, 0.32, 0.24]),
    n('ear-l', 'sphere', 'ear', [-0.43, 1, 0.03], [0.24, 0.56, 0.18], euler(0, 0, -0.25)),
    n('ear-r', 'sphere', 'ear', [0.43, 1, 0.03], [0.24, 0.56, 0.18], euler(0, 0, 0.25)),
    n('helmet', 'sphere', 'metal', [0, 1.36, -0.02], [0.86, 0.32, 0.68]),
    n('helmet-rim', 'box', 'metalDark', [0, 1.19, -0.08], [0.96, 0.1, 0.72]),
    n('helmet-gem', 'gem', 'heart', [0, 1.46, -0.38], [0.16, 0.24, 0.16], euler(0, Math.PI / 4, 0)),
    n('scarf', 'box', 'blue', [0, 0.68, -0.02], [0.92, 0.16, 0.62]),
    n('scarf-tail', 'box', 'sky', [-0.5, 0.65, 0.22], [0.16, 0.14, 0.55], euler(0, 0.1, -0.1)),
    n('eye-l', 'sphere', 'ink', [-0.2, 1.07, -0.48], [0.13, 0.15, 0.07]),
    n('eye-r', 'sphere', 'ink', [0.2, 1.07, -0.48], [0.13, 0.15, 0.07]),
    n('eye-shine-l', 'sphere', 'white', [-0.24, 1.13, -0.53], [0.045, 0.05, 0.025]),
    n('eye-shine-r', 'sphere', 'white', [0.16, 1.13, -0.53], [0.045, 0.05, 0.025]),
    n('blush-l', 'sphere', 'blush', [-0.33, 0.92, -0.43], [0.1, 0.07, 0.035]),
    n('blush-r', 'sphere', 'blush', [0.33, 0.92, -0.43], [0.1, 0.07, 0.035]),
    n('nose', 'sphere', 'ink', [0, 0.9, -0.58], [0.1, 0.08, 0.05]),
    n('shield', 'box', 'sky', [0.52, 0.62, -0.35], [0.5, 0.62, 0.09], euler(0, -0.08, 0.05)),
    n('shield-star-a', 'box', 'gold', [0.52, 0.62, -0.42], [0.22, 0.06, 0.1], euler(0, 0, Math.PI / 4)),
    n('shield-star-b', 'box', 'gold', [0.52, 0.62, -0.43], [0.06, 0.22, 0.1], euler(0, 0, Math.PI / 4)),
    n('sword', 'box', 'metal', [-0.52, 0.72, -0.34], [0.08, 0.78, 0.08], euler(0, 0, -0.15)),
    n('sword-hilt', 'box', 'gold', [-0.48, 0.42, -0.33], [0.26, 0.07, 0.1]),
  ];
}

function blob(material, feature = 'grunt') {
  const big = feature === 'brute';
  return [
    n('shadow', 'cylinder', 'shadow', [0, 0.02, 0], [big ? 1.35 : 1.05, 0.03, big ? 1.05 : 0.85]),
    n('body', 'sphere', material, [0, big ? 0.62 : 0.52, 0], [big ? 1.25 : 1, big ? 1.05 : 0.78, big ? 1.08 : 0.86]),
    n('belly-brush', 'sphere', 'tint', [-0.14, big ? 0.54 : 0.46, -0.35], [big ? 0.54 : 0.42, big ? 0.38 : 0.3, 0.12]),
    n('shine', 'sphere', 'white', [-0.24, big ? 0.92 : 0.72, -0.4], [0.18, 0.14, 0.07]),
    n('eye-l', 'sphere', 'ink', [-0.2, big ? 0.7 : 0.6, -0.46], [0.13, 0.15, 0.06]),
    n('eye-r', 'sphere', 'ink', [0.2, big ? 0.7 : 0.6, -0.46], [0.13, 0.15, 0.06]),
    n('mouth-a', 'sphere', 'ink', [-0.07, big ? 0.48 : 0.4, -0.53], [0.05, 0.035, 0.025]),
    n('mouth-b', 'sphere', 'ink', [0.07, big ? 0.48 : 0.4, -0.53], [0.05, 0.035, 0.025]),
    n('horn-l', 'cone', 'horn', [-0.28, big ? 1.2 : 0.94, -0.02], [0.22, 0.36, 0.22], euler(0, 0, 0.28)),
    n('horn-r', 'cone', 'horn', [0.28, big ? 1.2 : 0.94, -0.02], [0.22, 0.36, 0.22], euler(0, 0, -0.28)),
    ...(feature === 'runner' ? [
      n('runner-tail', 'sphere', 'tint', [0, 0.42, 0.46], [0.42, 0.26, 0.22]),
      n('runner-streak', 'box', 'white', [0, 0.84, -0.18], [0.48, 0.05, 0.04], euler(0, 0, -0.2)),
    ] : []),
    ...(feature === 'brute' ? [
      n('brow-l', 'box', 'ink', [-0.2, 0.88, -0.52], [0.22, 0.05, 0.04], euler(0, 0, 0.22)),
      n('brow-r', 'box', 'ink', [0.2, 0.88, -0.52], [0.22, 0.05, 0.04], euler(0, 0, -0.22)),
      n('crown-spike', 'cone', 'gold', [0, 1.32, 0.04], [0.3, 0.44, 0.3]),
    ] : []),
  ];
}

function tower() {
  return [
    n('shadow', 'cylinder', 'shadow', [0, 0.02, 0], [1.25, 0.03, 1.25]),
    n('base', 'box', 'wood', [0, 0.45, 0], [1.02, 0.82, 1.02]),
    n('brush-front', 'box', 'woodLight', [-0.16, 0.58, -0.53], [0.22, 0.58, 0.04]),
    n('door', 'box', 'metalDark', [0.2, 0.34, -0.55], [0.38, 0.46, 0.05]),
    n('rail', 'box', 'woodLight', [0, 0.92, 0], [1.26, 0.16, 1.26]),
    n('band', 'box', 'blue', [0, 0.66, -0.52], [1.18, 0.16, 0.09]),
    ...puppy().map((part) => ({ ...part, name: `guard-${part.name}`, t: [part.t[0], part.t[1] + 0.78, part.t[2] - 0.04], s: part.s.map((value) => value * 0.72) })),
    n('bolt-cannon', 'cylinder', 'gold', [0, 1.76, -0.62], [0.22, 0.86, 0.22], euler(Math.PI / 2, 0, 0)),
    n('cannon-tip', 'cylinder', 'metalDark', [0, 1.76, -1.08], [0.28, 0.16, 0.28], euler(Math.PI / 2, 0, 0)),
    n('flag-pole', 'box', 'wood', [-0.44, 1.35, 0.34], [0.06, 0.94, 0.06]),
    n('flag', 'box', 'sky', [-0.24, 1.58, 0.3], [0.4, 0.24, 0.05]),
  ];
}

function core() {
  return [
    n('plaza', 'box', 'stone', [0, 0.12, 0], [1.9, 0.24, 1.9]),
    n('step', 'box', 'stoneLight', [0, 0.35, 0], [1.38, 0.2, 1.38]),
    n('plinth', 'cylinder', 'stone', [0, 0.68, 0], [0.95, 0.38, 0.95]),
    n('heart-lobe-l', 'sphere', 'heart', [-0.2, 1.32, -0.02], [0.54, 0.58, 0.48]),
    n('heart-lobe-r', 'sphere', 'heart', [0.2, 1.32, -0.02], [0.54, 0.58, 0.48]),
    n('heart-point', 'gem', 'heart', [0, 1.04, -0.02], [0.78, 0.78, 0.78], euler(0, Math.PI / 4, Math.PI)),
    n('heart-brush', 'sphere', 'white', [-0.22, 1.5, -0.28], [0.18, 0.12, 0.06]),
    n('blue-crystal-l', 'gem', 'crystal', [-0.68, 0.95, 0.26], [0.34, 0.9, 0.34], euler(0, Math.PI / 4, -0.08)),
    n('blue-crystal-r', 'gem', 'crystal', [0.66, 0.92, 0.18], [0.3, 0.78, 0.3], euler(0, Math.PI / 4, 0.1)),
    n('lavender-crystal', 'gem', 'lavender', [0.12, 0.86, 0.72], [0.28, 0.68, 0.28], euler(0, Math.PI / 4, 0.08)),
    n('pillar-1', 'box', 'stone', [-0.94, 0.55, -0.94], [0.2, 0.62, 0.2]),
    n('pillar-2', 'box', 'stone', [0.94, 0.55, -0.94], [0.2, 0.62, 0.2]),
    n('pillar-3', 'box', 'stone', [-0.94, 0.55, 0.94], [0.2, 0.62, 0.2]),
    n('pillar-4', 'box', 'stone', [0.94, 0.55, 0.94], [0.2, 0.62, 0.2]),
  ];
}

const assetMaterials = {
  ink: colors.ink,
  white: colors.white,
  cream: colors.cream,
  fur: colors.fur,
  ear: colors.ear,
  blue: colors.blue,
  sky: colors.sky,
  metal: colors.metal,
  metalDark: colors.metalDark,
  gold: colors.gold,
  wood: colors.wood,
  woodLight: colors.woodLight,
  stone: colors.stone,
  stoneLight: colors.stoneLight,
  crystal: colors.crystal,
  heart: colors.heart,
  horn: colors.cream,
  blush: colors.blush,
  tint: [1, 1, 1, 0.32],
  lavender: [0.62, 0.42, 1, 0.92],
  shadow: [0.12, 0.1, 0.08, 0.26],
};

writeGlb('puppy_guard.glb', assetMaterials, puppy());
writeGlb('pup_tower.glb', assetMaterials, tower());
writeGlb('crystal_core.glb', assetMaterials, core());
writeGlb('blob_grunt.glb', { ...assetMaterials, grunt: colors.grunt, tint: [0.78, 1, 0.65, 0.42] }, blob('grunt', 'grunt'));
writeGlb('blob_runner.glb', { ...assetMaterials, runner: colors.runner, tint: [0.67, 0.94, 1, 0.42] }, blob('runner', 'runner'));
writeGlb('blob_brute.glb', { ...assetMaterials, brute: colors.brute, tint: [1, 0.62, 0.95, 0.42] }, blob('brute', 'brute'));
await extractKenneyAssets();

console.log(`Generated toon GLB assets in ${outDir}`);
console.log(`Extracted Kenney Tower Defense Kit GLB subset in ${kenneyOutDir}`);
