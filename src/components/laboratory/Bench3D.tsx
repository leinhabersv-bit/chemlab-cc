"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { observe, volume, type EdtaState } from "@/lib/simulation/edta";

type Point = { x: number; y: number };
import { benchPositions } from "./bench-layout";
type Item = keyof typeof benchPositions;
type Props = {
  s: EdtaState;
  positions?: Record<Item, Point>;
  selected?: Item;
  angle?: number;
  flow?: { from: Point; to: Point; colour: string; rinse: boolean } | null;
  onReady?: (available: boolean) => void;
};

/** A fixed orthographic work plane keeps the accessible drag targets registered to the 3D glassware. */
export default function Bench3D(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      props.onReady?.(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setClearColor("#e8ede8");
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute(
      "aria-label",
      "Three-dimensional chemistry apparatus",
    );
    renderer.domElement.dataset.renderer = "webgl";
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 900, 0, -630, 0.1, 3000);
    camera.position.set(0, 0, 1100);
    const ambient = new THREE.HemisphereLight(0xfaffff, 0x42645a, 2.5);
    scene.add(ambient);
    const sunlight = new THREE.DirectionalLight(0xfff4db, 3.4);
    sunlight.position.set(150, 250, 650);
    sunlight.target.position.set(450, -350, 0);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    Object.assign(sunlight.shadow.camera, {
      left: -700,
      right: 700,
      top: 700,
      bottom: -700,
      near: 1,
      far: 2000,
    });
    sunlight.shadow.bias = -0.001;
    scene.add(sunlight, sunlight.target);
    const fill = new THREE.DirectionalLight(0xc9eeff, 1.7);
    fill.position.set(900, -100, 300);
    scene.add(fill);
    const textures: THREE.Texture[] = [];
    const standard = (color: string, metalness = 0, roughness = 0.45) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#d4eef0",
      transparent: true,
      opacity: 0.3,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const metal = standard("#9bb2ae", 0.7, 0.23);
    const dark = standard("#234d43", 0.25, 0.35);
    const mesh = (
      parent: THREE.Object3D,
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) => {
      const result = new THREE.Mesh(geometry, material);
      result.position.set(x, y, z);
      result.castShadow = true;
      result.receiveShadow = true;
      parent.add(result);
      return result;
    };
    const box = (
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      mat: THREE.Material,
      x: number,
      y: number,
      z: number,
    ) => mesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
    const cylinder = (
      parent: THREE.Object3D,
      top: number,
      bottom: number,
      height: number,
      mat: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) =>
      mesh(
        parent,
        new THREE.CylinderGeometry(top, bottom, height, 32),
        mat,
        x,
        y,
        z,
      );
    const label = (
      parent: THREE.Object3D,
      text: string,
      x: number,
      y: number,
      width = 100,
      height = 22,
      background = "rgba(251,252,246,.94)",
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 112;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 512, 112);
      ctx.fillStyle = "#234d43";
      ctx.font = "500 64px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 56, 490);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          depthTest: false,
          toneMapped: false,
        }),
      );
      sprite.position.set(x, y, 90);
      sprite.scale.set(width, height, 1);
      parent.add(sprite);
      return sprite;
    };
    // The room is geometry, not a background photograph or a CSS perspective transform.
    box(scene, 1000, 700, 15, standard("#e2e9e4"), 450, -300, -100);
    box(scene, 900, 140, 180, standard("#d2ded6"), 450, -575, -35);
    box(scene, 900, 12, 220, standard("#f5f3e9", 0.03, 0.28), 450, -515, 0);
    box(scene, 250, 220, 8, standard("#f8f5e9"), 185, -190, -85);
    box(scene, 230, 200, 5, standard("#d5e8e5"), 185, -190, -78);
    box(scene, 7, 205, 7, standard("#ffffff"), 185, -190, -70);
    box(scene, 235, 7, 7, standard("#ffffff"), 185, -190, -70);
    label(scene, "WATER ANALYSIS / 01 A", 190, -55, 250, 18, "rgba(0,0,0,0)");
    box(scene, 170, 22, 125, dark, 490, -530, 10);
    cylinder(scene, 68, 68, 6, metal, 490, -516, 10);
    label(scene, "MAGNETIC STIRRER", 490, -551, 145, 16);
    box(scene, 170, 92, 35, metal, 120, -340, -5);
    const sink = cylinder(scene, 69, 60, 12, dark, 120, -340, 20);
    sink.rotation.x = Math.PI / 2;
    sink.scale.z = 0.45;
    label(scene, "WASTE / RINSE", 120, -409, 145, 20);
    cylinder(scene, 6, 6, 470, metal, 381, -298, -15);
    box(scene, 115, 9, 15, metal, 432, -147, 0);
    box(scene, 100, 10, 65, metal, 381, -535, -5);
    cylinder(scene, 14, 14, 260, glass, 490, -195, 25);
    const buretteLiquid = cylinder(
      scene,
      10,
      10,
      1,
      new THREE.MeshStandardMaterial({
        color: "#70b5c7",
        transparent: true,
        opacity: 0.75,
        roughness: 0.2,
      }),
      490,
      -315,
      25,
    );
    cylinder(scene, 3, 7, 33, glass, 490, -341, 25);
    const valve = box(
      scene,
      55,
      10,
      13,
      standard("#bd865d", 0.35),
      490,
      -326,
      45,
    );
    for (let i = 0; i <= 10; i++) {
      box(scene, i % 2 === 0 ? 13 : 8, 1, 2, dark, 482, -70 - i * 24, 42);
      label(scene, String(i * 5), 517, -70 - i * 24, 20, 12, "rgba(0,0,0,0)");
    }
    const groups = {} as Record<Item, THREE.Group>;
    const fluids = {} as Record<string, THREE.Mesh>;
    const markers = {} as Record<Item, THREE.Sprite>;
    const colourNames: Record<Item, string> = {
      flask: "Conical flask",
      pipette: "20 mL pipette",
      sample: "Water sample",
      buffer: "pH 10 buffer",
      indicator: "EBT",
      edta: "EDTA",
      wash: "Wash water",
    };
    for (const item of Object.keys(benchPositions) as Item[]) {
      const pivotY = item === "pipette" ? -127 : item === "flask" ? 146 : 119;
      const group = new THREE.Group();
      scene.add(group);
      groups[item] = group;
      group.position.set(
        benchPositions[item].x,
        -benchPositions[item].y + pivotY,
        40,
      );
      const body = new THREE.Group();
      body.position.y = -pivotY;
      group.add(body);
      if (item === "flask") {
        const points = [
          [1, 0],
          [56, 0],
          [64, 7],
          [62, 16],
          [15, 105],
          [14, 111],
          [14, 146],
          [16, 146],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        mesh(body, new THREE.LatheGeometry(points, 48), glass);
        const rim = mesh(
          body,
          new THREE.TorusGeometry(15, 1.4, 10, 40),
          metal,
          0,
          146,
        );
        rim.rotation.x = Math.PI / 2;
        const fluid = cylinder(
          body,
          57,
          60,
          1,
          new THREE.MeshStandardMaterial({
            color: "#aad7db",
            roughness: 0.15,
            transparent: true,
            opacity: 0.85,
          }),
          0,
          3,
          0,
        );
        fluids.flask = fluid;
        label(body, "250 mL", 0, 53, 49, 15, "rgba(0,0,0,0)");
      } else if (item === "pipette") {
        cylinder(body, 4, 4, 170, glass, 0, -25);
        mesh(body, new THREE.SphereGeometry(14, 24, 16), glass, 0, 8).scale.y =
          1.7;
        cylinder(body, 1, 4, 22, glass, 0, -116);
        const bulb = mesh(
          body,
          new THREE.SphereGeometry(19, 24, 16),
          standard("#bb7058"),
          0,
          90,
        );
        bulb.scale.y = 1.35;
        fluids.pipette = cylinder(body, 3, 3, 135, standard("#63b1c4"), 0, -32);
      } else {
        const bottle = standard(
          item === "buffer"
            ? "#a7773e"
            : item === "indicator"
              ? "#704356"
              : "#83b6ae",
          0.08,
          0.24,
        );
        cylinder(body, 25, 27, 83, bottle, 0, 43);
        cylinder(body, 17, 25, 16, bottle, 0, 91);
        cylinder(body, 17, 17, 21, dark, 0, 110);
        label(
          body,
          item === "sample"
            ? "SAMPLE"
            : item === "buffer"
              ? "pH 10"
              : item === "wash"
                ? "H2O"
                : item.toUpperCase(),
          0,
          51,
          48,
          24,
        );
      }
      markers[item] = label(
        scene,
        colourNames[item],
        benchPositions[item].x,
        -benchPositions[item].y - 28,
        item === "flask" ? 112 : 90,
        19,
      );
    }
    const liquidMat = new THREE.MeshStandardMaterial({
      color: "#58acc0",
      transparent: true,
      opacity: 0.8,
      roughness: 0.12,
    });
    const drops = Array.from({ length: 16 }, () =>
      mesh(scene, new THREE.SphereGeometry(2.5, 8, 8), liquidMat),
    );
    const line = mesh(
      scene,
      new THREE.CylinderGeometry(1.7, 1.7, 1, 10),
      new THREE.MeshBasicMaterial({
        color: "#78c0d0",
        transparent: true,
        opacity: 0.35,
      }),
    );
    let redraw = true;
    const resize = () => {
      redraw = true;
      renderer.setSize(container.clientWidth, container.clientHeight, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(container);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = performance.now();
    let frame = 0;
    let lastProps = props,
      settleUntil = performance.now() + 1400,
      lastRender = 0;
    const vector = new THREE.Vector3();
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      if (redraw || latest.current !== lastProps) {
        redraw = false;
        lastProps = latest.current;
        settleUntil = now + 1000;
      }
      const active = latest.current.flow || latest.current.s.valve > 0;
      if ((!active && now > settleUntil) || now - lastRender < 33) return;
      lastRender = now;
      const {
        s,
        positions = benchPositions,
        selected,
        angle = 0,
        flow,
      } = latest.current;
      const blend = media.matches
        ? 1
        : 1 - Math.exp(-Math.min((now - last) / 1000, 0.1) * 18);
      last = now;
      for (const item of Object.keys(groups) as Item[]) {
        let p = positions[item];
        let tilt = selected === item ? angle : 0;
        const pivotY = item === "pipette" ? -127 : item === "flask" ? 146 : 119;
        groups[item].position.lerp(vector.set(p.x, -p.y + pivotY, 40), blend);
        groups[item].rotation.z = THREE.MathUtils.lerp(
          groups[item].rotation.z,
          (-tilt * Math.PI) / 180,
          blend,
        );
        markers[item].position.set(p.x, -p.y - 28, 90);
        markers[item].visible = tilt < 5;
      }
      const flaskMl = volume(s.vessels.flask),
        liquidHeight = Math.max(0.1, Math.min(100, flaskMl * 1.2));
      fluids.flask.visible = flaskMl > 0;
      fluids.flask.scale.y = THREE.MathUtils.lerp(
        fluids.flask.scale.y,
        liquidHeight,
        blend * 0.5,
      );
      fluids.flask.position.y = 3 + fluids.flask.scale.y / 2;
      const radiusScale = Math.max(0.4, 1 - fluids.flask.scale.y / 190);
      fluids.flask.scale.x = radiusScale;
      fluids.flask.scale.z = radiusScale;
      (fluids.flask.material as THREE.MeshStandardMaterial).color.lerp(
        new THREE.Color(observe(s).colourHex),
        blend,
      );
      fluids.flask.rotation.y = s.stirring && !media.matches ? now * 0.002 : 0;
      fluids.pipette.visible = volume(s.vessels.pipette) > 0;
      const buretteHeight = volume(s.vessels.burette) * 4.8;
      buretteLiquid.scale.y = THREE.MathUtils.lerp(
        buretteLiquid.scale.y,
        Math.max(0.1, buretteHeight),
        blend,
      );
      buretteLiquid.position.y = -310 + buretteLiquid.scale.y / 2;
      valve.rotation.z = (s.valve * Math.PI) / 2;
      const stream =
        flow ??
        (s.valve > 0 && s.positioned
          ? {
              from: { x: 490, y: 357 },
              to: { x: 490, y: 490 },
              colour: "#58acc0",
            }
          : null);
      line.visible = !!stream;
      for (const drop of drops) drop.visible = !!stream;
      if (stream) {
        const from = new THREE.Vector3(stream.from.x, -stream.from.y, 100),
          to = new THREE.Vector3(stream.to.x, -stream.to.y, 100);
        line.position.copy(from).add(to).multiplyScalar(0.5);
        line.scale.y = from.distanceTo(to);
        line.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          to.clone().sub(from).normalize(),
        );
        liquidMat.color.set(stream.colour);
        drops.forEach((drop, i) => {
          const t = media.matches ? i / 16 : (now * 0.0006 + i / 16) % 1;
          drop.position.lerpVectors(from, to, t);
          drop.scale.y = 1.8;
        });
      }
      renderer.render(scene, camera);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      props.onReady?.(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    frame = requestAnimationFrame(animate);
    props.onReady?.(true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m.dispose());
        } else if (obj instanceof THREE.Sprite) obj.material.dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      ref={host}
      className="edta-webgl"
      data-testid="three-bench"
      aria-hidden="true"
    />
  );
}
