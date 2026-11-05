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
  solutionColor: string; // css colour, e.g. "rgb(158, 31, 61)"
  cameraView: "overview" | "meniscus" | "flask";
}

/* ---- Burette calibration: the liquid level and the printed graduations share one scale ---- */
const TUBE_TOP = 7.9; // tube spans y 2.5 → 7.9 (height 5.4)
const TUBE_H = 5.4;
const LIQ_BOTTOM = 2.7;
const Y0 = TUBE_TOP - TUBE_H * (120 / 2048); // 0 mL mark (canvas y = 120 of 2048)
const Y50 = TUBE_TOP - TUBE_H * (1920 / 2048); // 50 mL mark (canvas y = 1920)
const levelY = (used: number) => Y0 + (Y50 - Y0) * THREE.MathUtils.clamp(used / 50, 0, 1);

const FLASK_Y = 0.08; // flask sits on the tile
const TIP_Y = 1.85; // bottom of the delivery tip
const MAX_DROPS = 15;
/** Inner radius of the conical flask at height h (1.4 at the base, 0.38 at h = 1.5). */
const coneR = (h: number) => 1.4 - 0.68 * h;
/** Liquid follows the cone's taper exactly (scaling a fixed cone gets the taper wrong). */
const liquidGeo = (h: number) => new THREE.CylinderGeometry(coneR(h) - 0.04, coneR(0) - 0.04, h, 48);

/** Graduation marks on a transparent canvas (used on its own overlay tube, not on the glass). */
function createBuretteTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 2048);
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 100);
  ctx.lineTo(256, 1950);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px ui-monospace, Menlo, monospace";
  ctx.textAlign = "right";
  for (let m = 0; m <= 50; m++) {
    const y = 120 + (m / 50) * 1800;
    const major = m % 5 === 0;
    ctx.strokeStyle = major ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)";
    ctx.lineWidth = major ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(256, y);
    ctx.lineTo(256 + (major ? 45 : 24), y);
    ctx.stroke();
    if (major) ctx.fillText(String(m), 242, y + 9);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export const Exp1Canvas3D = forwardRef<Exp1Canvas3DHandle, Exp1Canvas3DProps>(function Exp1Canvas3D(
  { flaskPlaced, buretteFilled, pipetteAdded, bufferAdded, ebtAdded, buretteUsed, isRunning, solutionColor, cameraView },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const flaskGroupRef = useRef<THREE.Group | null>(null);
  const flaskLiquidRef = useRef<THREE.Mesh | null>(null);
  const buretteLiquidRef = useRef<THREE.Mesh | null>(null);
  const valveRef = useRef<THREE.Mesh | null>(null);
  const dropsRef = useRef<THREE.InstancedMesh | null>(null);

  const targetCamPos = useRef(new THREE.Vector3(0, 4.8, 10.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 3.5, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 3.5, 0));
  const yaw = useRef(0); // drag-to-orbit offset, springs back on release
  const dragging = useRef(false);
  const surfaceY = useRef(0.1); // world y where falling drops land

  /* FIX: the render loop lives in a [] effect, so it must read live values from a ref,
     otherwise isRunning / buretteUsed are frozen at their first-render values. */
  const live = useRef({ used: 0, running: false, filled: false, flask: false, view: cameraView });
  live.current = { used: buretteUsed, running: isRunning, filled: buretteFilled, flask: flaskPlaced, view: cameraView };

  const drops = useRef(Array.from({ length: MAX_DROPS }, () => ({ active: false, y: TIP_Y, speed: 5 })));

  const spawnDrop = () => {
    const d = drops.current.find((x) => !x.active);
    if (d) {
      d.active = true;
      d.y = TIP_Y;
      d.speed = 4.5 + Math.random() * 2; // units per second (frame-rate independent)
    }
  };

  const applyCameraPreset = (view: "overview" | "meniscus" | "flask") => {
    if (view === "overview") {
      targetCamPos.current.set(0, 4.8, 10.5);
      targetLookAt.current.set(0, 3.5, 0);
    } else if (view === "meniscus") {
      const y = levelY(live.current.used); // FIX: matches the real liquid level and the printed scale
      targetCamPos.current.set(0.4, y + 0.2, 3.2);
      targetLookAt.current.set(0, y, 0);
    } else {
      targetCamPos.current.set(0.3, 1.8, 3.8);
      targetLookAt.current.set(0, 1.1, 0);
    }
  };

  useImperativeHandle(ref, () => ({ setCameraView: applyCameraPreset, triggerDropAnim: spawnDrop }), []);

  // Re-aim on view change, and keep the meniscus camera tracking the falling level
  useEffect(() => {
    applyCameraPreset(cameraView);
  }, [cameraView, buretteUsed]);

  /* ------------------------------ scene setup ------------------------------ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      container.textContent = "3D view unavailable: WebGL is not supported on this device.";
      return;
    }
    const w0 = container.clientWidth || 800;
    const h0 = container.clientHeight || 450;
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f0e);
    const camera = new THREE.PerspectiveCamera(42, w0 / h0, 0.1, 100);
    camera.position.copy(targetCamPos.current);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0001;
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); // FIX: default ±5 clipped the bench shadow
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rim.position.set(-6, 6, -5);
    scene.add(rim);
    const bounce = new THREE.DirectionalLight(0x3dd6ba, 0.8);
    bounce.position.set(0, -2, 4);
    scene.add(bounce);

    // Materials (FIX: open glass tubes need DoubleSide or the back wall vanishes)
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x141816, roughness: 0.35, metalness: 0.1 });
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.05 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x47524e, roughness: 0.25, metalness: 0.85 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.94, transparent: true, roughness: 0.05, ior: 1.52, thickness: 0.6,
      specularIntensity: 1, side: THREE.DoubleSide,
    });

    // Bench + tile (tile now centred under the burette tip)
    const bench = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 8), benchMat);
    bench.position.set(0, -0.4, 0);
    bench.receiveShadow = true;
    scene.add(bench);
    const tile = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 3.6), tileMat);
    tile.position.set(0, 0.04, 0);
    tile.receiveShadow = true;
    scene.add(tile);

    // Retort stand
    const stand = new THREE.Group();
    scene.add(stand);
    const add = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rz = 0, rx = 0) => {
      const m = new THREE.Mesh(geo, metalMat);
      m.position.set(x, y, z);
      m.rotation.set(rx, 0, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      stand.add(m);
    };
    add(new THREE.BoxGeometry(3.2, 0.22, 2.2), 2.4, 0.11, 0);
    add(new THREE.CylinderGeometry(0.09, 0.09, 9.2, 32), 3.4, 4.6, 0);
    add(new THREE.BoxGeometry(0.35, 0.45, 0.35), 3.4, 5.8, 0);
    add(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 32), 1.6, 5.8, 0, Math.PI / 2);
    add(new THREE.TorusGeometry(0.3, 0.06, 16, 32, Math.PI * 1.5), 0, 5.8, 0, 0, Math.PI / 2);

    // Burette
    const burette = new THREE.Group();
    scene.add(burette);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, TUBE_H, 32, 1, true), glassMat);
    body.position.set(0, TUBE_TOP - TUBE_H / 2, 0);
    burette.add(body);

    // FIX: graduations on their own transparent overlay. As a `map` on the glass they made the tube
    // nearly invisible (alpha ≈ 0.05). Rotated π so the scale faces the camera and reads correctly.
    const gradTex = createBuretteTexture(renderer.capabilities.getMaxAnisotropy());
    const grads = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.245, TUBE_H, 32, 1, true),
      new THREE.MeshBasicMaterial({ map: gradTex, transparent: true, depthWrite: false })
    );
    grads.position.copy(body.position);
    grads.rotation.y = Math.PI;
    burette.add(grads);

    // Unit-height liquid column: scaled & positioned from the real calibrated level
    const bLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 1, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transmission: 0.82, transparent: true, roughness: 0.08, ior: 1.33 })
    );
    burette.add(bLiquid);
    buretteLiquidRef.current = bLiquid;

    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.45, 32), metalMat);
    housing.position.set(0, 2.5, 0);
    burette.add(housing);
    const valve = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.65, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 })
    );
    valve.position.set(0, 2.5, 0.3);
    burette.add(valve);
    valveRef.current = valve;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 32), glassMat);
    tip.rotation.x = Math.PI;
    tip.position.set(0, 2.1, 0);
    burette.add(tip);

    // Conical flask, centred on the burette axis
    const flask = new THREE.Group();
    flask.position.set(0, FLASK_Y, 0);
    scene.add(flask);
    flaskGroupRef.current = flask;
    // FIX: neck used to overlap the body (y 1.0–1.9 vs body to 1.5); now it sits exactly on top of it
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.4, 32, 1, true), glassMat);
    neck.position.set(0, 1.7, 0);
    flask.add(neck);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 16, 32), glassMat);
    lip.position.set(0, 1.9, 0);
    lip.rotation.x = Math.PI / 2;
    flask.add(lip);
    const fBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 1.4, 1.5, 48, 1, true), glassMat);
    fBody.position.set(0, 0.75, 0);
    fBody.castShadow = true;
    flask.add(fBody);
    const fBase = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), glassMat);
    fBase.rotation.x = -Math.PI / 2;
    flask.add(fBase);

    const fLiquid = new THREE.Mesh(
      liquidGeo(0.35),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xdbe9f4), transmission: 0.7, transparent: true, roughness: 0.1, ior: 1.33,
        attenuationDistance: 0.6, attenuationColor: new THREE.Color(0xdbe9f4),
      })
    );
    fLiquid.position.set(0, 0.35 / 2 + 0.02, 0);
    flask.add(fLiquid);
    flaskLiquidRef.current = fLiquid;

    // Falling drops
    const dropMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transmission: 0.9, transparent: true, roughness: 0.05 }),
      MAX_DROPS
    );
    dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    dropMesh.frustumCulled = false;
    scene.add(dropMesh);
    dropsRef.current = dropMesh;

    // Drag-to-orbit (the container advertises it; now it actually works)
    const el = renderer.domElement;
    let lastX = 0;
    const down = (e: PointerEvent) => { dragging.current = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      yaw.current = THREE.MathUtils.clamp(yaw.current - (e.clientX - lastX) * 0.005, -0.9, 0.9);
      lastX = e.clientX;
    };
    const up = () => { dragging.current = false; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    // Render loop: frame-rate independent, reads live props through the ref
    const clock = new THREE.Clock();
    const dummy = new THREE.Object3D();
    const tmp = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    let acc = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const k = 1 - Math.exp(-6 * dt);

      if (!dragging.current) yaw.current += (0 - yaw.current) * (1 - Math.exp(-2.5 * dt));
      tmp.copy(targetCamPos.current).sub(targetLookAt.current).applyAxisAngle(Y, yaw.current).add(targetLookAt.current);
      camera.position.lerp(tmp, k);
      currentLookAt.current.lerp(targetLookAt.current, k);
      camera.lookAt(currentLookAt.current);

      const L = live.current;
      if (L.running && L.filled && L.used < 50) {
        acc += dt;
        if (acc > 0.09) { acc = 0; spawnDrop(); }
      }
      drops.current.forEach((d, i) => {
        if (d.active) {
          d.y -= d.speed * dt;
          if (d.y <= surfaceY.current) d.active = false;
        }
        dummy.position.set(0, d.active ? d.y : -10, 0);
        dummy.scale.set(0.9, 1.3, 0.9);
        dummy.updateMatrix();
        dropMesh.setMatrixAt(i, dummy.matrix);
      });
      dropMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // FIX: observe the container (a side panel resizing never fires window "resize")
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      // FIX: dispose everything (geometries, materials, textures), not just the renderer
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh && !(o as THREE.InstancedMesh).isInstancedMesh) return;
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => {
          (mt as THREE.MeshBasicMaterial).map?.dispose();
          mt.dispose();
        });
      });
      renderer.dispose();
      if (container.contains(el)) container.removeChild(el);
    };
  }, []);

  /* ------------------- props → scene (flask, liquids, valve) ------------------- */
  useEffect(() => {
    if (flaskGroupRef.current) flaskGroupRef.current.visible = flaskPlaced;

    const fl = flaskLiquidRef.current;
    if (fl) {
      fl.visible = pipetteAdded;
      if (pipetteAdded) {
        const h = Math.min(1.1, 0.35 + (bufferAdded ? 0.12 : 0) + (ebtAdded ? 0.05 : 0) + (buretteUsed / 50) * 0.45);
        fl.geometry.dispose();
        fl.geometry = liquidGeo(h); // FIX: rebuild with the correct taper instead of squashing a fixed cone
        fl.position.set(0, h / 2 + 0.02, 0);
        surfaceY.current = FLASK_Y + 0.02 + h; // drops land on the actual surface
        const mat = fl.material as THREE.MeshPhysicalMaterial;
        mat.color.set(solutionColor);
        mat.attenuationColor.set(solutionColor); // FIX: transmission washed the colour out; tint the volume too
      } else {
        surfaceY.current = flaskPlaced ? FLASK_Y + 0.02 : 0.1;
      }
    }

    const bl = buretteLiquidRef.current;
    if (bl) {
      bl.visible = buretteFilled;
      if (buretteFilled) {
        const height = Math.max(0.001, levelY(buretteUsed) - LIQ_BOTTOM); // top sits on the printed mL mark
        bl.scale.set(1, height, 1);
        bl.position.set(0, LIQ_BOTTOM + height / 2, 0);
      }
    }

    if (valveRef.current) valveRef.current.rotation.z = isRunning ? Math.PI / 2 : 0;
  }, [flaskPlaced, buretteFilled, pipetteAdded, bufferAdded, ebtAdded, buretteUsed, isRunning, solutionColor]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      style={{ minHeight: "450px" }}
    />
  );
});
