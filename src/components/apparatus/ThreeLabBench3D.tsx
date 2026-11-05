"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { observe, reading, volume, type EdtaState } from "@/lib/simulation/edta";

interface ThreeLabBench3DProps {
  s: EdtaState;
  onValveChange?: (val: number) => void;
  onAddDrop?: () => void;
}

export const ThreeLabBench3D: React.FC<ThreeLabBench3DProps> = ({
  s,
  onValveChange,
  onAddDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraView, setCameraView] = useState<"full" | "meniscus" | "flask">("full");
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // References for animation loop
  const animFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic mesh references
  const stirBarRef = useRef<THREE.Mesh | null>(null);
  const buretteLiquidRef = useRef<THREE.Mesh | null>(null);
  const flaskLiquidRef = useRef<THREE.Mesh | null>(null);
  const stopcockValveRef = useRef<THREE.Group | null>(null);
  const dropParticlesRef = useRef<THREE.InstancedMesh | null>(null);
  const meniscusLineRef = useRef<THREE.Mesh | null>(null);

  const obs = observe(s);
  const buretteVol = volume(s.vessels.burette);
  const flaskVol = volume(s.vessels.flask);
  const curReading = reading(s);

  // Camera targets for smooth transitions
  const targetCamPos = useRef(new THREE.Vector3(0, 1.2, 3.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.4, 0));

  const setView = (view: "full" | "meniscus" | "flask") => {
    setCameraView(view);
    if (view === "full") {
      targetCamPos.current.set(0, 1.2, 3.2);
      targetLookAt.current.set(0, 0.4, 0);
    } else if (view === "meniscus") {
      // Zoom into burette meniscus area
      const meniscusY = 0.5 + (1 - curReading / 50) * 1.4;
      targetCamPos.current.set(0, meniscusY + 0.1, 1.1);
      targetLookAt.current.set(0, meniscusY, 0);
    } else if (view === "flask") {
      // Zoom into flask & stirrer
      targetCamPos.current.set(0, 0.25, 1.2);
      targetLookAt.current.set(0, 0.1, 0);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.FogExp2(0x0c0e14, 0.18);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdce5ef, 0.65);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xffffff, 1.4);
    mainSpot.position.set(2, 4, 3);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    mainSpot.shadow.bias = -0.0005;
    scene.add(mainSpot);

    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 0.7);
    cyanRim.position.set(-3, 2, -2);
    scene.add(cyanRim);

    const amberFill = new THREE.PointLight(0xf59e0b, 0.5, 6);
    amberFill.position.set(1.5, 0.5, 1);
    scene.add(amberFill);

    // 5. Materials
    const darkBenchMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.35,
      metalness: 0.4,
    });

    const ironStandMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.7,
      metalness: 0.8,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      roughness: 0.12,
      metalness: 0.95,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      ior: 1.52,
      thickness: 0.4,
      specularIntensity: 1.0,
    });

    const stirPlateMat = new THREE.MeshStandardMaterial({
      color: 0x2a303e,
      roughness: 0.25,
      metalness: 0.8,
    });

    const whiteCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6fa,
      roughness: 0.2,
      metalness: 0.1,
    });

    // 6. Workbench Table Surface
    const tableGeo = new THREE.BoxGeometry(4, 0.1, 2.5);
    const tableMesh = new THREE.Mesh(tableGeo, darkBenchMat);
    tableMesh.position.set(0, -0.05, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Subtle grid lines on table
    const grid = new THREE.GridHelper(3.6, 24, 0x2d3443, 0x1a202c);
    grid.position.set(0, 0.001, 0);
    scene.add(grid);

    // 7. Retort Stand (Base + Rod + Clamp)
    const standGroup = new THREE.Group();
    standGroup.position.set(0.18, 0, -0.15);

    // Cast iron heavy base
    const baseGeo = new THREE.BoxGeometry(0.5, 0.035, 0.35);
    const baseMesh = new THREE.Mesh(baseGeo, ironStandMat);
    baseMesh.position.set(0, 0.0175, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    standGroup.add(baseMesh);

    // Chrome upright rod
    const rodGeo = new THREE.CylinderGeometry(0.014, 0.014, 2.2, 32);
    const rodMesh = new THREE.Mesh(rodGeo, chromeMat);
    rodMesh.position.set(0.16, 1.1, -0.08);
    rodMesh.castShadow = true;
    standGroup.add(rodMesh);

    // Burette clamp boss-head
    const clampBossGeo = new THREE.BoxGeometry(0.05, 0.06, 0.05);
    const clampBoss = new THREE.Mesh(clampBossGeo, ironStandMat);
    clampBoss.position.set(0.16, 1.25, -0.08);
    standGroup.add(clampBoss);

    // Clamp arms holding burette
    const clampArmGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.24, 16);
    const clampArm = new THREE.Mesh(clampArmGeo, chromeMat);
    clampArm.rotation.z = Math.PI / 2;
    clampArm.position.set(0.04, 1.25, -0.08);
    standGroup.add(clampArm);

    scene.add(standGroup);

    // 8. Magnetic Stirrer Base
    const stirrerGroup = new THREE.Group();
    stirrerGroup.position.set(0, 0, 0);

    const stirrerHousingGeo = new THREE.BoxGeometry(0.44, 0.1, 0.44);
    const stirrerHousing = new THREE.Mesh(stirrerHousingGeo, stirPlateMat);
    stirrerHousing.position.set(0, 0.05, 0);
    stirrerHousing.castShadow = true;
    stirrerHousing.receiveShadow = true;
    stirrerGroup.add(stirrerHousing);

    // Ceramic top plate
    const topPlateGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.012, 48);
    const topPlate = new THREE.Mesh(topPlateGeo, whiteCeramicMat);
    topPlate.position.set(0, 0.106, 0);
    topPlate.receiveShadow = true;
    stirrerGroup.add(topPlate);

    // Digital LED display front
    const ledScreenGeo = new THREE.PlaneGeometry(0.14, 0.035);
    const ledScreenMat = new THREE.MeshBasicMaterial({ color: 0x0a1f0a });
    const ledScreen = new THREE.Mesh(ledScreenGeo, ledScreenMat);
    ledScreen.position.set(0, 0.06, 0.221);
    stirrerGroup.add(ledScreen);

    // Stirrer control knob
    const knobGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.02, 24);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x11141a, roughness: 0.3 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.13, 0.05, 0.221);
    stirrerGroup.add(knob);

    scene.add(stirrerGroup);

    // 9. Conical Flask (Erlenmeyer 250 mL)
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0, 0.112, 0);

    // Conical flask outer glass
    // Points along cross-section of Erlenmeyer flask
    const flaskPoints: THREE.Vector2[] = [];
    flaskPoints.push(new THREE.Vector2(0, 0));
    flaskPoints.push(new THREE.Vector2(0.13, 0));
    flaskPoints.push(new THREE.Vector2(0.13, 0.012));
    flaskPoints.push(new THREE.Vector2(0.032, 0.22));
    flaskPoints.push(new THREE.Vector2(0.032, 0.28));
    flaskPoints.push(new THREE.Vector2(0.038, 0.285));
    flaskPoints.push(new THREE.Vector2(0.038, 0.29));
    flaskPoints.push(new THREE.Vector2(0.030, 0.29));
    flaskPoints.push(new THREE.Vector2(0.030, 0.22));
    flaskPoints.push(new THREE.Vector2(0.122, 0.014));
    flaskPoints.push(new THREE.Vector2(0, 0.008));

    const flaskGlassGeo = new THREE.LatheGeometry(flaskPoints, 48);
    const flaskGlassMesh = new THREE.Mesh(flaskGlassGeo, glassMat);
    flaskGlassMesh.castShadow = true;
    flaskGroup.add(flaskGlassMesh);

    // Liquid in flask (Inner truncated cone)
    const liquidGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.08, 48);
    const initialHex = parseInt(obs.colourHex.replace("#", "0x"), 16) || 0x38bdf8;
    const flaskLiquidMat = new THREE.MeshStandardMaterial({
      color: initialHex,
      transparent: true,
      opacity: 0.88,
      roughness: 0.15,
      metalness: 0.1,
    });
    const flaskLiquidMesh = new THREE.Mesh(liquidGeo, flaskLiquidMat);
    flaskLiquidMesh.position.set(0, 0.045, 0);
    flaskLiquidMesh.scale.set(1, 0.01, 1);
    flaskLiquidRef.current = flaskLiquidMesh;
    flaskGroup.add(flaskLiquidMesh);

    // Stir bar (white PTFE cylindrical capsule)
    const stirBarGeo = new THREE.CapsuleGeometry(0.007, 0.028, 8, 16);
    const stirBarMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
    });
    const stirBarMesh = new THREE.Mesh(stirBarGeo, stirBarMat);
    stirBarMesh.rotation.z = Math.PI / 2;
    stirBarMesh.position.set(0, 0.012, 0);
    stirBarRef.current = stirBarMesh;
    flaskGroup.add(stirBarMesh);

    scene.add(flaskGroup);

    // 10. Graduated 50 mL Glass Burette & Stopcock
    const buretteGroup = new THREE.Group();
    buretteGroup.position.set(0, 0.44, 0);

    // Burette glass cylinder
    const buretteGlassGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.45, 32, 1, true);
    const buretteGlassMesh = new THREE.Mesh(buretteGlassGeo, glassMat);
    buretteGlassMesh.position.set(0, 0.725, 0);
    buretteGroup.add(buretteGlassMesh);

    // Graduation ring markings along burette
    const gradGroup = new THREE.Group();
    for (let i = 0; i <= 10; i++) {
      const y = 0.08 + (i / 10) * 1.3;
      const ringGeo = new THREE.RingGeometry(0.0241, 0.0245, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xdce7f2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, y, 0);
      gradGroup.add(ringMesh);
    }
    buretteGroup.add(gradGroup);

    // Tapered glass tip
    const tipGeo = new THREE.ConeGeometry(0.018, 0.09, 24, 1, true);
    const tipMesh = new THREE.Mesh(tipGeo, glassMat);
    tipMesh.rotation.x = Math.PI;
    tipMesh.position.set(0, -0.045, 0);
    buretteGroup.add(tipMesh);

    // Stopcock Valve Assembly (Rotates around Y when opening)
    const stopcockAssembly = new THREE.Group();
    stopcockAssembly.position.set(0, 0.03, 0);

    // PTFE valve body
    const valveBodyGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.07, 24);
    const valveBodyMat = new THREE.MeshStandardMaterial({
      color: 0x92512a,
      roughness: 0.35,
    });
    const valveBody = new THREE.Mesh(valveBodyGeo, valveBodyMat);
    valveBody.rotation.z = Math.PI / 2;
    stopcockAssembly.add(valveBody);

    // Valve handle
    const valveHandleGeo = new THREE.BoxGeometry(0.08, 0.016, 0.016);
    const valveHandleMat = new THREE.MeshStandardMaterial({
      color: 0xb46b38,
      roughness: 0.3,
    });
    const valveHandle = new THREE.Mesh(valveHandleGeo, valveHandleMat);
    valveHandle.position.set(0, 0, 0.025);
    stopcockAssembly.add(valveHandle);

    stopcockValveRef.current = stopcockAssembly;
    buretteGroup.add(stopcockAssembly);

    // Burette liquid column
    const buretteLiquidGeo = new THREE.CylinderGeometry(0.021, 0.021, 1.4, 32);
    const buretteLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.72,
      roughness: 0.1,
    });
    const buretteLiquidMesh = new THREE.Mesh(buretteLiquidGeo, buretteLiquidMat);
    buretteLiquidMesh.position.set(0, 0.75, 0);
    buretteLiquidRef.current = buretteLiquidMesh;
    buretteGroup.add(buretteLiquidMesh);

    // Meniscus ring marker
    const meniscusGeo = new THREE.TorusGeometry(0.021, 0.002, 16, 32);
    const meniscusMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscusMesh.rotation.x = Math.PI / 2;
    meniscusMesh.position.set(0, 1.42, 0);
    meniscusLineRef.current = meniscusMesh;
    buretteGroup.add(meniscusMesh);

    scene.add(buretteGroup);

    // 11. Droplets Animation Particles
    const dropGeo = new THREE.SphereGeometry(0.006, 12, 12);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.85,
    });
    const dropInstanced = new THREE.InstancedMesh(dropGeo, dropMat, 8);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 8; i++) {
      dummy.position.set(0, -10, 0);
      dummy.updateMatrix();
      dropInstanced.setMatrixAt(i, dummy.matrix);
    }
    dropInstanced.instanceMatrix.needsUpdate = true;
    dropParticlesRef.current = dropInstanced;
    scene.add(dropInstanced);

    // Mouse drag orbit interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = 0.35;
    let sphericalRadius = 3.2;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.006;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2.1, sphericalPhi - deltaY * 0.006));

      targetCamPos.current.x = targetLookAt.current.x + sphericalRadius * Math.sin(sphericalTheta) * Math.cos(sphericalPhi);
      targetCamPos.current.y = targetLookAt.current.y + sphericalRadius * Math.sin(sphericalPhi);
      targetCamPos.current.z = targetLookAt.current.z + sphericalRadius * Math.cos(sphericalTheta) * Math.cos(sphericalPhi);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let lastTime = performance.now();
    let dropProgress = 0;

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth camera interpolation
      camera.position.lerp(targetCamPos.current, 0.08);
      camera.lookAt(targetLookAt.current);

      // Rotate stir bar if active
      if (stirBarRef.current && s.stirring) {
        stirBarRef.current.rotation.z += 25 * dt;
      }

      // Valve rotation reflecting state
      if (stopcockValveRef.current) {
        const targetRot = s.valve * (Math.PI / 2);
        stopcockValveRef.current.rotation.z = THREE.MathUtils.lerp(
          stopcockValveRef.current.rotation.z,
          targetRot,
          0.15
        );
      }

      // Drop animation if valve is open
      if (s.valve > 0 && dropParticlesRef.current) {
        dropProgress += dt * (3 + s.valve * 10);
        const dropY = 0.35 - (dropProgress % 0.28);
        dummy.position.set(0, dropY, 0);
        dummy.scale.set(1, 1.4, 1);
        dummy.updateMatrix();
        dropParticlesRef.current.setMatrixAt(0, dummy.matrix);
        dropParticlesRef.current.instanceMatrix.needsUpdate = true;
      } else if (dropParticlesRef.current) {
        dummy.position.set(0, -10, 0);
        dummy.updateMatrix();
        dropParticlesRef.current.setMatrixAt(0, dummy.matrix);
        dropParticlesRef.current.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvasEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Update dynamic properties when simulation state changes
  useEffect(() => {
    // 1. Update Burette Fluid Level & Meniscus
    if (buretteLiquidRef.current && meniscusLineRef.current) {
      const fraction = Math.max(0, Math.min(1, buretteVol / 50));
      buretteLiquidRef.current.scale.set(1, fraction, 1);
      buretteLiquidRef.current.position.y = 0.05 + (fraction * 1.4) / 2;

      // Meniscus marker position
      const meniscusY = 0.05 + fraction * 1.4;
      meniscusLineRef.current.position.y = meniscusY;
      meniscusLineRef.current.visible = fraction > 0.01;
    }

    // 2. Update Flask Solution Volume & Color
    if (flaskLiquidRef.current) {
      const flaskMat = flaskLiquidRef.current.material as THREE.MeshStandardMaterial;
      const hex = parseInt(obs.colourHex.replace("#", "0x"), 16);
      if (!isNaN(hex)) {
        flaskMat.color.setHex(hex);
      }

      // Height of liquid in flask
      const volFraction = Math.min(flaskVol / 100, 1);
      const heightScale = Math.max(0.05, volFraction * 1.2);
      flaskLiquidRef.current.scale.set(1, heightScale, 1);
      flaskLiquidRef.current.position.y = 0.01 + heightScale * 0.04;
      flaskLiquidRef.current.visible = flaskVol > 0.1;
    }
  }, [s, obs.colourHex, buretteVol, flaskVol]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] bg-bench-950 rounded-2xl overflow-hidden border border-bench-800 shadow-2xl group select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Fallback if WebGL disabled */}
      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-bench-900/95 text-enamel-200 p-6 text-center">
          <p className="text-sm font-mono">
            WebGL acceleration unavailable on this device. Switching to precision SVG laboratory visualizer.
          </p>
        </div>
      )}

      {/* 3D Camera Controls Floating HUD */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-bench-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-bench-750 text-[11px] font-mono z-10">
        <span className="text-enamel-400 font-bold mr-1">3D VIEW:</span>
        <button
          onClick={() => setView("full")}
          className={`px-2 py-0.5 rounded-md transition-all ${
            cameraView === "full"
              ? "bg-instrument-amber text-slate-950 font-bold shadow-sm"
              : "text-enamel-300 hover:text-white hover:bg-bench-800"
          }`}
          title="Overall Bench Apparatus View"
        >
          Overview
        </button>
        <button
          onClick={() => setView("meniscus")}
          className={`px-2 py-0.5 rounded-md transition-all ${
            cameraView === "meniscus"
              ? "bg-instrument-amber text-slate-950 font-bold shadow-sm"
              : "text-enamel-300 hover:text-white hover:bg-bench-800"
          }`}
          title="Close-Up of Burette Meniscus"
        >
          Meniscus
        </button>
        <button
          onClick={() => setView("flask")}
          className={`px-2 py-0.5 rounded-md transition-all ${
            cameraView === "flask"
              ? "bg-instrument-amber text-slate-950 font-bold shadow-sm"
              : "text-enamel-300 hover:text-white hover:bg-bench-800"
          }`}
          title="Close-Up of Reaction Flask & Stirrer"
        >
          Flask
        </button>
      </div>

      {/* Top Right: Live Telemetry & Meniscus Readout */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10 font-mono">
        <div className="bg-bench-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-bench-750 flex items-center gap-3 shadow-lg">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-enamel-400 font-bold uppercase tracking-wider">
              Burette Meniscus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-instrument-phosphor leading-tight font-mono">
                {curReading.toFixed(2)}
              </span>
              <span className="text-[10px] text-enamel-400">mL</span>
            </div>
          </div>
          <div className="h-7 w-px bg-bench-750" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-enamel-400 font-bold uppercase tracking-wider">
              Solution
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: obs.colourHex }}
              />
              <span className="text-xs font-bold capitalize text-white">
                {obs.colour}
              </span>
            </div>
          </div>
        </div>

        {/* Live Stirrer Speed Display */}
        <div className="bg-bench-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-bench-800 flex items-center gap-2 text-[10px] text-enamel-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              s.stirring ? "bg-instrument-phosphor animate-pulse" : "bg-bench-600"
            }`}
          />
          <span>MIXER: {s.stirring ? "800 RPM (VORTEX ACTIVE)" : "STOPPED"}</span>
        </div>
      </div>

      {/* Bottom Center: Direct Interactive 3D Stopcock Slider */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-11/12 max-w-md bg-bench-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-bench-750 shadow-2xl flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddDrop?.()}
            className="px-2.5 py-1 rounded-lg bg-bench-800 hover:bg-bench-750 active:scale-95 border border-bench-700 text-xs text-instrument-sky font-bold transition-all shadow-sm"
            title="Dispense 1 drop (0.05 mL)"
          >
            + Drop
          </button>
          <button
            onClick={() => onValveChange?.(0)}
            className="px-2 py-1 rounded-lg bg-bench-800 hover:bg-bench-750 active:scale-95 border border-bench-700 text-xs text-enamel-300 transition-all"
            title="Stop delivery immediately"
          >
            Close
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between text-[10px] text-enamel-400 mb-0.5">
            <span>STOPCOCK VALVE</span>
            <span className="text-instrument-amber font-bold">{Math.round(s.valve * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={s.valve}
            onChange={(e) => onValveChange?.(Number(e.target.value))}
            className="w-full accent-instrument-amber cursor-pointer h-1.5 bg-bench-800 rounded-lg"
            aria-label="3D Stopcock valve control"
          />
        </div>

        <div className="text-[10px] text-enamel-400 text-right">
          <span>{s.valve > 0 ? `${(s.valve * 2).toFixed(1)} mL/s` : "SEALED"}</span>
        </div>
      </div>

      {/* Camera drag instructional hint */}
      <div className="absolute bottom-3 left-3 hidden md:flex items-center gap-1.5 text-[10px] text-enamel-500 font-mono pointer-events-none">
        <span>🖱️ Drag to rotate 3D studio bench</span>
      </div>
    </div>
  );
};
