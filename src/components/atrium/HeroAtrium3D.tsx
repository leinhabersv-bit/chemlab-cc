"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function HeroAtrium3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    } catch {
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // ── Three-Point Studio Lighting ──
    const ambientLight = new THREE.AmbientLight(0x0a101d, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 4.0);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 5.0);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x22c55e, 2.0, 15);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // ── Central Hero: Coordination Complex [Ca-EDTA]^2- ──
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // 1. Central Metal Cation (Ca2+)
    const metalGeo = new THREE.SphereGeometry(0.85, 48, 48);
    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const metalSphere = new THREE.Mesh(metalGeo, metalMat);
    heroGroup.add(metalSphere);

    // 2. Hexadentate Ligand Rings (EDTA Chelate Cage)
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.8,
      wireframe: false,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.045, 16, 64), ringMat);
    ring1.rotation.x = Math.PI / 3;
    heroGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.045, 16, 64), ringMat);
    ring2.rotation.y = Math.PI / 2.5;
    heroGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.045, 16, 64), ringMat);
    ring3.rotation.z = Math.PI / 4;
    heroGroup.add(ring3);

    // 3. Coordinate Donor Atoms (4 Oxygen, 2 Nitrogen)
    const donorPositions = [
      new THREE.Vector3(1.4, 0.5, 0),
      new THREE.Vector3(-1.4, -0.5, 0),
      new THREE.Vector3(0, 1.4, 0.6),
      new THREE.Vector3(0, -1.4, -0.6),
      new THREE.Vector3(0.5, 0, 1.5),
      new THREE.Vector3(-0.5, 0, -1.5),
    ];

    const donorGroup = new THREE.Group();
    donorPositions.forEach((pos, idx) => {
      const isNitrogen = idx >= 4;
      const donorGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const donorMat = new THREE.MeshStandardMaterial({
        color: isNitrogen ? 0x3b82f6 : 0xef4444, // Blue for N, Red for O
        metalness: 0.4,
        roughness: 0.3,
        emissive: isNitrogen ? 0x1d4ed8 : 0xb91c1c,
        emissiveIntensity: 0.35,
      });
      const donor = new THREE.Mesh(donorGeo, donorMat);
      donor.position.copy(pos);
      donorGroup.add(donor);

      // Coordination bond rod
      const bondGeo = new THREE.CylinderGeometry(0.025, 0.025, pos.length(), 12);
      const bondMat = new THREE.MeshBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.65,
      });
      const bond = new THREE.Mesh(bondGeo, bondMat);
      bond.position.copy(pos.clone().multiplyScalar(0.5));
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      donorGroup.add(bond);
    });
    heroGroup.add(donorGroup);

    // 4. Hydration Shell Solvation Particle Cloud
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      // Gradient between sky-blue and emerald
      const isSky = Math.random() > 0.4;
      particleColors[i * 3] = isSky ? 0.22 : 0.13;
      particleColors[i * 3 + 1] = isSky ? 0.74 : 0.77;
      particleColors[i * 3 + 2] = isSky ? 0.97 : 0.37;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Sizing & Resize ──
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Interaction: Inertia Drag & Pointer Parallax ──
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0.003;
    let velY = 0.0015;
    let pointerParallaxX = 0;
    let pointerParallaxY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      setHasInteracted(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerParallaxX = nx * 0.4;
      pointerParallaxY = ny * 0.3;

      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      velX = deltaX * 0.005;
      velY = deltaY * 0.005;
      heroGroup.rotation.y += velX;
      heroGroup.rotation.x += velY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ── Render Loop with Damped Easing ──
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Inertia decay
      if (!isDragging) {
        velX *= 0.96;
        velY *= 0.96;
        // Idle continuous drift
        heroGroup.rotation.y += velX + 0.0025;
        heroGroup.rotation.x += velY + 0.001;
      }

      // Parallax smooth interpolation
      camera.position.x += (pointerParallaxX - camera.position.x) * 0.05;
      camera.position.y += (pointerParallaxY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Resonant breathing pulsation
      const breath = 1 + Math.sin(time * 1.8) * 0.035;
      metalSphere.scale.set(breath, breath, breath);

      // Slow particle field counter-rotation
      particles.rotation.y -= 0.0008;
      particles.rotation.z += 0.0004;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      renderer.dispose();
      metalGeo.dispose();
      metalMat.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] md:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl border border-bench-800/80 bg-radial-gradient shadow-2xl"
      style={{
        background:
          "radial-gradient(circle at center 45%, #131926 0%, #090b10 100%)",
      }}
      aria-label="Interactive 3D model of [Ca-EDTA]^2- Chelate Complex"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />

      {/* Scientific Overlay Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-bench-950/80 border border-bench-700/60 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-instrument-sky animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
            [Ca-EDTA]²⁻ Chelate Model
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 pl-1">
          Hexadentate N₂O₄ Chelation Cage • log Kf = 10.70
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
        <span
          className={`font-mono text-[10px] text-slate-400 transition-opacity duration-500 ${
            hasInteracted ? "opacity-30" : "opacity-90"
          }`}
        >
          Drag to inspect coordination cage ⟳
        </span>
      </div>

      {/* Fallback if WebGL fails */}
      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-bench-950">
          <p className="text-slate-400 font-mono text-xs">
            WebGL acceleration unavailable. Experience running in high-contrast static mode.
          </p>
        </div>
      )}
    </div>
  );
}

