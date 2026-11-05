"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

export interface Exp1Canvas3DHandle {
  setCameraView: (view: "overview" | "meniscus" | "flask") => void;
  triggerDropAnim: () => void;
}

interface Exp1Canvas3DProps {
  flaskPlaced: boolean;
  buretteFilled: boolean;
  pipetteAdded: boolean;
  bufferAdded: boolean;
  ebtAdded: boolean;
  buretteUsed: number; // 0 to 50 mL
  isRunning: boolean;
  solutionColor: string; // css rgb string e.g. "rgb(158, 31, 61)"
  cameraView: "overview" | "meniscus" | "flask";
}

/**
 * Creates volumetric graduation markings texture for the Class-A 50 mL burette
 */
function createBuretteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background subtle glass frost
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vertical reference line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 100);
  ctx.lineTo(256, 1950);
  ctx.stroke();

  // Draw 0 to 50 mL graduations
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px ui-monospace, Menlo, monospace";
  ctx.textAlign = "right";

  for (let m = 0; m <= 50; m++) {
    const y = 120 + (m / 50) * 1800;
    const isMajor = m % 5 === 0;

    ctx.strokeStyle = isMajor ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = isMajor ? 4 : 2;

    ctx.beginPath();
    ctx.moveTo(256, y);
    ctx.lineTo(256 + (isMajor ? 45 : 24), y);
    ctx.stroke();

    if (isMajor) {
      ctx.fillText(String(m), 242, y + 9);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const Exp1Canvas3D = forwardRef<Exp1Canvas3DHandle, Exp1Canvas3DProps>(
  function Exp1Canvas3D(
    {
      flaskPlaced,
      buretteFilled,
      pipetteAdded,
      bufferAdded,
      ebtAdded,
      buretteUsed,
      isRunning,
      solutionColor,
      cameraView,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    // Dynamic animated meshes
    const flaskGroupRef = useRef<THREE.Group | null>(null);
    const flaskLiquidMeshRef = useRef<THREE.Mesh | null>(null);
    const buretteLiquidMeshRef = useRef<THREE.Mesh | null>(null);
    const stopcockHandleRef = useRef<THREE.Mesh | null>(null);
    const fallingDropsRef = useRef<THREE.InstancedMesh | null>(null);

    // Camera target positions
    const targetCamPos = useRef(new THREE.Vector3(0, 4.5, 11));
    const targetLookAt = useRef(new THREE.Vector3(0, 3.8, 0));
    const currentLookAt = useRef(new THREE.Vector3(0, 3.8, 0));

    // Expose control methods
    useImperativeHandle(ref, () => ({
      setCameraView: (view) => {
        applyCameraPreset(view);
      },
      triggerDropAnim: () => {
        spawnDrop();
      },
    }));

    const applyCameraPreset = (view: "overview" | "meniscus" | "flask") => {
      if (view === "overview") {
        targetCamPos.current.set(0, 4.8, 10.5);
        targetLookAt.current.set(0, 3.5, 0);
      } else if (view === "meniscus") {
        // Close-up on the burette liquid level
        const currentMeniscusY = 7.6 - (buretteUsed / 50) * 4.8;
        targetCamPos.current.set(0.4, currentMeniscusY + 0.2, 3.2);
        targetLookAt.current.set(0, currentMeniscusY, 0);
      } else if (view === "flask") {
        // Close-up on the conical flask endpoint color
        targetCamPos.current.set(0.3, 1.8, 3.8);
        targetLookAt.current.set(0, 1.1, 0);
      }
    };

    // Drops particle simulation data
    const maxDrops = 15;
    const dropPositions = useRef(
      Array.from({ length: maxDrops }, () => ({
        active: false,
        y: 2.5,
        speed: 0.12,
      }))
    );

    const spawnDrop = () => {
      const drop = dropPositions.current.find((d) => !d.active);
      if (drop) {
        drop.active = true;
        drop.y = 2.45;
        drop.speed = 0.08 + Math.random() * 0.04;
      }
    };

    // Update camera view when prop changes
    useEffect(() => {
      applyCameraPreset(cameraView);
    }, [cameraView]);

    // Initial 3D Scene Setup
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x0a0f0e);

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 4.8, 10.5);
      cameraRef.current = camera;

      // 3. Renderer with tone mapping and shadows
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      // Key light with soft shadow
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(4, 10, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0001;
      scene.add(keyLight);

      // Cool rim light (backlight for glass refraction)
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
      rimLight.position.set(-6, 6, -5);
      scene.add(rimLight);

      // Warm bench bounce light
      const bounceLight = new THREE.DirectionalLight(0x3dd6ba, 0.8);
      bounceLight.position.set(0, -2, 4);
      scene.add(bounceLight);

      // 5. Materials
      const benchMat = new THREE.MeshStandardMaterial({
        color: 0x141816,
        roughness: 0.35,
        metalness: 0.1,
      });

      const tileMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.05,
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x47524e,
        roughness: 0.25,
        metalness: 0.85,
      });

      const glassMat = new THREE.MeshPhysicalMaterial({
        transmission: 0.94,
        opacity: 1,
        transparent: true,
        roughness: 0.05,
        ior: 1.52,
        thickness: 0.6,
        specularIntensity: 1,
        specularColor: new THREE.Color(0xffffff),
      });

      const buretteTexture = createBuretteTexture();
      const buretteGlassMat = new THREE.MeshPhysicalMaterial({
        transmission: 0.92,
        opacity: 1,
        transparent: true,
        roughness: 0.08,
        ior: 1.52,
        thickness: 0.5,
        map: buretteTexture,
      });

      // 6. Geometry: Bench Top
      const benchGeo = new THREE.BoxGeometry(16, 0.8, 8);
      const benchMesh = new THREE.Mesh(benchGeo, benchMat);
      benchMesh.position.set(0, -0.4, 0);
      benchMesh.receiveShadow = true;
      scene.add(benchMesh);

      // 7. White Porcelain Titration Tile
      const tileGeo = new THREE.BoxGeometry(3.6, 0.08, 3.6);
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(0, 0.04, 0.2);
      tileMesh.receiveShadow = true;
      scene.add(tileMesh);

      // 8. Retort Stand Assembly
      const standGroup = new THREE.Group();
      scene.add(standGroup);

      // Stand Base (Heavy cast iron)
      const baseGeo = new THREE.BoxGeometry(3.2, 0.22, 2.2);
      const baseMesh = new THREE.Mesh(baseGeo, metalMat);
      baseMesh.position.set(2.4, 0.11, 0);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      standGroup.add(baseMesh);

      // Vertical Upright Rod
      const rodGeo = new THREE.CylinderGeometry(0.09, 0.09, 9.2, 32);
      const rodMesh = new THREE.Mesh(rodGeo, metalMat);
      rodMesh.position.set(3.4, 4.6, 0);
      rodMesh.castShadow = true;
      standGroup.add(rodMesh);

      // Bosshead Clamp & Horizontal Arm
      const bossGeo = new THREE.BoxGeometry(0.35, 0.45, 0.35);
      const bossMesh = new THREE.Mesh(bossGeo, metalMat);
      bossMesh.position.set(3.4, 5.8, 0);
      standGroup.add(bossMesh);

      const armGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.6, 32);
      const armMesh = new THREE.Mesh(armGeo, metalMat);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.position.set(1.6, 5.8, 0);
      standGroup.add(armMesh);

      // Dual-prong Burette Clamp Jaw
      const jawGeo = new THREE.TorusGeometry(0.3, 0.06, 16, 32, Math.PI * 1.5);
      const jawMesh = new THREE.Mesh(jawGeo, metalMat);
      jawMesh.position.set(0, 5.8, 0);
      jawMesh.rotation.x = Math.PI / 2;
      standGroup.add(jawMesh);

      // 9. Calibrated 50 mL Glass Burette Assembly
      const buretteGroup = new THREE.Group();
      buretteGroup.position.set(0, 0, 0);
      scene.add(buretteGroup);

      // Main Glass Cylinder (Length 5.4, Radius 0.24)
      const buretteBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 5.4, 32, 1, true);
      const buretteBody = new THREE.Mesh(buretteBodyGeo, buretteGlassMat);
      buretteBody.position.set(0, 5.2, 0);
      buretteBody.castShadow = true;
      buretteGroup.add(buretteBody);

      // Burette Liquid Column (Mesh length dynamically adjusted)
      const buretteLiquidGeo = new THREE.CylinderGeometry(0.21, 0.21, 5.0, 32);
      const buretteLiquidMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.82,
        transparent: true,
        roughness: 0.08,
        ior: 1.33,
      });
      const buretteLiquid = new THREE.Mesh(buretteLiquidGeo, buretteLiquidMat);
      buretteLiquid.position.set(0, 5.2, 0);
      buretteGroup.add(buretteLiquid);
      buretteLiquidMeshRef.current = buretteLiquid;

      // Stopcock housing & nozzle
      const stopcockHousingGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.45, 32);
      const stopcockHousing = new THREE.Mesh(stopcockHousingGeo, metalMat);
      stopcockHousing.position.set(0, 2.5, 0);
      buretteGroup.add(stopcockHousing);

      // Red Turn Valve
      const valveHandleGeo = new THREE.BoxGeometry(0.12, 0.65, 0.2);
      const valveHandleMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.2,
      });
      const valveHandle = new THREE.Mesh(valveHandleGeo, valveHandleMat);
      valveHandle.position.set(0, 2.5, 0.3);
      buretteGroup.add(valveHandle);
      stopcockHandleRef.current = valveHandle;

      // Delivery Tip
      const tipGeo = new THREE.ConeGeometry(0.12, 0.5, 32);
      const tipMesh = new THREE.Mesh(tipGeo, glassMat);
      tipMesh.rotation.x = Math.PI;
      tipMesh.position.set(0, 2.1, 0);
      buretteGroup.add(tipMesh);

      // 10. Conical Flask (Erlenmeyer) 3D Model
      const flaskGroup = new THREE.Group();
      flaskGroup.position.set(0, 0.08, 0.2);
      scene.add(flaskGroup);
      flaskGroupRef.current = flaskGroup;

      // Flask Neck
      const flaskNeckGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.9, 32, 1, true);
      const flaskNeck = new THREE.Mesh(flaskNeckGeo, glassMat);
      flaskNeck.position.set(0, 1.45, 0);
      flaskGroup.add(flaskNeck);

      // Flask Lip Ring
      const lipGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
      const lipMesh = new THREE.Mesh(lipGeo, glassMat);
      lipMesh.position.set(0, 1.9, 0);
      lipMesh.rotation.x = Math.PI / 2;
      flaskGroup.add(lipMesh);

      // Flask Conical Body
      const flaskBodyGeo = new THREE.CylinderGeometry(0.38, 1.4, 1.5, 32, 1, true);
      const flaskBody = new THREE.Mesh(flaskBodyGeo, glassMat);
      flaskBody.position.set(0, 0.75, 0);
      flaskBody.castShadow = true;
      flaskGroup.add(flaskBody);

      // Flask Base
      const flaskBaseGeo = new THREE.CircleGeometry(1.4, 32);
      const flaskBase = new THREE.Mesh(flaskBaseGeo, glassMat);
      flaskBase.rotation.x = -Math.PI / 2;
      flaskBase.position.set(0, 0, 0);
      flaskGroup.add(flaskBase);

      // Dynamic Fluid inside flask
      const flaskLiquidGeo = new THREE.CylinderGeometry(0.48, 1.34, 0.85, 32);
      const flaskLiquidMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xdbe9f4),
        transmission: 0.85,
        transparent: true,
        roughness: 0.1,
        ior: 1.33,
      });
      const flaskLiquid = new THREE.Mesh(flaskLiquidGeo, flaskLiquidMat);
      flaskLiquid.position.set(0, 0.44, 0);
      flaskGroup.add(flaskLiquid);
      flaskLiquidMeshRef.current = flaskLiquid;

      // 11. Instanced Falling Droplets
      const dropGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const dropMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.9,
        transparent: true,
        roughness: 0.05,
      });
      const dropInstanced = new THREE.InstancedMesh(dropGeo, dropMat, maxDrops);
      dropInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(dropInstanced);
      fallingDropsRef.current = dropInstanced;

      // Initialize drop matrices to hidden
      const dummy = new THREE.Object3D();
      for (let i = 0; i < maxDrops; i++) {
        dummy.position.set(0, -10, 0);
        dummy.updateMatrix();
        dropInstanced.setMatrixAt(i, dummy.matrix);
      }
      dropInstanced.instanceMatrix.needsUpdate = true;

      // 12. Animation & Render Loop
      let animId: number;
      let dropSpawnAccum = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Smooth camera glide interpolation (lerp)
        camera.position.lerp(targetCamPos.current, 0.06);
        currentLookAt.current.lerp(targetLookAt.current, 0.06);
        camera.lookAt(currentLookAt.current);

        // Falling drops update
        if (isRunning) {
          dropSpawnAccum += 0.016;
          if (dropSpawnAccum > 0.09) {
            dropSpawnAccum = 0;
            spawnDrop();
          }
        }

        const dropMesh = fallingDropsRef.current;
        if (dropMesh) {
          dropPositions.current.forEach((d, idx) => {
            if (d.active) {
              d.y -= d.speed;
              if (d.y <= 0.8) {
                // Drop reached liquid in flask
                d.active = false;
              }
              dummy.position.set(0, d.y, 0.1);
              dummy.scale.set(0.9, 1.3, 0.9); // Stretch falling drop
              dummy.updateMatrix();
              dropMesh.setMatrixAt(idx, dummy.matrix);
            } else {
              dummy.position.set(0, -10, 0);
              dummy.updateMatrix();
              dropMesh.setMatrixAt(idx, dummy.matrix);
            }
          });
          dropMesh.instanceMatrix.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    // Synchronize Reactive Physical Properties with Props
    useEffect(() => {
      // 1. Flask placement & positioning
      if (flaskGroupRef.current) {
        flaskGroupRef.current.visible = flaskPlaced;
      }

      // 2. Liquid in flask height & color
      if (flaskLiquidMeshRef.current) {
        flaskLiquidMeshRef.current.visible = pipetteAdded;
        if (pipetteAdded) {
          const liquidHeight = Math.min(
            1.1,
            0.35 + (bufferAdded ? 0.12 : 0) + (ebtAdded ? 0.05 : 0) + (buretteUsed / 50) * 0.45
          );
          flaskLiquidMeshRef.current.scale.set(1, liquidHeight / 0.85, 1);
          flaskLiquidMeshRef.current.position.set(0, liquidHeight / 2 + 0.02, 0);

          // Update fluid color
          const mat = flaskLiquidMeshRef.current.material as THREE.MeshPhysicalMaterial;
          if (mat) {
            mat.color.set(solutionColor);
          }
        }
      }

      // 3. Burette liquid height
      if (buretteLiquidMeshRef.current) {
        buretteLiquidMeshRef.current.visible = buretteFilled;
        if (buretteFilled) {
          const remainingFraction = Math.max(0.001, (50 - buretteUsed) / 50);
          buretteLiquidMeshRef.current.scale.set(1, remainingFraction, 1);
          // Anchor liquid from bottom of burette
          const totalH = 5.0;
          const currentH = totalH * remainingFraction;
          buretteLiquidMeshRef.current.position.set(0, 2.7 + currentH / 2, 0);
        }
      }

      // 4. Stopcock valve rotation (90 degrees when running)
      if (stopcockHandleRef.current) {
        stopcockHandleRef.current.rotation.z = isRunning ? Math.PI / 2 : 0;
      }
    }, [
      flaskPlaced,
      buretteFilled,
      pipetteAdded,
      bufferAdded,
      ebtAdded,
      buretteUsed,
      isRunning,
      solutionColor,
    ]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: "450px" }}
      />
    );
  }
);
