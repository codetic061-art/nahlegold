/**
 * honey-scenes.js — Scoped Real-Time 3D Scenes Only:
 *  1) Metal Drum Tap Continuous Liquid Honey Pour (#pourCanvas) + optional 3D Bee
 *  2) Improved Stage 05 Clear Glass Honey Jar (#jarCanvas) + Proportional Pour
 *     Stream Connection + Enter-the-Honey Caustic Dive Portal
 *
 * Notice: No 3D opening hero and NO 3D winding path tube (the winding path is 100% 2D SVG).
 */
import * as THREE from './vendor/three.module.min.js';
import {
  createLiquidHoneyMaterial,
  createCausticPortalMaterial,
} from './honey-shaders.js';
import {
  createHoneyEnvironment,
  createHoneyJar,
  createContinuousPourGeometry,
  createHoneybee,
} from './honey-assets.js';

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 840px)');

/* =====================================================================
   SCENE 1 — METAL HONEY DRUM TAP POURING INTO 2D CHANNEL OPENING
   ===================================================================== */
function initPourScene() {
  const board = document.getElementById('journeyBoard');
  const pourZone = document.getElementById('journeyPour');
  const canvas = document.getElementById('pourCanvas');
  const tankImg = document.getElementById('honeyTankImg');
  const inletMarker = document.getElementById('journeyInletMarker');
  if (!board || !pourZone || !canvas || !tankImg || !inletMarker) return;

  if (reducedQuery.matches) {
    board.classList.add('is-pour-fallback');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    board.classList.add('is-pour-fallback');
    return;
  }

  const isMobile = mobileQuery.matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1.5, 0.1, 40);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight('#FFF8E4', '#94622A', 1.0));
  const key = new THREE.DirectionalLight('#FFF5D8', 2.4);
  key.position.set(4, 6, 6);
  scene.add(key);

  const pourMat = createLiquidHoneyMaterial({ animatedFlow: true });
  const pourGeo = createContinuousPourGeometry({
    topRadius: 0.088,
    midRadius: 0.062,
    botRadius: 0.11,
    height: 1.0,
    radialSegments: 22,
    heightSegments: 36,
  });
  const pourMesh = new THREE.Mesh(pourGeo, pourMat);
  scene.add(pourMesh);

  // Glossy contact bulge right at top opening of the 2D black-outlined collector
  const capMat = createLiquidHoneyMaterial();
  const capGeo = new THREE.SphereGeometry(0.145, 18, 12);
  capGeo.scale(1.15, 0.38, 0.9);
  const impactCap = new THREE.Mesh(capGeo, capMat);
  scene.add(impactCap);

  // Subtle single optional 3D honeybee gently hovering near the honey tap
  const bee = createHoneybee();
  bee.scale.setScalar(isMobile ? 0.85 : 1.05);
  scene.add(bee);

  function screenToWorldAtZ0(pxX, pxY, w, h) {
    const ndcX = (pxX / w) * 2 - 1;
    const ndcY = -(pxY / h) * 2 + 1;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
    const halfW = halfH * (w / h);
    return { x: ndcX * halfW, y: ndcY * halfH };
  }

  let worldSpanScale = 1.0;

  function syncLayout() {
    const zoneRect = pourZone.getBoundingClientRect();
    const tankRect = tankImg.getBoundingClientRect();
    const inletRect = inletMarker.getBoundingClientRect();
    const w = Math.max(120, Math.round(zoneRect.width));
    const h = Math.max(120, Math.round(zoneRect.height));

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    // Chrome dispensing tap exact coordinates measured from honey-tank-tap.jpg (cx=0.732, y=0.852)
    const spoutScreenX = tankRect.left + tankRect.width * 0.732 - zoneRect.left;
    const spoutScreenY = tankRect.top + tankRect.height * 0.852 - zoneRect.top;
    const inletScreenX = inletRect.left + inletRect.width * 0.5 - zoneRect.left;
    const inletScreenY = inletRect.top + 6 - zoneRect.top;

    // Keep inlet marker horizontally locked right under chrome nozzle!
    const offsetPct = ((spoutScreenX / w) * 100).toFixed(2);
    inletMarker.style.left = `${offsetPct}%`;

    const topW = screenToWorldAtZ0(spoutScreenX, spoutScreenY, w, h);
    const botW = screenToWorldAtZ0(inletScreenX, inletScreenY, w, h);

    const dropHeight = Math.max(0.4, topW.y - botW.y);
    worldSpanScale = dropHeight;

    pourMesh.position.set(topW.x, botW.y, 0);
    // Stream scales Y from 0 to dropHeight cleanly; radius matches ~15px chrome tap opening
    const rxScale = isMobile ? 0.96 : 1.12;
    pourMesh.scale.set(rxScale, dropHeight, rxScale);

    impactCap.position.set(topW.x, botW.y + 0.02, 0.04);

    // Trigger SVG rebuild cleanly via custom event so syncLayout never recurses on resize
    window.dispatchEvent(new CustomEvent('honey:rebuild-path'));
  }

  let isVisible = true;
  const visObs = new IntersectionObserver(
    (entries) => { isVisible = entries[0]?.isIntersecting ?? true; },
    { rootMargin: '80px 0px 80px 0px' }
  );
  visObs.observe(pourZone);

  if (window.ResizeObserver) {
    new ResizeObserver(syncLayout).observe(pourZone);
  }
  window.addEventListener('resize', syncLayout);
  if (tankImg.complete) syncLayout();
  else tankImg.addEventListener('load', syncLayout, { once: true });

  const clock = new THREE.Clock();
  let rafId = 0;

  function renderPour() {
    rafId = requestAnimationFrame(renderPour);
    if (!isVisible || document.hidden) return;
    clock.getDelta();
    const t = clock.elapsedTime;

    pourMat.uniforms.uTime.value = t;
    capMat.uniforms.uTime.value = t;

    // Subtle organic liquid meniscus pulsing at inlet collector
    const pulse = 1.0 + Math.sin(t * 4.2) * 0.07;
    impactCap.scale.set(pulse * 1.15, 0.36, pulse * 0.9);

    // Optional delicate single honeybee hovering beside the honey stream
    const baseBeeX = pourMesh.position.x + (isMobile ? -0.95 : 1.15);
    const baseBeeY = pourMesh.position.y + worldSpanScale * 0.48;
    bee.position.set(
      baseBeeX + Math.sin(t * 1.35) * 0.22,
      baseBeeY + Math.cos(t * 1.9) * 0.14,
      0.45 + Math.cos(t * 1.1) * 0.16
    );
    bee.rotation.y = isMobile ? 0.6 : -0.75 + Math.sin(t * 0.9) * 0.22;
    bee.rotation.z = Math.sin(t * 2.1) * 0.09;
    const flap = Math.sin(t * 32.0) * 0.62;
    bee.userData.leftWing.rotation.z = 0.58 + flap;
    bee.userData.rightWing.rotation.z = -0.58 - flap;

    renderer.render(scene, camera);
  }

  renderPour();

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    visObs.disconnect();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    renderer.dispose();
  });
}

/* =====================================================================
   SCENE 2 — STAGE 05 CRYSTAL GLASS JAR + PROPORTIONAL STREAM + DIVE PORTAL
   ===================================================================== */
function initJarFinaleScene() {
  const wrap = document.getElementById('jarFinaleWrap');
  const stage = document.getElementById('jarStage');
  const canvas = document.getElementById('jarCanvas');
  const portalVeil = document.getElementById('jarPortalVeil');
  const cue = document.getElementById('journeyFinaleCue');
  if (!wrap || !stage || !canvas) return;

  if (reducedQuery.matches) {
    wrap.classList.add('is-jar-fallback');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    wrap.classList.add('is-jar-fallback');
    return;
  }

  const isMobile = mobileQuery.matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const envTex = createHoneyEnvironment(renderer);
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(36, 1.0, 0.1, 40);
  camera.position.set(0, 0.42, 6.2);

  scene.add(new THREE.HemisphereLight('#FFFFFF', '#5A4A38', 0.85));
  const key = new THREE.DirectionalLight('#FFFFFF', 2.45);
  key.position.set(5, 7, 6);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#FFE5AA', 1.65);
  rim.position.set(-6, 3, -4);
  scene.add(rim);

  // Crystal-Clear Improved Final Jar framed cleanly inside #jarCanvas on #FFFFFF White
  const jar = createHoneyJar({ isMobile, initialFill: 0.26 });
  jar.group.scale.setScalar(isMobile ? 0.84 : 0.92);
  jar.group.position.set(0, -0.24, 0);
  jar.group.rotation.y = -0.10;
  // Brushed gold lid centered locally; tucked cleanly upper-right clear of central honey stream
  const lidRestX = isMobile ? 0.80 : 0.84;
  const lidRestY = isMobile ? 1.24 : 1.28;
  jar.lidGroup.position.set(lidRestX, lidRestY, -0.34);
  jar.lidGroup.rotation.set(0.24, 0.0, -0.36);
  scene.add(jar.group);

  // Slim Continuous 3D Pouring Honey Stream emerging at exact top center (~9.5px wide matching 9px 2D nozzle!)
  const streamMat = createLiquidHoneyMaterial({ animatedFlow: true });
  const streamGeo = createContinuousPourGeometry({
    topRadius: 0.028,
    midRadius: 0.023,
    botRadius: 0.034,
    height: 1.0,
    radialSegments: 20,
    heightSegments: 32,
  });
  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  scene.add(streamMesh);

  let scrollTarget = 0;
  let scrollSmooth = 0;
  let pointerX = 0;
  let pointerSmoothX = 0;
  let isVisible = false;

  function getNavH() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 74;
  }

  function computeScrollProgress() {
    const r = wrap.getBoundingClientRect();
    const navH = getNavH();
    const totalPin = Math.max(1, wrap.offsetHeight - stage.offsetHeight);
    if (r.top > navH) {
      // Pre-sticky entry: crystal jar calmly showcases filling from 0 -> 0.44 before sticky pin engages
      const preSpan = Math.max(160, window.innerHeight * 0.85 - navH);
      scrollTarget = THREE.MathUtils.clamp((window.innerHeight * 0.85 - r.top) / preSpan, 0, 1) * 0.44;
    } else {
      // Sticky showcase (0.44 -> 0.68 fill completion, then 0.70 -> 1.00 Enter-the-Honey dive & reveal!)
      const pinFrac = THREE.MathUtils.clamp((navH - r.top) / totalPin, 0, 1);
      scrollTarget = 0.44 + pinFrac * 0.56;
    }
  }

  window.addEventListener('scroll', computeScrollProgress, { passive: true });
  if (!isMobile) {
    window.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });
  }

  function resize() {
    const w = Math.max(160, stage.clientWidth);
    const h = Math.max(200, stage.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    computeScrollProgress();
  }
  resize();
  scrollSmooth = scrollTarget;
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

  const visObs = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
      if (!isVisible) {
        if (portalVeil) portalVeil.style.opacity = '0';
        canvas.style.opacity = scrollSmooth > 0.88 ? '0' : '1';
      }
    },
    { rootMargin: '60px 0px 60px 0px' }
  );
  visObs.observe(wrap);

  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  let rafId = 0;

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!isVisible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (Math.abs(scrollTarget - scrollSmooth) > 0.25) {
      scrollSmooth = scrollTarget;
    } else {
      scrollSmooth += (scrollTarget - scrollSmooth) * Math.min(1, dt * 14.0);
    }
    pointerSmoothX += (pointerX - pointerSmoothX) * Math.min(1, dt * 5.0);
    const s = THREE.MathUtils.clamp(scrollSmooth, 0, 1);

    // Phase A (s: 0.00 -> 0.68): Crystal-clear glass jar showcases pouring ribbon & rising amber fill
    // Phase B (s: 0.68 -> 1.00): Camera rises above threaded neck rim & dives smoothly through golden portal
    const fillFrac = THREE.MathUtils.smoothstep(s, 0.02, 0.64);
    const jarFill = THREE.MathUtils.lerp(0.28, 0.94, fillFrac);
    const divePrep = THREE.MathUtils.smoothstep(s, 0.66, 0.80);
    const diveFull = THREE.MathUtils.smoothstep(s, 0.72, 0.98);

    const jarScale = jar.group.scale.y;
    const jarY = jar.group.position.y;
    jar.updateFill(jarFill, 0.55 + (1 - diveFull) * 0.45, t, diveFull < 0.7);
    jar.group.rotation.y = -0.10 + fillFrac * 0.14 + pointerSmoothX * 0.08 * (1 - diveFull);

    // Lifted brushed-gold lid glides neatly upward clear during dive
    jar.lidGroup.position.set(lidRestX + divePrep * 0.7, lidRestY + divePrep * 1.15, -0.34);
    jar.lidGroup.rotation.z = -0.36 - divePrep * 0.35;

    // Position slim 3D pouring ribbon from EXACT top center of viewport canvas down to rising honey surfaceY!
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
    const streamTopY = Math.max(1.85, camera.position.y + halfH + 0.08);
    const surfaceWorldY = jarY + jar.getSurfaceY() * jarScale;
    const streamHeight = Math.max(0.2, streamTopY - surfaceWorldY);

    streamMat.uniforms.uTime.value = t;
    streamMesh.visible = divePrep < 0.72;
    if (streamMesh.visible) {
      streamMesh.position.set(0, surfaceWorldY, 0);
      streamMesh.scale.set(1, streamHeight, 1);
    }

    // Camera choreography: crisp full-jar framing -> dive smoothly into jar mouth
    const baseCamZ = isMobile ? 6.75 : 5.98;
    if (s <= 0.68) {
      const p = s / 0.68;
      camPos.set(pointerSmoothX * 0.14, THREE.MathUtils.lerp(0.22, 0.36, p), baseCamZ);
      camLook.set(0, THREE.MathUtils.lerp(-0.14, -0.02, p), 0);
      camera.fov = isMobile ? 39 : 36;
    } else if (s <= 0.84) {
      const u = THREE.MathUtils.smoothstep(s, 0.68, 0.84);
      camPos.set(
        THREE.MathUtils.lerp(pointerSmoothX * 0.14, 0, u),
        THREE.MathUtils.lerp(0.36, 1.36, u),
        THREE.MathUtils.lerp(baseCamZ, 1.30, u)
      );
      camLook.set(0, THREE.MathUtils.lerp(-0.02, 0.16, u), 0);
      camera.fov = THREE.MathUtils.lerp(isMobile ? 39 : 36, 48, u);
    } else {
      const u = THREE.MathUtils.smoothstep(s, 0.84, 1.0);
      camPos.set(0, THREE.MathUtils.lerp(1.36, -0.35, u), THREE.MathUtils.lerp(1.30, 0.04, u));
      camLook.set(0, THREE.MathUtils.lerp(0.16, -2.0, u), 0);
      camera.fov = THREE.MathUtils.lerp(48, 66, u);
    }

    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.updateProjectionMatrix();

    // Fade canvas out seamlessly as Enter-the-Honey portal veil blooms full-screen (ZERO square rectangle!)
    const canvasFade = 1.0 - THREE.MathUtils.smoothstep(s, 0.72, 0.86);
    canvas.style.opacity = canvasFade.toFixed(3);

    if (portalVeil) {
      const veilAlpha = THREE.MathUtils.smoothstep(s, 0.70, 0.84) * (1.0 - THREE.MathUtils.smoothstep(s, 0.93, 1.0));
      portalVeil.style.opacity = (veilAlpha * 0.96).toFixed(3);
    }

    if (cue) {
      const cueFade = 1.0 - THREE.MathUtils.smoothstep(s, 0.64, 0.78);
      cue.style.opacity = cueFade.toFixed(2);
    }

    renderer.render(scene, camera);
  }

  tick();

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    visObs.disconnect();
    window.removeEventListener('resize', resize);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    envTex.dispose();
    renderer.dispose();
  });
}

initPourScene();
initJarFinaleScene();
