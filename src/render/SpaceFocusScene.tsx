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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    hostElement.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060611, 0.032);
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 180);
    camera.position.set(0, 2.0, 21.4);
    camera.lookAt(0, -0.25, 0);

    const hemi = new THREE.HemisphereLight(0xfff4d0, 0x141438, 2.35);
    scene.add(hemi);
    const sun = new THREE.PointLight(0xffe0a2, 135, 100, 1.45);
    sun.position.set(-8, 5.5, 12);
    scene.add(sun);
    const rim = new THREE.PointLight(0x8be9ff, 76, 88, 1.65);
    rim.position.set(8, -1.5, 9);
    scene.add(rim);

    const createGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d')!;
      const gradient = context.createRadialGradient(128, 128, 5, 128, 128, 126);
      gradient.addColorStop(0, 'rgba(255, 246, 202, 0.95)');
      gradient.addColorStop(0.18, 'rgba(247, 216, 137, 0.62)');
      gradient.addColorStop(0.48, 'rgba(125, 109, 255, 0.26)');
      gradient.addColorStop(1, 'rgba(125, 109, 255, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      return canvas;
    };
    const glowTexture = new THREE.CanvasTexture(createGlowTexture());

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

    const deepStars = makeStars(1800, 44, 34, 0.046, 16);
    const nearDust = makeStars(1100, 28, 10, 0.065, 9);

    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, -1.2, 0);
    scene.add(planetGroup);

    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffe2a6,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    glowSprite.scale.set(18, 18, 1);
    glowSprite.position.set(0, 0, -1.2);
    glowSprite.renderOrder = -2;
    planetGroup.add(glowSprite);

    const planetMaterial = new THREE.MeshStandardMaterial({
      color: makeColor(latest.current.currentPlanet.color),
      roughness: 0.64,
      metalness: 0.08,
      emissive: makeColor(latest.current.currentPlanet.color),
      emissiveIntensity: 0.2
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(5.05, 128, 64), planetMaterial);
    planet.scale.y = 0.94;
    planetGroup.add(planet);

    const bandMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i += 1) {
      const y = -3.3 + i * 0.74;
      const radius = Math.sqrt(Math.max(0.1, 5.05 * 5.05 - y * y));
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.018 + Math.random() * 0.024, 6, 160),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xd3ba82 : 0x927a53, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending })
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
    const ringBaseOpacities = [0.72, 0.38, 0.28, 0.48];
    const ringMaterials = [0xffefbf, 0xd9bf7b, 0xa9966d, 0xffdd8b].map((color, index) => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: ringBaseOpacities[index],
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    const ringSpecs: Array<[number, number, number]> = [[6.35, 0.18, 0], [7.1, 0.09, 1], [7.85, 0.26, 2], [8.9, 0.14, 3], [9.72, 0.07, 1]];
    ringSpecs.forEach(([radius, tube, mat], index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 260), ringMaterials[mat]);
      ring.rotation.z = index * 0.013;
      ringGroup.add(ring);
    });

    const focusHaloMaterial = new THREE.MeshBasicMaterial({ color: 0x97f7ff, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending });
    const focusHalo = new THREE.Mesh(new THREE.TorusGeometry(10.55, 0.046, 8, 320), focusHaloMaterial);
    focusHalo.rotation.x = Math.PI / 2;
    focusHalo.rotation.z = 0.62;
    planetGroup.add(focusHalo);

    const progressHaloMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0be, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending });
    const progressHalo = new THREE.Mesh(new THREE.TorusGeometry(11.0, 0.1, 8, 320), progressHaloMaterial);
    progressHalo.rotation.x = Math.PI / 2;
    progressHalo.rotation.z = -0.28;
    planetGroup.add(progressHalo);

    const orbitLine = new THREE.Mesh(
      new THREE.TorusGeometry(11.5, 0.018, 6, 260),
      new THREE.MeshBasicMaterial({ color: 0xfff1c6, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending })
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
        const scale = 0.28 + (index % 4) * 0.065;
        moon.scale.setScalar(scale);
        group.add(moon);
        group.userData = {
          angle: index * 2.12,
          radius: 8.4 + (index % 6) * 0.78,
          speed: 0.2 + (index % 5) * 0.045,
          y: 0.55 + (index % 4) * 0.38
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
      new THREE.MeshBasicMaterial({ color: 0xfff0ba, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    scene.add(birthPulse);

    const birthRing = new THREE.Mesh(
      new THREE.TorusGeometry(6.2, 0.11, 8, 260),
      new THREE.MeshBasicMaterial({ color: 0xfff0ba, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    birthRing.rotation.x = Math.PI / 2;
    planetGroup.add(birthRing);

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
      const visualEnergy = Math.min(1, data.progress + (data.isFocusing ? 0.16 : 0) + pulse * 0.34);
      planetMaterial.color.lerp(target, 0.035);
      planetMaterial.emissive.lerp(target, 0.035);
      planetMaterial.emissiveIntensity = 0.2 + visualEnergy * 0.56;
      const breathing = 1.02 + Math.sin(time * 1.4) * 0.016 + data.progress * 0.08 + pulse * 0.055;
      planetGroup.scale.setScalar(breathing);
      planetGroup.rotation.y = Math.sin(time * 0.09) * 0.16 + time * 0.025;
      planet.rotation.y = time * (0.055 + visualEnergy * 0.025);
      ringGroup.rotation.z = Math.sin(time * 0.18) * 0.025 + visualEnergy * 0.035;
      focusHalo.rotation.z = 0.62 + time * (data.isFocusing ? 0.42 : 0.08);
      progressHalo.rotation.z = -0.28 - time * (0.06 + data.progress * 0.18);
      orbitLine.rotation.z = 0.18 + time * (0.012 + visualEnergy * 0.018);
      bandMeshes.forEach((band, index) => { band.rotation.z = time * (0.01 + index * 0.002); });
      ringMaterials.forEach((material, index) => {
        material.opacity = Math.min(0.96, ringBaseOpacities[index] + visualEnergy * 0.16 + pulse * 0.16);
      });
      deepStars.rotation.y = time * 0.004;
      nearDust.rotation.z = Math.sin(time * 0.05) * 0.02;
      (nearDust.material as THREE.PointsMaterial).opacity = 0.7 + Math.sin(time * 0.8) * 0.08 + visualEnergy * 0.14;
      (glowSprite.material as THREE.SpriteMaterial).opacity = 0.42 + visualEnergy * 0.34 + pulse * 0.22;
      glowSprite.scale.setScalar(17.4 + visualEnergy * 2.7 + pulse * 3.8);
      focusHaloMaterial.opacity = 0.24 + (data.isFocusing ? 0.2 : 0) + data.progress * 0.16 + pulse * 0.18;
      progressHaloMaterial.opacity = 0.16 + data.progress * 0.42 + pulse * 0.28;
      sun.intensity = 112 + visualEnergy * 82 + pulse * 125;
      rim.intensity = 62 + visualEnergy * 54 + pulse * 52;

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

      birthPulse.scale.setScalar(1.4 + pulse * 17);
      (birthPulse.material as THREE.MeshBasicMaterial).opacity = pulse * 0.34;
      birthRing.scale.setScalar(1 + pulse * 1.9);
      (birthRing.material as THREE.MeshBasicMaterial).opacity = pulse * 0.72;

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
      glowTexture.dispose();
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
