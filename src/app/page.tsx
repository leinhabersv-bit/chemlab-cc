"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scene as sceneTokens, tiers, glide, type TierName } from "../tokens";
import "./home.css";

gsap.registerPlugin(ScrollTrigger);

/* ====================================================================
   1. SHADERS: a displaced, fresnel-lit "instrument core"
   ==================================================================== */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
${NOISE_GLSL}
uniform float uTime;
uniform float uDistort;
uniform float uSpeed;
uniform float uBulge;
uniform vec3 uPointer;
varying vec3 vN;
varying vec3 vV;
varying float vNoise;

float field(vec3 p){
  float t=uTime*uSpeed;
  return snoise(p*1.1+vec3(0.,t,t*.6))+.35*snoise(p*2.4-vec3(t*1.3));
}
vec3 shape(vec3 p){
  vec3 n=normalize(p);
  float d=field(p)*uDistort;
  vec3 wp=(modelMatrix*vec4(p,1.)).xyz;
  float k=smoothstep(2.4,0.,distance(wp,uPointer));
  return p+n*(d+k*uBulge);
}
void main(){
  vec3 n=normalize(position);
  float R=length(position);
  vec3 up=abs(n.y)>.99?vec3(1.,0.,0.):vec3(0.,1.,0.);
  vec3 tg=normalize(cross(n,up));
  vec3 bt=cross(n,tg);
  float e=.02;
  vec3 a=shape(position);
  vec3 b=shape(normalize(position+tg*e)*R);
  vec3 c=shape(normalize(position+bt*e)*R);
  vec3 nn=normalize(cross(b-a,c-a));
  if(dot(nn,n)<0.) nn=-nn;
  vNoise=field(position);
  vN=normalize(normalMatrix*nn);
  vec4 mv=modelViewMatrix*vec4(a,1.);
  vV=-mv.xyz;
  gl_Position=projectionMatrix*mv;
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uGlow;
uniform float uPulse;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uRim;
varying vec3 vN;
varying vec3 vV;
varying float vNoise;
void main(){
  vec3 n=normalize(vN);
  vec3 v=normalize(vV);
  float ndv=max(dot(n,v),0.);
  float fres=pow(1.-ndv,2.6);
  float t=smoothstep(-.7,.9,vNoise);
  vec3 col=mix(uA,uB,t);
  float diff=dot(n,normalize(vec3(.4,.7,.6)))*.5+.5;
  col*=.35+.75*diff;
  col+=uRim*fres*(1.05+uPulse*1.6);
  col+=uB*uGlow*pow(1.-abs(ndv-.25),6.)*.45;
  col+=.06*vec3(sin(vNoise*6.+uTime),sin(vNoise*6.+uTime+2.1),sin(vNoise*6.+uTime+4.2));
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/* ====================================================================
   2. STAGE: renderer, scene, and a render() the ticker calls
   ==================================================================== */

type StageState = {
  rigX: number; rigY: number; scale: number; camZ: number;
  distort: number; speed: number; glow: number; ring: number; pulse: number;
};

const themeMode = (): "dark" | "light" => {
  const el = document.documentElement;
  if (el.dataset.theme === "light" || el.classList.contains("light")) return "light";
  if (el.dataset.theme === "dark" || el.classList.contains("dark")) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

function createStage(canvas: HTMLCanvasElement, startTier: TierName) {
  let tier = startTier;
  const mode = themeMode();
  const tok = sceneTokens[mode];

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier !== "low",
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0); // CSS background shows through
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  const rig = new THREE.Group();
  scene.add(rig);

  /* Hero: displaced icosphere with a fresnel shader */
  const uniforms = {
    uTime: { value: 0 },
    uDistort: { value: 0.35 },
    uSpeed: { value: 0.25 },
    uBulge: { value: 0 },
    uPointer: { value: new THREE.Vector3(99, 99, 99) },
    uGlow: { value: 0.5 },
    uPulse: { value: 0 },
    uA: { value: new THREE.Color(mode === "dark" ? tok.fill : tok.hero) },
    uB: { value: new THREE.Color(tok.accent) },
    uRim: { value: new THREE.Color(tok.rim) },
  };
  const detail = { high: 64, medium: 40, low: 24 }[tier];
  const orbGeo = new THREE.IcosahedronGeometry(1.4, detail);
  const orbMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  rig.add(orb);

  /* Orbit rings: they spread out during the "How it works" beat */
  const ringGeo = new THREE.TorusGeometry(2.15, 0.006, 8, 220);
  const ringMat = new THREE.MeshBasicMaterial({ color: tok.rim, transparent: true, opacity: 0.55 });
  const rings = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(ringGeo, ringMat);
    m.rotation.set(Math.PI / 2.2 + i * 0.5, i * 0.9, 0);
    rig.add(m);
    return m;
  });

  /* Halo of instrument dust */
  const COUNT = 2600;
  const haloPos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 2.4 + Math.random() * 2.2;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    haloPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    haloPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    haloPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPos, 3));
  const haloMat = new THREE.PointsMaterial({
    color: tok.key,
    size: 0.022,
    sizeAttenuation: true,
    transparent: true,
    opacity: mode === "dark" ? 0.8 : 0.6,
    depthWrite: false,
    blending: mode === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const halo = new THREE.Points(haloGeo, haloMat);
  rig.add(halo);

  const applyTier = () => {
    haloGeo.setDrawRange(0, Math.floor(COUNT * tiers[tier].particles));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tiers[tier].pixelRatio));
  };

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    applyTier();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  /* Scroll-driven values (tweened by GSAP) and input (damped here) */
  const state: StageState = {
    rigX: 1.7, rigY: 0, scale: 1, camZ: 7,
    distort: 0.35, speed: 0.25, glow: 0.5, ring: 0.4, pulse: 0,
  };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  const drag = { active: false, vx: 0, vy: 0, rotX: 0.15, rotY: 0 };

  const render = (dt: number, t: number) => {
    const damp = (a: number, b: number, l: number) => a + (b - a) * (1 - Math.exp(-l * dt));
    ptr.x = damp(ptr.x, ptr.tx, glide.dampPointer);
    ptr.y = damp(ptr.y, ptr.ty, glide.dampPointer);

    if (!drag.active) {
      drag.rotY += drag.vy * dt;
      drag.vy *= Math.exp(-2.4 * dt);
      drag.rotX = damp(drag.rotX, 0.15, 1.2);
    }

    camera.position.set(ptr.x * 0.3, ptr.y * 0.18, state.camZ);
    camera.lookAt(0, 0, 0);

    rig.position.set(state.rigX, state.rigY, 0);
    rig.scale.setScalar(state.scale);
    rig.rotation.set(-ptr.y * 0.12, ptr.x * 0.2, 0);

    orb.rotation.set(drag.rotX, drag.rotY + t * 0.06, 0);
    rings.forEach((m, i) => {
      m.rotation.z += dt * (0.08 + i * 0.05);
      m.scale.setScalar((1 + i * 0.22) * (0.8 + state.ring * 0.35));
    });
    halo.rotation.y = t * 0.02;

    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * state.camZ;
    uniforms.uPointer.value.set(ptr.x * halfH * camera.aspect, ptr.y * halfH, 1.6);
    uniforms.uBulge.value = damp(uniforms.uBulge.value, ptr.active && !drag.active ? 0.16 : 0, 3);
    uniforms.uTime.value = t;
    uniforms.uDistort.value = state.distort;
    uniforms.uSpeed.value = state.speed;
    uniforms.uGlow.value = state.glow;
    uniforms.uPulse.value = state.pulse;

    renderer.render(scene, camera);
  };

  resize();

  return {
    state, ptr, drag, resize, render,
    setTier(next: TierName) { tier = next; applyTier(); },
    dispose() {
      orbGeo.dispose(); orbMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
      haloGeo.dispose(); haloMat.dispose();
      renderer.dispose();
    },
  };
}

/** Heuristic starting tier. The runtime monitor steps down further if frames drop. */
function detectTier(): TierName {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = navigator.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 8;
  const small = window.matchMedia("(max-width: 899px)").matches;
  if (mem <= 2 || cores <= 2) return "low";
  if (small || cores <= 4 || mem <= 4) return "medium";
  return "high";
}

/* ====================================================================
   3. SCROLL BEATS: how the instrument changes per section
      order: hero, features, process, stats, cta
   ==================================================================== */

const BEATS = {
  wide: [
    { rigX: 1.7, rigY: 0, scale: 1, camZ: 7, distort: 0.35, speed: 0.25, glow: 0.5, ring: 0.4 },
    { rigX: 3.3, rigY: 1.7, scale: 0.5, camZ: 8, distort: 0.15, speed: 0.15, glow: 0.25, ring: 0.2 },
    { rigX: 1.9, rigY: 0, scale: 0.62, camZ: 6.2, distort: 0.6, speed: 0.6, glow: 0.85, ring: 1 },
    { rigX: -2.7, rigY: 0, scale: 0.6, camZ: 7, distort: 0.3, speed: 0.3, glow: 0.5, ring: 0.5 },
    { rigX: 0, rigY: 0, scale: 1.1, camZ: 6.4, distort: 0.45, speed: 0.4, glow: 1, ring: 0.8 },
  ],
  narrow: [
    { rigX: 0, rigY: 1.5, scale: 0.85, camZ: 8, distort: 0.35, speed: 0.25, glow: 0.5, ring: 0.4 },
    { rigX: 0, rigY: 2.6, scale: 0.32, camZ: 8.5, distort: 0.15, speed: 0.15, glow: 0.25, ring: 0.2 },
    { rigX: 0, rigY: 1.7, scale: 0.55, camZ: 7.5, distort: 0.6, speed: 0.6, glow: 0.85, ring: 1 },
    { rigX: 0, rigY: 2.3, scale: 0.4, camZ: 8, distort: 0.3, speed: 0.3, glow: 0.5, ring: 0.5 },
    { rigX: 0, rigY: 0.3, scale: 0.95, camZ: 8, distort: 0.45, speed: 0.4, glow: 1, ring: 0.8 },
  ],
} as const;

const SECTION_IDS = ["top", "features", "process", "stats", "cta"] as const;

/* ====================================================================
   4. CONTENT
   ==================================================================== */

const LABS = ["Northfield Bio", "Helix Row", "Kestrel Labs", "Orbital Genomics", "Fathom Therapeutics", "Meridian Cell Co."];
const INSTRUMENTS = ["Plate reader", "Liquid handler", "Sequencer", "Mass spec", "Microscope"];
const INTEGRATIONS = ["LIMS", "ELN", "Slack", "S3"];

const STEPS = [
  { n: "01", title: "Connect your instruments", body: "Plug in plate readers, handlers and sequencers once. Assay learns what each one can do and keeps their calibration history." },
  { n: "02", title: "Describe the run", body: "Write the protocol the way you would tell a colleague. Assay drafts the steps, flags conflicts, and waits for your review." },
  { n: "03", title: "Run it and sign off", body: "Approve the plan and it executes. Every action is timestamped, every result traceable, every run reproducible." },
] as const;

const STATS = [
  { value: 12, decimals: 0, unit: "×", label: "faster protocol setup" },
  { value: 99.2, decimals: 1, unit: "%", label: "of runs reproduced first try" },
  { value: 340, decimals: 0, unit: "", label: "labs running on Assay" },
  { value: 38, decimals: 0, unit: "ms", label: "median query across instruments" },
] as const;

/* ====================================================================
   5. PAGE
   ==================================================================== */

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const main = mainRef.current!;
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];
    const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s);
    const $$ = <T extends HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

    /* ---- Stage (3D), with graceful fallback ---- */
    let tier = detectTier();
    let stage: ReturnType<typeof createStage> | null = null;
    try {
      stage = createStage(canvas, tier);
      root.dataset.tier = tier;
    } catch {
      root.classList.add("no-webgl");
    }
    const onContextLost = (e: Event) => { e.preventDefault(); root.classList.add("no-webgl"); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    cleanups.push(() => canvas.removeEventListener("webglcontextlost", onContextLost));

    /* ---- Smooth scroll ("glide") ---- */
    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: glide.lenisDuration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
    }

    /* ---- One ticker drives Lenis, GSAP and the render loop ---- */
    const order: TierName[] = ["high", "medium", "low"];
    let ready = false;
    let acc = 0;
    let frames = 0;
    const tick = (time: number, deltaMs: number) => {
      lenis?.raf(time * 1000);
      if (!stage || document.hidden) return;
      stage.render(Math.min(deltaMs / 1000, 0.05), time);
      if (!ready) return;
      // Quality monitor: step the tier down if the average frame is slow
      acc += deltaMs;
      if (++frames === 90) {
        const avg = acc / frames;
        acc = 0; frames = 0;
        const idx = order.indexOf(tier);
        if (avg > 27 && idx < order.length - 1) {
          tier = order[idx + 1];
          stage.setTier(tier);
          root.dataset.tier = tier;
        }
      }
    };
    if (!reduced) {
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } else {
      stage?.render(0.016, 0);
      root.classList.add("is-static");
    }

    const onResize = () => { stage?.resize(); if (reduced) stage?.render(0.016, 0); };
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    /* ---- Pointer input: parallax + drag-to-spin on the hero zone ---- */
    const zone = $(".hm-orb-zone");
    const hint = $(".hm-hint");
    if (stage && !reduced) {
      const s = stage;
      const onMove = (e: PointerEvent) => {
        s.ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
        s.ptr.ty = -((e.clientY / window.innerHeight) * 2 - 1);
        s.ptr.active = e.pointerType === "mouse";
      };
      window.addEventListener("pointermove", onMove);
      cleanups.push(() => window.removeEventListener("pointermove", onMove));

      if (zone) {
        let lx = 0, ly = 0;
        const down = (e: PointerEvent) => {
          s.drag.active = true; lx = e.clientX; ly = e.clientY;
          zone.setPointerCapture(e.pointerId);
        };
        const move = (e: PointerEvent) => {
          if (!s.drag.active) return;
          const dx = e.clientX - lx, dy = e.clientY - ly;
          lx = e.clientX; ly = e.clientY;
          s.drag.rotY += dx * 0.008;
          s.drag.rotX = THREE.MathUtils.clamp(s.drag.rotX + dy * 0.006, -0.9, 0.9);
          s.drag.vy = dx * 0.008 * 60;
          hint?.classList.add("is-done");
        };
        const up = () => { s.drag.active = false; };
        zone.addEventListener("pointerdown", down);
        zone.addEventListener("pointermove", move);
        zone.addEventListener("pointerup", up);
        zone.addEventListener("pointercancel", up);
        cleanups.push(() => {
          zone.removeEventListener("pointerdown", down);
          zone.removeEventListener("pointermove", move);
          zone.removeEventListener("pointerup", up);
          zone.removeEventListener("pointercancel", up);
        });
      }
    }

    /* ---- Anchor links glide with Lenis ---- */
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || !lenis) return;
      const id = a.getAttribute("href")!;
      const target = id === "#top" ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target as number | HTMLElement, { duration: 1.6 });
    };
    document.addEventListener("click", onAnchor);
    cleanups.push(() => document.removeEventListener("click", onAnchor));

    /* ---- Cursor, magnetic buttons, tilt cards (mouse only) ---- */
    if (finePointer && !reduced) {
      const cursor = $(".hm-cursor");
      if (cursor) {
        const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
        const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
        const move = (e: PointerEvent) => { cx(e.clientX); cy(e.clientY); };
        const over = (e: PointerEvent) => {
          const t = (e.target as Element).closest("a,button,[data-magnetic],[data-tilt],.hm-orb-zone");
          cursor.dataset.state = !t ? "" : t.classList.contains("hm-orb-zone") ? "drag" : "hover";
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerover", over);
        cleanups.push(() => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerover", over);
        });
      }

      $$("[data-magnetic]").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
        };
        const leave = () => { xTo(0); yTo(0); };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
      });

      $$("[data-tilt]").forEach((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
          el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
          gsap.to(el, { "--rx": `${(-y * 7).toFixed(2)}deg`, "--ry": `${(x * 9).toFixed(2)}deg`, duration: 0.6, ease: "power3.out", overwrite: "auto" } as gsap.TweenVars);
        };
        const leave = () => {
          gsap.to(el, { "--rx": "0deg", "--ry": "0deg", duration: 0.9, ease: "expo.out", overwrite: "auto" } as gsap.TweenVars);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
      });
    }

    /* ---- Scroll choreography ---- */
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Nav state and active link
      const nav = $(".hm-nav");
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => { if (self.scroll() > 40) nav?.setAttribute("data-scrolled", ""); else nav?.removeAttribute("data-scrolled"); },
      });
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el, start: "top 50%", end: "bottom 50%",
          onToggle: (self) => {
            if (!self.isActive) return;
            $$("[data-nav]").forEach((a) => a.toggleAttribute("data-active", a.dataset.nav === id));
          },
        });
      });

      if (reduced) return;

      // Instrument beats: one tween per section, scrubbed with glide smoothing
      mm.add({ wide: "(min-width: 900px)", narrow: "(max-width: 899px)" }, (c) => {
        const set = c.conditions?.wide ? BEATS.wide : BEATS.narrow;
        if (!stage) return;
        Object.assign(stage.state, set[0]);
        for (let i = 1; i < SECTION_IDS.length; i++) {
          const trigger = document.getElementById(SECTION_IDS[i]);
          if (!trigger) continue;
          gsap.fromTo(stage.state, { ...set[i - 1] }, {
            ...set[i], ease: "none", immediateRender: false,
            scrollTrigger: { trigger, start: "top bottom", end: "top 25%", scrub: glide.scrub },
          });
        }
      });

      // Section reveals
      const reveals = $$("[data-reveal]");
      gsap.set(reveals, { opacity: 0, y: 28 });
      ScrollTrigger.batch(reveals, {
        start: "top 88%", once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: glide.stagger }),
      });

      // Process steps follow scroll progress through the sticky section
      const steps = $$(".hm-step");
      const stepsEl = $(".hm-steps-wrap");
      ScrollTrigger.create({
        trigger: "#process", start: "top top", end: "bottom bottom",
        onUpdate: (self) => {
          const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          steps.forEach((s, i) => s.toggleAttribute("data-active", i === idx));
          stepsEl?.style.setProperty("--p", String(Math.min(1, self.progress * 1.05)));
        },
      });

      // Stats count up from 0. The markup ships the real numbers (no-JS, crawlers, reduced motion).
      $$("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count!);
        const dec = parseInt(el.dataset.decimals || "0", 10);
        const o = { v: 0 };
        el.textContent = (0).toFixed(dec);
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => {
            gsap.to(o, { v: end, duration: 2, ease: "expo.out", onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
            if (stage) gsap.fromTo(stage.state, { pulse: 1 }, { pulse: 0, duration: 1.4, ease: "expo.out", overwrite: "auto" });
          },
        });
      });
    }, main);

    /* ---- Intro: loader counter, wipe, hero reveal ---- */
    const finishLoading = () => { root.classList.remove("is-loading"); ready = true; ScrollTrigger.refresh(); };
    const loader = $(".hm-loader");
    if (reduced) {
      loader?.remove();
      finishLoading();
    } else {
      gsap.set(".hm-line > span", { yPercent: 110 });
      gsap.set("[data-intro]", { opacity: 0, y: 20 });
      const count = $(".hm-loader-count");
      const c = { v: 0 };
      const intro = () => {
        finishLoading();
        gsap.timeline({ defaults: { ease: "expo.out" } })
          .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut", onComplete: () => loader?.remove() })
          .to(".hm-line > span", { yPercent: 0, duration: 1.2, stagger: 0.09 }, "-=0.4")
          .to("[data-intro]", { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, "-=0.9");
      };
      const fontsOrTimeout = Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
      gsap.to(c, {
        v: 100, duration: 1.2, ease: "power2.out",
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(c.v)).padStart(3, "0");
          loader?.style.setProperty("--p", String(c.v / 100));
        },
        onComplete: () => { fontsOrTimeout.then(intro); },
      });
    }

    /* ---- Cleanup (also makes React StrictMode's double-mount safe) ---- */
    return () => {
      mm.revert();
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      cleanups.forEach((fn) => fn());
      stage?.dispose();
      root.classList.remove("is-static");
    };
  }, []);

  return (
    <div className="hm-root">
      {/* Intro loader */}
      <div className="hm-loader" aria-hidden="true">
        <div className="hm-loader-inner">
          <span className="hm-loader-word">Assay</span>
          <div className="hm-loader-bar"><i /></div>
          <span className="hm-loader-count">000</span>
        </div>
      </div>

      {/* Fixed layers: 3D canvas, CSS fallback orb, vignette, grain, cursor */}
      <canvas ref={canvasRef} className="canvas-fixed hm-canvas" aria-hidden="true" />
      <div className="hm-fallback-orb" aria-hidden="true" />
      <div className="hm-vignette" aria-hidden="true" />
      <div className="hm-grain bg-noise tier-low:hidden" aria-hidden="true" />
      <div className="hm-cursor" aria-hidden="true"><i /></div>

      {/* Nav */}
      <header className="hm-nav">
        <a href="#top" className="hm-brand" data-magnetic aria-label="Assay home">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="5" fill="rgb(var(--accent))" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="rgb(var(--info))" strokeWidth="1" transform="rotate(-24 12 12)" />
          </svg>
          Assay
        </a>
        <nav className="hm-links" aria-label="Primary">
          <a href="#features" data-nav="features">Product</a>
          <a href="#process" data-nav="process">How it works</a>
          <a href="#stats" data-nav="stats">Results</a>
        </nav>
        <a href="#cta" className="btn btn-primary btn-sm" data-magnetic>Start free</a>
      </header>

      <main id="main" ref={mainRef}>
        {/* ============ Hero ============ */}
        <section id="top" className="hm-hero stage">
          <div className="hm-hero-copy">
            <a href="#features" className="hm-pill" data-intro>
              <span className="hm-pill-tag">New</span>
              Notebook 2.0 now runs your protocols
              <span aria-hidden="true">→</span>
            </a>
            <h1 className="hm-title font-display text-display-xl">
              <span className="hm-line block"><span className="block">Experiments</span></span>
              <span className="hm-line block"><span className="block">that run</span></span>
              <span className="hm-line block"><span className="block"><em>themselves.</em></span></span>
            </h1>
            <p className="hm-lead text-lead text-muted" data-intro>
              Assay is the lab notebook that talks to your instruments. Describe a protocol in plain language, review the plan, and watch every step run, logged and reproducible.
            </p>
            <div className="hm-actions" data-intro>
              <a href="#cta" className="btn btn-primary" data-magnetic>Start free</a>
              <a href="#process" className="btn btn-ghost" data-magnetic>See it run</a>
            </div>
          </div>
          <div className="hm-orb-zone" role="img" aria-label="Interactive 3D instrument core. Drag to rotate it." />
          <p className="hm-hint hud" aria-hidden="true">Drag the instrument to turn it</p>
        </section>

        {/* ============ Marquee ============ */}
        <div className="hm-marquee stage" aria-label="Trusted by research teams">
          <ul className="hm-marquee-track animate-marquee">
            {[...LABS, ...LABS].map((name, i) => (
              <li key={i} aria-hidden={i >= LABS.length ? true : undefined}>{name}</li>
            ))}
          </ul>
        </div>

        {/* ============ Features ============ */}
        <section id="features" className="hm-section stage">
          <div className="hm-head" data-reveal>
            <p className="text-eyebrow uppercase text-accent-ink">The platform</p>
            <h2 className="font-display text-display-lg">One notebook. Every instrument.</h2>
            <p className="text-lead text-muted max-w-measure">
              Everything your lab needs to plan, run and prove an experiment, without stitching six tools together.
            </p>
          </div>

          <div className="hm-bento">
            <article className="hm-tile hm-tile-a t3d persp-mid" data-tilt data-reveal>
              <div>
                <p className="hud text-accent-ink">Protocols</p>
                <h3 className="mt-3 max-w-tight">Protocols that write themselves</h3>
                <p className="mt-3">Describe the assay once. Assay drafts the plan, checks it against what each instrument can do, and keeps a live log as it runs.</p>
              </div>
              <ul className="hm-log hud" aria-label="Example run log">
                <li><span className="dot" aria-hidden="true" />Plate 04 · read complete<time>00:41</time></li>
                <li><span className="dot" data-s="run" aria-hidden="true" />Handler B · dispensing 20 µL<time>live</time></li>
                <li><span className="dot" data-s="wait" aria-hidden="true" />Incubate · 37 °C<time>queued</time></li>
              </ul>
            </article>

            <article className="hm-tile hm-tile-b t3d persp-mid" data-tilt data-reveal>
              <p className="hud text-muted">Latency</p>
              <div className="hm-big-num"><span>38</span><small>ms</small></div>
              <p>Median query time across every connected instrument.</p>
            </article>

            <article className="hm-tile hm-tile-c t3d persp-mid" data-tilt data-reveal>
              <div>
                <h3>Instrument-aware agents</h3>
                <p className="mt-2">Prebuilt for the gear you already own.</p>
              </div>
              <div className="hm-chips">
                {INSTRUMENTS.map((n) => <span key={n} className="chip">{n}</span>)}
              </div>
            </article>

            <article className="hm-tile hm-tile-d t3d persp-mid" data-tilt data-reveal>
              <div>
                <h3>Audit-ready by default</h3>
                <p className="mt-2">Every run is signed, timestamped and reproducible. Your data never trains a model.</p>
              </div>
              <span className="chip self-start">Signed run records</span>
            </article>

            <article className="hm-tile hm-tile-e t3d persp-mid" data-tilt data-reveal>
              <div>
                <h3>Plugs into your stack</h3>
                <p className="mt-2">Send results where your team already works.</p>
              </div>
              <div className="hm-chips">
                {INTEGRATIONS.map((n) => <span key={n} className="chip">{n}</span>)}
                <span className="chip">+112 more</span>
              </div>
            </article>
          </div>
        </section>

        {/* ============ Process (sticky, scroll-driven) ============ */}
        <section id="process" className="hm-process stage">
          <div className="hm-process-sticky">
            <div className="hm-head">
              <p className="text-eyebrow uppercase text-accent-ink">How it works</p>
              <h2 className="font-display text-display-lg">From question to signed result.</h2>
            </div>
            <div className="hm-steps-wrap" style={{ "--p": 0 } as CSSProperties}>
              <div className="hm-rail" aria-hidden="true"><i /></div>
              <ol className="hm-steps">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="hm-step" data-active={i === 0 ? "" : undefined}>
                    <span className="hm-step-n">{s.n}</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============ Stats ============ */}
        <section id="stats" className="hm-section stage">
          <div className="hm-stats-wrap">
            <div className="hm-head" data-reveal>
              <p className="text-eyebrow uppercase text-accent-ink">Results</p>
              <h2 className="font-display text-display-lg">Results that compound.</h2>
            </div>
            <dl className="hm-stats">
              {STATS.map((s) => (
                <div key={s.label} className="hm-stat" data-reveal>
                  <dt>{s.label}</dt>
                  <dd>
                    <span data-count={s.value} data-decimals={s.decimals}>{s.value.toFixed(s.decimals)}</span>
                    {s.unit && <span className="hm-unit">{s.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section id="cta" className="hm-cta stage">
          <div className="hm-cta-inner" data-reveal>
            <h2 className="font-display text-display-xl">Ready to run your first protocol?</h2>
            <p className="text-lead text-muted max-w-tight">Free for 14 days. No credit card, no setup call.</p>
            <div className="hm-actions">
              <a href="#" className="btn btn-primary" data-magnetic>Start free</a>
              <a href="#" className="btn btn-ghost" data-magnetic>Book a demo</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="hm-foot stage">
        <span>© 2026 Assay Labs</span>
        <span className="hud">Drag the instrument to turn it</span>
      </footer>
    </div>
  );
}
