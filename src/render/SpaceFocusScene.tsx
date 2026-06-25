import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { FocusPlanet } from '../focus/progression';

type SceneProps = {
  progress: number;
  isFocusing: boolean;
  births: number;
  currentPlanet: FocusPlanet;
  galaxyCount: number;
};

type LatestState = SceneProps;

const makeColor = (value: string) => new THREE.Color(value);

export function SpaceFocusScene(props: SceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const latest = useRef<LatestState>(props);

  useEffect(() => {
    latest.current = props;
  }, [props]);

  useEffect(() => {
    const hostElement = hostRef.current!;
    if (!hostElement) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    hostElement.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060611, 0.047);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180);
    camera.position.set(0, 3.4, 24);

    const hemi = new THREE.HemisphereLight(0xfff4d0, 0x11112b, 1.8);
    scene.add(hemi);
    const sun = new THREE.PointLight(0xffe0a2, 90, 90, 1.55);
    sun.position.set(-9, 4, 13);
    scene.add(sun);
    const rim = new THREE.PointLight(0x7d6dff, 44, 80, 1.8);
    rim.position.set(8, -2, 8);
    scene.add(rim);

    function makeStars(count: number, radius: number, spreadY: number, size: number, zOffset: number) {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const color = new THREE.Color();
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.62) * radius;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
        positions[i * 3 + 2] = Math.sin(angle) * r - zOffset - Math.random() * 28;
        color.setHSL(0.12 + Math.random() * 0.48, 0.28 + Math.random() * 0.4, 0.58 + Math.random() * 0.38);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size, transparent: true, opacity: 0.82, vertexColors: true, depthWrite: false });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      return points;
    }

    const deepStars = makeStars(1800, 44, 34, 0.042, 16);
    const nearDust = makeStars(1100, 28, 10, 0.055, 9);

    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, 0.4, 0);
    scene.add(planetGroup);

    const planetMaterial = new THREE.MeshStandardMaterial({
      color: makeColor(latest.current.currentPlanet.color),
      roughness: 0.78,
      metalness: 0.05,
      emissive: makeColor(latest.current.currentPlanet.color),
      emissiveIntensity: 0.1
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(4.7, 96, 48), planetMaterial);
    planet.scale.y = 0.94;
    planetGroup.add(planet);

    const bandMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i += 1) {
      const y = -3.2 + i * 0.72;
      const radius = Math.sqrt(Math.max(0.1, 4.72 * 4.72 - y * y));
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.018 + Math.random() * 0.024, 6, 160),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xa48e67 : 0x6f5e44, transparent: true, opacity: 0.24 })
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      planetGroup.add(band);
      bandMeshes.push(band);
    }

    const ringGroup = new THREE.Group();
    ringGroup.rotation.x = Math.PI * 0.5;
    ringGroup.rotation.y = Math.PI * 0.045;
    planetGroup.add(ringGroup);
    const ringMaterials = [0xffefbf, 0xd9bf7b, 0x8b7b55, 0xffdd8b].map((color, index) => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: [0.5, 0.25, 0.18, 0.34][index],
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    const ringSpecs: Array<[number, number, number]> = [[6.1, 0.18, 0], [6.9, 0.08, 1], [7.55, 0.28, 2], [8.65, 0.13, 3], [9.4, 0.06, 1]];
    ringSpecs.forEach(([radius, tube, mat], index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 260), ringMaterials[mat]);
      ring.rotation.z = index * 0.013;
      ringGroup.add(ring);
    });

    const orbitLine = new THREE.Mesh(
      new THREE.TorusGeometry(11.5, 0.014, 6, 260),
      new THREE.MeshBasicMaterial({ color: 0xfff1c6, transparent: true, opacity: 0.22, depthWrite: false })
    );
    orbitLine.rotation.x = Math.PI / 2;
    orbitLine.rotation.z = 0.18;
    planetGroup.add(orbitLine);

    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xffd889, roughness: 0.58, emissive: 0xffd889, emissiveIntensity: 0.08 });
    const moonGeometry = new THREE.SphereGeometry(1, 32, 18);
    const moonGroups: THREE.Group[] = [];
    function ensureMoons(count: number) {
      while (moonGroups.length < count) {
        const index = moonGroups.length;
        const group = new THREE.Group();
        const mat = moonMaterial.clone();
        const hue = (0.12 + index * 0.17) % 1;
        mat.color.setHSL(hue, 0.7, 0.72);
        mat.emissive.copy(mat.color).multiplyScalar(0.42);
        const moon = new THREE.Mesh(moonGeometry, mat);
        const scale = 0.14 + (index % 4) * 0.04;
        moon.scale.setScalar(scale);
        group.add(moon);
        group.userData = {
          angle: index * 2.12,
          radius: 7.8 + (index % 6) * 0.72,
          speed: 0.16 + (index % 5) * 0.035,
          y: 0.8 + (index % 4) * 0.32
        };
        scene.add(group);
        moonGroups.push(group);
      }
    }
    ensureMoons(latest.current.galaxyCount);

    const cometGeometry = new THREE.ConeGeometry(0.08, 0.55, 12);
    const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0ba, transparent: true, opacity: 0.84 });
    const comets = Array.from({ length: 9 }, () => {
      const comet = new THREE.Mesh(cometGeometry, cometMaterial.clone());
      comet.rotation.z = Math.PI / 2;
      comet.userData = { x: -12 + Math.random() * 24, y: 2 + Math.random() * 15, z: -10 - Math.random() * 18, speed: 0.03 + Math.random() * 0.05, phase: Math.random() * 10 };
      scene.add(comet);
      return comet;
    });

    const birthPulse = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 18),
      new THREE.MeshBasicMaterial({ color: 0xfff0ba, transparent: true, opacity: 0.0, depthWrite: false })
    );
    scene.add(birthPulse);

    let previousBirths = latest.current.births;
    let pulse = 0;
    let frame = 0;
    let raf = 0;

    function resize() {
      const rect = hostElement.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hostElement);
    resize();

    const clock = new THREE.Clock();
    function animate() {
      const dt = Math.min(clock.getDelta(), 0.033);
      const time = clock.elapsedTime;
      const data = latest.current;
      frame += 1;

      if (data.births !== previousBirths) {
        previousBirths = data.births;
        pulse = 1;
        ensureMoons(data.galaxyCount);
      }
      pulse = Math.max(0, pulse - dt * 0.8);

      const target = makeColor(data.currentPlanet.color);
      planetMaterial.color.lerp(target, 0.035);
      planetMaterial.emissive.lerp(target, 0.035);
      planetMaterial.emissiveIntensity = 0.08 + data.progress * 0.28 + (data.isFocusing ? 0.05 : 0);
      const breathing = 1 + Math.sin(time * 1.4) * 0.012 + data.progress * 0.06;
      planetGroup.scale.setScalar(breathing);
      planetGroup.rotation.y = Math.sin(time * 0.09) * 0.16 + time * 0.025;
      planet.rotation.y = time * 0.055;
      ringGroup.rotation.z = Math.sin(time * 0.18) * 0.025;
      orbitLine.rotation.z = 0.18 + time * 0.008;
      bandMeshes.forEach((band, index) => { band.rotation.z = time * (0.01 + index * 0.002); });
      deepStars.rotation.y = time * 0.004;
      nearDust.rotation.z = Math.sin(time * 0.05) * 0.02;
      (nearDust.material as THREE.PointsMaterial).opacity = 0.62 + Math.sin(time * 0.8) * 0.08 + data.progress * 0.08;
      sun.intensity = 86 + data.progress * 36 + pulse * 90;
      rim.intensity = 42 + (data.isFocusing ? 12 : 0) + pulse * 30;

      moonGroups.forEach((moon, index) => {
        const user = moon.userData as { angle: number; radius: number; speed: number; y: number };
        user.angle += dt * user.speed;
        const depth = Math.sin(user.angle) * 2.8 + 2;
        moon.position.set(Math.cos(user.angle) * user.radius, user.y + Math.sin(user.angle * 1.7) * 0.8, depth);
        moon.visible = index < data.galaxyCount;
        moon.rotation.y += dt * 0.7;
      });

      comets.forEach((comet) => {
        const user = comet.userData as { x: number; y: number; z: number; speed: number; phase: number };
        user.x += user.speed * 10;
        user.y -= user.speed * 2.6;
        if (user.x > 14) {
          user.x = -14;
          user.y = 4 + Math.random() * 13;
        }
        comet.position.set(user.x, user.y, user.z);
        (comet.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.abs(Math.sin(time * 0.7 + user.phase)) * 0.55;
      });

      birthPulse.scale.setScalar(1 + pulse * 14);
      (birthPulse.material as THREE.MeshBasicMaterial).opacity = pulse * 0.22;

      renderer.render(scene, camera);
      window.__orbitBloomScene = {
        ready: true,
        frame,
        progress: Number(data.progress.toFixed(3)),
        focusing: data.isFocusing,
        births: data.births,
        moons: data.galaxyCount,
        planet: data.currentPlanet.name
      };
      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      hostElement.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if ('geometry' in object && object.geometry) (object.geometry as THREE.BufferGeometry).dispose();
        if ('material' in object && object.material) {
          const material = object.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return <div ref={hostRef} className="space-scene" aria-hidden="true" />;
}

declare global {
  interface Window {
    __orbitBloomScene?: {
      ready: boolean;
      frame: number;
      progress: number;
      focusing: boolean;
      births: number;
      moons: number;
      planet: string;
    };
  }
}
