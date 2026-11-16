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

/**
 * Generates a fine brushed stainless steel texture for realistic anisotropic
 * tank highlights on the Hero extraction drum.
 */
export function createBrushedSteelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, '#CDD2D6');
  grad.addColorStop(0.22, '#E9EDF0');
  grad.addColorStop(0.46, '#C4C9CE');
  grad.addColorStop(0.72, '#F2F5F7');
  grad.addColorStop(1.0, '#CDD2D6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  for (let y = 0; y < 256; y += 2) {
    const shade = 212 + Math.round(Math.sin(y * 0.7) * 18 + (Math.random() - 0.5) * 20);
    ctx.strokeStyle = `rgba(${shade}, ${shade + 2}, ${shade + 5}, 0.22)`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates an embossed warm gold/espresso crest badge for the Hero stainless extraction drum.
 */
function createDrumCrestTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 384);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(256, 192, 232, 166, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E09D2B';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#3C2712';
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(256, 192, 214, 150, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3C2712';
  ctx.fill();

  ctx.fillStyle = '#FBE8A6';
  ctx.font = '800 60px "Tajawal", "Almarai", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('نحل الذهب', 256, 156);

  ctx.fillStyle = '#E8A93C';
  ctx.font = '700 26px "Tajawal", "Almarai", sans-serif';
  ctx.fillText('فرز طبيعي صافي ١٠٠٪', 256, 224);

  ctx.fillStyle = '#F7CA52';
  ctx.beginPath();
  ctx.moveTo(256, 255);
  ctx.bezierCurveTo(272, 275, 275, 296, 256, 302);
  ctx.bezierCurveTo(237, 296, 240, 275, 256, 255);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Realistic Stainless-Steel Honey Extraction Tank ("منضج / خزان عسل استانلس")
 * fitted with an unmistakably OPEN front-left chrome dispensing valve & downward nozzle.
 */
export function createHoneyDrumWithOpenTap({ isMobile = false } = {}) {
  const group = new THREE.Group();
  const segs = isMobile ? 32 : 48;

  const steelTex = createBrushedSteelTexture();
  const steelMat = new THREE.MeshStandardMaterial({
    map: steelTex,
    color: new THREE.Color('#EAEFF2'),
    metalness: 0.88,
    roughness: 0.22,
    envMapIntensity: 1.55,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F5F7FA'),
    metalness: 0.94,
    roughness: 0.14,
    envMapIntensity: 1.7,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#707780'),
    metalness: 0.82,
    roughness: 0.34,
    envMapIntensity: 1.25,
  });

  const brassGripMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C97A16'),
    metalness: 0.35,
    roughness: 0.30,
    envMapIntensity: 1.2,
  });

  // Soft studio contact shadow underneath stainless tank base
  const shadowGeo = new THREE.PlaneGeometry(2.75, 2.75);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.position.y = -1.16;
  group.add(shadowPlane);

  // Main cylindrical brushed stainless extractor drum (lathe profile with rolled beads & base skirt)
  const bodyPoints = [
    new THREE.Vector2(0.0, -1.13),
    new THREE.Vector2(0.87, -1.13),
    new THREE.Vector2(0.89, -1.07),
    new THREE.Vector2(0.86, -1.01),
    new THREE.Vector2(0.86, -0.58),
    new THREE.Vector2(0.888, -0.54),
    new THREE.Vector2(0.86, -0.50),
    new THREE.Vector2(0.86, 0.44),
    new THREE.Vector2(0.888, 0.48),
    new THREE.Vector2(0.86, 0.52),
    new THREE.Vector2(0.86, 0.96),
    new THREE.Vector2(0.905, 1.00),
    new THREE.Vector2(0.905, 1.04),
    new THREE.Vector2(0.86, 1.04),
  ];
  const bodyGeo = new THREE.LatheGeometry(bodyPoints, segs);
  const bodyMesh = new THREE.Mesh(bodyGeo, steelMat);
  group.add(bodyMesh);

  // Domed mirror-chrome extractor lid + center brass/chrome finial knob + tension latches
  const lidPoints = [
    new THREE.Vector2(0.918, 0.99),
    new THREE.Vector2(0.918, 1.09),
    new THREE.Vector2(0.86, 1.13),
    new THREE.Vector2(0.55, 1.18),
    new THREE.Vector2(0.0, 1.21),
  ];
  const lidMesh = new THREE.Mesh(new THREE.LatheGeometry(lidPoints, segs), chromeMat);
  group.add(lidMesh);

  const knobPost = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.11, 20), brassGripMat);
  knobPost.position.y = 1.25;
  group.add(knobPost);
  const knobCap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.065, 24), chromeMat);
  knobCap.position.y = 1.32;
  group.add(knobCap);

  // Side welded carry handles + latch ears
  for (const side of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.24), darkMetalMat);
    pad.position.set(side * 0.87, 0.58, 0);
    group.add(pad);

    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.87, 0.62, -0.09),
      new THREE.Vector3(side * 1.02, 0.54, -0.07),
      new THREE.Vector3(side * 1.02, 0.54, 0.07),
      new THREE.Vector3(side * 0.87, 0.62, 0.09),
    ]);
    const handleMesh = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 18, 0.025, 10, false), chromeMat);
    group.add(handleMesh);

    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.14, 0.07), darkMetalMat);
    latch.position.set(side * 0.905, 1.01, 0.12);
    group.add(latch);
  }

  // Front crest plaque subtly connecting stainless drum to Nahl Al-Thahab brand
  const crestTex = createDrumCrestTexture();
  const crestGeo = new THREE.CylinderGeometry(0.876, 0.876, 0.44, 32, 1, true, -0.34, 0.68);
  const crestMat = new THREE.MeshStandardMaterial({
    map: crestTex,
    transparent: true,
    alphaTest: 0.18,
    roughness: 0.35,
    metalness: 0.12,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const crestMesh = new THREE.Mesh(crestGeo, crestMat);
  crestMesh.position.y = 0.04;
  crestMesh.rotation.y = 0.18;
  group.add(crestMesh);

  // =====================================================================
  // UNMISTAKABLY OPEN DISPENSING TAP (Lower Left-Front of Stainless Tank)
  // Oriented cleanly toward screen LEFT-FRONT so bolted flange, valve bore,
  // lifted chrome+amber lever (OPEN!), and flowing honey stream read crisply.
  // =====================================================================
  const tapGroup = new THREE.Group();
  const tapAzimuth = -Math.PI * 0.36; // pointing left & slightly front
  const wallR = 0.855;
  tapGroup.position.set(Math.sin(tapAzimuth) * wallR, -0.78, Math.cos(tapAzimuth) * wallR);
  tapGroup.rotation.y = tapAzimuth;
  group.add(tapGroup);

  // 1. Bolted diamond/oval wall flange + 4 hex bolts
  const flangePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.045, 24), chromeMat);
  flangePlate.rotation.x = Math.PI / 2;
  flangePlate.scale.set(1.22, 1, 0.85);
  flangePlate.position.z = 0.015;
  tapGroup.add(flangePlate);

  for (const bx of [-0.145, 0.145]) {
    for (const by of [-0.075, 0.075]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.032, 6), darkMetalMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(bx, by, 0.042);
      tapGroup.add(bolt);
    }
  }

  // 2. Hex coupling nut + horizontal stainless outlet barrel
  const hexCoupler = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.08, 6), chromeMat);
  hexCoupler.rotation.x = Math.PI / 2;
  hexCoupler.position.z = 0.075;
  tapGroup.add(hexCoupler);

  const feedPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.24, 24), steelMat);
  feedPipe.rotation.x = Math.PI / 2;
  feedPipe.position.z = 0.20;
  tapGroup.add(feedPipe);

  // 3. Heavy cylindrical valve chamber + raised chrome gland nut (OPEN stem extension)
  const valveChamber = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.23, 24), chromeMat);
  valveChamber.position.set(0, 0.015, 0.34);
  tapGroup.add(valveChamber);

  const glandNut = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.055, 6), darkMetalMat);
  glandNut.position.set(0, 0.14, 0.34);
  tapGroup.add(glandNut);

  const brassStem = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.11, 16), brassGripMat);
  brassStem.position.set(0, 0.20, 0.34);
  tapGroup.add(brassStem);

  // 4. OPEN LEVER HANDLE: rotated +54 deg upward & aligned PARALLEL with spout flow!
  const leverPivot = new THREE.Group();
  leverPivot.position.set(0, 0.245, 0.34);
  // Negative X rotation lifts +Z end upward toward +Y cleanly -> unmistakably pulled OPEN!
  leverPivot.rotation.x = -0.88;
  tapGroup.add(leverPivot);

  const pivotHub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 18), chromeMat);
  leverPivot.add(pivotHub);

  const leverBar = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.026, 0.30), chromeMat);
  leverBar.position.z = 0.16;
  leverPivot.add(leverBar);

  // Ergonomic warm amber-copper grip sleeve makes open lever read starkly against silver/cream
  const leverGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.19, 16), brassGripMat);
  leverGrip.rotation.x = Math.PI / 2;
  leverGrip.position.z = 0.27;
  leverPivot.add(leverGrip);

  const leverTip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), brassGripMat);
  leverTip.position.z = 0.365;
  leverPivot.add(leverTip);

  // 5. Graceful 90-degree bent chrome dispensing spout pointing straight DOWN
  const spoutCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.0, 0.40),
    new THREE.Vector3(0, 0.0, 0.56),
    new THREE.Vector3(0, -0.05, 0.62),
    new THREE.Vector3(0, -0.22, 0.62)
  );
  const spoutMesh = new THREE.Mesh(new THREE.TubeGeometry(spoutCurve, 20, 0.066, 18, false), chromeMat);
  tapGroup.add(spoutMesh);

  const nozzleLip = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.014, 10, 24), chromeMat);
  nozzleLip.rotation.x = Math.PI / 2;
  nozzleLip.position.set(0, -0.22, 0.62);
  tapGroup.add(nozzleLip);

  // Glistening honey bead brimming directly inside the open nozzle rim
  const honeyBeadMat = createLiquidHoneyMaterial();
  const honeyBead = new THREE.Mesh(new THREE.SphereGeometry(0.059, 16, 12), honeyBeadMat);
  honeyBead.scale.set(1, 0.85, 1);
  honeyBead.position.set(0, -0.23, 0.62);
  tapGroup.add(honeyBead);

  // Exact world anchor right below nozzle exit where the 3D viscous stream emerges
  const tapSpoutAnchor = new THREE.Object3D();
  tapSpoutAnchor.position.set(0, -0.225, 0.62);
  tapGroup.add(tapSpoutAnchor);

  return {
    group,
    tapSpoutAnchor,
    leverPivot,
    honeyBead,
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

