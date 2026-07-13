import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  MAP_HALF,
  TERRAIN,
  TOWER_SHOT_DURATION,
  nextBuildSlot,
  nodeRegrowth,
  orderPreviews,
  playerUnitIdsInRect,
  towerShots,
  waveTelegraph
} from '../game/simulation';
import type { Building, GameState, OrderPreviewKind, ResourceNode, Unit } from '../game/types';
import { useGameStore } from '../store/gameStore';

interface EntityVisual {
  group: THREE.Group;
  body: THREE.Group;
  ring: THREE.Mesh;
  hpFill: THREE.Mesh | null;
  hpBar: THREE.Group | null;
  carry: CarryVisual | null;
  flash: THREE.Mesh | null;
  bolt: THREE.Mesh | null;
  rangeRing: THREE.Group | null;
  rallyFlag: THREE.Group | null;
}

interface CarryVisual {
  root: THREE.Group;
  goldBundle: THREE.Group;
  woodBundle: THREE.Group;
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
  bridgeLight: 0xe0bd79,
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
  ember: 0xff6f3d,
  flame: 0xffd166,
  charcoal: 0x342b28,
  gold: 0xf5c542,
  trunk: 0x8a6238,
  leaves: 0x3f8f4e,
  frontierGreen: 0x3f7e52,
  leather: 0x76502f,
  steel: 0xe8edf4,
  cream: 0xfff3d6,
  raiderDark: 0x23272e,
  ringPlayer: 0x53f28c,
  ringEnemy: 0xff8a5c,
  hpBack: 0x27303a,
  hpGood: 0x5ff08b,
  hpBad: 0xff6f61
} as const;

// Order lines reuse the smart-command marker color language: white move,
// gold economy (gather/deposit), red attack.
const ORDER_COLORS: Record<OrderPreviewKind, number> = {
  move: 0xffffff,
  gather: COLORS.gold,
  deposit: COLORS.gold,
  attack: COLORS.hpBad
};

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

  const snout = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    lambert(unit.kind === 'raider' ? 0xc6c8c9 : COLORS.cream)
  );
  snout.position.set(0, 0.9, 0.24);
  body.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lambert(COLORS.raiderDark));
  nose.position.set(0, 0.92, 0.33);
  body.add(nose);

  // Chunky paws and face points keep every unit reading as an animal at the
  // distant isometric camera scale, rather than as a colored game-piece dot.
  for (const x of [-0.18, 0.18]) {
    const paw = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lambert(color)));
    paw.scale.set(1, 0.65, 1.15);
    paw.position.set(x, 0.12, 0.07);
    body.add(paw);
  }

  if (unit.kind === 'soldier') {
    const helmet = shadowed(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        lambert(0x3559ad)
      )
    );
    helmet.position.y = 0.98;
    body.add(helmet);

    const plume = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 8), lambert(COLORS.gold)));
    plume.position.y = 1.35;
    body.add(plume);

    const shield = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 12), lambert(COLORS.frontierGreen))
    );
    shield.position.set(-0.38, 0.56, 0.12);
    shield.rotation.x = Math.PI / 2;
    body.add(shield);
    const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), lambert(COLORS.gold));
    shieldBoss.position.set(-0.38, 0.56, 0.2);
    body.add(shieldBoss);

    const blade = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.14), lambert(COLORS.steel)));
    blade.position.set(0.42, 0.62, 0);
    blade.rotation.z = -0.35;
    body.add(blade);
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.16), lambert(COLORS.gold));
    hilt.position.set(0.3, 0.3, 0);
    hilt.rotation.z = -0.35;
    body.add(hilt);
  } else if (unit.kind === 'worker') {
    const cap = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.1, 12), lambert(COLORS.frontierGreen))
    );
    cap.position.y = 1.17;
    body.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.2), lambert(COLORS.frontierGreen));
    brim.position.set(0, 1.16, 0.17);
    body.add(brim);

    const backpack = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.22), lambert(COLORS.leather)));
    backpack.position.set(0, 0.58, -0.31);
    body.add(backpack);
    const bedroll = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), lambert(0x5f9664))
    );
    bedroll.position.set(0, 0.87, -0.32);
    bedroll.rotation.z = Math.PI / 2;
    body.add(bedroll);

    const axeHandle = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.65, 8), lambert(COLORS.trunk))
    );
    axeHandle.position.set(0.4, 0.56, 0.02);
    axeHandle.rotation.z = -0.28;
    body.add(axeHandle);
    const axeHead = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.09), lambert(COLORS.steel)));
    axeHead.position.set(0.49, 0.86, 0.02);
    axeHead.rotation.z = -0.28;
    body.add(axeHead);
  } else {
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.18), lambert(COLORS.raiderDark));
    mask.position.set(0, 0.98, 0.18);
    body.add(mask);

    for (const x of [-0.11, 0.11]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lambert(COLORS.ringEnemy));
      eye.position.set(x, 1, 0.29);
      body.add(eye);
    }

    const tailParts: Array<[number, number, number, number, number]> = [
      [-0.28, 0.49, -0.2, 0.16, COLORS.raiderDark],
      [-0.4, 0.42, -0.26, 0.15, 0xa3a8ad],
      [-0.5, 0.34, -0.3, 0.135, COLORS.raiderDark],
      [-0.57, 0.26, -0.32, 0.11, 0xa3a8ad]
    ];
    for (const [x, y, z, size, tailColor] of tailParts) {
      const tailPart = shadowed(new THREE.Mesh(new THREE.SphereGeometry(size, 10, 8), lambert(tailColor)));
      tailPart.scale.set(1.2, 0.9, 1);
      tailPart.position.set(x, y, z);
      body.add(tailPart);
    }

    const clubHandle = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.62, 8), lambert(COLORS.trunk))
    );
    clubHandle.position.set(0.4, 0.52, 0.02);
    clubHandle.rotation.z = -0.3;
    body.add(clubHandle);
    const clubHead = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), lambert(0x4a3a31)));
    clubHead.position.set(0.5, 0.82, 0.02);
    body.add(clubHead);
  }
  return body;
}

function buildWorkerCarryVisual(): CarryVisual {
  const root = new THREE.Group();
  root.position.set(-0.08, 0.52, 0.46);
  root.visible = false;

  // A leather pouch with exposed nuggets makes a gold delivery read as
  // treasure instead of the generic recolored cube it replaces.
  const goldBundle = new THREE.Group();
  const pouch = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), lambert(COLORS.leather)));
  pouch.scale.set(1.15, 0.95, 0.82);
  pouch.position.y = -0.03;
  goldBundle.add(pouch);
  const pouchTie = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 10), lambert(COLORS.bridgeLight));
  pouchTie.rotation.x = Math.PI / 2;
  pouchTie.position.y = 0.16;
  goldBundle.add(pouchTie);
  for (const [x, y, z, size] of [
    [-0.13, 0.17, 0, 0.11],
    [0.12, 0.18, 0.02, 0.12],
    [0, 0.24, 0.06, 0.09]
  ] as Array<[number, number, number, number]>) {
    const nugget = shadowed(new THREE.Mesh(new THREE.OctahedronGeometry(size), lambert(COLORS.gold)));
    nugget.position.set(x, y, z);
    goldBundle.add(nugget);
  }
  root.add(goldBundle);

  // Three cross-stacked logs and pale rope bands keep wood readable by shape,
  // even when faction lighting makes its brown color similar to the backpack.
  const woodBundle = new THREE.Group();
  const logGeometry = new THREE.CylinderGeometry(0.075, 0.085, 0.62, 8);
  const logMaterial = lambert(COLORS.trunk);
  for (const [y, z] of [
    [-0.07, 0],
    [0.08, 0],
    [0.01, 0.14]
  ] as Array<[number, number]>) {
    const log = shadowed(new THREE.Mesh(logGeometry, logMaterial));
    log.rotation.z = Math.PI / 2;
    log.position.set(0, y, z);
    woodBundle.add(log);
  }
  const ropeGeometry = new THREE.BoxGeometry(0.055, 0.34, 0.27);
  const ropeMaterial = lambert(COLORS.bridgeLight);
  for (const x of [-0.19, 0.19]) {
    const rope = shadowed(new THREE.Mesh(ropeGeometry, ropeMaterial));
    rope.position.set(x, 0.01, 0.06);
    woodBundle.add(rope);
  }
  root.add(woodBundle);

  return { root, goldBundle, woodBundle };
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

    // Give the puppy headquarters a welcoming frontier identity to match the
    // richer raider camp. All props stay attached to the existing base visual
    // so simulation footprint, pathing, selection, and cleanup remain intact.
    const door = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.18, 0.12), lambert(COLORS.leather)));
    door.position.set(0, 0.62, 1.64);
    group.add(door);
    const doorFrameMaterial = lambert(COLORS.trunk);
    const doorPostGeometry = new THREE.BoxGeometry(0.12, 1.34, 0.12);
    for (const x of [-0.45, 0.45]) {
      const post = shadowed(new THREE.Mesh(doorPostGeometry, doorFrameMaterial));
      post.position.set(x, 0.67, 1.7);
      group.add(post);
    }
    const doorLintel = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.14, 0.12), doorFrameMaterial));
    doorLintel.position.set(0, 1.34, 1.7);
    group.add(doorLintel);
    const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), lambert(COLORS.gold));
    doorKnob.position.set(0.22, 0.66, 1.73);
    group.add(doorKnob);

    const porchMaterial = lambert(COLORS.bridgeLight);
    const porch = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.14, 0.72), porchMaterial));
    porch.position.set(0, 0.1, 1.93);
    group.add(porch);
    const step = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.1, 0.42), porchMaterial));
    step.position.set(0, 0.05, 2.48);
    group.add(step);

    // A chunky green paw sign is legible at the distant isometric scale and
    // makes the friendly faction clear without adding more HUD copy.
    const sign = shadowed(
      new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.48, 0.1), lambert(COLORS.frontierGreen))
    );
    sign.position.set(0, 1.58, 1.7);
    group.add(sign);
    const pawMaterial = lambert(COLORS.cream);
    const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), pawMaterial);
    pawPad.scale.set(1.2, 0.9, 0.28);
    pawPad.position.set(0, 1.53, 1.78);
    group.add(pawPad);
    for (const [x, y] of [
      [-0.18, 1.69],
      [0, 1.74],
      [0.18, 1.69]
    ] as Array<[number, number]>) {
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 9, 7), pawMaterial);
      toe.scale.z = 0.3;
      toe.position.set(x, y, 1.78);
      group.add(toe);
    }

    // Warm shuttered window and a tidy log stockpile make the outpost feel
    // inhabited while keeping the starting workers and build slots readable.
    const windowGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.58, 0.7),
      new THREE.MeshBasicMaterial({ color: COLORS.flame })
    );
    windowGlow.position.set(1.64, 0.94, 0.35);
    group.add(windowGlow);
    const shutterGeometry = new THREE.BoxGeometry(0.12, 0.68, 0.2);
    const shutterMaterial = lambert(COLORS.frontierGreen);
    for (const z of [-0.14, 0.84]) {
      const shutter = shadowed(new THREE.Mesh(shutterGeometry, shutterMaterial));
      shutter.position.set(1.72, 0.94, z);
      group.add(shutter);
    }

    const logGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.92, 8);
    const logMaterial = lambert(COLORS.trunk);
    for (const [x, y, z] of [
      [1.86, 0.14, -0.55],
      [2.08, 0.14, -0.52],
      [1.97, 0.37, -0.54]
    ] as Array<[number, number, number]>) {
      const log = shadowed(new THREE.Mesh(logGeometry, logMaterial));
      log.position.set(x, y, z);
      log.rotation.x = Math.PI / 2;
      group.add(log);
    }
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

    // Turn the first production building into a readable puppy training post
    // instead of a plain cabin. The entry, crest, and compact gear rack stay
    // inside the existing selection footprint and do not affect simulation.
    const door = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.1), lambert(COLORS.leather)));
    door.position.set(0, 0.51, 1.14);
    group.add(door);
    const frameMaterial = lambert(COLORS.bridgeLight);
    const framePostGeometry = new THREE.BoxGeometry(0.1, 1.12, 0.1);
    for (const x of [-0.42, 0.42]) {
      const post = shadowed(new THREE.Mesh(framePostGeometry, frameMaterial));
      post.position.set(x, 0.56, 1.2);
      group.add(post);
    }
    const lintel = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.12, 0.1), frameMaterial));
    lintel.position.set(0, 1.1, 1.2);
    group.add(lintel);
    const step = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.48), frameMaterial));
    step.position.set(0, 0.06, 1.38);
    group.add(step);

    // A frontier-green shield with crossed steel practice swords connects the
    // building to the soldiers' equipment without adding another HUD label.
    const crest = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.09, 10), lambert(COLORS.frontierGreen))
    );
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 1.5, 1.2);
    group.add(crest);
    for (const rotation of [-0.68, 0.68]) {
      const sword = new THREE.Group();
      const blade = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.48, 0.055), lambert(COLORS.steel)));
      blade.position.y = 0.08;
      sword.add(blade);
      const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.055, 0.07), lambert(COLORS.gold));
      hilt.position.y = -0.17;
      sword.add(hilt);
      sword.position.set(0, 1.5, 1.27);
      sword.rotation.z = rotation;
      group.add(sword);
    }

    // The side rack makes the train-soldier milestone visible in the world.
    // Its chunky shields and practice blades remain legible at RTS camera scale.
    const gearRack = new THREE.Group();
    const rackMaterial = lambert(COLORS.trunk);
    const rackPostGeometry = new THREE.CylinderGeometry(0.055, 0.07, 1, 7);
    for (const x of [-0.42, 0.42]) {
      const post = shadowed(new THREE.Mesh(rackPostGeometry, rackMaterial));
      post.position.set(x, 0.5, 0);
      gearRack.add(post);
    }
    const rackBeam = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1, 0.11, 0.11), rackMaterial));
    rackBeam.position.y = 0.88;
    gearRack.add(rackBeam);
    for (const x of [-0.24, 0.24]) {
      const shield = shadowed(
        new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 10), lambert(COLORS.frontierGreen))
      );
      shield.rotation.x = Math.PI / 2;
      shield.position.set(x, 0.58, 0.08);
      gearRack.add(shield);
      const boss = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), lambert(COLORS.gold));
      boss.position.set(x, 0.58, 0.14);
      gearRack.add(boss);
    }
    gearRack.position.set(1.7, 0, 0.18);
    gearRack.rotation.y = -0.12;
    group.add(gearRack);
    return { mesh: group, height: 3.2, ringRadius: 2.2 };
  }
  if (building.kind === 'tower') {
    const shaft = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.95, 2.6, 10), lambert(COLORS.tower)));
    shaft.position.y = 1.3;
    group.add(shaft);

    // Make the defense building read as a puppy frontier watchtower rather
    // than a generic stone cone. The timber bands and lookout balcony stay
    // within the existing footprint and leave range/shot behavior untouched.
    const timberMaterial = lambert(COLORS.trunk);
    for (const [y, radius] of [
      [0.58, 0.91],
      [1.38, 0.84],
      [2.18, 0.77]
    ] as Array<[number, number]>) {
      const band = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.14, 10), timberMaterial));
      band.position.y = y;
      group.add(band);
    }

    const balcony = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.16, 0.18, 10), lambert(COLORS.bridgeLight))
    );
    balcony.position.y = 2.58;
    group.add(balcony);
    const railPostGeometry = new THREE.CylinderGeometry(0.045, 0.055, 0.5, 6);
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2;
      const post = shadowed(new THREE.Mesh(railPostGeometry, timberMaterial));
      post.position.set(Math.cos(angle) * 1.03, 2.84, Math.sin(angle) * 1.03);
      group.add(post);
    }
    const balconyRail = shadowed(new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.055, 6, 10), timberMaterial));
    balconyRail.rotation.x = Math.PI / 2;
    balconyRail.position.y = 3.05;
    group.add(balconyRail);

    // A chunky green-and-gold paw shield ties the tower to the friendly
    // headquarters and stays readable from the default +x/+z camera angle.
    const shield = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.09, 10), lambert(COLORS.frontierGreen))
    );
    shield.rotation.x = Math.PI / 2;
    shield.position.set(0, 1.45, 0.86);
    group.add(shield);
    const pawMaterial = lambert(COLORS.gold);
    const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 9, 7), pawMaterial);
    pawPad.scale.set(1.15, 0.85, 0.3);
    pawPad.position.set(0, 1.4, 0.94);
    group.add(pawPad);
    for (const [x, y] of [
      [-0.14, 1.55],
      [0, 1.6],
      [0.14, 1.55]
    ] as Array<[number, number]>) {
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), pawMaterial);
      toe.scale.z = 0.3;
      toe.position.set(x, y, 0.95);
      group.add(toe);
    }

    const top = shadowed(new THREE.Mesh(new THREE.ConeGeometry(1, 0.9, 10), lambert(COLORS.frontierGreen)));
    top.position.y = 3.05;
    group.add(top);

    // The roof-mounted launcher gives the existing gold flash/bolt a visible
    // world-space origin without moving the simulation-driven tracer.
    const launcherPivot = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.15, 9, 7), lambert(COLORS.gold)));
    launcherPivot.position.y = 3.56;
    group.add(launcherPivot);
    const launcherBarrel = shadowed(
      new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.72, 8), lambert(COLORS.steel))
    );
    launcherBarrel.rotation.x = Math.PI / 2;
    launcherBarrel.position.set(0, 3.56, 0.34);
    group.add(launcherBarrel);
    const launcherTip = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 8), lambert(COLORS.gold)));
    launcherTip.rotation.x = Math.PI / 2;
    launcherTip.position.set(0, 3.56, 0.78);
    group.add(launcherTip);
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

  // The raccoon headquarters should read as a defended raider camp in the
  // opening frame, not as a lone purple tent. Chunky props stay inside the
  // existing camp footprint and move/dispose with the building.
  const campfire = new THREE.Group();
  const fireStoneGeometry = new THREE.DodecahedronGeometry(0.16);
  const fireStoneMaterial = lambert(0x777579);
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    const stone = shadowed(new THREE.Mesh(fireStoneGeometry, fireStoneMaterial));
    stone.position.set(Math.cos(angle) * 0.5, 0.12, Math.sin(angle) * 0.5);
    campfire.add(stone);
  }
  const fireLogGeometry = new THREE.CylinderGeometry(0.09, 0.11, 0.9, 8);
  const fireLogMaterial = lambert(COLORS.charcoal);
  const fireLogA = shadowed(new THREE.Mesh(fireLogGeometry, fireLogMaterial));
  fireLogA.position.y = 0.18;
  fireLogA.rotation.z = Math.PI / 2;
  fireLogA.rotation.y = Math.PI / 4;
  campfire.add(fireLogA);
  const fireLogB = shadowed(new THREE.Mesh(fireLogGeometry, fireLogMaterial));
  fireLogB.position.y = 0.18;
  fireLogB.rotation.z = Math.PI / 2;
  fireLogB.rotation.y = -Math.PI / 4;
  campfire.add(fireLogB);
  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.8, 7),
    new THREE.MeshBasicMaterial({ color: COLORS.ember })
  );
  outerFlame.position.y = 0.62;
  outerFlame.rotation.z = 0.08;
  campfire.add(outerFlame);
  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.58, 7),
    new THREE.MeshBasicMaterial({ color: COLORS.flame })
  );
  innerFlame.position.set(-0.06, 0.66, 0.04);
  innerFlame.rotation.z = -0.12;
  campfire.add(innerFlame);
  campfire.position.set(-2.35, 0, -0.7);
  group.add(campfire);

  const crateMaterial = lambert(COLORS.bridge);
  const crateBandMaterial = lambert(COLORS.trunk);
  const crateGeometry = new THREE.BoxGeometry(0.72, 0.64, 0.72);
  const crateBandGeometry = new THREE.BoxGeometry(0.1, 0.67, 0.75);
  for (const [x, z, scale, rotation] of [
    [2.15, -0.65, 1, -0.1],
    [2.7, -1.2, 0.78, 0.16]
  ] as Array<[number, number, number, number]>) {
    const crate = new THREE.Group();
    const box = shadowed(new THREE.Mesh(crateGeometry, crateMaterial));
    box.position.y = 0.32;
    crate.add(box);
    for (const bandX of [-0.2, 0.2]) {
      const band = shadowed(new THREE.Mesh(crateBandGeometry, crateBandMaterial));
      band.position.set(bandX, 0.32, 0);
      crate.add(band);
    }
    crate.position.set(x, 0, z);
    crate.rotation.y = rotation;
    crate.scale.setScalar(scale);
    group.add(crate);
  }
  for (const [x, z, size] of [
    [2.05, -0.55, 0.18],
    [2.35, -0.75, 0.13]
  ] as Array<[number, number, number]>) {
    const loot = shadowed(new THREE.Mesh(new THREE.OctahedronGeometry(size), lambert(COLORS.gold)));
    loot.position.set(x, 0.78, z);
    group.add(loot);
  }

  const barricadeWood = lambert(0x4a3a31);
  const stakeGeometry = new THREE.CylinderGeometry(0.1, 0.13, 0.78, 7);
  const stakeTipGeometry = new THREE.ConeGeometry(0.13, 0.28, 7);
  const barricadeRailGeometry = new THREE.BoxGeometry(1.75, 0.13, 0.13);
  for (const [x, z, rotation] of [
    [-1.35, -2.55, -0.18],
    [1.35, -2.55, 0.18]
  ] as Array<[number, number, number]>) {
    const barricade = new THREE.Group();
    for (const stakeX of [-0.65, 0, 0.65]) {
      const stake = shadowed(new THREE.Mesh(stakeGeometry, barricadeWood));
      stake.position.set(stakeX, 0.39, 0);
      barricade.add(stake);
      const tip = shadowed(new THREE.Mesh(stakeTipGeometry, barricadeWood));
      tip.position.set(stakeX, 0.92, 0);
      barricade.add(tip);
    }
    for (const [railY, railRotation] of [
      [0.35, 0.1],
      [0.65, -0.1]
    ] as Array<[number, number]>) {
      const rail = shadowed(new THREE.Mesh(barricadeRailGeometry, barricadeWood));
      rail.position.y = railY;
      rail.rotation.z = railRotation;
      barricade.add(rail);
    }
    barricade.position.set(x, 0, z);
    barricade.rotation.y = rotation;
    group.add(barricade);
  }
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

function buildFrontierBridge(): THREE.Group {
  const group = new THREE.Group();
  const span = TERRAIN.river.width + 1.2;
  const deckWidth = TERRAIN.bridge.length;
  const plankCount = 9;
  const plankStep = span / plankCount;
  const plankGeometry = new THREE.BoxGeometry(plankStep * 0.94, 0.08, deckWidth - 0.18);
  const plankMaterials = [lambert(COLORS.bridge), lambert(COLORS.bridgeLight)];

  // Crosswise boards and tiny height/color changes make the river crossing
  // read as a hand-built toy bridge instead of a flat terrain rectangle.
  for (let index = 0; index < plankCount; index += 1) {
    const plank = shadowed(new THREE.Mesh(plankGeometry, plankMaterials[index % plankMaterials.length]));
    plank.position.set(-span / 2 + plankStep * (index + 0.5), index % 3 === 1 ? 0.015 : 0, 0);
    plank.rotation.y = index % 2 === 0 ? -0.008 : 0.008;
    group.add(plank);
  }

  const railZ = deckWidth / 2 - 0.06;
  const beamGeometry = new THREE.BoxGeometry(span + 0.16, 0.16, 0.22);
  const railGeometry = new THREE.BoxGeometry(span - 0.18, 0.1, 0.1);
  const postGeometry = new THREE.CylinderGeometry(0.1, 0.13, 0.76, 8);
  const darkWood = lambert(COLORS.trunk);

  for (const side of [-1, 1]) {
    const beam = shadowed(new THREE.Mesh(beamGeometry, darkWood));
    beam.position.set(0, -0.08, side * (railZ - 0.16));
    group.add(beam);

    const rail = shadowed(new THREE.Mesh(railGeometry, darkWood));
    rail.position.set(0, 0.61, side * railZ);
    group.add(rail);

    for (const x of [-span / 2 + 0.18, 0, span / 2 - 0.18]) {
      const post = shadowed(new THREE.Mesh(postGeometry, darkWood));
      post.position.set(x, 0.32, side * railZ);
      group.add(post);
    }
  }

  return group;
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

    // Frame both frontier headquarters on load without zooming out the puppy
    // silhouettes that were tuned for the current isometric gameplay scale.
    const camTarget = new THREE.Vector3(1.25, 0, -0.25);
    const camOffset = new THREE.Vector3(17, 21, 17);
    const defaultViewSize = 15;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

    function applyCamera() {
      camera.position.copy(camTarget).add(camOffset);
      camera.lookAt(camTarget);
    }

    function resize() {
      const width = container!.clientWidth || window.innerWidth;
      const height = container!.clientHeight || window.innerHeight;
      const aspect = width / Math.max(1, height);
      // Preserve enough horizontal world span on squarer desktop/tablet
      // viewports to keep both camps in frame, with a conservative zoom cap.
      const viewSize = Math.min(18, Math.max(defaultViewSize, 22 / aspect));
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

    const bridge = buildFrontierBridge();
    bridge.position.set(TERRAIN.river.centerX, 0.055, TERRAIN.bridge.centerZ);
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

    // Raider telegraph: a pulsing enemy-orange ring plus a hovering spike on
    // the actual spawn ground during the wave warning window, so "incoming"
    // has a place on the battlefield, not just a countdown chip.
    const telegraphGroup = new THREE.Group();
    const telegraphRing = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 1.4, 40),
      new THREE.MeshBasicMaterial({ color: COLORS.ringEnemy, transparent: true, opacity: 0.9 })
    );
    telegraphRing.rotation.x = -Math.PI / 2;
    telegraphRing.position.y = 0.06;
    telegraphGroup.add(telegraphRing);
    const telegraphSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.8, 8),
      new THREE.MeshBasicMaterial({ color: COLORS.ringEnemy })
    );
    telegraphSpike.rotation.x = Math.PI;
    telegraphSpike.position.y = 1.5;
    telegraphGroup.add(telegraphSpike);
    telegraphGroup.visible = false;
    scene.add(telegraphGroup);

    // Build-slot preview: a low, transparent footprint showing exactly where
    // the next build button will place a structure. It is derived from the same
    // nextBuildSlot() function that placeBuilding() uses.
    const buildPreviewGroup = new THREE.Group();
    const buildPreviewFootprint = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.04, 2.8),
      new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, transparent: true, opacity: 0.18 })
    );
    buildPreviewFootprint.position.y = 0.04;
    buildPreviewGroup.add(buildPreviewFootprint);
    const buildPreviewRing = new THREE.Mesh(
      new THREE.RingGeometry(1.65, 1.9, 40),
      new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, transparent: true, opacity: 0.75 })
    );
    buildPreviewRing.rotation.x = -Math.PI / 2;
    buildPreviewRing.position.y = 0.08;
    buildPreviewGroup.add(buildPreviewRing);
    buildPreviewGroup.visible = false;
    scene.add(buildPreviewGroup);

    const unitVisuals = new Map<string, EntityVisual>();
    const buildingVisuals = new Map<string, EntityVisual>();
    const nodeVisuals = new Map<string, NodeVisual>();

    // Order lines: one line + target dot per selected player unit with an
    // active destination, so a selected army shows where it is going.
    interface OrderVisual {
      line: THREE.Line;
      dot: THREE.Mesh;
      positions: THREE.BufferAttribute;
    }
    const orderVisuals = new Map<string, OrderVisual>();

    function ensureOrderVisual(id: string): OrderVisual {
      let visual = orderVisuals.get(id);
      if (visual) return visual;
      const positions = new THREE.BufferAttribute(new Float32Array(6), 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', positions);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      );
      // Endpoints move every frame; skip per-frame bounding-sphere upkeep.
      line.frustumCulled = false;
      scene.add(line);
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.24, 20),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
      );
      dot.rotation.x = -Math.PI / 2;
      dot.position.y = 0.08;
      scene.add(dot);
      visual = { line, dot, positions };
      orderVisuals.set(id, visual);
      return visual;
    }

    function disposeOrderVisual(visual: OrderVisual) {
      scene.remove(visual.line);
      scene.remove(visual.dot);
      visual.line.geometry.dispose();
      (visual.line.material as THREE.Material).dispose();
      visual.dot.geometry.dispose();
      (visual.dot.material as THREE.Material).dispose();
    }

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
      const carry = unit.kind === 'worker' ? buildWorkerCarryVisual() : null;
      if (carry) group.add(carry.root);
      scene.add(group);
      visual = { group, body, ring, hpFill: fill, hpBar: bar, carry, flash: null, bolt: null, rangeRing: null, rallyFlag: null };
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
      // Shot tracer: a gold bolt that flies from the tower top to the raider
      // the simulation actually hit, so tower damage is readable at a glance.
      let bolt: THREE.Mesh | null = null;
      if (building.kind === 'tower' && building.faction === 'player') {
        bolt = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 6),
          new THREE.MeshBasicMaterial({ color: COLORS.gold })
        );
        bolt.visible = false;
        group.add(bolt);
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
      // Rally flag: marks where new soldiers muster, shown only while the
      // barracks is selected so the field stays uncluttered.
      let rallyFlag: THREE.Group | null = null;
      if (building.kind === 'barracks' && building.faction === 'player') {
        rallyFlag = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), lambert(0x777777));
        pole.position.y = 0.75;
        rallyFlag.add(pole);
        const cloth = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.45),
          new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, side: THREE.DoubleSide })
        );
        cloth.position.set(0.38, 1.28, 0);
        rallyFlag.add(cloth);
        const mark = new THREE.Mesh(
          new THREE.RingGeometry(0.5, 0.66, 32),
          new THREE.MeshBasicMaterial({ color: COLORS.ringPlayer, transparent: true, opacity: 0.6 })
        );
        mark.rotation.x = -Math.PI / 2;
        mark.position.y = 0.05;
        rallyFlag.add(mark);
        rallyFlag.visible = false;
        group.add(rallyFlag);
      }
      scene.add(group);
      visual = { group, body: mesh, ring, hpFill: fill, hpBar: bar, carry: null, flash, bolt, rangeRing, rallyFlag };
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

        if (visual.carry) {
          visual.carry.root.visible = unit.carry !== null;
          visual.carry.goldBundle.visible = unit.carry?.type === 'gold';
          visual.carry.woodBundle.visible = unit.carry?.type === 'wood';
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
      const shots = new Map(towerShots(sim).map((shot) => [shot.id, shot]));
      for (const building of sim.buildings) {
        liveBuildings.add(building.id);
        const visual = ensureBuildingVisual(building);
        visual.group.position.set(building.pos.x, 0, building.pos.z);
        visual.ring.visible = selected.has(building.id);
        if (visual.rangeRing) visual.rangeRing.visible = selected.has(building.id);
        if (visual.rallyFlag) {
          const rally = building.rallyPoint;
          visual.rallyFlag.visible = rally !== null && selected.has(building.id);
          if (rally) visual.rallyFlag.position.set(rally.x - building.pos.x, 0, rally.z - building.pos.z);
        }
        if (visual.flash) {
          const sinceShot = building.attackCooldown - building.cooldownLeft;
          visual.flash.visible = building.cooldownLeft > 0 && sinceShot < 0.18;
        }
        if (visual.bolt) {
          const shot = shots.get(building.id);
          if (shot) {
            // Bolt positions are relative to the tower group; lerp from the
            // tower top down to torso height at the recorded impact point.
            const t = Math.min(1, shot.age / TOWER_SHOT_DURATION);
            visual.bolt.visible = true;
            visual.bolt.position.set(
              (shot.to.x - building.pos.x) * t,
              3.4 + (0.6 - 3.4) * t,
              (shot.to.z - building.pos.z) * t
            );
            visual.bolt.scale.setScalar(1 - t * 0.45);
          } else {
            visual.bolt.visible = false;
          }
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

      const liveOrders = new Set<string>();
      for (const preview of orderPreviews(sim)) {
        liveOrders.add(preview.id);
        const visual = ensureOrderVisual(preview.id);
        visual.positions.setXYZ(0, preview.from.x, 0.09, preview.from.z);
        visual.positions.setXYZ(1, preview.to.x, 0.09, preview.to.z);
        visual.positions.needsUpdate = true;
        const color = ORDER_COLORS[preview.kind];
        (visual.line.material as THREE.LineBasicMaterial).color.setHex(color);
        (visual.dot.material as THREE.MeshBasicMaterial).color.setHex(color);
        visual.dot.position.set(preview.to.x, 0.08, preview.to.z);
      }
      for (const [id, visual] of orderVisuals) {
        if (!liveOrders.has(id)) {
          disposeOrderVisual(visual);
          orderVisuals.delete(id);
        }
      }

      const telegraph = waveTelegraph(sim);
      telegraphGroup.visible = telegraph.active && telegraph.pos !== null;
      if (telegraph.active && telegraph.pos) {
        telegraphGroup.position.set(telegraph.pos.x, 0, telegraph.pos.z);
        const phase = (sim.time % 0.9) / 0.9;
        telegraphRing.scale.setScalar(1 + phase * 0.9);
        (telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - phase * 0.75);
        telegraphSpike.position.y = 1.5 + Math.sin(sim.time * 6) * 0.12;
      }

      const buildSlot = nextBuildSlot(sim);
      buildPreviewGroup.visible = sim.status === 'playing' && buildSlot !== null;
      if (buildSlot) {
        buildPreviewGroup.position.set(buildSlot.x, 0, buildSlot.z);
        const phase = (sim.time % 1.2) / 1.2;
        buildPreviewRing.scale.setScalar(1 + phase * 0.25);
        (buildPreviewRing.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - phase * 0.35);
      }

      const liveNodes = new Set<string>();
      const regrowth = new Map(nodeRegrowth(sim).map((entry) => [entry.id, entry]));
      for (const node of sim.resources) {
        const regrow = regrowth.get(node.id);
        if (node.amountLeft <= 0 && !regrow) continue;
        liveNodes.add(node.id);
        const visual = ensureNodeVisual(node);
        // A regrowing tree reads as a sapling scaling back up, then pops to
        // full size when it becomes gatherable again; live nodes shrink with
        // their remaining amount so depletion stays readable at a glance.
        const scale = regrow ? 0.15 + 0.65 * regrow.progress : Math.max(0.35, node.amountLeft / node.maxAmount);
        visual.scalable.scale.setScalar(scale);
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
        const ralliedHere = sim.buildings.some(
          (building) =>
            selected.has(building.id) &&
            building.faction === 'player' &&
            building.kind === 'barracks' &&
            building.rallyPoint !== null &&
            Math.hypot(building.rallyPoint.x - target.x, building.rallyPoint.z - target.z) < 1e-6
        );
        if ((commanded.length === 0 && !ralliedHere) || sim.status !== 'playing') return;
        const markerColor = commanded.some((unit) => unit.order.type === 'gather')
          ? COLORS.gold
          : commanded.some((unit) => unit.order.type === 'attack')
            ? COLORS.hpBad
            : commanded.length === 0
              ? COLORS.ringPlayer
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
      for (const visual of orderVisuals.values()) disposeOrderVisual(visual);
      disposeGroup(telegraphGroup);
      disposeGroup(buildPreviewGroup);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="scene-root" aria-label="Puppy Frontier battlefield" />;
}
