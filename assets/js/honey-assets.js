/**
 * honey-assets.js — Focused Studio 3D Assets for Nahl Al-Thahab:
 *  - High-contrast white-studio PMREM environment for clear glass & warm beeswax highlights
 *  - Irregular 3D Broken Honeycomb Composition (3 foreground fractured chunks, 3 background
 *    3D chunks for bokeh depth, 3D wildflower stems & blossoms, cascading continuous viscous
 *    liquid honey bridges, and bottom-center amber pooling pocket with underside spout outlet)
 *  - Crystal-Clear Octagonal Stage 05 "نحل الذهب" Jar with neck threads, contact shadow,
 *    clear Fresnel silhouettes, rising golden honey, and pour ripple coil
 *  - Continuous Liquid Pour Stream geometry (Lathe/Bezier catenoid column)
 */
import * as THREE from './vendor/three.module.min.js';
import {
  createClearGlassMaterial,
  createJarHoneyMaterial,
  createLiquidHoneyMaterial,
} from './honey-shaders.js';

/**
 * Generates a white-backdrop studio PMREM environment map with dark negative-fill
 * reflector cards and sharp crisp softbox strips so gold caps & glass jar walls
 * catch razor-sharp specular highlights against #FFFFFF white.
 */
export function createHoneyEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#D8D4CE');

  // High overhead studio softbox
  const topPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.55, 2.45), side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 8, 1);
  topPanel.rotation.x = Math.PI / 2;
  envScene.add(topPanel);

  // Key narrow bright softbox strip (right-front)
  const keyStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 15),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 4.0, 3.65), side: THREE.DoubleSide })
  );
  keyStrip.position.set(6.8, 1.5, 5.5);
  keyStrip.lookAt(0, 0, 0);
  envScene.add(keyStrip);

  // Warm amber fill bounce (left-back) for honey translucency
  const fillStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.75, 0.72), side: THREE.DoubleSide })
  );
  fillStrip.position.set(-7.2, 0.5, -4);
  fillStrip.lookAt(0, 0, 0);
  envScene.add(fillStrip);

  // Deep charcoal negative-fill silhouette cards so glass borders look unmistakably crisp on #FFFFFF
  const darkLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#14110D'), side: THREE.DoubleSide })
  );
  darkLeft.position.set(-8.2, 0, 3.6);
  darkLeft.lookAt(0, 0, 0);
  envScene.add(darkLeft);

  const darkRight = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#19140E'), side: THREE.DoubleSide })
  );
  darkRight.position.set(8.6, -1, -2.5);
  darkRight.lookAt(0, 0, 0);
  envScene.add(darkRight);

  const renderTarget = pmrem.fromScene(envScene, 0.03);
  pmrem.dispose();
  return renderTarget.texture;
}

/**
 * Draws a crisp subtle studio ground shadow texture so the Stage 05 jar sits
 * physically grounded on pure #FFFFFF white without gray smudge.
 */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0.0, 'rgba(17, 15, 12, 0.34)');
  grad.addColorStop(0.45, 'rgba(17, 15, 12, 0.16)');
  grad.addColorStop(0.78, 'rgba(17, 15, 12, 0.04)');
  grad.addColorStop(1.0, 'rgba(17, 15, 12, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Draws the gold jar lid rim texture with brushed metallic detail & Arabic script band.
 */
export function createGoldCapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 192);
  grad.addColorStop(0, '#F7DC88');
  grad.addColorStop(0.28, '#E0AC44');
  grad.addColorStop(0.7, '#C1851E');
  grad.addColorStop(1, '#98610E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 192);

  ctx.strokeStyle = 'rgba(255, 250, 224, 0.18)';
  ctx.lineWidth = 1;
  for (let y = 4; y < 192; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(24, 16, 6, 0.72)';
  ctx.font = 'bold 26px "Tajawal", "Almarai", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 6; i++) {
    ctx.fillText('عسل نحل طبيعي  ·  نحل الذهب', (i + 0.5) * (1024 / 6), 116);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * High-contrast oval "نحل الذهب" label matching the authentic product jars,
 * framed with crisp dark/gold editorial edge rings so it pops sharply against #FFFFFF.
 */
export function createBrandLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const cx = 512;
  const cy = 512;
  const rx = 442;
  const ry = 442;

  const paintLabel = (logoImg) => {
    ctx.clearRect(0, 0, 1024, 1024);

    // Outer subtle dark hairline framing ring
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1C140A';
    ctx.fill();
    ctx.restore();

    // Metallic gold border ring
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 5, ry - 5, 0, 0, Math.PI * 2);
    const goldBorder = ctx.createLinearGradient(100, 100, 924, 924);
    goldBorder.addColorStop(0, '#F7DA82');
    goldBorder.addColorStop(0.35, '#C9851C');
    goldBorder.addColorStop(0.7, '#FBE294');
    goldBorder.addColorStop(1, '#9E5E0B');
    ctx.fillStyle = goldBorder;
    ctx.fill();
    ctx.restore();

    // Crisp pure cream-white interior label face
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 22, ry - 22, 0, 0, Math.PI * 2);
    const cream = ctx.createRadialGradient(cx, cy - 60, 40, cx, cy, ry);
    cream.addColorStop(0, '#FFFFFF');
    cream.addColorStop(0.75, '#FAF1DB');
    cream.addColorStop(1, '#EEE0BF');
    ctx.fillStyle = cream;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#73420A';
    ctx.stroke();
    ctx.restore();

    // Top hexagon + bee crest
    ctx.save();
    ctx.translate(cx, 250);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = Math.cos(a) * 104;
      const py = Math.sin(a) * 104;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#181109';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#E6A22E';
    ctx.stroke();

    // Bee wings & body inside crest
    ctx.fillStyle = 'rgba(255, 250, 232, 0.92)';
    ctx.beginPath();
    ctx.ellipse(-40, -16, 44, 19, -0.32, 0, Math.PI * 2);
    ctx.ellipse(40, -16, 44, 19, 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EFA932';
    ctx.beginPath();
    ctx.ellipse(0, 14, 23, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#181109';
    ctx.fillRect(-19, 2, 38, 9);
    ctx.fillRect(-17, 22, 34, 9);
    ctx.beginPath();
    ctx.arc(0, -33, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Brand Logo Image or Fallback Bold Calligraphy
    if (logoImg) {
      const targetW = 540;
      const ratio = logoImg.height / logoImg.width;
      const targetH = targetW * ratio;
      ctx.drawImage(logoImg, cx - targetW / 2, 398, targetW, targetH);
    } else {
      ctx.fillStyle = '#14110D';
      ctx.font = '800 110px "Tajawal", "Almarai", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('نحل الذهب', cx, 466);
    }

    ctx.strokeStyle = '#B87616';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(155, 574);
    ctx.lineTo(295, 574);
    ctx.moveTo(729, 574);
    ctx.lineTo(869, 574);
    ctx.stroke();

    ctx.fillStyle = '#1F160C';
    ctx.font = '700 32px "Tajawal", "Almarai", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('عسل النحل الطبيعي ومشتقاته', cx, 574);

    // High-contrast ribbon banner ("عسل طبيعي مصري ١٠٠٪")
    ctx.save();
    ctx.fillStyle = '#14110D';
    ctx.beginPath();
    ctx.roundRect(cx - 265, 622, 530, 74, 37);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#E8A93C';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 35px "Tajawal", "Almarai", sans-serif';
    ctx.fillText('عسل مصري خام ١٠٠٪', cx, 661);
    ctx.restore();

    // Botanical leaves & honey drop crest
    ctx.save();
    ctx.translate(cx, 788);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.fillStyle = '#B87414';
      for (let k = 0; k < 4; k++) {
        ctx.save();
        ctx.translate(75 + k * 34, -k * 14);
        ctx.rotate(-0.4 - k * 0.14);
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.fillStyle = '#D98515';
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.bezierCurveTo(26, -2, 30, 26, 0, 32);
    ctx.bezierCurveTo(-30, 26, -26, -2, 0, -34);
    ctx.fill();
    ctx.restore();
  };

  paintLabel(null);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    paintLabel(img);
    texture.needsUpdate = true;
  };
  img.src = 'assets/img/logo-nahl-al-thahab.png';

  return texture;
}

function getOctagonalScale(x, z) {
  const angle = Math.atan2(z, x) + Math.PI / 8;
  const mod = ((angle % (Math.PI / 4)) + Math.PI / 4) % (Math.PI / 4) - Math.PI / 8;
  return Math.min(1 / Math.cos(mod), 1.07);
}

/**
 * Improved Final Stage 05 Clear Glass Honey Jar built specifically to read with sharp
 * silhouette edges, glass wall thickness, screw neck threads, glossy reflections, and
 * ground contact shadow against #FFFFFF white.
 */
export function createHoneyJar({ isMobile = false, initialFill = 0.25 } = {}) {
  const group = new THREE.Group();

  // Soft studio contact shadow ellipse at base
  const shadowTex = createContactShadowTexture();
  const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.position.y = -1.07;
  group.add(shadowPlane);

  // Outer faceted glass jar profile (bottom-to-top for outward normals!)
  const glassPoints = [
    new THREE.Vector2(0.0, -1.05),
    new THREE.Vector2(0.68, -1.05),
    new THREE.Vector2(0.84, -0.92),
    new THREE.Vector2(0.88, -0.78),
    new THREE.Vector2(0.88, 0.56),
    new THREE.Vector2(0.82, 0.72),
    new THREE.Vector2(0.66, 0.84),
    new THREE.Vector2(0.64, 1.02),
    new THREE.Vector2(0.69, 1.05),
    new THREE.Vector2(0.60, 1.06),
    new THREE.Vector2(0.55, 0.89),
  ];

  const radialSegs = isMobile ? 28 : 40;
  const glassGeo = new THREE.LatheGeometry(glassPoints, radialSegs);

  const pos = glassGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.7 && y > -0.9 && y < 0.7) {
      const oct = getOctagonalScale(x, z);
      const blend = THREE.MathUtils.smoothstep(y, -0.9, -0.7) * (1 - THREE.MathUtils.smoothstep(y, 0.55, 0.72));
      const scale = THREE.MathUtils.lerp(1.0, oct, blend * 0.90);
      pos.setX(i, x * scale);
      pos.setZ(i, z * scale);
    }
  }
  glassGeo.computeVertexNormals();

  // 1. Back glass shell (visible inner cavity rim when unfilled)
  const glassBackMat = createClearGlassMaterial({ backSide: true });
  const glassBackMesh = new THREE.Mesh(glassGeo, glassBackMat);
  glassBackMesh.renderOrder = 0;
  group.add(glassBackMesh);

  // 2. Inner honey volume (rich golden amber rising fill)
  const innerPoints = [
    new THREE.Vector2(0.0, -0.94),
    new THREE.Vector2(0.75, -0.94),
    new THREE.Vector2(0.81, -0.78),
    new THREE.Vector2(0.81, 0.56),
    new THREE.Vector2(0.76, 0.70),
    new THREE.Vector2(0.60, 0.82),
    new THREE.Vector2(0.57, 0.88),
    new THREE.Vector2(0.0, 0.88),
  ];
  const innerGeo = new THREE.LatheGeometry(innerPoints, radialSegs);
  const ipos = innerGeo.attributes.position;
  for (let i = 0; i < ipos.count; i++) {
    const x = ipos.getX(i);
    const y = ipos.getY(i);
    const z = ipos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.65 && y > -0.82 && y < 0.62) {
      const oct = getOctagonalScale(x, z);
      const blend = THREE.MathUtils.smoothstep(y, -0.82, -0.65) * (1 - THREE.MathUtils.smoothstep(y, 0.45, 0.62));
      const scale = THREE.MathUtils.lerp(1.0, oct, blend * 0.86);
      ipos.setX(i, x * scale);
      ipos.setZ(i, z * scale);
    }
  }
  innerGeo.computeVertexNormals();

  const honeyMat = createJarHoneyMaterial();
  honeyMat.uniforms.uFillLevel.value = initialFill;
  const innerHoneyMesh = new THREE.Mesh(innerGeo, honeyMat);
  innerHoneyMesh.renderOrder = 1;
  group.add(innerHoneyMesh);

  // 3. Top liquid meniscus cap + viscous honey coiling mound at pour contact center
  const surfGeo = new THREE.CircleGeometry(0.79, radialSegs);
  surfGeo.rotateX(-Math.PI / 2);
  const surfMat = createLiquidHoneyMaterial();
  surfMat.uniforms.uCoreColor.value.set('#A84B08');
  surfMat.uniforms.uMidColor.value.set('#E6951D');
  const surfaceMesh = new THREE.Mesh(surfGeo, surfMat);
  surfaceMesh.renderOrder = 2;
  group.add(surfaceMesh);

  const coilGeo = new THREE.TorusGeometry(0.085, 0.036, 14, 28);
  coilGeo.rotateX(Math.PI / 2);
  const coilMat = createLiquidHoneyMaterial();
  const coilMesh = new THREE.Mesh(coilGeo, coilMat);
  coilMesh.renderOrder = 2;
  group.add(coilMesh);

  // 4. Crystal-Clear High-Contrast Front Glass Shell
  const glassFrontMat = createClearGlassMaterial({ backSide: false });
  const glassMesh = new THREE.Mesh(glassGeo, glassFrontMat);
  glassMesh.renderOrder = 3;
  group.add(glassMesh);

  // Crisp glass screw-thread rings & open mouth rim lip so upper opening reads unmistakably!
  for (const ty of [0.89, 0.945, 1.00]) {
    const threadGeo = new THREE.TorusGeometry(0.655, 0.018, 10, 36);
    threadGeo.rotateX(Math.PI / 2);
    const threadMesh = new THREE.Mesh(threadGeo, glassFrontMat);
    threadMesh.position.y = ty;
    threadMesh.renderOrder = 3;
    group.add(threadMesh);
  }
  const mouthRimGeo = new THREE.TorusGeometry(0.625, 0.034, 12, 36);
  mouthRimGeo.rotateX(Math.PI / 2);
  const mouthRim = new THREE.Mesh(mouthRimGeo, glassFrontMat);
  mouthRim.position.y = 1.055;
  mouthRim.renderOrder = 3;
  group.add(mouthRim);

  // 5. Sharp Curved Brand Oval Label ("نحل الذهب") on +Z flat front wall
  const labelTex = createBrandLabelTexture();
  const labelGeo = new THREE.CylinderGeometry(0.916, 0.916, 0.98, 40, 12, true, -0.62, 1.24);
  const lpos = labelGeo.attributes.position;
  for (let i = 0; i < lpos.count; i++) {
    const x = lpos.getX(i);
    const z = lpos.getZ(i);
    const oct = getOctagonalScale(x, z);
    const desiredScale = THREE.MathUtils.lerp(1.0, oct, 0.90);
    lpos.setX(i, x * desiredScale);
    lpos.setZ(i, z * desiredScale);
  }
  labelGeo.computeVertexNormals();

  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    transparent: true,
    alphaTest: 0.12,
    roughness: 0.32,
    metalness: 0.08,
    envMapIntensity: 1.0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = -0.10;
  labelMesh.renderOrder = 4;
  group.add(labelMesh);

  // 6. Brushed Gold Lid Assembly (centered around local origin so tilt rotates cleanly in place)
  const lidGroup = new THREE.Group();
  const capTex = createGoldCapTexture();
  const capGeo = new THREE.CylinderGeometry(0.71, 0.72, 0.26, 36, 1, true);
  const capSkirtMat = new THREE.MeshStandardMaterial({
    map: capTex,
    metalness: 0.80,
    roughness: 0.22,
    envMapIntensity: 1.45,
  });
  const capSkirt = new THREE.Mesh(capGeo, capSkirtMat);
  capSkirt.position.y = -0.07;
  lidGroup.add(capSkirt);

  const capTopGeo = new THREE.CylinderGeometry(0.69, 0.71, 0.04, 36);
  const capTopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E3AF49'),
    metalness: 0.85,
    roughness: 0.18,
    envMapIntensity: 1.5,
  });
  const capTop = new THREE.Mesh(capTopGeo, capTopMat);
  capTop.position.y = 0.05;
  lidGroup.add(capTop);

  const rimGeo = new THREE.TorusGeometry(0.66, 0.025, 10, 36);
  rimGeo.rotateX(Math.PI / 2);
  const capRim = new THREE.Mesh(rimGeo, capTopMat);
  capRim.position.y = 0.06;
  lidGroup.add(capRim);

  lidGroup.position.y = 1.10;
  group.add(lidGroup);

  let currentSurfaceY = THREE.MathUtils.lerp(-0.94, 0.84, initialFill);

  const updateFill = (level, ripple = 0, time = 0, showCoil = true) => {
    const clamped = THREE.MathUtils.clamp(level, 0.0, 1.0);
    honeyMat.uniforms.uFillLevel.value = clamped;
    honeyMat.uniforms.uRipple.value = ripple;
    honeyMat.uniforms.uTime.value = time;
    surfMat.uniforms.uTime.value = time;
    coilMat.uniforms.uTime.value = time;

    const minY = honeyMat.uniforms.uMinY.value;
    const maxY = honeyMat.uniforms.uMaxY.value;
    const y = THREE.MathUtils.lerp(minY, maxY, clamped);
    currentSurfaceY = y;

    surfaceMesh.visible = clamped > 0.02;
    surfaceMesh.position.y = y + 0.004;
    const shoulderShrink = y > 0.56 ? THREE.MathUtils.lerp(1.0, 0.72, (y - 0.56) / 0.34) : 1.0;
    surfaceMesh.scale.set(shoulderShrink, 1, shoulderShrink);

    coilMesh.visible = showCoil && clamped > 0.03;
    if (coilMesh.visible) {
      coilMesh.position.set(
        Math.cos(time * 5.2) * 0.03,
        y + 0.028,
        Math.sin(time * 5.2) * 0.03
      );
      const pulse = 0.88 + Math.sin(time * 6.0) * 0.14;
      coilMesh.scale.set(pulse, 1.0, pulse);
    }
  };

  updateFill(initialFill, 0, 0, true);

  return {
    group,
    lidGroup,
    glassMesh,
    labelMesh,
    honeyMat,
    surfaceMesh,
    getSurfaceY: () => currentSurfaceY,
    updateFill,
  };
}

/**
 * Builds a continuous vertical/catenoid pouring column Geometry centered around X=Z=0,
 * Y spanning from 0 (bottom impact end) to height H (top spout mouth), so `vUv.y = 1` at nozzle
 * and `0` at impact. Zero detached dots — one smooth viscous honey stream.
 */
export function createContinuousPourGeometry({
  topRadius = 0.075,
  midRadius = 0.048,
  botRadius = 0.062,
  height = 2.0,
  radialSegments = 20,
  heightSegments = 36,
} = {}) {
  const geo = new THREE.CylinderGeometry(topRadius, botRadius, height, radialSegments, heightSegments, false);
  // Shift so bottom = 0, top = height
  geo.translate(0, height * 0.5, 0);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = THREE.MathUtils.clamp(y / height, 0, 1); // 0 bottom -> 1 top
    // Smooth catenary thinning through middle waist + tiny bell flare near inlet
    const bellTop = Math.pow(THREE.MathUtils.smoothstep(t, 0.72, 1.0), 1.4);
    const poolBot = Math.pow(1.0 - THREE.MathUtils.smoothstep(t, 0.0, 0.25), 1.5);
    const currBase = THREE.MathUtils.lerp(botRadius, topRadius, t);
    const targetR = THREE.MathUtils.lerp(midRadius, topRadius, bellTop) + (botRadius - midRadius) * poolBot * 0.65;
    const ratio = currBase > 0.0001 ? targetR / currBase : 1.0;
    pos.setX(i, x * ratio);
    pos.setZ(i, z * ratio);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Deterministic cell pseudo-random generator so organic honeycomb fracturing & cell
 * depth variations stay rock-solid across frames and reloads.
 */
function cellHash(c, r) {
  const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Ray-casting point-in-polygon check for irregular fractured comb boundaries.
 */
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < ((xj - xi) * (py - yi)) / ((yj - yi) || 1e-9) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Procedural organic golden-cream beeswax albedo & fine micro-pitted bump textures
 * so front hex walls and fractured borders look like real hand-broken natural honeycomb.
 */
function createBeeswaxTextures() {
  const size = 512;
  const colCanvas = document.createElement('canvas');
  colCanvas.width = size;
  colCanvas.height = size;
  const cCtx = colCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  // Keep texture tint nearly neutral-cream so multiplying vertex colors preserves authentic
  // golden beeswax hues instead of over-saturating into peach/salmon under ACES tone mapping.
  const grad = cCtx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0.0, '#FFFDF6');
  grad.addColorStop(0.45, '#F8F0DA');
  grad.addColorStop(0.85, '#EFE0BE');
  grad.addColorStop(1.0, '#FAF4E3');
  cCtx.fillStyle = grad;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle organic wax flakes, warm golden marbling & micro-pitting
  for (let i = 0; i < 680; i++) {
    const x = cellHash(i, 1.3) * size;
    const y = cellHash(i, 7.9) * size;
    const r = 4 + cellHash(i, 13.7) * 26;
    const warm = cellHash(i, 23.1);

    const g = cCtx.createRadialGradient(x, y, 0, x, y, r);
    if (warm > 0.52) {
      g.addColorStop(0, 'rgba(255, 250, 228, 0.24)');
      g.addColorStop(1, 'rgba(255, 250, 228, 0)');
    } else {
      g.addColorStop(0, 'rgba(205, 166, 94, 0.18)');
      g.addColorStop(1, 'rgba(205, 166, 94, 0)');
    }
    cCtx.fillStyle = g;
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();

    const bv = Math.round(92 + warm * 82);
    const bg = bCtx.createRadialGradient(x, y, 0, x, y, r * 0.85);
    bg.addColorStop(0, `rgba(${bv},${bv},${bv},0.35)`);
    bg.addColorStop(1, 'rgba(128,128,128,0)');
    bCtx.fillStyle = bg;
    bCtx.beginPath();
    bCtx.arc(x, y, r * 0.85, 0, Math.PI * 2);
    bCtx.fill();
  }

  const map = new THREE.CanvasTexture(colCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

/**
 * Shrinks an irregular broken contour slightly inward toward its centroid so the central
 * beeswax midrib never bulges outside the jagged fractured perimeter hexagonal cells.
 */
function insetPoly(poly, shrinkDist) {
  let cx = 0, cy = 0;
  for (const [x, y] of poly) { cx += x; cy += y; }
  cx /= poly.length;
  cy /= poly.length;
  return poly.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const factor = Math.max(0.45, (len - shrinkDist) / len);
    return [cx + dx * factor, cy + dy * factor];
  });
}

/**
 * Watertight quantized corner hash so adjacent hex cells share identical organic corner jitter.
 */
function getJitteredHexVertex(px, py, cx, cy, outerR, a) {
  const ux = cx + Math.cos(a) * outerR;
  const uy = cy + Math.sin(a) * outerR;
  const qx = Math.round(ux * 220);
  const qy = Math.round(uy * 220);
  const dx = (cellHash(qx, qy) - 0.5) * outerR * 0.12;
  const dy = (cellHash(qx + 17, qy + 31) - 0.5) * outerR * 0.12;
  return [ux + dx, uy + dy];
}

/**
 * Builds an extruded non-uniform hexagonal beeswax lattice mesh that cleanly fractures open
 * half-cells along an irregular broken polygon boundary in ONE single draw call without
 * protruding outward spikes, with deep recessed golden-amber throats & creamy wax rims.
 */
function buildFracturedCombCellsGeometry({
  contour,
  cellR = 0.068,
  depthFront = 0.095,
  depthBack = 0.065,
  septumHalfZ = 0.020,
  zTilt = 0.012,
  warmRimScale = 1.0,
} = {}) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of contour) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const positions = [];
  const colors = [];
  const uvs = [];
  const indices = [];

  const tmpColA = new THREE.Color();
  const tmpColB = new THREE.Color();
  const tmpColC = new THREE.Color();
  // Rich caramelized beeswax interior -> warm golden-amber cell walls -> honey-kissed gold rims
  const colFloor = new THREE.Color('#240C00');
  const colThroat = new THREE.Color('#542001');
  const colMid = new THREE.Color('#A6620C');
  const colWaxOuter = new THREE.Color('#B87616');
  const colRimBright = new THREE.Color('#E4BA54').multiplyScalar(warmRimScale);
  const colRimWarm = new THREE.Color('#C68D24').multiplyScalar(warmRimScale);

  const pushTri = (a, b, c, ca, cb, cc) => {
    const base = positions.length / 3;
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    colors.push(
      ca.r, ca.g, ca.b,
      cb.r, cb.g, cb.b,
      cc.r, cc.g, cc.b
    );
    uvs.push(
      a[0] * 0.65 + 0.5, a[1] * 0.65 + 0.5,
      b[0] * 0.65 + 0.5, b[1] * 0.65 + 0.5,
      c[0] * 0.65 + 0.5, c[1] * 0.65 + 0.5
    );
    indices.push(base, base + 1, base + 2);
  };

  const pushQuad = (a, b, c, d, ca, cb, cc, cd) => {
    pushTri(a, b, c, ca, cb, cc);
    pushTri(a, c, d, ca, cc, cd);
  };

  const colStep = Math.sqrt(3) * cellR;
  const rowStep = 1.5 * cellR;
  const rMin = Math.floor((minY - cellR) / rowStep);
  const rMax = Math.ceil((maxY + cellR) / rowStep);
  const cMin = Math.floor((minX - cellR) / colStep) - 1;
  const cMax = Math.ceil((maxX + cellR) / colStep) + 1;

  const openCells = [];
  const sealedCells = [];

  const wallMaskPoly = contour;

  const addHexPrismFace = (cx, cy, dirSign, baseZ, wallDepth, rnd) => {
    const outerR = cellR * 1.02;
    const midR = cellR * 0.89;
    const innerR = cellR * 0.77;

    const rimTone = tmpColA.copy(colRimBright).lerp(colRimWarm, rnd * 0.62);
    const rim0 = rimTone.clone();
    const midTone = colMid.clone().lerp(colThroat, (1 - rnd) * 0.25);

    const floorPts = [];

    for (let k = 0; k < 6; k++) {
      const kNext = (k + 1) % 6;
      const a0 = (Math.PI / 3) * k + Math.PI / 6;
      const a1 = (Math.PI / 3) * kNext + Math.PI / 6;

      const [ox0, oy0] = getJitteredHexVertex(0, 0, cx, cy, outerR, a0);
      const [ox1, oy1] = getJitteredHexVertex(0, 0, cx, cy, outerR, a1);

      const ix0 = cx + (ox0 - cx) * (innerR / outerR);
      const iy0 = cy + (oy0 - cy) * (innerR / outerR);
      const ix1 = cx + (ox1 - cx) * (innerR / outerR);
      const iy1 = cy + (oy1 - cy) * (innerR / outerR);

      const rx0 = cx + (ox0 - cx) * (midR / outerR);
      const ry0 = cy + (oy0 - cy) * (midR / outerR);
      const rx1 = cx + (ox1 - cx) * (midR / outerR);
      const ry1 = cy + (oy1 - cy) * (midR / outerR);

      const aMid = (Math.PI / 3) * k + Math.PI / 3;
      const nbX = cx + Math.cos(aMid) * colStep;
      const nbY = cy + Math.sin(aMid) * colStep;
      const isOuterBoundaryEdge = !pointInPoly(nbX, nbY, wallMaskPoly);

      const chipScale = isOuterBoundaryEdge
        ? (0.56 + cellHash(Math.round(ox0 * 90), Math.round(oy0 * 90)) * 0.36)
        : (0.90 + rnd * 0.16);

      const und0 = Math.sin(ox0 * 2.8 + oy0 * 2.1) * zTilt;
      const und1 = Math.sin(ox1 * 2.8 + oy1 * 2.1) * zTilt;

      const z0_0 = dirSign * baseZ + und0;
      const z0_1 = dirSign * baseZ + und1;
      const zMid_0 = dirSign * (baseZ + wallDepth * chipScale * 0.72) + und0;
      const zMid_1 = dirSign * (baseZ + wallDepth * chipScale * 0.72) + und1;
      const zTip_0 = dirSign * (baseZ + wallDepth * chipScale) + und0;
      const zTip_1 = dirSign * (baseZ + wallDepth * chipScale) + und1;

      const O0 = [ox0, oy0, z0_0], O1 = [ox1, oy1, z0_1];
      const B0 = [ox0, oy0, zMid_0], B1 = [ox1, oy1, zMid_1];
      const R0 = [rx0, ry0, zTip_0], R1 = [rx1, ry1, zTip_1];
      const I0 = [ix0, iy0, zMid_0], I1 = [ix1, iy1, zMid_1];
      const D0 = [ix0, iy0, z0_0], D1 = [ix1, iy1, z0_1];

      if (dirSign > 0) {
        pushQuad(O0, O1, B1, B0, colWaxOuter, colWaxOuter, midTone, midTone);
        pushQuad(B0, B1, R1, R0, midTone, midTone, rim0, rim0);
        pushQuad(R0, R1, I1, I0, rim0, rim0, colMid, colMid);
        pushQuad(I0, I1, D1, D0, colThroat, colThroat, colFloor, colFloor);
        floorPts.push([D0, D1]);

        if (isOuterBoundaryEdge) {
          const Ob0 = [ox0, oy0, -baseZ + und0];
          const Ob1 = [ox1, oy1, -baseZ + und1];
          pushQuad(O1, O0, Ob0, Ob1, colWaxOuter, colWaxOuter, colWaxOuter, colWaxOuter);
        }
      } else {
        pushQuad(O1, O0, B0, B1, colWaxOuter, colWaxOuter, midTone, midTone);
        pushQuad(B1, B0, R0, R1, midTone, midTone, rim0, rim0);
        pushQuad(R1, R0, I0, I1, rim0, rim0, colMid, colMid);
        pushQuad(I1, I0, D0, D1, colThroat, colThroat, colFloor, colFloor);
        floorPts.push([D0, D1]);
      }
    }

    // Solid amber floor triangle fan inside BOTH front & back of every kept cell (100% watertight!)
    if (floorPts.length) {
      const undC = Math.sin(cx * 2.8 + cy * 2.1) * zTilt;
      const C = [cx, cy, dirSign * (baseZ * 0.72) + undC];
      const cDeep = tmpColB.set('#3A1601');
      const cWallFloor = tmpColC.set('#6E3504');
      for (const [D0, D1] of floorPts) {
        if (dirSign > 0) pushTri(C, D0, D1, cDeep, cWallFloor, cWallFloor);
        else pushTri(C, D1, D0, cDeep, cWallFloor, cWallFloor);
      }
    }
  };

  for (let r = rMin; r <= rMax; r++) {
    const cy = r * rowStep;
    const xShift = (Math.abs(r) % 2) * (colStep * 0.5);
    for (let c = cMin; c <= cMax; c++) {
      const cx = c * colStep + xShift;
      if (!pointInPoly(cx, cy, wallMaskPoly)) continue;

      let boundaryCount = 0;
      for (let k = 0; k < 6; k++) {
        const aMid = (Math.PI / 3) * k + Math.PI / 3;
        if (!pointInPoly(cx + Math.cos(aMid) * colStep, cy + Math.sin(aMid) * colStep, wallMaskPoly)) {
          boundaryCount++;
        }
      }

      const rnd = cellHash(c, r);
      addHexPrismFace(cx, cy, +1, septumHalfZ, depthFront, rnd);
      addHexPrismFace(cx, cy, -1, septumHalfZ, depthBack, rnd);

      const undulation = Math.sin(cx * 2.8 + cy * 2.1) * zTilt;
      const sealScore = Math.sin(cx * 3.2 - cy * 2.4) * 0.16 + rnd;
      if (sealScore > 0.965 && boundaryCount === 0) {
        sealedCells.push({ cx, cy, rnd, undulation });
      } else {
        openCells.push({ cx, cy, rnd, undulation, isEdge: boundaryCount > 0 });
      }
    }
  }

  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  wallGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  wallGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  wallGeo.setIndex(indices);
  wallGeo.computeVertexNormals();

  return { wallGeo, openCells, sealedCells };
}

/**
 * Builds a gentle 3-ring silky concave honey saucer matching a pointy-top hexagon cell,
 * shaded from deep warm amber center -> molten golden honey capillary rim without harsh cone glints.
 */
function createConcaveHoneyPoolGeometry(cellR) {
  const outerR = cellR * 0.785;
  const midR = cellR * 0.48;
  const cCenter = new THREE.Color('#662F02');
  const cMid = new THREE.Color('#CE7E08');
  const cRim = new THREE.Color('#F7C538');

  const positions = [0, 0, -0.013];
  const colors = [cCenter.r, cCenter.g, cCenter.b];
  const indices = [];

  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    const cosA = Math.cos(a), sinA = Math.sin(a);
    positions.push(cosA * midR, sinA * midR, -0.007);
    colors.push(cMid.r, cMid.g, cMid.b);
    positions.push(cosA * outerR, sinA * outerR, 0.008);
    colors.push(cRim.r, cRim.g, cRim.b);
  }

  for (let k = 0; k < 6; k++) {
    const kNext = (k + 1) % 6;
    const m0 = 1 + k * 2;
    const r0 = m0 + 1;
    const m1 = 1 + kNext * 2;
    const r1 = m1 + 1;
    indices.push(0, m0, m1);
    indices.push(m0, r0, r1);
    indices.push(m0, r1, m1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a single genuine 3D irregular broken honeycomb chunk where interior hex mosaics
 * extend all the way to the fractured stepped perimeter (zero biscuit flange!), backed cleanly
 * inside by an inset septum and filled with silky concave amber honey meniscus pools.
 */
function createBrokenCombChunk({
  contour,
  cellR = 0.068,
  depthFront = 0.095,
  depthBack = 0.062,
  septumHalfZ = 0.022,
  honeyIntensity = 0.78,
  zTilt = 0.012,
  materials,
  simplified = false,
} = {}) {
  const chunkGroup = new THREE.Group();

  // 1. Interior reinforcing wax midrib inset well inside outer mosaic ring (zero outside rim flange!)
  const innerPoly = insetPoly(contour, cellR * 0.55);
  const shape = new THREE.Shape();
  innerPoly.forEach(([x, y], idx) => {
    if (idx === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  const septumGeo = new THREE.ExtrudeGeometry(shape, {
    depth: septumHalfZ * 1.4,
    bevelEnabled: false,
    curveSegments: 1,
  });
  septumGeo.translate(0, 0, -septumHalfZ * 0.7);
  const sPos = septumGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const sx = sPos.getX(i);
    const sy = sPos.getY(i);
    const sz = sPos.getZ(i);
    sPos.setZ(i, sz + Math.sin(sx * 2.8 + sy * 2.1) * zTilt);
  }
  septumGeo.computeVertexNormals();
  chunkGroup.add(new THREE.Mesh(septumGeo, materials.septumMat));

  // 2. Watertight vertex-colored fractured hexagonal beeswax cell walls front & back + outer skirts
  const { wallGeo, openCells, sealedCells } = buildFracturedCombCellsGeometry({
    contour,
    cellR,
    depthFront,
    depthBack,
    septumHalfZ: septumHalfZ * 0.72,
    zTilt,
  });
  chunkGroup.add(new THREE.Mesh(wallGeo, materials.wallMat));

  // 3. Silky concave shimmering golden-amber liquid meniscus pools inside open uncapped cells
  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();
  if (openCells.length) {
    const poolGeo = createConcaveHoneyPoolGeometry(cellR);
    const frontAndBack = simplified ? 1 : 2;
    const poolInst = new THREE.InstancedMesh(poolGeo, materials.cellHoneyMat, openCells.length * frontAndBack);
    let pIdx = 0;
    openCells.forEach((cell) => {
      const clusterGlow = Math.sin(cell.cx * 3.8 + cell.cy * 2.9) * 0.5 + 0.5;
      const depthBias = cell.rnd < 0.25 ? 0.16 : 0.30 + cell.rnd * 0.44 * honeyIntensity;
      const zFill = septumHalfZ * 0.66 + depthFront * depthBias + cell.undulation;
      dummy.position.set(cell.cx, cell.cy, zFill);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poolInst.setMatrixAt(pIdx, dummy.matrix);
      const luma = THREE.MathUtils.clamp(0.56 + cell.rnd * 0.20 + clusterGlow * 0.14, 0.54, 0.90);
      cColor.setHSL(0.112 + cell.rnd * 0.015, 0.92, luma);
      poolInst.setColorAt(pIdx, cColor);
      pIdx++;

      if (!simplified) {
        dummy.position.set(cell.cx, cell.cy, -(septumHalfZ * 0.66 + depthBack * 0.34) + cell.undulation);
        dummy.rotation.set(0, Math.PI, 0);
        dummy.updateMatrix();
        poolInst.setMatrixAt(pIdx, dummy.matrix);
        poolInst.setColorAt(pIdx, cColor);
        pIdx++;
      }
    });
    poolInst.instanceMatrix.needsUpdate = true;
    if (poolInst.instanceColor) poolInst.instanceColor.needsUpdate = true;
    chunkGroup.add(poolInst);
  }

  // 4. Organic warm beeswax cappings scattered naturally in subtle sparse clusters
  if (sealedCells.length && !simplified) {
    const capGeo = new THREE.CylinderGeometry(cellR * 0.79, cellR * 0.85, 0.024, 6);
    capGeo.rotateX(Math.PI / 2);
    const capInst = new THREE.InstancedMesh(capGeo, materials.waxCapMat, sealedCells.length);
    sealedCells.forEach((cell, idx) => {
      dummy.position.set(cell.cx, cell.cy, septumHalfZ * 0.72 + depthFront * 0.66 + cell.undulation);
      dummy.rotation.set((cell.rnd - 0.5) * 0.14, (cell.rnd - 0.5) * 0.14, 0);
      dummy.scale.setScalar(0.94 + cell.rnd * 0.10);
      dummy.updateMatrix();
      capInst.setMatrixAt(idx, dummy.matrix);
      cColor.setHSL(0.114 + cell.rnd * 0.008, 0.58, 0.48 + cell.rnd * 0.08);
      capInst.setColorAt(idx, cColor);
    });
    capInst.instanceMatrix.needsUpdate = true;
    if (capInst.instanceColor) capInst.instanceColor.needsUpdate = true;
    chunkGroup.add(capInst);
  }

  return chunkGroup;
}

/**
 * Helper to compute vertex colors across a flower petal from deep saffron throat -> rich
 * buttercup gold mid -> bright luminous yellow tip so blooms show natural crisp petal relief.
 */
function applyPetalVertexGradient(geo, radius, innerHex = '#A85201', midHex = '#EFA800', tipHex = '#FFD818') {
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const cInner = new THREE.Color(innerHex);
  const cMid = new THREE.Color(midHex);
  const cTip = new THREE.Color(tipHex);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = THREE.MathUtils.clamp(Math.hypot(x, y) / Math.max(0.001, radius), 0, 1);
    if (t < 0.38) {
      c.copy(cInner).lerp(cMid, t / 0.38);
    } else {
      c.copy(cMid).lerp(cTip, (t - 0.38) / 0.62);
    }
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
}

/**
 * Builds a bushy, layered golden-yellow wildflower head with rich petal shading
 * matching the golden meadow chrysanthemum blossoms in `/home/antigravity/image.png`.
 */
function createFluffyWildflowerHead({ radius = 0.14, petalMat, centerMat, calyxMat } = {}) {
  const head = new THREE.Group();

  const calyx = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.42, radius * 0.56, 8), calyxMat);
  calyx.rotation.x = Math.PI / 2;
  calyx.position.z = -radius * 0.14;
  head.add(calyx);

  const rings = [
    { count: 14, tintScale: 1.0,  tilt: 0.24, z: 0.0,           len: 1.0,  wid: 1.0 },
    { count: 12, tintScale: 0.94, tilt: 0.50, z: radius * 0.09, len: 0.78, wid: 0.92 },
    { count: 9,  tintScale: 0.88, tilt: 0.78, z: radius * 0.16, len: 0.54, wid: 0.80 },
  ];

  // Pointed notched strap petal geometry
  const pShape = new THREE.Shape();
  pShape.moveTo(0, 0);
  pShape.bezierCurveTo(radius * 0.14, radius * 0.25, radius * 0.16, radius * 0.72, 0.04 * radius, radius * 0.98);
  pShape.lineTo(0, radius * 0.92);
  pShape.lineTo(-0.04 * radius, radius * 0.98);
  pShape.bezierCurveTo(-radius * 0.16, radius * 0.72, -radius * 0.14, radius * 0.25, 0, 0);

  const petalGeo = new THREE.ExtrudeGeometry(pShape, {
    depth: 0.005,
    bevelEnabled: false,
    curveSegments: 6,
  });
  const pPos = petalGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const py = pPos.getY(i);
    const t = THREE.MathUtils.clamp(py / radius, 0, 1);
    pPos.setZ(i, pPos.getZ(i) + Math.pow(t, 1.5) * radius * 0.16);
  }
  petalGeo.computeVertexNormals();
  applyPetalVertexGradient(petalGeo, radius, '#843600', '#D18200', '#F0B200');

  rings.forEach((ring, rIdx) => {
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + rIdx * 0.26 + cellHash(i, rIdx) * 0.14;
      const pHolder = new THREE.Group();
      pHolder.rotation.z = a;
      pHolder.position.z = ring.z;
      const p = new THREE.Mesh(petalGeo, petalMat);
      p.rotation.x = -ring.tilt;
      p.scale.set(ring.wid, ring.len, 1);
      pHolder.add(p);
      head.add(pHolder);
    }
  });

  const core = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.24, 10, 8), centerMat);
  core.scale.set(1, 1, 0.68);
  core.position.z = radius * 0.14;
  head.add(core);

  return head;
}

/**
 * Builds the signature 5-petal bright buttercup-yellow blossom with shaded vein curvature
 * and saffron-tipped stamen crown nestled cleanly at the lower-right honey edge.
 */
function createFivePetalFlower({ radius = 0.26, petalMat, centerMat, calyxMat } = {}) {
  const flower = new THREE.Group();

  const calyx = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.22, radius * 0.12, radius * 0.22, 8), calyxMat);
  calyx.rotation.x = Math.PI / 2;
  calyx.position.z = -radius * 0.08;
  flower.add(calyx);

  const pShape = new THREE.Shape();
  pShape.moveTo(0, 0);
  pShape.bezierCurveTo(radius * 0.34, radius * 0.20, radius * 0.58, radius * 0.66, radius * 0.26, radius * 0.94);
  pShape.quadraticCurveTo(0, radius * 1.03, -radius * 0.26, radius * 0.94);
  pShape.bezierCurveTo(-radius * 0.58, radius * 0.66, -radius * 0.34, radius * 0.20, 0, 0);

  const pGeo = new THREE.ExtrudeGeometry(pShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 12,
  });
  const pPos = pGeo.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const px = pPos.getX(i);
    const py = pPos.getY(i);
    const pz = pPos.getZ(i);
    const rN = Math.hypot(px, py) / radius;
    const rib = Math.cos((px / (radius * 0.36)) * Math.PI) * 0.006 * rN;
    pPos.setZ(i, pz + Math.pow(rN, 1.45) * (radius * 0.24) - (px * px) * 0.40 + rib);
  }
  pGeo.computeVertexNormals();
  applyPetalVertexGradient(pGeo, radius, '#8F3C00', '#DA8D00', '#F7BC00');

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.18;
    const holder = new THREE.Group();
    holder.rotation.z = a;
    const petal = new THREE.Mesh(pGeo, petalMat);
    petal.rotation.x = -0.14;
    petal.position.z = (i % 2) * 0.006;
    holder.add(petal);
    flower.add(holder);
  }

  const pistil = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.17, 12, 10), centerMat);
  pistil.scale.set(1, 1, 0.72);
  pistil.position.z = radius * 0.09;
  flower.add(pistil);

  const filamentGeo = new THREE.CylinderGeometry(0.0045, 0.0055, radius * 0.24, 5);
  filamentGeo.translate(0, radius * 0.12, 0);
  const antherGeo = new THREE.SphereGeometry(0.015, 6, 6);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const st = new THREE.Group();
    st.rotation.z = a;
    st.position.set(Math.cos(a) * radius * 0.12, Math.sin(a) * radius * 0.12, radius * 0.06);
    const fil = new THREE.Mesh(filamentGeo, centerMat);
    fil.rotation.x = 0.56 + (i % 2) * 0.18;
    st.add(fil);
    const ant = new THREE.Mesh(antherGeo, centerMat);
    ant.position.set(0, Math.cos(fil.rotation.x) * radius * 0.24, Math.sin(fil.rotation.x) * radius * 0.24);
    st.add(ant);
    flower.add(st);
  }

  return flower;
}

/**
 * Helper to create a tapered continuous tube ribbon along a CatmullRomCurve3 so liquid
 * honey bridges neck gracefully at both chunk junctions while swelling along mid-flow.
 */
function createTaperedBridgeGeometry({
  points,
  radiusStart = 0.048,
  radiusMid = 0.032,
  radiusEnd = 0.046,
  tubularSegments = 32,
  radialSegments = 12,
  flattenZ = 1.0,
} = {}) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, tubularSegments, 1.0, radialSegments, false);
  const pos = geo.attributes.position;
  const ringCount = radialSegments + 1;
  const centerPt = new THREE.Vector3();

  for (let seg = 0; seg <= tubularSegments; seg++) {
    const t = seg / tubularSegments;
    curve.getPointAt(t, centerPt);
    const bellTop = Math.pow(1.0 - THREE.MathUtils.smoothstep(t, 0.0, 0.35), 1.4);
    const bellBot = Math.pow(THREE.MathUtils.smoothstep(t, 0.68, 1.0), 1.4);
    const r = radiusMid + (radiusStart - radiusMid) * bellTop + (radiusEnd - radiusMid) * bellBot;

    for (let j = 0; j < ringCount; j++) {
      const idx = seg * ringCount + j;
      const vx = pos.getX(idx) - centerPt.x;
      const vy = pos.getY(idx) - centerPt.y;
      const vz = (pos.getZ(idx) - centerPt.z) * flattenZ;
      pos.setXYZ(idx, centerPt.x + vx * r, centerPt.y + vy * r, centerPt.z + vz * r);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Hero 3D Broken Honeycomb Composition matching `/home/antigravity/image.png`:
 *  - 3 Forefront tightly nestled fractured broken honeycomb chunks with clean sheared half-hex cups
 *  - 3 Real 3D background honeycomb chunks rendered via soft optical bokeh depth-of-field pass
 *  - 3D yellow buttercup & chrysanthemum wildflower stems wrapping naturally around the pieces
 *  - Natural golden-amber cascading honey hugging fractured shoulders down into a plump glossy
 *    hanging bottom drop belly attached directly onto the Main Slab V-apex (`spoutAnchor`).
 */
export function createBrokenHoneycombComposition({ isMobile = false } = {}) {
  const root = new THREE.Group();
  const fgGroup = new THREE.Group();
  const bgGroup = new THREE.Group();
  root.add(fgGroup);

  const waxTex = createBeeswaxTextures();

  const sharedMats = {
    septumMat: new THREE.MeshStandardMaterial({
      map: waxTex.map,
      bumpMap: waxTex.bumpMap,
      bumpScale: 0.024,
      color: new THREE.Color('#D4962A'),
      emissive: new THREE.Color('#2E1A02'),
      emissiveIntensity: 0.10,
      roughness: 0.34,
      metalness: 0.02,
      envMapIntensity: 0.95,
    }),
    wallMat: new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: waxTex.map,
      bumpMap: waxTex.bumpMap,
      bumpScale: 0.022,
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#241200'),
      emissiveIntensity: 0.06,
      roughness: 0.30,
      metalness: 0.02,
      envMapIntensity: 0.88,
    }),
    waxCapMat: new THREE.MeshStandardMaterial({
      map: waxTex.map,
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#382404'),
      emissiveIntensity: 0.06,
      roughness: 0.50,
      metalness: 0.02,
      envMapIntensity: 0.78,
    }),
    cellHoneyMat: new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#3D1900'),
      emissiveIntensity: 0.14,
      roughness: 0.19,
      metalness: 0.01,
      clearcoat: 0.24,
      clearcoatRoughness: 0.34,
      envMapIntensity: 0.42,
    }),
  };

  // Animated warm golden honey flow & hugging amber pool materials (NO red-orange tint!)
  const bridgeFlowMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 2.1,
    pulseAmp: 0.006,
  });
  const glazeFlowMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 1.65,
    pulseAmp: 0.004,
  });
  const pocketMat = createLiquidHoneyMaterial({
    animatedFlow: false,
    warmGolden: true,
  });

  // ------------------------------------------------------------------
  // 1. FOREGROUND 3 IRREGULAR BROKEN HONEYCOMB PIECES (authentic angular slabs)
  // ------------------------------------------------------------------

  // A) Upper-Center Chunk — chunky irregular broken nugget tilted gently forward
  const upperContour = [
    [-0.36, 0.20], [-0.20, 0.34], [0.04, 0.36], [0.22, 0.30],
    [0.37, 0.14], [0.40, -0.06], [0.33, -0.22], [0.20, -0.34],
    [-0.02, -0.36], [-0.22, -0.28], [-0.36, -0.14], [-0.41, 0.04],
  ];
  const upperChunk = createBrokenCombChunk({
    contour: upperContour,
    cellR: isMobile ? 0.084 : 0.072,
    depthFront: 0.098,
    depthBack: 0.064,
    septumHalfZ: 0.074,
    honeyIntensity: 0.84,
    zTilt: 0.014,
    materials: sharedMats,
  });
  upperChunk.position.set(-0.20, 0.56, 0.28);
  upperChunk.rotation.set(0.16, 0.32, 0.12);
  upperChunk.userData.baseRotY = 0.32;
  fgGroup.add(upperChunk);

  // B) Left Tall Narrow Vertical Chisel Bar — gently angled 3/4 view matching reference silhouette
  const leftContour = [
    [-0.20, 0.72], [-0.02, 0.79], [0.16, 0.74], [0.23, 0.50],
    [0.25, 0.14], [0.26, -0.22], [0.28, -0.58], [0.18, -0.78],
    [0.00, -0.82], [-0.18, -0.72], [-0.24, -0.42], [-0.25, -0.04],
    [-0.22, 0.36],
  ];
  const leftChunk = createBrokenCombChunk({
    contour: leftContour,
    cellR: isMobile ? 0.076 : 0.067,
    depthFront: 0.086,
    depthBack: 0.056,
    septumHalfZ: 0.066,
    honeyIntensity: 0.90,
    zTilt: 0.012,
    materials: sharedMats,
  });
  leftChunk.position.set(-0.60, -0.45, 0.12);
  leftChunk.rotation.set(0.06, 0.30, 0.24);
  leftChunk.userData.baseRotY = 0.30;
  fgGroup.add(leftChunk);

  // C) Large Diagonal Main Center-Right Slab — jagged trapezoid slab with lower V-corner apex
  const mainContour = [
    [-0.42, 0.72], [-0.18, 0.88], [0.06, 0.94], [0.40, 0.88],
    [0.54, 0.62], [0.51, 0.28], [0.58, -0.04], [0.50, -0.44],
    [0.55, -0.68], [0.40, -0.84], [0.28, -0.94], [0.06, -0.90],
    [-0.24, -0.82], [-0.45, -0.62], [-0.52, -0.28], [-0.48, 0.10],
    [-0.53, 0.44],
  ];
  const mainChunk = createBrokenCombChunk({
    contour: mainContour,
    cellR: isMobile ? 0.072 : 0.063,
    depthFront: 0.104,
    depthBack: 0.062,
    septumHalfZ: 0.074,
    honeyIntensity: 0.76,
    zTilt: 0.015,
    materials: sharedMats,
  });
  mainChunk.position.set(0.28, -0.18, 0.12);
  mainChunk.rotation.set(0.14, -0.24, -0.64);
  mainChunk.userData.baseRotY = -0.24;
  fgGroup.add(mainChunk);

  // Compute exact world bottom V-apex of Main Slab so hanging drop hugs underside cleanly
  fgGroup.updateMatrixWorld(true);
  const dropApexLocal = new THREE.Vector3(0.26, -0.90, 0.02);
  const dropApexWorld = dropApexLocal.clone();
  mainChunk.localToWorld(dropApexWorld);
  fgGroup.worldToLocal(dropApexWorld);

  // ------------------------------------------------------------------
  // 2. SOFTLY BLURRED 3D BACKGROUND CHUNKS (rendered to GPU bokeh FBO!)
  // ------------------------------------------------------------------
  const bgSpecs = [
    { pos: [-1.06, 1.08, -0.85], rot: [0.20, 0.34, 0.36], scale: 0.88, contour: upperContour },
    { pos: [0.42, 1.12, -0.95],  rot: [0.16, -0.32, -0.50], scale: 0.90, contour: leftContour },
    { pos: [1.06, -0.76, -0.90], rot: [0.14, -0.38, 0.34], scale: 0.94, contour: upperContour },
  ];
  const bgChunks = [];
  bgSpecs.forEach((spec) => {
    const bgC = createBrokenCombChunk({
      contour: spec.contour,
      cellR: 0.090,
      depthFront: 0.088,
      depthBack: 0.044,
      septumHalfZ: 0.070,
      honeyIntensity: 0.88,
      zTilt: 0.010,
      materials: sharedMats,
      simplified: true,
    });
    bgC.position.set(...spec.pos);
    bgC.rotation.set(...spec.rot);
    bgC.scale.setScalar(spec.scale);
    bgGroup.add(bgC);
    bgChunks.push({ mesh: bgC, basePos: [...spec.pos], baseRot: [...spec.rot] });
  });

  // ------------------------------------------------------------------
  // 3. SUBTLE CREVICE HONEY BRIDGES & UNDER-CORNER HANGING DROPLET BELLY
  // ------------------------------------------------------------------
  const cascadeGroup = new THREE.Group();
  fgGroup.add(cascadeGroup);

  // Delicate viscous honey meniscus bridging Upper Chunk underside -> Main Slab recessed upper cleft
  const upperToMainDripPts = [
    new THREE.Vector3(0.01, 0.34, 0.22),
    new THREE.Vector3(0.05, 0.22, 0.16),
    new THREE.Vector3(0.05, 0.10, 0.11),
  ];
  cascadeGroup.add(new THREE.Mesh(
    createTaperedBridgeGeometry({
      points: upperToMainDripPts,
      radiusStart: 0.038,
      radiusMid: 0.024,
      radiusEnd: 0.032,
      tubularSegments: 16,
      radialSegments: 14,
      flattenZ: 0.55,
    }),
    bridgeFlowMat
  ));

  // Smooth bulbous U-teardrop honey belly tucked cleanly behind Main Slab's lower fractured V-apex
  const pocketPoints = [
    new THREE.Vector2(0.0, -0.172),
    new THREE.Vector2(0.040, -0.152),
    new THREE.Vector2(0.092, -0.100),
    new THREE.Vector2(0.140, -0.026),
    new THREE.Vector2(0.152, 0.050),
    new THREE.Vector2(0.122, 0.112),
    new THREE.Vector2(0.070, 0.152),
    new THREE.Vector2(0.0, 0.162),
  ];
  const pocketGeo = new THREE.LatheGeometry(pocketPoints, 28);
  pocketGeo.scale(1.18, 1.00, 0.64);
  const collectionPocket = new THREE.Mesh(pocketGeo, pocketMat);
  collectionPocket.position.set(dropApexWorld.x, dropApexWorld.y + 0.008, dropApexWorld.z - 0.046);
  collectionPocket.rotation.set(0.04, -0.08, -0.03);
  cascadeGroup.add(collectionPocket);

  // Keep reference variable live for tick modulation cleanly without jellybean artifacts
  const spoutAnchor = new THREE.Object3D();
  spoutAnchor.position.set(0.0, -0.150, 0.0);
  collectionPocket.add(spoutAnchor);

  // ------------------------------------------------------------------
  // 4. 3D BOTANICAL YELLOW WILDFLOWER STEMS & BLOSSOMS (vivid marigold-yellow!)
  // ------------------------------------------------------------------
  const flowerGroup = new THREE.Group();
  fgGroup.add(flowerGroup);

  const stemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2D4412'),
    roughness: 0.64,
    metalness: 0.02,
  });
  const calyxMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#405B1A'),
    roughness: 0.58,
  });
  const petalVertexMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    color: new THREE.Color('#FFFFFF'),
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 0.0,
    roughness: 0.52,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const fluffyCenterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E09B04'),
    emissive: new THREE.Color('#382000'),
    emissiveIntensity: 0.06,
    roughness: 0.64,
  });
  const flowerCenterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C46C02'),
    emissive: new THREE.Color('#2B1200'),
    emissiveIntensity: 0.08,
    roughness: 0.66,
  });

  // Branch 1: Delicate Arching Upper Twig (kept cleanly inside hero frame above Upper Chunk)
  const twigCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, 0.78, 0.25),
    new THREE.Vector3(0.20, 0.88, 0.27),
    new THREE.Vector3(0.48, 0.99, 0.28),
    new THREE.Vector3(0.72, 1.18, 0.26),
    new THREE.Vector3(0.88, 1.24, 0.24),
  ]);
  const twigMesh = new THREE.Mesh(new THREE.TubeGeometry(twigCurve, 26, 0.011, 7, false), stemMat);
  flowerGroup.add(twigMesh);

  const twigBlooms = [
    { pos: [0.06, 0.96, 0.30], rot: [0.12, 0.16, 0.2], r: 0.125 },
    { pos: [0.58, 1.06, 0.31], rot: [0.10, -0.14, -0.18], r: 0.13 },
    { pos: [0.70, 1.32, 0.28], rot: [0.08, -0.18, 0.12], r: 0.14 },
  ];
  twigBlooms.forEach((b) => {
    const fl = createFluffyWildflowerHead({
      radius: b.r,
      petalMat: petalVertexMat,
      centerMat: fluffyCenterMat,
      calyxMat,
    });
    fl.position.set(...b.pos);
    fl.rotation.set(...b.rot);
    flowerGroup.add(fl);
  });

  const subStem1 = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.10, 0.84, 0.26), new THREE.Vector3(0.06, 0.96, 0.30)]), 8, 0.007, 6, false),
    stemMat
  );
  const subStem2 = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.62, 1.10, 0.27), new THREE.Vector3(0.70, 1.32, 0.28)]), 8, 0.007, 6, false),
    stemMat
  );
  flowerGroup.add(subStem1, subStem2);
  const budMesh = new THREE.Mesh(new THREE.SphereGeometry(0.023, 8, 8), fluffyCenterMat);
  budMesh.position.set(0.88, 1.24, 0.24);
  flowerGroup.add(budMesh);

  // Branch 2: Long Vertical Slender Wildflower Stem climbing closely across Left Chunk
  const leftStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.76, -1.26, 0.25),
    new THREE.Vector3(-0.68, -0.78, 0.31),
    new THREE.Vector3(-0.58, -0.24, 0.34),
    new THREE.Vector3(-0.48, 0.14, 0.33),
    new THREE.Vector3(-0.34, 0.34, 0.29),
  ]);
  const leftStem = new THREE.Mesh(new THREE.TubeGeometry(leftStemCurve, 30, 0.013, 8, false), stemMat);
  flowerGroup.add(leftStem);

  const leftBlooms = [
    { pos: [-0.79, -0.82, 0.32], rot: [0.16, 0.22, 0.35], r: 0.138 },
    { pos: [-0.62, -0.28, 0.36], rot: [0.14, 0.12, 0.18], r: 0.148 },
    { pos: [-0.50, 0.02, 0.34], rot: [0.12, 0.08, -0.15], r: 0.098 },
  ];
  leftBlooms.forEach((b) => {
    const fl = createFluffyWildflowerHead({
      radius: b.r,
      petalMat: petalVertexMat,
      centerMat: fluffyCenterMat,
      calyxMat,
    });
    fl.position.set(...b.pos);
    fl.rotation.set(...b.rot);
    flowerGroup.add(fl);
  });

  // Flower 3: Prominent 5-Petal Buttercup Blossom nestled cleanly at Lower-Right notch of Main Slab
  const mainBlossom = createFivePetalFlower({
    radius: 0.26,
    petalMat: petalVertexMat,
    centerMat: flowerCenterMat,
    calyxMat,
  });
  mainBlossom.position.set(0.48, -0.78, 0.37);
  mainBlossom.rotation.set(0.16, -0.22, -0.18);
  flowerGroup.add(mainBlossom);

  const updateCascade = (t) => {
    bridgeFlowMat.uniforms.uTime.value = t;
    glazeFlowMat.uniforms.uTime.value = t;
    pocketMat.uniforms.uTime.value = t;

    const swell = 1.0 + Math.sin(t * 2.2) * 0.024;
    collectionPocket.scale.set(swell, 1.0 + Math.cos(t * 2.2) * 0.018, swell);

    twigMesh.rotation.z = Math.sin(t * 1.1) * 0.014;
    mainBlossom.rotation.z = -0.18 + Math.sin(t * 1.35 + 0.6) * 0.030;

    bgChunks.forEach((b, idx) => {
      b.mesh.position.y = b.basePos[1] + Math.sin(t * 0.72 + idx * 1.9) * 0.028;
      b.mesh.rotation.z = b.baseRot[2] + Math.cos(t * 0.54 + idx * 1.3) * 0.016;
    });
  };

  return {
    group: root,
    fgGroup,
    bgGroup,
    bgChunks,
    upperChunk,
    leftChunk,
    mainChunk,
    collectionPocket,
    spoutAnchor,
    updateCascade,
  };
}



/**
 * Builds a single continuous gravity-curved viscous honey column starting cleanly inside
 * a pouring spout (0, 0, 0), curving gently downward to align vertically along (dropX, y, dropZ)
 * down to `dropBottomY` with smooth neck-thinning and helical uv.y mapping (1 at spout -> 0 at bottom).
 */
export function createGravityPourGeometry({
  start = new THREE.Vector3(0, 0, 0),
  dropX = -0.08,
  dropZ = 0.04,
  bottomY = -2.2,
  topRadius = 0.056,
  waistRadius = 0.040,
  bottomRadius = 0.048,
  radialSegments = 20,
  heightSegments = 48,
} = {}) {
  const curve = new THREE.CubicBezierCurve3(
    start.clone(),
    new THREE.Vector3(dropX, start.y - 0.14, dropZ),
    new THREE.Vector3(dropX, start.y - 0.36, dropZ),
    new THREE.Vector3(dropX, bottomY, dropZ)
  );

  const geo = new THREE.CylinderGeometry(1, 1, 1, radialSegments, heightSegments, true);
  const pos = geo.attributes.position;
  const upVec = new THREE.Vector3(0, 1, 0);
  const pt = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // -0.5 .. +0.5
    const z = pos.getZ(i);

    const tDown = THREE.MathUtils.clamp(0.5 - y, 0, 1); // 0 top (spout) -> 1 bottom
    const vUp = 1.0 - tDown; // 1 top -> 0 bottom

    curve.getPointAt(tDown, pt);
    curve.getTangentAt(tDown, tan).normalize();

    // Stable perpendicular frame so stream cross-section stays circular
    binormal.crossVectors(tan, new THREE.Vector3(0, 0, 1));
    if (binormal.lengthSq() < 0.001) binormal.crossVectors(tan, upVec);
    binormal.normalize();
    normal.crossVectors(binormal, tan).normalize();

    const neck = Math.pow(THREE.MathUtils.smoothstep(vUp, 0.72, 1.0), 1.3);
    const flare = Math.pow(1.0 - THREE.MathUtils.smoothstep(vUp, 0.0, 0.25), 1.4);
    const r = THREE.MathUtils.lerp(waistRadius, topRadius, neck) + (bottomRadius - waistRadius) * flare * 0.55;

    const vx = pt.x + (binormal.x * x + normal.x * z) * r;
    const vy = pt.y + (binormal.y * x + normal.y * z) * r;
    const vz = pt.z + (binormal.z * x + normal.z * z) * r;
    pos.setXYZ(i, vx, vy, vz);
  }
  geo.computeVertexNormals();
  return geo;
}

