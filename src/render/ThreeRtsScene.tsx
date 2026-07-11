import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MAP_HALF, TERRAIN, playerUnitIdsInRect } from '../game/simulation';
import type { Building, GameState, ResourceNode, Unit } from '../game/types';
import { useGameStore } from '../store/gameStore';

interface EntityVisual {
  group: THREE.Group;
  body: THREE.Group;
  ring: THREE.Mesh;
  hpFill: THREE.Mesh | null;
  hpBar: THREE.Group | null;
  carryCube: THREE.Mesh | null;
  flash: THREE.Mesh | null;
  rangeRing: THREE.Group | null;
}

interface NodeVisual {
  group: THREE.Group;
  scalable: THREE.Group;
}

const COLORS = {
  sky: 0x9ec9ec,
  grass: 0x7cb85f,
  river: 0x4f9fd8,
  bridge: 0xc9a36a,
  dirt: 0xb08d57,
  worker: 0xf2c368,
  soldier: 0x6e8ef5,
  raider: 0x5f6672,
  playerBuilding: 0xf4e9d0,
  roof: 0xd9634f,
  barracks: 0x9a7248,
  tower: 0xb9bdc4,
  camp: 0x5a4470,
  campRoof: 0x8a5fae,
  gold: 0xf5c542,
  trunk: 0x8a6238,
  leaves: 0x3f8f4e,
  ringPlayer: 0x53f28c,
  ringEnemy: 0xff8a5c,
  hpBack: 0x27303a,
  hpGood: 0x5ff08b,
  hpBad: 0xff6f61
} as const;

function lambert(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color });
}

function shadowed(mesh: THREE.Mesh): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeRing(radius: number, color: number): THREE.Mesh {
  const geometry = new THREE.RingGeometry(radius * 0.82, radius, 40);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }));
  mesh.position.y = 0.06;
  mesh.visible = false;
  return mesh;
}

function makeHpBar(width: number, height: number): { bar: THREE.Group; fill: THREE.Mesh } {
  const bar = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.14),
    new THREE.MeshBasicMaterial({ color: COLORS.hpBack, transparent: true, opacity: 0.85 })
  );
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.1), new THREE.MeshBasicMaterial({ color: COLORS.hpGood }));
  fill.position.z = 0.002;
  bar.add(back);
  bar.add(fill);
  bar.position.y = height;
  return { bar, fill };
}

function buildUnitMesh(unit: Unit): THREE.Group {
  const body = new THREE.Group();
  const color = unit.kind === 'worker' ? COLORS.worker : unit.kind === 'soldier' ? COLORS.soldier : COLORS.raider;

  const torso = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.62, 12), lambert(color)));
  torso.position.y = 0.42;
  body.add(torso);

  const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), lambert(color)));
  head.position.y = 0.95;
  body.add(head);

  const earGeometry = new THREE.ConeGeometry(0.09, 0.22, 8);
  const earMaterial = lambert(unit.kind === 'raider' ? 0x3d434c : 0xd9a24b);
  const earLeft = new THREE.Mesh(earGeometry, earMaterial);
  earLeft.position.set(-0.16, 1.18, 0);
  body.add(earLeft);
  const earRight = new THREE.Mesh(earGeometry, earMaterial);
  earRight.position.set(0.16, 1.18, 0);
  body.add(earRight);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), lambert(unit.kind === 'raider' ? 0x2c3138 : 0xffffff));
  snout.position.set(0, 0.9, 0.24);
  body.add(snout);

  if (unit.kind === 'soldier') {
    const blade = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.14), lambert(0xe8edf4)));
    blade.position.set(0.42, 0.62, 0);
    blade.rotation.z = -0.35;
    body.add(blade);
  }
  if (unit.kind === 'raider') {
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.2), lambert(0x23272e));
    mask.position.set(0, 0.98, 0.18);
    body.add(mask);
  }
  return body;
}

function buildBuildingMesh(building: Building): { mesh: THREE.Group; height: number; ringRadius: number } {
  const group = new THREE.Group();
  if (building.kind === 'base') {
    const walls = shadowed(new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.7, 3.2), lambert(COLORS.playerBuilding)));
    walls.position.y = 0.85;
    group.add(walls);
    const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 4), lambert(COLORS.roof)));
    roof.position.y = 2.4;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), lambert(0x777777));
    pole.position.set(0, 3.7, 0);
    group.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, side: THREE.DoubleSide }));
    flag.position.set(0.45, 4.05, 0);
    group.add(flag);
    return { mesh: group, height: 4.6, ringRadius: 2.6 };
  }
  if (building.kind === 'barracks') {
    const walls = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.4, 2.2), lambert(COLORS.barracks)));
    walls.position.y = 0.7;
    group.add(walls);
    const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(2, 1.1, 4), lambert(0x6f4f2f)));
    roof.position.y = 1.95;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
    return { mesh: group, height: 3.2, ringRadius: 2.2 };
  }
  if (building.kind === 'tower') {
    const shaft = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.95, 2.6, 10), lambert(COLORS.tower)));
    shaft.position.y = 1.3;
    group.add(shaft);
    const top = shadowed(new THREE.Mesh(new THREE.ConeGeometry(1, 0.9, 10), lambert(COLORS.roof)));
    top.position.y = 3.05;
    group.add(top);
    return { mesh: group, height: 4, ringRadius: 1.5 };
  }
  const tent = shadowed(new THREE.Mesh(new THREE.ConeGeometry(2.3, 2.6, 6), lambert(COLORS.camp)));
  tent.position.y = 1.3;
  group.add(tent);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 6), lambert(COLORS.campRoof));
  tip.position.y = 2.9;
  group.add(tip);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshBasicMaterial({ color: COLORS.ringEnemy, side: THREE.DoubleSide }));
  banner.position.set(0.4, 3.4, 0);
  group.add(banner);
  return { mesh: group, height: 4, ringRadius: 2.6 };
}

function buildNodeMesh(node: ResourceNode): NodeVisual {
  const group = new THREE.Group();
  const scalable = new THREE.Group();
  group.add(scalable);
  if (node.type === 'gold') {
    const offsets: Array<[number, number, number, number]> = [
      [0, 0.45, 0, 0.55],
      [-0.5, 0.3, 0.35, 0.36],
      [0.45, 0.28, -0.3, 0.32]
    ];
    for (const [x, y, z, size] of offsets) {
      const crystal = shadowed(new THREE.Mesh(new THREE.OctahedronGeometry(size), lambert(COLORS.gold)));
      crystal.position.set(x, y, z);
      scalable.add(crystal);
    }
    const rock = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.6), lambert(0x8f8f94)));
    rock.position.set(0.1, 0.2, 0.5);
    group.add(rock);
  } else {
    const trunk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.8, 8), lambert(COLORS.trunk)));
    trunk.position.y = 0.4;
    scalable.add(trunk);
    const lower = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.1, 8), lambert(COLORS.leaves)));
    lower.position.y = 1.15;
    scalable.add(lower);
    const upper = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 8), lambert(0x4da35e)));
    upper.position.y = 1.85;
    scalable.add(upper);
  }
  return { group, scalable };
}

export function ThreeRtsScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('data-game-canvas', 'rts-three');
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.sky);

    const camTarget = new THREE.Vector3(-6, 0, 4);
    const camOffset = new THREE.Vector3(17, 21, 17);
    const viewSize = 15;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

    function applyCamera() {
      camera.position.copy(camTarget).add(camOffset);
      camera.lookAt(camTarget);
    }

    function resize() {
      const width = container!.clientWidth || window.innerWidth;
      const height = container!.clientHeight || window.innerHeight;
      const aspect = width / Math.max(1, height);
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    resize();
    applyCamera();

    const hemi = new THREE.HemisphereLight(0xd8ecff, 0x6f9b57, 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.35);
    sun.position.set(20, 32, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -32;
    sun.shadow.camera.right = 32;
    sun.shadow.camera.top = 32;
    sun.shadow.camera.bottom = -32;
    sun.shadow.camera.far = 90;
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(MAP_HALF * 2, MAP_HALF * 2), lambert(COLORS.grass));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const river = new THREE.Mesh(new THREE.PlaneGeometry(TERRAIN.river.width, MAP_HALF * 2), lambert(COLORS.river));
    river.rotation.x = -Math.PI / 2;
    river.position.set(TERRAIN.river.centerX, 0.02, 0);
    scene.add(river);

    const bridge = new THREE.Mesh(new THREE.PlaneGeometry(TERRAIN.river.width + 1.2, TERRAIN.bridge.length), lambert(COLORS.bridge));
    bridge.rotation.x = -Math.PI / 2;
    bridge.position.set(TERRAIN.river.centerX, 0.035, TERRAIN.bridge.centerZ);
    scene.add(bridge);

    for (const [x, z, radius] of [
      [-13.5, 11.5, 4.4],
      [16, -12, 4.2]
    ] as Array<[number, number, number]>) {
      const patch = new THREE.Mesh(new THREE.CircleGeometry(radius, 28), lambert(COLORS.dirt));
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(x, 0.012, z);
      patch.receiveShadow = true;
      scene.add(patch);
    }

    const decor: Array<[number, number, number]> = [
      [9, 9, 0.5],
      [-2, -8, 0.7],
      [12, 2, 0.45],
      [-16, -6, 0.6],
      [4.5, -16, 0.5],
      [-8, 0, 0.4]
    ];
    for (const [x, z, size] of decor) {
      const rock = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(size), lambert(0x9aa0a6)));
      rock.position.set(x, size * 0.45, z);
      scene.add(rock);
    }

    const commandMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    );
    commandMarker.rotation.x = -Math.PI / 2;
    commandMarker.position.y = 0.07;
    scene.add(commandMarker);
    let markerAge = Infinity;

    const unitVisuals = new Map<string, EntityVisual>();
    const buildingVisuals = new Map<string, EntityVisual>();
    const nodeVisuals = new Map<string, NodeVisual>();

    function ensureUnitVisual(unit: Unit): EntityVisual {
      let visual = unitVisuals.get(unit.id);
      if (visual) return visual;
      const group = new THREE.Group();
      group.userData.entityId = unit.id;
      const body = buildUnitMesh(unit);
      group.add(body);
      const ring = makeRing(0.72, unit.faction === 'player' ? COLORS.ringPlayer : COLORS.ringEnemy);
      group.add(ring);
      const { bar, fill } = makeHpBar(0.9, 1.55);
      group.add(bar);
      const carryCube = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), lambert(COLORS.gold));
      carryCube.position.set(0, 0.55, 0.42);
      carryCube.visible = false;
      group.add(carryCube);
      scene.add(group);
      visual = { group, body, ring, hpFill: fill, hpBar: bar, carryCube, flash: null, rangeRing: null };
      unitVisuals.set(unit.id, visual);
      return visual;
    }

    function ensureBuildingVisual(building: Building): EntityVisual {
      let visual = buildingVisuals.get(building.id);
      if (visual) return visual;
      const group = new THREE.Group();
      group.userData.entityId = building.id;
      const { mesh, height, ringRadius } = buildBuildingMesh(building);
      group.add(mesh);
      const ring = makeRing(ringRadius, building.faction === 'player' ? COLORS.ringPlayer : COLORS.ringEnemy);
      group.add(ring);
      const { bar, fill } = makeHpBar(2.2, height);
      group.add(bar);
      let flash: THREE.Mesh | null = null;
      let rangeRing: THREE.Group | null = null;
      if (building.kind === 'tower') {
        flash = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 10, 8),
          new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.95 })
        );
        flash.position.y = 3.65;
        flash.visible = false;
        group.add(flash);
      }
      // Tower range preview: a flat ring + faint disc at the real attackRange,
      // shown only while the tower is selected.
      if (building.kind === 'tower' && building.faction === 'player') {
        rangeRing = new THREE.Group();
        const edge = new THREE.Mesh(
          new THREE.RingGeometry(building.attackRange - 0.22, building.attackRange, 64),
          new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, transparent: true, opacity: 0.55 })
        );
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = 0.05;
        rangeRing.add(edge);
        const area = new THREE.Mesh(
          new THREE.CircleGeometry(building.attackRange, 64),
          new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, transparent: true, opacity: 0.08 })
        );
        area.rotation.x = -Math.PI / 2;
        area.position.y = 0.045;
        rangeRing.add(area);
        rangeRing.visible = false;
        group.add(rangeRing);
      }
      scene.add(group);
      visual = { group, body: mesh, ring, hpFill: fill, hpBar: bar, carryCube: null, flash, rangeRing };
      buildingVisuals.set(building.id, visual);
      return visual;
    }

    function ensureNodeVisual(node: ResourceNode): NodeVisual {
      let visual = nodeVisuals.get(node.id);
      if (visual) return visual;
      visual = buildNodeMesh(node);
      visual.group.userData.entityId = node.id;
      visual.group.position.set(node.pos.x, 0, node.pos.z);
      scene.add(visual.group);
      nodeVisuals.set(node.id, visual);
      return visual;
    }

    function disposeGroup(group: THREE.Group) {
      scene.remove(group);
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
    }

    function syncScene(sim: GameState) {
      const selected = new Set(sim.selectedIds);

      const liveUnits = new Set<string>();
      for (const unit of sim.units) {
        liveUnits.add(unit.id);
        const visual = ensureUnitVisual(unit);
        visual.group.position.set(unit.pos.x, 0, unit.pos.z);
        visual.ring.visible = selected.has(unit.id);

        // Gather feedback: workers bob while actively mining/chopping (gatherProgress only advances in range).
        if (unit.order.type === 'gather' && unit.gatherProgress > 0) {
          visual.body.position.y = Math.abs(Math.sin(unit.gatherProgress * Math.PI * 3)) * 0.16;
        } else {
          visual.body.position.y = 0;
        }

        // Attack feedback: cooldownLeft resets to attackCooldown only when a hit lands, so a
        // freshly-reset cooldown means "struck just now" — pulse the body briefly.
        const sinceStrike = unit.attackCooldown - unit.cooldownLeft;
        if (unit.cooldownLeft > 0 && sinceStrike < 0.22) {
          visual.body.scale.setScalar(1 + 0.22 * (1 - sinceStrike / 0.22));
        } else {
          visual.body.scale.setScalar(1);
        }

        if (visual.carryCube) {
          visual.carryCube.visible = unit.kind === 'worker' && unit.carry !== null;
          if (unit.carry) {
            (visual.carryCube.material as THREE.MeshLambertMaterial).color.setHex(
              unit.carry.type === 'gold' ? COLORS.gold : COLORS.trunk
            );
          }
        }
        if (visual.hpFill && visual.hpBar) {
          const ratio = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
          visual.hpFill.scale.x = Math.max(0.001, ratio);
          visual.hpFill.position.x = -(1 - ratio) * 0.45;
          (visual.hpFill.material as THREE.MeshBasicMaterial).color.setHex(ratio > 0.45 ? COLORS.hpGood : COLORS.hpBad);
          visual.hpBar.visible = ratio < 1 || selected.has(unit.id);
          visual.hpBar.quaternion.copy(camera.quaternion);
        }
      }
      for (const [id, visual] of unitVisuals) {
        if (!liveUnits.has(id)) {
          disposeGroup(visual.group);
          unitVisuals.delete(id);
        }
      }

      const liveBuildings = new Set<string>();
      for (const building of sim.buildings) {
        liveBuildings.add(building.id);
        const visual = ensureBuildingVisual(building);
        visual.group.position.set(building.pos.x, 0, building.pos.z);
        visual.ring.visible = selected.has(building.id);
        if (visual.rangeRing) visual.rangeRing.visible = selected.has(building.id);
        if (visual.flash) {
          const sinceShot = building.attackCooldown - building.cooldownLeft;
          visual.flash.visible = building.cooldownLeft > 0 && sinceShot < 0.18;
        }
        if (visual.hpFill && visual.hpBar) {
          const ratio = Math.max(0, Math.min(1, building.hp / building.maxHp));
          visual.hpFill.scale.x = Math.max(0.001, ratio);
          visual.hpFill.position.x = -(1 - ratio) * 1.1;
          (visual.hpFill.material as THREE.MeshBasicMaterial).color.setHex(ratio > 0.45 ? COLORS.hpGood : COLORS.hpBad);
          visual.hpBar.visible = ratio < 1 || selected.has(building.id);
          visual.hpBar.quaternion.copy(camera.quaternion);
        }
      }
      for (const [id, visual] of buildingVisuals) {
        if (!liveBuildings.has(id)) {
          disposeGroup(visual.group);
          buildingVisuals.delete(id);
        }
      }

      const liveNodes = new Set<string>();
      for (const node of sim.resources) {
        if (node.amountLeft <= 0) continue;
        liveNodes.add(node.id);
        const visual = ensureNodeVisual(node);
        const ratio = Math.max(0.35, node.amountLeft / node.maxAmount);
        visual.scalable.scale.setScalar(ratio);
      }
      for (const [id, visual] of nodeVisuals) {
        if (!liveNodes.has(id)) {
          disposeGroup(visual.group);
          nodeVisuals.delete(id);
        }
      }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const selectBox = document.createElement('div');
    selectBox.className = 'drag-select-box';
    container.appendChild(selectBox);

    const DRAG_THRESHOLD_PX = 6;
    let dragAnchor: { screenX: number; screenY: number; ground: THREE.Vector3 | null; entityId: string | null } | null = null;
    let dragging = false;
    let dragGroundEnd: THREE.Vector3 | null = null;

    function groundPointAt(clientX: number, clientY: number): THREE.Vector3 | null {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(ground, false);
      return hits.length > 0 ? hits[0].point.clone() : null;
    }

    function pick(event: PointerEvent | MouseEvent): { entityId: string | null; point: THREE.Vector3 | null } {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const pickables: THREE.Object3D[] = [];
      for (const visual of unitVisuals.values()) pickables.push(visual.group);
      for (const visual of buildingVisuals.values()) pickables.push(visual.group);
      for (const visual of nodeVisuals.values()) pickables.push(visual.group);

      const hits = raycaster.intersectObjects(pickables, true);
      for (const hit of hits) {
        let current: THREE.Object3D | null = hit.object;
        while (current) {
          const entityId = current.userData?.entityId as string | undefined;
          if (entityId) return { entityId, point: hit.point };
          current = current.parent;
        }
      }
      const groundHits = raycaster.intersectObject(ground, false);
      if (groundHits.length > 0) return { entityId: null, point: groundHits[0].point };
      return { entityId: null, point: null };
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button === 0) {
        // Selection is applied on release so a drag past the threshold becomes
        // a box select instead of a single-entity click.
        const { entityId } = pick(event);
        dragAnchor = {
          screenX: event.clientX,
          screenY: event.clientY,
          ground: groundPointAt(event.clientX, event.clientY),
          entityId
        };
        dragging = false;
        dragGroundEnd = null;
        return;
      }
      if (event.button === 2) {
        const { entityId, point } = pick(event);
        if (!point && !entityId) return;
        const target = point ?? new THREE.Vector3();
        useGameStore.getState().smart({ point: { x: target.x, z: target.z }, entityId });

        // Marker reflects the order the simulation actually applied to the selection.
        const sim = useGameStore.getState().sim;
        const selected = new Set(sim.selectedIds);
        const commanded = sim.units.filter((unit) => unit.faction === 'player' && selected.has(unit.id));
        if (commanded.length === 0 || sim.status !== 'playing') return;
        const markerColor = commanded.some((unit) => unit.order.type === 'gather')
          ? COLORS.gold
          : commanded.some((unit) => unit.order.type === 'attack')
            ? COLORS.hpBad
            : 0xffffff;
        (commandMarker.material as THREE.MeshBasicMaterial).color.setHex(markerColor);
        commandMarker.position.set(target.x, 0.07, target.z);
        markerAge = 0;
      }
    }

    function onContextMenu(event: MouseEvent) {
      event.preventDefault();
    }

    function onWindowPointerMove(event: PointerEvent) {
      if (!dragAnchor) return;
      if (!dragging) {
        if (Math.hypot(event.clientX - dragAnchor.screenX, event.clientY - dragAnchor.screenY) < DRAG_THRESHOLD_PX) return;
        dragging = true;
        selectBox.style.display = 'block';
      }
      const rect = renderer.domElement.getBoundingClientRect();
      selectBox.style.left = `${Math.min(event.clientX, dragAnchor.screenX) - rect.left}px`;
      selectBox.style.top = `${Math.min(event.clientY, dragAnchor.screenY) - rect.top}px`;
      selectBox.style.width = `${Math.abs(event.clientX - dragAnchor.screenX)}px`;
      selectBox.style.height = `${Math.abs(event.clientY - dragAnchor.screenY)}px`;
      dragGroundEnd = groundPointAt(event.clientX, event.clientY) ?? dragGroundEnd;
    }

    function onWindowPointerUp(event: PointerEvent) {
      if (event.button !== 0 || !dragAnchor) return;
      const anchor = dragAnchor;
      const wasDragging = dragging;
      dragAnchor = null;
      dragging = false;
      selectBox.style.display = 'none';
      if (wasDragging) {
        const end = groundPointAt(event.clientX, event.clientY) ?? dragGroundEnd;
        if (anchor.ground && end) {
          const sim = useGameStore.getState().sim;
          const ids = playerUnitIdsInRect(sim, { x: anchor.ground.x, z: anchor.ground.z }, { x: end.x, z: end.z });
          useGameStore.getState().select(ids);
        }
        return;
      }
      useGameStore.getState().select(anchor.entityId ? [anchor.entityId] : []);
    }

    const keys = new Set<string>();
    function onKeyDown(event: KeyboardEvent) {
      keys.add(event.key.toLowerCase());
    }
    function onKeyUp(event: KeyboardEvent) {
      keys.delete(event.key.toLowerCase());
    }

    function updatePan(dt: number) {
      const speed = 16 * dt;
      const right = new THREE.Vector3(1, 0, -1).normalize();
      const forward = new THREE.Vector3(-1, 0, -1).normalize();
      if (keys.has('w') || keys.has('arrowup')) camTarget.addScaledVector(forward, speed);
      if (keys.has('s') || keys.has('arrowdown')) camTarget.addScaledVector(forward, -speed);
      if (keys.has('d') || keys.has('arrowright')) camTarget.addScaledVector(right, speed);
      if (keys.has('a') || keys.has('arrowleft')) camTarget.addScaledVector(right, -speed);
      const limit = MAP_HALF - 2;
      camTarget.x = Math.max(-limit, Math.min(limit, camTarget.x));
      camTarget.z = Math.max(-limit, Math.min(limit, camTarget.z));
      applyCamera();
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', resize);

    let lastFrameAt = performance.now();
    let raf = 0;
    function loop(now: number) {
      const dt = Math.min(0.1, Math.max(0, (now - lastFrameAt) / 1000));
      lastFrameAt = now;
      useGameStore.getState().tick(dt);
      updatePan(dt);

      markerAge += dt;
      if (markerAge < 0.6) {
        const t = markerAge / 0.6;
        commandMarker.scale.setScalar(1 + t * 1.6);
        (commandMarker.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t);
      } else {
        (commandMarker.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      syncScene(useGameStore.getState().sim);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      selectBox.remove();
      for (const visual of unitVisuals.values()) disposeGroup(visual.group);
      for (const visual of buildingVisuals.values()) disposeGroup(visual.group);
      for (const visual of nodeVisuals.values()) disposeGroup(visual.group);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="scene-root" aria-label="Puppy Frontier battlefield" />;
}
