/**
 * honey-scenes.js — Focused Real-Time 3D Scenes for Nahl Al-Thahab:
 *  1) Hero 3D Wooden Beehive Honeycomb Frame with Hexagonal Beeswax Cells,
 *     Natural Dripping Honey & Honey-Catching Channel pouring into Section 2 (#journey).
 *  2) Stage 05 Crystal-Clear Octagonal "نحل الذهب" Jar Pinned with GSAP ScrollTrigger:
 *     Filling -> Full-Jar Appreciation Pause -> Gradual Over-Rim Dive -> Caustic Exit Reveal
 *     directly into the restored original website (#categories).
 */
import * as THREE from './vendor/three.module.min.js';
import {
  createLiquidHoneyMaterial,
  createCausticPortalMaterial,
} from './honey-shaders.js';
import {
  createHoneyEnvironment,
  createHoneycombFrameWithChannel,
  createGravityPourGeometry,
  createHoneyJar,
  createContinuousPourGeometry,
} from './honey-assets.js';

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 840px)');

function getNavH() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
}

/* =====================================================================
   SCENE 1 — HERO 3D HONEYCOMB FRAME + COLLECTION CHANNEL + POUR STREAM
   ===================================================================== */
function initHeroScene() {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('heroStage');
  const canvas = document.getElementById('heroDrumCanvas');
  if (!hero || !stage || !canvas) return;

  const broadcastFallbackSpout = () => {
    const sr = stage.getBoundingClientRect();
    const cx = sr.left + sr.width * 0.50;
    window.__NH_HERO_SPOUT__ = { clientX: cx };
    window.dispatchEvent(new CustomEvent('honey:hero-spout', { detail: { clientX: cx } }));
  };

  if (reducedQuery.matches) {
    hero.classList.add('nh-hero--fallback');
    broadcastFallbackSpout();
    window.addEventListener('resize', broadcastFallbackSpout);
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
    hero.classList.add('nh-hero--fallback');
    broadcastFallbackSpout();
    window.addEventListener('resize', broadcastFallbackSpout);
    return;
  }

  const isMobile = mobileQuery.matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const envTex = createHoneyEnvironment(renderer);
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 45);
  camera.position.set(0, 0.12, 7.8);

  // Warm three-point daylight lighting tailored for natural beeswax, wood grain, and honey refraction
  scene.add(new THREE.HemisphereLight('#FFFDF5', '#B08448', 1.0));
  const key = new THREE.DirectionalLight('#FFFBF0', 2.45);
  key.position.set(4.5, 6.5, 6.8);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#FFCE6B', 1.75);
  rim.position.set(-5.8, 3.2, -3.2);
  scene.add(rim);

  const frontFill = new THREE.DirectionalLight('#FFF6E0', 1.05);
  frontFill.position.set(-2.2, 0.8, 7.2);
  scene.add(frontFill);

  const honeycomb = createHoneycombFrameWithChannel({ isMobile });
  scene.add(honeycomb.group);

  // Continuous 3D liquid stream flowing downward out of the collector channel spout into Section 2
  const pourMat = createLiquidHoneyMaterial({ animatedFlow: true });
  let pourMesh = new THREE.Mesh(
    createGravityPourGeometry({ start: new THREE.Vector3(0, 0, 0), bottomY: -2.5 }),
    pourMat
  );
  scene.add(pourMesh);

  let lastSpoutClientX = null;

  function syncHeroLayout() {
    const hr = hero.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const w = Math.max(240, Math.round(hr.width));
    const h = Math.max(280, Math.round(hr.height));

    camera.aspect = w / h;
    camera.fov = w < 720 ? 38 : 34;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    const camZ = w < 720 ? 8.5 : 7.8;
    camera.position.set(0, 0.10, camZ);
    camera.lookAt(0, 0.02, 0);
    camera.updateMatrixWorld(true);

    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camZ;
    const halfW = halfH * camera.aspect;

    // Position 3D honeycomb frame & catching channel neatly inside `.nh-hero__stage`
    const targetPxX = (sr.left - hr.left) + sr.width * (w < 720 ? 0.50 : 0.52);
    const targetPxY = (sr.top - hr.top) + sr.height * (w < 720 ? 0.45 : 0.44);

    const worldX = ((targetPxX / w) * 2 - 1) * halfW;
    const worldY = (1 - (targetPxY / h) * 2) * halfH + camera.position.y;

    const stageHFrac = sr.height / h;
    const frameScale = THREE.MathUtils.clamp(
      w < 720 ? Math.min(stageHFrac * 1.12, 0.78) : Math.min(stageHFrac * 1.08, 1.06),
      0.66,
      1.06
    );

    honeycomb.group.scale.setScalar(frameScale);
    honeycomb.group.position.set(worldX, worldY + 0.10, 0);
    honeycomb.group.rotation.y = w < 720 ? 0.02 : 0.04;
    honeycomb.group.updateMatrixWorld(true);

    // Measure exact world position of collector channel spout mouth
    const spoutWorld = new THREE.Vector3();
    honeycomb.spoutAnchor.getWorldPosition(spoutWorld);

    const distAtSpoutZ = Math.max(2.0, camZ - spoutWorld.z);
    const halfHAtSpout = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distAtSpoutZ;
    const bottomWorldY = camera.position.y - halfHAtSpout - 0.28;

    const dropX = spoutWorld.x;
    const dropZ = spoutWorld.z + 0.015;

    if (pourMesh.geometry) pourMesh.geometry.dispose();
    pourMesh.position.set(dropX, 0, dropZ);
    pourMesh.geometry = createGravityPourGeometry({
      start: new THREE.Vector3(0, spoutWorld.y, 0),
      dropX: 0,
      dropZ: 0,
      bottomY: Math.min(spoutWorld.y - 0.45, bottomWorldY),
      topRadius: 0.056 * frameScale,
      waistRadius: 0.044 * frameScale,
      bottomRadius: 0.052 * frameScale,
      radialSegments: 24,
      heightSegments: 54,
    });

    const bottomExitWorld = new THREE.Vector3(dropX, camera.position.y - halfHAtSpout, dropZ);
    const projected = bottomExitWorld.clone().project(camera);
    const spoutClientX = hr.left + (projected.x * 0.5 + 0.5) * hr.width;

    if (lastSpoutClientX === null || Math.abs(lastSpoutClientX - spoutClientX) > 0.4) {
      lastSpoutClientX = spoutClientX;
      window.__NH_HERO_SPOUT__ = { clientX: spoutClientX };
      window.dispatchEvent(new CustomEvent('honey:hero-spout', { detail: { clientX: spoutClientX } }));
    }
  }

  let isVisible = true;
  const visObs = new IntersectionObserver(
    (entries) => { isVisible = entries[0]?.isIntersecting ?? true; },
    { rootMargin: '120px 0px 120px 0px' }
  );
  visObs.observe(hero);

  if (window.ResizeObserver) {
    new ResizeObserver(syncHeroLayout).observe(hero);
    new ResizeObserver(syncHeroLayout).observe(stage);
  }
  window.addEventListener('resize', syncHeroLayout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeroLayout);
  }
  syncHeroLayout();

  let pointerX = 0;
  let pointerSmoothX = 0;
  if (!isMobile) {
    hero.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });
  }

  const clock = new THREE.Clock();
  let rafId = 0;

  function tickHero() {
    rafId = requestAnimationFrame(tickHero);
    if (!isVisible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    pointerSmoothX += (pointerX - pointerSmoothX) * Math.min(1, dt * 4.5);
    pourMat.uniforms.uTime.value = t;
    honeycomb.updateDrips(t);

    // Subtle breathing & hover angle on suspended honeycomb frame while keeping collector spout locked!
    honeycomb.frameGroup.rotation.x = 0.11 + Math.sin(t * 0.50) * 0.01;
    honeycomb.frameGroup.rotation.y = -0.40 + pointerSmoothX * 0.05 + Math.sin(t * 0.65) * 0.018;
    honeycomb.frameGroup.rotation.z = -0.045 + Math.cos(t * 0.55) * 0.008;

    renderer.render(scene, camera);
  }

  tickHero();

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(rafId);
    visObs.disconnect();
    window.removeEventListener('resize', syncHeroLayout);
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

/* =====================================================================
   SCENE 2 — PINNED STAGE 05 CRYSTAL JAR + SLOW ENTER-THE-JAR TRANSITION
   Powered cleanly by GSAP ScrollTrigger over generous scroll distance.
   ===================================================================== */
function initJarFinaleScene() {
  const wrap = document.getElementById('nhJarFinale');
  const stage = document.getElementById('nhJarPin');
  const canvas = document.getElementById('jarCanvas');
  const portalVeil = document.getElementById('nhPortalVeil');
  const jarDecor = document.getElementById('nhJarDecor');
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

  const camera = new THREE.PerspectiveCamera(36, 1.0, 0.1, 45);
  camera.position.set(0, 0.28, isMobile ? 6.5 : 5.85);

  scene.add(new THREE.HemisphereLight('#FFFDF8', '#5E4831', 0.90));
  const key = new THREE.DirectionalLight('#FFFFFF', 2.45);
  key.position.set(5, 7, 6);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#FFE4A8', 1.65);
  rim.position.set(-6, 3, -4);
  scene.add(rim);

  // Crystal-Clear Octagonal Stage 05 Jar
  const jar = createHoneyJar({ isMobile, initialFill: 0.22 });
  jar.group.scale.setScalar(isMobile ? 0.84 : 0.96);
  jar.group.position.set(0, -0.26, 0);
  jar.group.rotation.y = -0.14;
  const lidRestX = isMobile ? 0.82 : 0.86;
  const lidRestY = isMobile ? 1.24 : 1.28;
  jar.lidGroup.position.set(lidRestX, lidRestY, -0.34);
  jar.lidGroup.rotation.set(0.24, 0.0, -0.36);
  scene.add(jar.group);

  // Slim Continuous 3D Pour Stream descending from exact top center (#jarInletAnchor)
  const streamMat = createLiquidHoneyMaterial({ animatedFlow: true });
  const streamGeo = createContinuousPourGeometry({
    topRadius: 0.030,
    midRadius: 0.024,
    botRadius: 0.036,
    height: 1.0,
    radialSegments: 20,
    heightSegments: 32,
  });
  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  scene.add(streamMesh);

  // Real-time GLSL Golden Caustic Portal screen-space quad inside canvas
  const portalMat = createCausticPortalMaterial();
  const portalQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), portalMat);
  portalQuad.frustumCulled = false;
  portalQuad.renderOrder = 30;
  portalQuad.visible = false;
  scene.add(portalQuad);

  // Synchronized timeline state driven by GSAP ScrollTrigger (or fallback scroll progress)
  const timeline = {
    preProgress: 0,   // 0..1 while scrolling into #nhJarFinale before pin locks
    pinProgress: 0,   // 0..1 across full pinned ScrollTrigger scroll range
  };

  let smoothPre = 0;
  let smoothPin = 0;
  let pointerX = 0;
  let pointerSmoothX = 0;
  let isVisible = false;

  const hasGsapST = Boolean(window.gsap && window.ScrollTrigger);
  if (hasGsapST) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Pre-pin smooth filling intro as visitor scrolls up toward the finale block
    window.ScrollTrigger.create({
      trigger: wrap,
      start: 'top 92%',
      end: () => `top ${getNavH()}px`,
      scrub: 0.9,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        timeline.preProgress = self.progress;
      },
    });

    // Main Pinned Choreography:
    //  0.00 -> 0.42 : Honey fills continuously until jar is FULL (95%)
    //  0.42 -> 0.62 : Appreciation pause displaying the FULL sparkling jar clearly
    //  0.62 -> 0.87 : Gradual slow dolly up & over crystal rim into jar mouth
    //  0.87 -> 1.00 : Golden caustic immersion & smooth reveal of original website (#categories)
    window.ScrollTrigger.create({
      trigger: wrap,
      pin: true,
      pinSpacing: true,
      start: () => `top ${getNavH()}px`,
      end: () => `+=${mobileQuery.matches ? 2500 : 3500}`,
      scrub: 1.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        timeline.pinProgress = self.progress;
        if (self.progress > 0.001) timeline.preProgress = 1;
      },
    });
  } else {
    // Fallback linear scroll mapping if ScrollTrigger unavailable
    const updateFallbackScroll = () => {
      const r = wrap.getBoundingClientRect();
      const navH = getNavH();
      const span = Math.max(1, window.innerHeight * 0.8);
      timeline.preProgress = THREE.MathUtils.clamp((window.innerHeight * 0.9 - r.top) / span, 0, 1);
      timeline.pinProgress = r.top <= navH ? THREE.MathUtils.clamp((navH - r.top) / span, 0, 1) : 0;
    };
    window.addEventListener('scroll', updateFallbackScroll, { passive: true });
    updateFallbackScroll();
  }

  function resize() {
    const w = Math.max(180, stage.clientWidth);
    const h = Math.max(240, stage.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (hasGsapST) window.ScrollTrigger.refresh();
  }
  resize();

  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize', resize);

  if (!isMobile) {
    window.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });
  }

  const visObs = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
      if (!isVisible) {
        if (portalVeil) portalVeil.style.opacity = '0';
        stage.style.opacity = timeline.pinProgress > 0.96 ? '0' : '1';
      }
    },
    { rootMargin: '120px 0px 120px 0px' }
  );
  visObs.observe(wrap);

  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  let rafId = 0;

  function tickFinale() {
    rafId = requestAnimationFrame(tickFinale);
    if (!isVisible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Gentle catch-up smoothing on top of GSAP scrub for silky WebGL sub-frame motion
    const dampPre = Math.min(1, dt * 10);
    const dampPin = Math.min(1, dt * 9);
    smoothPre += (timeline.preProgress - smoothPre) * dampPre;
    smoothPin += (timeline.pinProgress - smoothPin) * dampPin;
    pointerSmoothX += (pointerX - pointerSmoothX) * Math.min(1, dt * 5);

    const p = THREE.MathUtils.clamp(smoothPin, 0, 1);
    const pre = THREE.MathUtils.clamp(smoothPre, 0, 1);

    // Phase breakdown:
    //  pre (before lock): fill 0.18 -> 0.42
    //  p [0.00 .. 0.42] : fill 0.42 -> 0.95 (jar fills completely)
    //  p [0.42 .. 0.62] : hold at 0.95 FULL JAR appreciation moment
    //  p [0.62 .. 0.87] : slow lid exit + gradual camera rim glide
    //  p [0.87 .. 1.00] : interior submersion + golden caustic reveal into original site
    const fillFromPre = THREE.MathUtils.lerp(0.18, 0.42, pre);
    const fillFromPin = THREE.MathUtils.smoothstep(p, 0.0, 0.42);
    const jarFill = THREE.MathUtils.lerp(fillFromPre, 0.95, fillFromPin);

    const streamCut = THREE.MathUtils.smoothstep(p, 0.41, 0.48);
    const rippleAmp = THREE.MathUtils.lerp(0.85, 0.14, THREE.MathUtils.smoothstep(p, 0.38, 0.56));
    const fullAppreciationZoom = THREE.MathUtils.smoothstep(p, 0.42, 0.62);
    const divePrep = THREE.MathUtils.smoothstep(p, 0.62, 0.76);
    const diveProgress = THREE.MathUtils.smoothstep(p, 0.62, 0.87);
    const insideDive = THREE.MathUtils.smoothstep(p, 0.85, 0.99);

    const jarScale = jar.group.scale.y;
    const jarY = jar.group.position.y;
    jar.updateFill(jarFill, rippleAmp, t, streamCut < 0.75);
    jar.group.rotation.y =
      THREE.MathUtils.lerp(-0.14, 0.05, Math.min(1, fillFromPin + fullAppreciationZoom * 0.25)) +
      pointerSmoothX * 0.08 * (1 - diveProgress);

    // Brushed gold lid stays poised offset beside rim during fill & hold, then lifts smoothly out of view
    jar.lidGroup.position.set(
      lidRestX + divePrep * 0.9,
      lidRestY + divePrep * 1.45,
      -0.34
    );
    jar.lidGroup.rotation.z = -0.36 - divePrep * 0.42;

    // 3D Pouring honey stream aligned strictly from top inlet anchor down to rising meniscus
    streamMat.uniforms.uTime.value = t;
    streamMesh.visible = streamCut < 0.95;
    if (streamMesh.visible) {
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
      const streamTopY = Math.max(1.9, camera.position.y + halfH + 0.08);
      const surfaceWorldY = jarY + jar.getSurfaceY() * jarScale;
      const totalH = Math.max(0.2, streamTopY - surfaceWorldY);
      const radiusFactor = Math.max(0.05, 1 - streamCut);
      // Taper cleanly downward as pour finishes so it never pops instantaneously
      const tailBot = THREE.MathUtils.lerp(surfaceWorldY, streamTopY, Math.pow(streamCut, 1.5));
      const h = Math.max(0.08, streamTopY - tailBot);
      streamMesh.position.set(0, tailBot, 0);
      streamMesh.scale.set(radiusFactor, h, radiusFactor);
    }

    // Slow, non-abrupt Camera Choreography
    const baseCamZ = isMobile ? 6.5 : 5.85;
    const holdCamZ = isMobile ? 5.75 : 5.05;
    const holdCamY = isMobile ? 0.34 : 0.36;

    if (p <= 0.42) {
      const q = p / 0.42;
      camPos.set(pointerSmoothX * 0.10, THREE.MathUtils.lerp(0.22, holdCamY * 0.85, q), baseCamZ);
      camLook.set(0, THREE.MathUtils.lerp(-0.16, -0.06, q), 0);
      camera.fov = isMobile ? 39 : 36;
    } else if (p <= 0.62) {
      // Dedicated full-jar appreciation pause — gentle slow camera push-in to admire gold facets & label
      const u = THREE.MathUtils.smoothstep(p, 0.42, 0.62);
      camPos.set(
        pointerSmoothX * 0.10 * (1 - u * 0.4),
        THREE.MathUtils.lerp(holdCamY * 0.85, holdCamY, u),
        THREE.MathUtils.lerp(baseCamZ, holdCamZ, u)
      );
      camLook.set(0, THREE.MathUtils.lerp(-0.06, 0.0, u), 0);
      camera.fov = isMobile ? 39 : 36;
    } else if (p <= 0.87) {
      // Gradual graceful rise & approach over faceted rim
      const u = THREE.MathUtils.smoothstep(p, 0.62, 0.87);
      const arcLift = Math.sin(u * Math.PI * 0.72) * 0.45;
      camPos.set(
        THREE.MathUtils.lerp(pointerSmoothX * 0.06, 0, u),
        THREE.MathUtils.lerp(holdCamY, 1.44, u) + arcLift,
        THREE.MathUtils.lerp(holdCamZ, 1.32, u)
      );
      camLook.set(0, THREE.MathUtils.lerp(0.0, 0.24, u), 0);
      camera.fov = THREE.MathUtils.lerp(isMobile ? 39 : 36, 49, u);
    } else {
      // Smooth submersion inside luminous honey chamber
      const u = THREE.MathUtils.smoothstep(p, 0.87, 1.0);
      camPos.set(0, THREE.MathUtils.lerp(1.44, -0.35, u), THREE.MathUtils.lerp(1.32, 0.02, u));
      camLook.set(0, THREE.MathUtils.lerp(0.24, -2.1, u), 0);
      camera.fov = THREE.MathUtils.lerp(49, 68, u);
    }

    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.updateProjectionMatrix();

    // Animated 3D caustic dive portal quad + smooth exit into original #FAF5EA site
    const portalStrength = THREE.MathUtils.smoothstep(p, 0.83, 0.94);
    portalMat.uniforms.uTime.value = t;
    portalMat.uniforms.uStrength.value = portalStrength;
    portalQuad.visible = portalStrength > 0.01;

    // Fade jar stage out cleanly beneath portal veil as #categories scrolls into viewport
    const pinFadeOut = 1.0 - THREE.MathUtils.smoothstep(p, 0.90, 0.985);
    stage.style.opacity = pinFadeOut.toFixed(3);
    canvas.style.opacity = '1';

    if (portalVeil) {
      const veilIn = THREE.MathUtils.smoothstep(p, 0.83, 0.90);
      const veilOut = 1.0 - THREE.MathUtils.smoothstep(p, 0.94, 1.0);
      portalVeil.style.opacity = (veilIn * veilOut * 0.995).toFixed(3);
    }

    if (jarDecor) {
      jarDecor.style.opacity = (1.0 - THREE.MathUtils.smoothstep(p, 0.65, 0.84)).toFixed(3);
    }

    renderer.render(scene, camera);
  }

  tickFinale();

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

initHeroScene();
initJarFinaleScene();
