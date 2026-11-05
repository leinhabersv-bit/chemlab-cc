"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { palette, scene as sceneTokens } from "../../../tokens";

export function LumenOrbScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      renderer.toneMappingExposure = 1.25;
    } catch {
      setWebglSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6.8);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x0e1014, 2.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      sceneTokens.dark.key, // #f59e0b amber
      3.5
    );
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      sceneTokens.dark.rim, // #38bdf8 sky
      4.0
    );
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // ── Hero Object: The Glowing Deforming Orb ──
    const orbGroup = new THREE.Group();
    orbGroup.position.set(1.5, 0, 0); // Positioned off-center right on desktop
    scene.add(orbGroup);

    // GLSL Vertex & Fragment Shaders for the Orb
    const vertexShader = `
      uniform float uTime;
      uniform float uDistort;
      uniform float uSpeed;
      uniform vec3 uPointer;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDistort;

      // Classic Perlin 3D Noise
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        float noiseVal = snoise(position * 1.5 + uTime * uSpeed);
        vDistort = noiseVal;
        
        // Pointer attraction bulge
        float d = distance(position, uPointer);
        float bulge = smoothstep(2.5, 0.0, d) * 0.25;
        
        vec3 newPos = position + normal * (noiseVal * uDistort + bulge);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uGlow;
      uniform float uPulse;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDistort;

      void main() {
        // Fresnel rim effect
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
        
        // Gradient interpolation based on noise distortion
        vec3 baseColor = mix(uColorA, uColorB, vDistort * 0.5 + 0.5);
        vec3 glowColor = mix(baseColor, vec3(1.0, 0.9, 0.6), fresnel * uGlow);
        
        // Subtle pulse modulation
        glowColor += vec3(0.15, 0.08, 0.02) * uPulse;
        
        gl_FragColor = vec4(glowColor, 0.92);
      }
    `;

    const orbUniforms = {
      uTime: { value: 0 },
      uDistort: { value: 0.32 },
      uSpeed: { value: 0.35 },
      uGlow: { value: 0.75 },
      uPulse: { value: 0 },
      uColorA: { value: new THREE.Color(palette.instrument.amber) }, // Amber
      uColorB: { value: new THREE.Color(palette.instrument.sky) },   // Sky blue
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
    };

    const orbGeo = new THREE.IcosahedronGeometry(1.4, 64);
    const orbMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: orbUniforms,
      transparent: true,
      wireframe: false,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbGroup.add(orbMesh);

    // ── Support Layer 1: Atmospheric Back-Glow Halo ──
    const haloGeo = new THREE.SphereGeometry(1.65, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    orbGroup.add(haloMesh);

    // ── Support Layer 2: Orbiting Particle Halo (1.8k particles) ──
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = radius * Math.cos(phi);

      const isAmber = Math.random() > 0.45;
      particleColors[i * 3] = isAmber ? 0.96 : 0.22;
      particleColors[i * 3 + 1] = isAmber ? 0.62 : 0.74;
      particleColors[i * 3 + 2] = isAmber ? 0.07 : 0.97;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    orbGroup.add(particles);

    // ── Support Layer 3: Thin Orbit Rings ──
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.015, 12, 64), ringMat);
    ring1.rotation.x = Math.PI / 3;
    orbGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.015, 12, 64), ringMat);
    ring2.rotation.y = Math.PI / 2.5;
    orbGroup.add(ring2);

    // ── Resize Handling ──
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);

      // Adapt orb position based on viewport
      if (w < 900) {
        orbGroup.position.set(0, 0.6, 0); // Centered upper half on mobile
      } else {
        orbGroup.position.set(1.5, 0, 0); // Off-center right on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // ── Pointer Drag with Inertia & Damping ──
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0.004;
    let velY = 0.002;
    let mouseX = 0;
    let mouseY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      setHasInteracted(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Project pointer into orb local coordinates for vertex attraction
      orbUniforms.uPointer.value.set(mouseX * 2.0, mouseY * 2.0, 1.0);

      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      velX = dx * 0.005;
      velY = dy * 0.005;
      orbGroup.rotation.y += velX;
      orbGroup.rotation.x += velY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ── Scroll-Scrubbed Choreography ──
    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Render Loop ──
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      orbUniforms.uTime.value = elapsed;

      // Inertia decay
      if (!isDragging) {
        velX *= 0.96;
        velY *= 0.96;
        orbGroup.rotation.y += velX + 0.003;
        orbGroup.rotation.x += velY + 0.001;
      }

      // Parallax camera easing
      camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.35 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Scroll-driven state transition
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = totalH > 0 ? Math.min(1, Math.max(0, scrollY / totalH)) : 0;

      // Master choreography:
      // Hero (0): normal size, gentle distort
      // How it works (0.35 - 0.6): contracts into core, orbit rings speed up
      // CTA (0.8 - 1.0): expands, brightens, rim peaks
      const targetScale = 1.0 - Math.sin(scrollProgress * Math.PI) * 0.25 + (scrollProgress > 0.8 ? (scrollProgress - 0.8) * 1.5 : 0);
      orbMesh.scale.set(targetScale, targetScale, targetScale);
      orbUniforms.uDistort.value = 0.32 + scrollProgress * 0.25;
      orbUniforms.uGlow.value = 0.75 + (scrollProgress > 0.8 ? 0.6 : 0);

      // Counter-rotate particles and rings
      particles.rotation.y -= 0.001;
      ring1.rotation.z += 0.002;
      ring2.rotation.x += 0.0015;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("scroll", onScroll);

      renderer.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-auto -z-10 block"
        style={{ touchAction: "none" }}
        aria-label="Interactive 3D Intelligence Orb background"
      />

      {/* Floating Drag Hint Pill */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-none transition-opacity duration-700">
        <div
          className={`px-3 py-1.5 rounded-full bg-bench-900/80 border border-bench-700/60 backdrop-blur-md flex items-center gap-2 ${
            hasInteracted ? "opacity-25" : "opacity-90"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-instrument-amber animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">
            Drag the orb to spin it ⟳
          </span>
        </div>
      </div>

      {!webglSupported && (
        <div className="fixed inset-0 -z-10 bg-radial-gradient from-bench-900 to-bench-950 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/20 to-sky-500/20 blur-3xl" />
        </div>
      )}
    </>
  );
}

