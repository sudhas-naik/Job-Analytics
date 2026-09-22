"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

const PARTICLE_COUNT = 96;
const LINK_DISTANCE = 2.35;

const AURORA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AURORA_FRAGMENT = `
  uniform float uTime;
  uniform float uDark;
  uniform vec2 uPointer;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 pointer = uPointer * 0.08;
    float wave =
      sin((uv.x + pointer.x) * 4.2 + uTime * 0.28) * 0.5 +
      cos((uv.y - pointer.y) * 3.4 - uTime * 0.18) * 0.5;

    vec3 indigo = vec3(0.31, 0.27, 0.90);
    vec3 sky = vec3(0.05, 0.65, 0.90);
    vec3 rose = vec3(0.96, 0.25, 0.45);

    vec3 color = mix(indigo, sky, clamp(uv.x + wave * 0.12, 0.0, 1.0));
    color = mix(color, rose, smoothstep(0.25, 1.0, uv.y + wave * 0.1));

    float vignette = smoothstep(1.05, 0.18, length(uv - 0.5));
    float alpha = mix(0.16, 0.42, uDark) * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

const POINT_VERTEX = `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vPointColor;

  void main() {
    vPointColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (280.0 / max(1.2, -mvPosition.z));
  }
`;

const POINT_FRAGMENT = `
  varying vec3 vPointColor;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered);
    if (dist > 0.5) discard;
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    gl_FragColor = vec4(vPointColor, glow * glow);
  }
`;

export default function ThreeBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const dark = pathname?.startsWith("/Auth") ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return;
    }

    const dispose = mountScene(host, dark);
    document.documentElement.dataset.threeBg = "on";

    return () => {
      dispose();
      delete document.documentElement.dataset.threeBg;
    };
  }, [dark]);

  return (
    <div
      ref={hostRef}
      className="three-bg pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}

function mountScene(host: HTMLElement, dark: boolean) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
  renderer.setClearColor(dark ? 0x070b18 : 0x000000, dark ? 1 : 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    (host.clientWidth || window.innerWidth) / (host.clientHeight || window.innerHeight),
    0.1,
    40
  );
  camera.position.z = 8.4;

  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();

  const aurora = createAurora(dark);
  scene.add(aurora);

  const { points, lines, bases, speeds, phases, sizes } = createNetwork(dark);
  scene.add(points);
  scene.add(lines);

  const solids = createSolids(dark);
  solids.forEach((mesh) => scene.add(mesh));

  const timer = new THREE.Timer();
  timer.connect(document);
  let frame = 0;
  let running = true;

  const onPointerMove = (event: PointerEvent) => {
    pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  const onResize = () => {
    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    (points.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value =
      Math.min(window.devicePixelRatio, 1.75);
  };

  const onVisibility = () => {
    running = document.visibilityState === "visible";
    if (running) {
      frame = window.requestAnimationFrame(render);
    }
  };

  function render(timestamp: number) {
    if (!running) {
      return;
    }

    timer.update(timestamp);
    const elapsed = timer.getElapsed();
    pointer.lerp(pointerTarget, 0.045);

    const auroraMaterial = aurora.material as THREE.ShaderMaterial;
    auroraMaterial.uniforms.uTime.value = elapsed;
    auroraMaterial.uniforms.uPointer.value.copy(pointer);

    const positions = points.geometry.getAttribute("position") as THREE.BufferAttribute;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3;
      const drift = 0.32 + sizes[i] * 0.08;
      positions.setXYZ(
        i,
        bases[i3] + Math.sin(elapsed * speeds[i] + phases[i]) * drift + pointer.x * 0.18,
        bases[i3 + 1] + Math.cos(elapsed * speeds[i] * 0.85 + phases[i]) * drift + pointer.y * 0.12,
        bases[i3 + 2] + Math.sin(elapsed * speeds[i] * 0.55 + phases[i] * 1.4) * 0.22
      );
    }
    positions.needsUpdate = true;

    solids.forEach((mesh, index) => {
      mesh.rotation.x = elapsed * (0.08 + index * 0.03);
      mesh.rotation.y = elapsed * (0.12 + index * 0.02);
      mesh.position.x = mesh.userData.baseX + Math.sin(elapsed * 0.35 + index) * 0.18;
      mesh.position.y = mesh.userData.baseY + Math.cos(elapsed * 0.28 + index) * 0.14;
    });

    camera.position.x = pointer.x * 0.7;
    camera.position.y = pointer.y * 0.32;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  frame = window.requestAnimationFrame(render);

  return () => {
    running = false;
    window.cancelAnimationFrame(frame);
    timer.dispose();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material.dispose();
        }
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}

function createAurora(dark: boolean) {
  const geometry = new THREE.PlaneGeometry(18, 12, 1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDark: { value: dark ? 1 : 0 },
      uPointer: { value: new THREE.Vector2() },
    },
    vertexShader: AURORA_VERTEX,
    fragmentShader: AURORA_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -6;
  return mesh;
}

function createNetwork(dark: boolean) {
  const bases = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizeAttr = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = dark
    ? [new THREE.Color("#a5b4fc"), new THREE.Color("#7dd3fc"), new THREE.Color("#fda4af")]
    : [new THREE.Color("#6366f1"), new THREE.Color("#0ea5e9"), new THREE.Color("#f43f5e")];

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const i3 = i * 3;
    bases[i3] = (Math.random() - 0.5) * 10.5;
    bases[i3 + 1] = (Math.random() - 0.5) * 6.8;
    bases[i3 + 2] = (Math.random() - 0.5) * 4.2;
    const color = palette[i % palette.length].clone().lerp(new THREE.Color("#ffffff"), dark ? 0.18 : 0.08);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    sizes[i] = 4 + Math.random() * 7;
    sizeAttr[i] = sizes[i];
    speeds[i] = 0.18 + Math.random() * 0.35;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const livePositions = new THREE.BufferAttribute(bases.slice(), 3);
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", livePositions);
  pointGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  pointGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizeAttr, 1));

  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
    },
    vertexShader: POINT_VERTEX,
    fragmentShader: POINT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  const points = new THREE.Points(pointGeometry, pointMaterial);

  const links: number[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    for (let j = i + 1; j < PARTICLE_COUNT; j += 1) {
      const dx = bases[i * 3] - bases[j * 3];
      const dy = bases[i * 3 + 1] - bases[j * 3 + 1];
      const dz = bases[i * 3 + 2] - bases[j * 3 + 2];
      if (Math.hypot(dx, dy, dz) < LINK_DISTANCE) {
        links.push(i, j);
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setIndex(links);
  lineGeometry.setAttribute("position", livePositions);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: dark ? 0xa5b4fc : 0x818cf8,
    transparent: true,
    opacity: dark ? 0.22 : 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);

  return { points, lines: lineSegments, bases, speeds, phases, sizes };
}

function createSolids(dark: boolean) {
  const configs = [
    { geometry: new THREE.IcosahedronGeometry(1.7, 1), x: -3.4, y: 1.5, z: -2.2, color: 0x818cf8 },
    { geometry: new THREE.OctahedronGeometry(0.9, 0), x: 3.6, y: -1.1, z: -1.4, color: 0x38bdf8 },
    { geometry: new THREE.TorusGeometry(1.35, 0.018, 12, 80), x: 1.8, y: 1.8, z: -2.8, color: 0xfb7185 },
  ];

  return configs.map((config) => {
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      wireframe: true,
      transparent: true,
      opacity: dark ? 0.28 : 0.16,
    });
    const mesh = new THREE.Mesh(config.geometry, material);
    mesh.position.set(config.x, config.y, config.z);
    mesh.userData.baseX = config.x;
    mesh.userData.baseY = config.y;
    return mesh;
  });
}
