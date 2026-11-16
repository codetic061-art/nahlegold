/**
 * honey-world.js — Real-time 3D Honey Experience & Scroll Choreography
 * Connects: Hero (Jar + Wooden Dipper + Dripping Honey) -> 5-Stage Winding Honey Stream
 *           -> Final Jar Filling -> Enter the Honey Jar Portal -> Products Section.
 */
import * as THREE from './vendor/three.module.min.js';
import {
  createHoneyStreamMaterial,
  createPathGuideMaterial,
  createLiquidHoneyMaterial,
  createCausticPortalMaterial,
} from './honey-shaders.js';
import {
  createHoneyEnvironment,
  createHoneyJar,
  createHoneyDipper,
  createStage01FloraAndBees,
  createHoneycombStage,
  createHarvestStage,
} from './honey-assets.js';

(function initHoneyWorld() {
  const wrap = document.getElementById('experienceWrap');
  const canvas = document.getElementById('honeyWorldCanvas');
  const portalVeil = document.getElementById('portalVeil');
  const finaleCue = document.querySelector('.journey-finale__cue');
  if (!wrap || !canvas) return;

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  if (reducedQuery.matches) {
    wrap.classList.add('is-static-fallback');
    window.dispatchEvent(new CustomEvent('honey:fallback', { detail: { reason: 'reduced-motion' } }));
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
  } catch (err) {
    wrap.classList.add('is-static-fallback');
    window.dispatchEvent(new CustomEvent('honey:fallback', { detail: { reason: 'no-webgl' } }));
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

  const camera = new THREE.PerspectiveCamera(isMobile ? 46 : 40, 16 / 9, 0.1, 80);
  camera.position.set(0, 0.15, isMobile ? 7.4 : 6.2);

  // Studio warm lighting
  const hemiLight = new THREE.HemisphereLight('#FFF8E6', '#A0692E', 0.90);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight('#FFF3D4', 2.45);
  keyLight.position.set(5, 7, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight('#F4B44A', 1.65);
  rimLight.position.set(-6, 2, -4);
  scene.add(rimLight);

  const warmPoint = new THREE.PointLight('#F7BD4E', 2.2, 24, 1.4);
  warmPoint.position.set(2, 1, 3);
  scene.add(warmPoint);

  /* ==============================================================
     1. HERO ASSETS (Right-side Jar + Tilted Wooden Dipper + Live Drip)
     ============================================================== */
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  const heroJar = createHoneyJar({ isMobile, initialFill: 0.88 });
  heroJar.group.scale.setScalar(isMobile ? 0.64 : 1.06);
  heroJar.group.position.set(isMobile ? 0.50 : 2.10, isMobile ? 0.95 : -0.34, 0.12);
  heroJar.group.rotation.y = -0.14;
  heroGroup.add(heroJar.group);

  const dipper = createHoneyDipper();
  dipper.group.scale.setScalar(isMobile ? 0.64 : 0.98);
  dipper.group.position.set(isMobile ? -0.32 : 1.18, isMobile ? 1.88 : 1.48, 0.78);
  dipper.group.rotation.set(0.12, -0.18, -0.68);
  heroGroup.add(dipper.group);

  // Exact world-space emitter anchored inside lowest gravitational belly of the tilted glaze bulb
  const dipperTipMarker = new THREE.Object3D();
  dipperTipMarker.position.set(0.095, -0.48, 0.02);
  dipper.group.add(dipperTipMarker);
  dipper.group.updateMatrixWorld(true);
  const initialTipWorld = new THREE.Vector3();
  dipperTipMarker.getWorldPosition(initialTipWorld);

  // Optical amber-gold materials for Hero drip, teardrop & pool
  const dripMat = createLiquidHoneyMaterial();
  const puddleMat = createLiquidHoneyMaterial();
  puddleMat.uniforms.uCoreColor.value.set('#7A2C02');
  puddleMat.uniforms.uMidColor.value.set('#C96608');
  puddleMat.uniforms.uGoldColor.value.set('#EEA428');

  // Dynamic stretching catenoid meniscus filament tucked smoothly inside the honey bulb
  const neckProfile = [
    new THREE.Vector2(0.044, 0.10),
    new THREE.Vector2(0.036, 0.02),
    new THREE.Vector2(0.022, -0.18),
    new THREE.Vector2(0.012, -0.52),
    new THREE.Vector2(0.014, -0.78),
    new THREE.Vector2(0.030, -0.94),
    new THREE.Vector2(0.046, -1.00),
  ];
  const dripNeckGeo = new THREE.LatheGeometry(neckProfile.reverse(), 24);
  const dripNeck = new THREE.Mesh(dripNeckGeo, dripMat);
  heroGroup.add(dripNeck);

  // Falling viscous teardrop
  const dropProfile = [
    new THREE.Vector2(0.0, 0.14),
    new THREE.Vector2(0.036, 0.08),
    new THREE.Vector2(0.066, 0.01),
    new THREE.Vector2(0.072, -0.045),
    new THREE.Vector2(0.052, -0.095),
    new THREE.Vector2(0.0, -0.115),
  ];
  const dropGeo = new THREE.LatheGeometry(dropProfile.reverse(), 24);
  const fallingDrop = new THREE.Mesh(dropGeo, dripMat);
  heroGroup.add(fallingDrop);

  // Sculpted thick domed golden honey pool resting beside the Hero jar base
  const puddleProfile = [
    new THREE.Vector2(0.0, 0.082),
    new THREE.Vector2(0.20, 0.074),
    new THREE.Vector2(0.46, 0.062),
    new THREE.Vector2(0.70, 0.046),
    new THREE.Vector2(0.84, 0.024),
    new THREE.Vector2(0.86, 0.0),
    new THREE.Vector2(0.0, 0.0),
  ];
  const puddleGeo = new THREE.LatheGeometry(puddleProfile.reverse(), 36);
  const puddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
  puddleMesh.position.set(initialTipWorld.x + (isMobile ? 0.02 : 0.08), isMobile ? 0.24 : -1.50, 0.60);
  puddleMesh.scale.set(isMobile ? 0.56 : 1.04, 1, isMobile ? 0.48 : 0.80);
  heroGroup.add(puddleMesh);

  /* ==============================================================
     2. CONTINUOUS WINDING 3D HONEY STREAM (CatmullRomCurve3 + Custom Tube)
     ============================================================== */
  const pathPoints = isMobile
    ? [
        new THREE.Vector3(initialTipWorld.x, initialTipWorld.y, initialTipWorld.z),
        new THREE.Vector3(-0.25, -1.7, 0.68),
        new THREE.Vector3(-0.85, -4.4, 0.45),
        new THREE.Vector3(-0.95, -6.7, 0.60),   // Stage 01: Flowers & Bees
        new THREE.Vector3(0.25, -9.8, 0.25),
        new THREE.Vector3(1.05, -12.8, 0.65),   // Stage 02: Honeycomb & Curl
        new THREE.Vector3(0.45, -14.2, 1.25),   // Organic loop front
        new THREE.Vector3(-0.35, -13.1, 0.20),  // Organic loop back
        new THREE.Vector3(0.80, -16.2, 0.50),
        new THREE.Vector3(-0.95, -20.2, 0.62),  // Stage 03: Honey making
        new THREE.Vector3(0.35, -23.6, 0.22),
        new THREE.Vector3(0.95, -27.2, 0.42),   // Stage 04: Harvest
        new THREE.Vector3(-0.15, -30.5, 0.50),
        new THREE.Vector3(0.0, -32.2, 0.52),    // Arcs over Stage 05 jar mouth
        new THREE.Vector3(0.0, -35.4, 0.52),    // Submerges deeply into Stage 05 honey pool
      ]
    : [
        new THREE.Vector3(initialTipWorld.x, initialTipWorld.y, initialTipWorld.z), // Launches right off Hero dipper tip!
        new THREE.Vector3(0.65, -1.85, 0.72),
        new THREE.Vector3(-0.55, -4.0, 0.45),
        new THREE.Vector3(-1.85, -6.5, 0.75),   // Stage 01: Left-side sweep around wildflowers & bees
        new THREE.Vector3(-1.05, -9.9, 0.15),
        new THREE.Vector3(1.75, -12.5, 0.50),   // Stage 02: Right-side sweep around honeycomb
        new THREE.Vector3(2.55, -13.9, 1.25),   // Signature 3D organic loop (front)
        new THREE.Vector3(1.42, -14.5, -0.35),  // Signature 3D loop (back curl, clear of left card)
        new THREE.Vector3(0.85, -12.9, 0.55),   // Loop crossover
        new THREE.Vector3(-0.75, -16.8, 0.35),
        new THREE.Vector3(-2.05, -20.4, 0.80),  // Stage 03: Left-side honey transformation
        new THREE.Vector3(-0.10, -24.0, 0.12),
        new THREE.Vector3(1.75, -27.4, 0.45),   // Stage 04: Right-side apiary harvest frame
        new THREE.Vector3(1.25, -30.7, 0.55),
        new THREE.Vector3(0.62, -32.4, 0.52),   // Arcs gracefully above final Stage 05 jar mouth (x=0.62)
        new THREE.Vector3(0.62, -35.4, 0.52),   // Plunges continuously inside the Stage 05 jar liquid
      ];

  const honeyCurve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.48);

  function buildProgressiveTubeGeometry(curve, tubularSegments, radius, radialSegments) {
    const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    const count = geo.attributes.position.count;
    const expected = (tubularSegments + 1) * (radialSegments + 1);
    const curveT = new Float32Array(count);
    const centers = new Float32Array(count * 3);

    const sampledCenters = [];
    for (let i = 0; i <= tubularSegments; i++) {
      sampledCenters.push(curve.getPointAt(i / tubularSegments));
    }

    if (count === expected) {
      for (let i = 0; i <= tubularSegments; i++) {
        const tVal = i / tubularSegments;
        const c = sampledCenters[i];
        for (let j = 0; j <= radialSegments; j++) {
          const idx = i * (radialSegments + 1) + j;
          curveT[idx] = tVal;
          centers[idx * 3] = c.x;
          centers[idx * 3 + 1] = c.y;
          centers[idx * 3 + 2] = c.z;
        }
      }
    }
    geo.setAttribute('aCurveT', new THREE.BufferAttribute(curveT, 1));
    geo.setAttribute('aCenter', new THREE.BufferAttribute(centers, 3));
    return geo;
  }

  const tubSegs = isMobile ? 220 : 380;
  const radSegs = isMobile ? 12 : 20;
  const streamGeo = buildProgressiveTubeGeometry(honeyCurve, tubSegs, isMobile ? 0.13 : 0.165, radSegs);
  const streamMat = createHoneyStreamMaterial();
  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  streamMesh.frustumCulled = false;
  scene.add(streamMesh);

  // Subtle translucent trace filament showing the upcoming curve path (Reference Image B cue)
  const guideGeo = buildProgressiveTubeGeometry(honeyCurve, isMobile ? 160 : 240, 0.042, 8);
  const guideMat = createPathGuideMaterial();
  guideMat.uniforms.uOpacity.value = 0.12;
  const guideMesh = new THREE.Mesh(guideGeo, guideMat);
  guideMesh.frustumCulled = false;
  scene.add(guideMesh);

  /* ==============================================================
     3. STORYTELLING STAGE 3D WORLDS (01 -> 05)
     Each stage sits opposite its HTML card side for clear desktop framing.
     ============================================================== */
  // Stage 01 (HTML card right -> Flowers & Bees left-center)
  const stage01 = createStage01FloraAndBees({ isMobile });
  stage01.group.position.set(isMobile ? 0.0 : -1.45, -6.5, 0.25);
  scene.add(stage01.group);

  // Stage 02 (HTML card left -> Honeycomb right-center)
  const stage02 = createHoneycombStage({ isMobile });
  stage02.group.position.set(isMobile ? 0.0 : 1.72, -13.5, 0.15);
  stage02.group.rotation.set(0.10, -0.26, 0.08);
  scene.add(stage02.group);

  // Stage 03 (HTML card right -> Honeycomb transformation left-center)
  const stage03 = createHoneycombStage({ isMobile });
  stage03.group.scale.setScalar(0.94);
  stage03.group.position.set(isMobile ? 0.0 : -1.92, -20.5, 0.35);
  stage03.group.rotation.set(-0.08, 0.28, -0.12);
  scene.add(stage03.group);

  // Stage 04 (HTML card left -> Wooden Harvest Frame right-center)
  const stage04 = createHarvestStage();
  stage04.group.scale.setScalar(isMobile ? 0.76 : 0.94);
  stage04.group.position.set(isMobile ? 0.0 : 1.55, -27.4, 0.25);
  stage04.group.rotation.y = -0.24;
  scene.add(stage04.group);

  // Stage 05: Final Branded Jar (placed cleanly right of left edge card on desktop, centered on mobile)
  const finalJarX = isMobile ? 0.0 : 0.62;
  const finalJar = createHoneyJar({ isMobile, initialFill: 0.08 });
  finalJar.group.scale.setScalar(isMobile ? 1.0 : 1.20);
  finalJar.group.position.set(finalJarX, -35.1, 0.52);
  finalJar.group.rotation.y = -0.10;
  // Open lid lifted cleanly out of the jar-pouring frame during Stage 05
  finalJar.lidGroup.position.set(1.95, 2.55, -0.35);
  finalJar.lidGroup.rotation.set(0.18, 0.0, -0.45);
  scene.add(finalJar.group);

  /* ==============================================================
     4. FLOATING GOLDEN POLLEN & HONEY MOTES (Ambient Depth)
     ============================================================== */
  const moteCount = isMobile ? 70 : 150;
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = (Math.random() - 0.5) * 9.5;
    motePos[i * 3 + 1] = 2.5 - Math.random() * 40.0;
    motePos[i * 3 + 2] = (Math.random() - 0.5) * 4.5 + 0.2;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const moteMat = new THREE.PointsMaterial({
    color: '#F5C45E',
    size: isMobile ? 0.055 : 0.065,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  scene.add(motes);

  /* ==============================================================
     5. PORTAL CAUSTIC OVERLAY MESH (Screen-Space Shader for "Enter the Jar")
     ============================================================== */
  const portalScene = new THREE.Scene();
  const portalCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const portalMat = createCausticPortalMaterial();
  const portalQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), portalMat);
  portalScene.add(portalQuad);

  /* ==============================================================
     6. CAMERA CHOREOGRAPHY & EXACT WRAP-RELATIVE SCROLL KEYFRAMES
     ============================================================== */
  const state = {
    scrollTarget: 0,
    scrollSmooth: 0,
    lastSmooth: 0,
    pointerX: 0,
    pointerY: 0,
    pointerSmoothX: 0,
    pointerSmoothY: 0,
    isVisible: true,
    activeStage: 0,
  };

  function findCurveTForY(targetY) {
    let bestT = 0;
    let bestDiff = Infinity;
    const p = new THREE.Vector3();
    for (let i = 0; i <= 240; i++) {
      const t = i / 240;
      honeyCurve.getPointAt(t, p);
      const d = Math.abs(p.y - targetY);
      if (d < bestDiff) {
        bestDiff = d;
        bestT = t;
      }
    }
    return bestT;
  }

  const streamTStage1 = findCurveTForY(-6.5);
  const streamTStage2 = findCurveTForY(-13.5);
  const streamTStage3 = findCurveTForY(-20.4);
  const streamTStage4 = findCurveTForY(-27.4);

  const stageEls = [
    document.getElementById('hero'),
    document.getElementById('stage-01'),
    document.getElementById('stage-02'),
    document.getElementById('stage-03'),
    document.getElementById('stage-04'),
    document.getElementById('stage-05'),
    document.getElementById('journeyFinale'),
  ];

  let keyframes = [];
  let measuredAnchors = { sHero: 0, s1: 0.18, s2: 0.35, s3: 0.52, s4: 0.68, s5: 0.83, sDiveStart: 0.91 };

  function measureKeyframes() {
    const wrapRect = wrap.getBoundingClientRect();
    const navOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
    const visibleStageH = Math.max(360, window.innerHeight - navOffset);
    const totalScroll = Math.max(1, wrap.offsetHeight - window.innerHeight);

    const getS = (el, offsetFactor = 0.5, fallback = 0) => {
      if (!el) return fallback;
      // Measure exact top relative to #experienceWrap (immune to nested position:relative ancestors!)
      const topInWrap = el.getBoundingClientRect().top - wrapRect.top;
      const h = el.offsetHeight;
      const scrollYAtView = Math.max(0, topInWrap + h * offsetFactor - (navOffset + visibleStageH * 0.5));
      return THREE.MathUtils.clamp(scrollYAtView / totalScroll, 0, 1);
    };

    const sHero = 0.0;
    const s1 = getS(stageEls[1], 0.5, 0.18);
    const s2 = getS(stageEls[2], 0.5, 0.35);
    const s3 = getS(stageEls[3], 0.5, 0.52);
    const s4 = getS(stageEls[4], 0.5, 0.68);
    const s5 = getS(stageEls[5], 0.5, 0.83);
    const sDiveStart = Math.min(0.895, Math.max(s5 + 0.035, getS(stageEls[6], 0.25, 0.88)));
    const sDiveMid = Math.min(0.955, sDiveStart + (1.0 - sDiveStart) * 0.45);

    measuredAnchors = { sHero, s1, s2, s3, s4, s5, sDiveStart };

    keyframes = [
      {
        s: sHero,
        pos: new THREE.Vector3(0.0, 0.15, isMobile ? 7.4 : 6.2),
        look: new THREE.Vector3(0.0, -0.05, 0.0),
        stream: 0.015,
        fov: isMobile ? 46 : 40,
      },
      {
        s: sHero + (s1 - sHero) * 0.45,
        pos: new THREE.Vector3(0.20, -2.4, isMobile ? 7.2 : 6.1),
        look: new THREE.Vector3(0.15, -2.7, 0.45),
        stream: streamTStage1 * 0.48,
        fov: isMobile ? 46 : 40,
      },
      {
        s: s1,
        pos: new THREE.Vector3(isMobile ? 0.0 : -0.45, -6.5, isMobile ? 7.2 : 6.1),
        look: new THREE.Vector3(isMobile ? 0.0 : -0.95, -6.55, 0.25),
        stream: streamTStage1 + 0.04,
        fov: isMobile ? 46 : 40,
      },
      {
        s: s2,
        pos: new THREE.Vector3(isMobile ? 0.0 : 0.45, -13.4, isMobile ? 7.2 : 6.2),
        look: new THREE.Vector3(isMobile ? 0.0 : 1.08, -13.5, 0.25),
        stream: streamTStage2 + 0.05,
        fov: isMobile ? 46 : 40,
      },
      {
        s: s3,
        pos: new THREE.Vector3(isMobile ? 0.0 : -0.52, -20.4, isMobile ? 7.1 : 6.0),
        look: new THREE.Vector3(isMobile ? 0.0 : -1.14, -20.5, 0.35),
        stream: streamTStage3 + 0.04,
        fov: isMobile ? 46 : 40,
      },
      {
        s: s4,
        pos: new THREE.Vector3(isMobile ? 0.0 : 0.45, -27.2, isMobile ? 7.2 : 6.1),
        look: new THREE.Vector3(isMobile ? 0.0 : 0.95, -27.4, 0.25),
        stream: streamTStage4 + 0.04,
        fov: isMobile ? 46 : 40,
      },
      {
        s: s5,
        pos: new THREE.Vector3(finalJarX * 0.65, -34.5, isMobile ? 6.5 : 5.05),
        look: new THREE.Vector3(finalJarX, -34.95, 0.52),
        stream: 1.0,
        fov: isMobile ? 46 : 40,
      },
      {
        s: sDiveStart,
        pos: new THREE.Vector3(finalJarX, -33.25, isMobile ? 3.2 : 2.55),
        look: new THREE.Vector3(finalJarX, -34.7, 0.52),
        stream: 1.0,
        fov: isMobile ? 48 : 44,
      },
      {
        s: sDiveMid,
        pos: new THREE.Vector3(finalJarX, -33.40, 0.62),
        look: new THREE.Vector3(finalJarX, -35.6, 0.52),
        stream: 1.0,
        fov: 56,
      },
      {
        s: 1.0,
        pos: new THREE.Vector3(finalJarX, -34.95, 0.53),
        look: new THREE.Vector3(finalJarX, -37.2, 0.52),
        stream: 1.0,
        fov: 66,
      },
    ];
  }

  function sampleKeyframes(s, outPos, outLook) {
    if (!keyframes.length) measureKeyframes();
    const clamped = THREE.MathUtils.clamp(s, 0, 1);
    let idx = 0;
    while (idx < keyframes.length - 2 && clamped > keyframes[idx + 1].s) {
      idx++;
    }
    const a = keyframes[idx];
    const b = keyframes[idx + 1];
    const span = Math.max(0.0001, b.s - a.s);
    const rawT = THREE.MathUtils.clamp((clamped - a.s) / span, 0, 1);
    const u = rawT * rawT * (3 - 2 * rawT);

    outPos.lerpVectors(a.pos, b.pos, u);
    outLook.lerpVectors(a.look, b.look, u);
    return {
      stream: THREE.MathUtils.lerp(a.stream, b.stream, u),
      fov: THREE.MathUtils.lerp(a.fov, b.fov, u),
      s5: measuredAnchors.s5,
      sDiveStart: measuredAnchors.sDiveStart,
    };
  }

  measureKeyframes();

  // Register GSAP ScrollTrigger if loaded
  let stInstance = null;
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    stInstance = window.ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: false,
      onRefresh: measureKeyframes,
      onUpdate: (self) => {
        state.scrollTarget = self.progress;
      },
    });
  } else {
    const onScrollFallback = () => {
      const rect = wrap.getBoundingClientRect();
      const total = Math.max(1, wrap.offsetHeight - window.innerHeight);
      state.scrollTarget = THREE.MathUtils.clamp(-rect.top / total, 0, 1);
    };
    window.addEventListener('scroll', onScrollFallback, { passive: true });
    onScrollFallback();
  }

  // Subtle desktop pointer parallax
  if (!isMobile) {
    window.addEventListener('pointermove', (e) => {
      state.pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function handleResize() {
    const stageEl = document.getElementById('experienceStage');
    const w = stageEl ? stageEl.clientWidth : window.innerWidth;
    const h = stageEl ? stageEl.clientHeight : Math.max(420, window.innerHeight - 76);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    measureKeyframes();
  }
  handleResize();
  window.addEventListener('resize', handleResize);

  const visObserver = new IntersectionObserver(
    (entries) => {
      state.isVisible = entries[0]?.isIntersecting ?? true;
    },
    { rootMargin: '40px 0px 40px 0px' }
  );
  visObserver.observe(wrap);

  /* ==============================================================
     7. REAL-TIME ANIMATION LOOP
     ============================================================== */
  const clock = new THREE.Clock();
  const tmpCamPos = new THREE.Vector3();
  const tmpLookAt = new THREE.Vector3();
  const tmpTip = new THREE.Vector3();
  let rafId = 0;

  function updateDripAnimation(t, scrollT) {
    const heroFade = 1.0 - THREE.MathUtils.smoothstep(scrollT, 0.015, 0.12);
    dripNeck.visible = heroFade > 0.02;
    fallingDrop.visible = heroFade > 0.02;
    puddleMesh.visible = heroFade > 0.02;
    if (heroFade <= 0.02) return;

    dipper.group.updateMatrixWorld();
    dipperTipMarker.getWorldPosition(tmpTip);

    const tipX = tmpTip.x;
    const tipY = tmpTip.y;
    const tipZ = tmpTip.z;

    dripMat.uniforms.uTime.value = t;
    puddleMat.uniforms.uTime.value = t;
    dipper.glazeMat.uniforms.uTime.value = t;

    const cycle = (t * 0.42) % 1.0;
    const stretch = cycle < 0.62
      ? THREE.MathUtils.smoothstep(cycle, 0.0, 0.62)
      : Math.max(0.0, 1.0 - (cycle - 0.62) * 5.2);

    const neckLen = 0.09 + stretch * 0.43;
    dripNeck.position.set(tipX, tipY + 0.015, tipZ);
    dripNeck.scale.set(1.0 - stretch * 0.18, neckLen, 1.0 - stretch * 0.18);

    if (cycle < 0.62) {
      const grow = 0.68 + stretch * 0.46;
      fallingDrop.position.set(tipX, tipY + 0.015 - neckLen - 0.025, tipZ);
      fallingDrop.scale.set(grow * 1.06, grow * (0.96 + stretch * 0.25), grow * 1.06);
    } else {
      const fallPhase = (cycle - 0.62) / 0.38;
      const g = fallPhase * fallPhase;
      const targetY = puddleMesh.position.y + 0.055;
      const startY = tipY + 0.015 - 0.52;
      fallingDrop.position.set(tipX, THREE.MathUtils.lerp(startY, targetY, g), tipZ);
      const shrink = 1.0 - THREE.MathUtils.smoothstep(fallPhase, 0.84, 1.0);
      fallingDrop.scale.set(shrink * 1.05, shrink * 1.24, shrink * 1.05);
    }

    const impact = cycle > 0.90 ? Math.sin(((cycle - 0.90) / 0.10) * Math.PI) * 0.045 : 0;
    const basePoolX = isMobile ? 0.56 : 1.04;
    const basePoolZ = isMobile ? 0.48 : 0.80;
    puddleMesh.scale.set(basePoolX + impact, 1, basePoolZ + impact);
  }

  function animateBees(bees, t, wingFreq = 26) {
    for (let i = 0; i < bees.length; i++) {
      const b = bees[i];
      const u = b.userData;
      const ang = t * u.orbitSpeed + u.phase;
      const nx = u.orbitCenter.x + Math.cos(ang) * u.orbitRadius;
      const ny = u.orbitCenter.y + Math.sin(ang * 1.6) * (u.orbitRadius * 0.35);
      const nz = u.orbitCenter.z + Math.sin(ang) * (u.orbitRadius * 0.65);

      const dx = -Math.sin(ang) * u.orbitRadius * u.orbitSpeed;
      const dz = Math.cos(ang) * u.orbitRadius * 0.65 * u.orbitSpeed;
      b.position.set(nx, ny, nz);
      b.rotation.y = Math.atan2(dx, dz);
      b.rotation.z = Math.sin(ang * 2) * 0.12;

      const flap = Math.sin(t * wingFreq + u.phase) * 0.62;
      u.leftWing.rotation.z = 0.58 + flap;
      u.rightWing.rotation.z = -0.58 - flap;
    }
  }

  function frame() {
    rafId = requestAnimationFrame(frame);
    if (!state.isVisible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    state.scrollSmooth += (state.scrollTarget - state.scrollSmooth) * Math.min(1, dt * 14.5);
    const scrollVel = Math.abs(state.scrollSmooth - state.lastSmooth) / Math.max(dt, 0.001);
    state.lastSmooth = state.scrollSmooth;

    state.pointerSmoothX += (state.pointerX - state.pointerSmoothX) * Math.min(1, dt * 5.0);
    state.pointerSmoothY += (state.pointerY - state.pointerSmoothY) * Math.min(1, dt * 5.0);

    const s = THREE.MathUtils.clamp(state.scrollSmooth, 0, 1);

    const kf = sampleKeyframes(s, tmpCamPos, tmpLookAt);

    // 1. Hero breathing & live viscous honey drip
    heroJar.group.rotation.y = -0.14 + state.pointerSmoothX * 0.15 + Math.sin(elapsed * 0.5) * 0.03;
    dipper.group.rotation.z = -0.68 + Math.sin(elapsed * 0.8) * 0.032 + state.pointerSmoothX * 0.04;
    heroJar.updateFill(0.88, 0.12, elapsed);
    updateDripAnimation(elapsed, s);

    // 2. Flowing Honey Stream along the 3D spline (fades in smoothly as scroll starts)
    const streamProgress = THREE.MathUtils.clamp(kf.stream, 0.004, 1.0);
    const streamIntro = THREE.MathUtils.smoothstep(s, 0.008, 0.055);
    const guideIntro = THREE.MathUtils.smoothstep(s, 0.012, 0.070);
    const diveFade = 1.0 - THREE.MathUtils.smoothstep(s, kf.sDiveStart, 0.96);

    streamMat.uniforms.uTime.value = elapsed;
    streamMat.uniforms.uFlowProgress.value = streamProgress;
    streamMat.uniforms.uOpacity.value = streamIntro * diveFade;
    streamMesh.visible = streamMat.uniforms.uOpacity.value > 0.01;

    guideMat.uniforms.uFlowProgress.value = streamProgress;
    guideMat.uniforms.uOpacity.value = 0.12 * guideIntro * (1.0 - THREE.MathUtils.smoothstep(s, kf.sDiveStart, 0.92));
    guideMesh.visible = guideMat.uniforms.uOpacity.value > 0.005;

    // 3. Stage 01 Flowers & Bees
    for (let i = 0; i < stage01.flowers.length; i++) {
      const f = stage01.flowers[i];
      f.rotation.z = f.userData.baseRotZ + Math.sin(elapsed * 1.1 + f.userData.phase) * 0.045;
    }
    animateBees(stage01.bees, elapsed, 28);

    // 4. Stage 02 & 03 Honeycomb fill progression synchronized with scroll
    const combFill2 = THREE.MathUtils.smoothstep(s, measuredAnchors.s2 - 0.12, measuredAnchors.s2 + 0.08);
    const combFill3 = THREE.MathUtils.smoothstep(s, measuredAnchors.s3 - 0.12, measuredAnchors.s3 + 0.08);
    stage02.updateCellFill(0.28 + combFill2 * 0.72);
    stage03.updateCellFill(0.22 + combFill3 * 0.78);
    animateBees(stage02.bees, elapsed, 22);
    animateBees(stage03.bees, elapsed + 1.5, 22);

    // 5. Stage 04 Harvest Frame sway
    stage04.group.rotation.y = -0.24 + Math.sin(elapsed * 0.45) * 0.06;
    if (stage04.sheetMat) stage04.sheetMat.uniforms.uTime.value = elapsed;

    // 6. Stage 05 Final Jar Filling + Lid Hover + Enter Jar Dive
    const fillStart = Math.max(0.65, kf.s5 - 0.11);
    const fillEnd = Math.min(kf.sDiveStart, kf.s5 + 0.045);
    const jarFill = THREE.MathUtils.lerp(0.08, 0.96, THREE.MathUtils.smoothstep(s, fillStart, fillEnd));
    const pourRipple = THREE.MathUtils.smoothstep(s, fillStart, fillEnd - 0.02)
      * (1.0 - THREE.MathUtils.smoothstep(s, fillEnd - 0.01, kf.sDiveStart))
      + Math.min(scrollVel * 0.5, 0.75);
    finalJar.updateFill(jarFill, pourRipple, elapsed);
    finalJar.group.rotation.y = -0.10 + THREE.MathUtils.smoothstep(s, fillStart, kf.sDiveStart) * 0.14 + state.pointerSmoothX * 0.08;

    const divePrep = THREE.MathUtils.smoothstep(s, kf.s5 + 0.02, kf.sDiveStart + 0.03);
    finalJar.lidGroup.position.set(1.95 + divePrep * 1.4, 2.55 + divePrep * 1.4, -0.35);
    finalJar.lidGroup.rotation.z = -0.45 - divePrep * 0.45;

    // 7. Camera Position, LookAt & Dynamic FOV
    const parallaxWeight = (1.0 - THREE.MathUtils.smoothstep(s, kf.s5, kf.sDiveStart + 0.02)) * (isMobile ? 0.0 : 0.25);
    camera.position.set(
      tmpCamPos.x + state.pointerSmoothX * parallaxWeight,
      tmpCamPos.y - state.pointerSmoothY * parallaxWeight * 0.55,
      tmpCamPos.z
    );
    camera.lookAt(tmpLookAt);

    if (Math.abs(camera.fov - kf.fov) > 0.05) {
      camera.fov = kf.fov;
      camera.updateProjectionMatrix();
    }

    warmPoint.position.set(camera.position.x + 1.8, camera.position.y + 1.2, camera.position.z - 1.5);
    motes.rotation.y = Math.sin(elapsed * 0.08) * 0.04;

    // 8. Golden Caustic Portal during "Enter the Honey Jar"
    const portalStrength = THREE.MathUtils.smoothstep(s, kf.sDiveStart - 0.01, 0.968);
    portalMat.uniforms.uTime.value = elapsed;
    portalMat.uniforms.uStrength.value = portalStrength;

    if (portalVeil) {
      const veilAlpha = THREE.MathUtils.smoothstep(s, kf.sDiveStart + 0.015, 0.955)
        * (1.0 - THREE.MathUtils.smoothstep(s, 0.978, 1.0));
      portalVeil.style.opacity = veilAlpha.toFixed(3);
    }

    if (finaleCue) {
      const cueFade = 1.0 - THREE.MathUtils.smoothstep(s, kf.sDiveStart, kf.sDiveStart + 0.045);
      finaleCue.style.opacity = cueFade.toFixed(2);
    }

    renderer.autoClear = true;
    renderer.render(scene, camera);

    if (portalStrength > 0.005) {
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(portalScene, portalCam);
      renderer.autoClear = true;
    }

    // Broadcast active stage index dynamically using measured DOM anchors
    const a = measuredAnchors;
    const s1m = (a.sHero + a.s1) * 0.5;
    const s2m = (a.s1 + a.s2) * 0.5;
    const s3m = (a.s2 + a.s3) * 0.5;
    const s4m = (a.s3 + a.s4) * 0.5;
    const s5m = (a.s4 + a.s5) * 0.5;
    const stageIdx =
      s < s1m ? 0 :
      s < s2m ? 1 :
      s < s3m ? 2 :
      s < s4m ? 3 :
      s < s5m ? 4 : 5;
    if (stageIdx !== state.activeStage) {
      state.activeStage = stageIdx;
      window.dispatchEvent(new CustomEvent('honey:stage', { detail: { stage: stageIdx, progress: s } }));
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measureKeyframes();
      if (stInstance) window.ScrollTrigger?.refresh();
    });
  }

  frame();

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    visObserver.disconnect();
    window.removeEventListener('resize', handleResize);
    if (stInstance) stInstance.kill();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          if (m.bumpMap) m.bumpMap.dispose();
          m.dispose();
        });
      }
    });
    envTex.dispose();
    portalQuad.geometry.dispose();
    portalMat.dispose();
    renderer.dispose();
  });
})();
