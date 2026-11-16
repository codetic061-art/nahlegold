/**
 * honey-assets.js — Focused Studio 3D Assets for the Corrected Honey Experience:
 *  - High-contrast white-studio PMREM environment for clear glass refraction
 *  - Improved Crystal-Clear Octagonal Stage 05 "نحل الذهب" Jar with neck threads,
 *    contact shadow, clear Fresnel silhouettes, rising golden honey, and pour ripple coil
 *  - Continuous Liquid Pour Stream geometry (Lathe catenoid/ribbon column)
 *  - Subtle optional animated 3D Honeybee
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
 * Optional crisp articulated 3D Honeybee whose wings flap smoothly.
 */
export function createHoneybee() {
  const bee = new THREE.Group();

  const amberMat = new THREE.MeshStandardMaterial({ color: '#E89B24', roughness: 0.36, metalness: 0.08 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: '#18110B', roughness: 0.45, metalness: 0.06 });
  const wingMat  = new THREE.MeshStandardMaterial({
    color: '#F4F4F2',
    roughness: 0.16,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  });

  const abd = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), amberMat);
  abd.scale.set(0.95, 0.9, 1.45);
  abd.position.z = -0.14;
  bee.add(abd);

  for (const zOff of [-0.08, -0.16, -0.23]) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 6, 14), darkMat);
    stripe.position.z = zOff;
    bee.add(stripe);
  }

  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.092, 12, 10), darkMat);
  thorax.position.z = 0.02;
  bee.add(thorax);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), darkMat);
  head.position.z = 0.13;
  bee.add(head);

  const wingGeo = new THREE.CircleGeometry(0.15, 14);
  wingGeo.scale(0.56, 1.28, 1);
  wingGeo.translate(0, 0.15, 0);

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.04, 0.08, 0.02);
  leftWing.rotation.set(-0.55, 0, 0.65);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.04, 0.08, 0.02);
  rightWing.rotation.set(-0.55, 0, -0.65);

  bee.add(leftWing, rightWing);
  bee.userData = { leftWing, rightWing, phase: Math.random() * Math.PI * 2 };
  return bee;
}
