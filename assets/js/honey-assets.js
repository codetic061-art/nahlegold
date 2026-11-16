/**
 * honey-assets.js — Focused Studio 3D Assets for the Corrected Honey Experience:
 *  - High-contrast white-studio PMREM environment for clear glass refraction
 *  - Realistic 3D Beehive Honeycomb Frame with Hexagonal Beeswax Cells, overflowing golden
 *    honey, dripping strands, and wood/antique-brass honey-catching collection channel
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
 * Procedural natural cedar/acacia wood grain texture for the Hero honeycomb
 * beehive frame and honey-catching collection channel.
 */
function createCedarWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0.0, '#9B6532');
  base.addColorStop(0.35, '#B57B40');
  base.addColorStop(0.7, '#895627');
  base.addColorStop(1.0, '#A77038');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Fine organic wood fiber streaks
  for (let y = 0; y < 512; y += 2) {
    const wave = Math.sin(y * 0.085) * 8 + Math.cos(y * 0.23) * 4;
    const dark = (Math.sin(y * 0.14) + Math.cos(y * 0.047)) * 0.5;
    const alpha = 0.05 + Math.abs(dark) * 0.11;
    ctx.strokeStyle = dark > 0 ? `rgba(68, 36, 12, ${alpha.toFixed(3)})` : `rgba(222, 168, 102, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + wave, 340, y - wave, 512, y);
    ctx.stroke();
  }

  // Subtle growth ring knot details
  for (const [kx, ky, rx, ry] of [[128, 164, 34, 10], [374, 342, 26, 8]]) {
    const kGrad = ctx.createRadialGradient(kx, ky, 2, kx, ky, rx);
    kGrad.addColorStop(0, 'rgba(54, 28, 10, 0.36)');
    kGrad.addColorStop(0.6, 'rgba(82, 46, 18, 0.16)');
    kGrad.addColorStop(1, 'rgba(82, 46, 18, 0)');
    ctx.save();
    ctx.translate(kx, ky);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Deterministic cell pseudo-random generator so honeycomb variation looks natural
 * yet stays rock-solid across frames and reloads.
 */
function cellHash(c, r) {
  const n = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Builds a single beveled hexagonal cell wall cup geometry (hollow front & rim)
 * for InstancedMesh rendering of a real 3D beehive honeycomb matrix.
 */
function createHexCellWallGeometry(outerR = 0.082, innerR = 0.066, depth = 0.082) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6; // pointy-top hexagon
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const hole = new THREE.Path();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const x = Math.cos(a) * innerR;
    const y = Math.sin(a) * innerR;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.005,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the Hero 3D Beehive Honeycomb Frame & Honey-Catching Channel:
 *  - Tilted 3/4 natural oiled cedar wooden beehive frame (top bar ears, side end bars,
 *    bottom bar, brass wire pins & tension wires).
 *  - Detailed 3D hexagonal beeswax matrix filled with golden honey pools, creamy capped cells,
 *    and bulging lower cells overflowing with honey.
 *  - Continuous liquid drips & hanging golden droplets stretching off the bottom wooden bar.
 *  - Sculpted wood & antique brushed-brass honey-catching tray/channel directly beneath
 *    collecting the falling drips into a glossy honey basin with a front pouring spout lip.
 */
export function createHoneycombFrameWithChannel({ isMobile = false } = {}) {
  const root = new THREE.Group();

  const woodTex = createCedarWoodTexture();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    color: new THREE.Color('#D8A972'),
    roughness: 0.56,
    metalness: 0.04,
    envMapIntensity: 0.85,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#DFA649'),
    roughness: 0.24,
    metalness: 0.78,
    envMapIntensity: 1.5,
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C8CDD2'),
    roughness: 0.28,
    metalness: 0.88,
    envMapIntensity: 1.35,
  });

  const beeswaxMidribMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B56910'),
    emissive: new THREE.Color('#471F00'),
    emissiveIntensity: 0.28,
    roughness: 0.48,
    metalness: 0.04,
  });

  const cellWallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F2C56A'),
    emissive: new THREE.Color('#5A2E04'),
    emissiveIntensity: 0.14,
    roughness: 0.36,
    metalness: 0.05,
    envMapIntensity: 1.15,
  });

  const waxCapMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F5DC9B'),
    emissive: new THREE.Color('#694510'),
    emissiveIntensity: 0.12,
    roughness: 0.64,
    metalness: 0.02,
    envMapIntensity: 0.8,
  });

  const cellHoneyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DF840C'),
    emissive: new THREE.Color('#732E00'),
    emissiveIntensity: 0.26,
    roughness: 0.06,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.9,
  });

  // ------------------------------------------------------------------
  // 1. HANGING 3D WOODEN BEEHIVE HONEYCOMB FRAME (tilted 3/4 for rich 3D depth)
  // ------------------------------------------------------------------
  const frameGroup = new THREE.Group();
  frameGroup.position.set(0.06, 0.39, 0.0);
  frameGroup.rotation.set(0.11, -0.40, -0.045);
  root.add(frameGroup);

  const innerW = 2.08;
  const innerH = 1.18;
  const barD = 0.22;

  // Top bar (with left & right resting rabbet ears)
  const topBarMain = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.12, 0.25), woodMat);
  topBarMain.position.set(0, innerH * 0.5 + 0.06, 0);
  frameGroup.add(topBarMain);

  // Subtle recessed underside shoulder on top bar
  const topShoulder = new THREE.Mesh(new THREE.BoxGeometry(innerW + 0.16, 0.045, 0.20), woodMat);
  topShoulder.position.set(0, innerH * 0.5 - 0.015, 0);
  frameGroup.add(topShoulder);

  // Bottom bar
  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(innerW + 0.22, 0.095, 0.20), woodMat);
  bottomBar.position.set(0, -innerH * 0.5 - 0.045, 0);
  frameGroup.add(bottomBar);

  // Side end-bars with brass corner rivets & tension wire eyelets
  for (const side of [-1, 1]) {
    const endBar = new THREE.Mesh(new THREE.BoxGeometry(0.11, innerH + 0.19, barD), woodMat);
    endBar.position.set(side * (innerW * 0.5 + 0.055), 0.0, 0);
    frameGroup.add(endBar);

    for (const py of [innerH * 0.5 + 0.05, -innerH * 0.5 - 0.04]) {
      const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 10), brassMat);
      nail.rotation.z = Math.PI / 2;
      nail.position.set(side * (innerW * 0.5 + 0.112), py, 0);
      frameGroup.add(nail);
    }

    for (const wy of [-0.28, 0.02, 0.30]) {
      const eyelet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10), brassMat);
      eyelet.rotation.z = Math.PI / 2;
      eyelet.position.set(side * (innerW * 0.5 + 0.111), wy, 0.015);
      frameGroup.add(eyelet);
    }
  }

  // Horizontal stainless foundation support wires embedded across comb
  for (const wy of [-0.28, 0.02, 0.30]) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, innerW + 0.08, 8), wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, wy, 0.016);
    frameGroup.add(wire);
  }

  // Warm translucent-looking honey-amber beeswax septum midrib plate inside frame
  const midribMesh = new THREE.Mesh(new THREE.BoxGeometry(innerW + 0.02, innerH + 0.02, 0.032), beeswaxMidribMat);
  frameGroup.add(midribMesh);

  // Build authentic staggered hexagonal comb coordinates cleanly filling aperture
  const cellR = 0.082;
  const colStep = Math.sqrt(3) * cellR; // ~0.142
  const rowStep = 1.5 * cellR;          // ~0.123
  const cells = [];

  for (let r = -4; r <= 4; r++) {
    const cy = r * rowStep;
    if (Math.abs(cy) > innerH * 0.5 - 0.048) continue;
    const xShift = (Math.abs(r) % 2) * (colStep * 0.5);
    for (let c = -7; c <= 7; c++) {
      const cx = c * colStep + xShift - (colStep * 0.25);
      if (Math.abs(cx) > innerW * 0.5 - 0.055) continue;

      const rnd = cellHash(c, r);
      const normY = (cy + innerH * 0.5) / innerH; // 0 bottom .. 1 top
      const isSealed = normY > 0.62 && rnd > 0.34 || (normY > 0.45 && Math.abs(cx) > 0.68 && rnd > 0.35);
      const isOverflow = normY < 0.26 && rnd > 0.25;
      cells.push({ cx, cy, r, c, rnd, isSealed, isOverflow });
    }
  }

  // Front + back extruded 3D hexagonal cell cups (one single InstancedMesh draw call!)
  const hexWallGeo = createHexCellWallGeometry(cellR + 0.003, cellR - 0.017, 0.082);
  const totalWallInstances = cells.length * 2;
  const wallInstanced = new THREE.InstancedMesh(hexWallGeo, cellWallMat, totalWallInstances);
  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();

  let wIdx = 0;
  cells.forEach((cell) => {
    // Front comb face (+Z)
    dummy.position.set(cell.cx, cell.cy, 0.014);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 0.94 + cell.rnd * 0.16);
    dummy.updateMatrix();
    wallInstanced.setMatrixAt(wIdx, dummy.matrix);
    cColor.setHSL(0.105 + cell.rnd * 0.018, 0.78, 0.62 - cell.rnd * 0.12);
    wallInstanced.setColorAt(wIdx, cColor);
    wIdx++;

    // Back comb face (-Z)
    dummy.position.set(cell.cx, cell.cy, -0.014);
    dummy.rotation.set(0, Math.PI, 0);
    dummy.scale.set(1, 1, 0.94 + cell.rnd * 0.14);
    dummy.updateMatrix();
    wallInstanced.setMatrixAt(wIdx, dummy.matrix);
    wallInstanced.setColorAt(wIdx, cColor);
    wIdx++;
  });
  wallInstanced.instanceMatrix.needsUpdate = true;
  if (wallInstanced.instanceColor) wallInstanced.instanceColor.needsUpdate = true;
  frameGroup.add(wallInstanced);

  // Beeswax dome cappings on upper sealed cells
  const sealedCells = cells.filter((c) => c.isSealed);
  if (sealedCells.length) {
    const capGeo = new THREE.CylinderGeometry(cellR - 0.012, cellR - 0.008, 0.032, 6);
    capGeo.rotateX(Math.PI / 2);
    const capInstanced = new THREE.InstancedMesh(capGeo, waxCapMat, sealedCells.length);
    sealedCells.forEach((cell, idx) => {
      dummy.position.set(cell.cx, cell.cy, 0.080 + cell.rnd * 0.016);
      dummy.rotation.set((cell.rnd - 0.5) * 0.08, (cell.rnd - 0.5) * 0.08, 0);
      dummy.scale.setScalar(0.98 + cell.rnd * 0.08);
      dummy.updateMatrix();
      capInstanced.setMatrixAt(idx, dummy.matrix);
      cColor.setHSL(0.115 + cell.rnd * 0.015, 0.65, 0.76 + cell.rnd * 0.08);
      capInstanced.setColorAt(idx, cColor);
    });
    capInstanced.instanceMatrix.needsUpdate = true;
    if (capInstanced.instanceColor) capInstanced.instanceColor.needsUpdate = true;
    frameGroup.add(capInstanced);
  }

  // Glossy liquid amber honey filling inside all uncapped open cells
  const openCells = cells.filter((c) => !c.isSealed);
  if (openCells.length) {
    const poolHexGeo = new THREE.CylinderGeometry(cellR - 0.016, cellR - 0.016, 0.058, 6);
    poolHexGeo.rotateX(Math.PI / 2);
    const poolInstanced = new THREE.InstancedMesh(poolHexGeo, cellHoneyMat, openCells.length);
    openCells.forEach((cell, idx) => {
      const fillDepthZ = cell.isOverflow ? 0.072 : 0.044 + cell.rnd * 0.022;
      dummy.position.set(cell.cx, cell.cy, fillDepthZ);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poolInstanced.setMatrixAt(idx, dummy.matrix);
      cColor.setHSL(0.082 + cell.rnd * 0.018, 0.92, cell.isOverflow ? 0.50 : 0.44 + cell.rnd * 0.08);
      poolInstanced.setColorAt(idx, cColor);
    });
    poolInstanced.instanceMatrix.needsUpdate = true;
    if (poolInstanced.instanceColor) poolInstanced.instanceColor.needsUpdate = true;
    frameGroup.add(poolInstanced);
  }

  // Natural brimming golden honey bulging gently out of lower hex cells & draping over bottom bar
  const liveHoneyMat = createLiquidHoneyMaterial();
  const dripMat = createLiquidHoneyMaterial({ animatedFlow: true });

  // Soft golden honey pillows overflowing slightly out of random bottom-row open cells
  const brimCellSpots = [
    [-0.56, -0.43, 0.082, 0.068],
    [-0.30, -0.46, 0.084, 0.074],
    [-0.04, -0.44, 0.083, 0.078],
    [0.18, -0.48, 0.084, 0.070],
    [0.42, -0.43, 0.082, 0.066],
  ];
  brimCellSpots.forEach(([bx, by, bz, br]) => {
    const bulge = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 12), cellHoneyMat);
    bulge.position.set(bx, by, bz);
    bulge.scale.set(1.08, 1.18, 0.36);
    frameGroup.add(bulge);
  });

  // Subtle tapering drip rivulets curving seamlessly down onto bottom wooden frame rail
  const spillRivulets = [
    [-0.48, -0.49, 0.090, 0.24],
    [-0.18, -0.47, 0.094, 0.28],
    [0.09, -0.49, 0.094, 0.27],
    [0.37, -0.48, 0.088, 0.22],
  ];
  spillRivulets.forEach(([sx, sy, sz, len]) => {
    const dripGeo = new THREE.ConeGeometry(0.022, len, 12);
    dripGeo.rotateX(Math.PI);
    const dripRibbon = new THREE.Mesh(dripGeo, liveHoneyMat);
    dripRibbon.position.set(sx, sy - len * 0.32, sz);
    dripRibbon.scale.set(1.15, 1.0, 0.42);
    frameGroup.add(dripRibbon);
  });

  // Delicate glistening amber meniscus lip along center span of bottom frame bar
  const barGlazeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.62, -innerH * 0.5 - 0.015, 0.090),
    new THREE.Vector3(-0.24, -innerH * 0.5 - 0.056, 0.102),
    new THREE.Vector3(0.10, -innerH * 0.5 - 0.066, 0.100),
    new THREE.Vector3(0.50, -innerH * 0.5 - 0.036, 0.090),
  ]);
  const barGlazeMesh = new THREE.Mesh(
    new THREE.TubeGeometry(barGlazeCurve, 24, 0.022, 10, false),
    liveHoneyMat
  );
  frameGroup.add(barGlazeMesh);

  // Organic staggered hanging honey lobes gripping underside of bottom frame bar
  const pendantPositions = [-0.46, -0.16, 0.12, 0.44];
  const frameDrops = [];
  const dripBaseY = -0.26;
  pendantPositions.forEach((px, idx) => {
    const lobeSize = idx === 1 ? 0.034 : idx === 2 ? 0.030 : 0.024;
    const pendant = new THREE.Mesh(new THREE.SphereGeometry(lobeSize, 14, 12), liveHoneyMat);
    pendant.position.set(px * 0.88, -innerH * 0.5 - 0.080, 0.04 + (idx % 2) * 0.025);
    pendant.scale.set(0.84, 1.55, 0.84);
    frameGroup.add(pendant);

    // Falling elongated honey droplet traveling smoothly down into the brass collector pool
    const tearGroup = new THREE.Group();
    const dropR = 0.026 + (idx % 2) * 0.007;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(dropR, 14, 12), dripMat);
    bulb.scale.set(0.82, 1.38, 0.82);
    tearGroup.add(bulb);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.006, dropR * 0.72, 0.12, 10), dripMat);
    neck.position.y = 0.07;
    tearGroup.add(neck);

    root.add(tearGroup);
    frameDrops.push({
      mesh: tearGroup,
      x: px * 0.82,
      z: 0.05 + (idx === 1 ? 0.06 : 0),
      startY: dripBaseY,
      endY: -0.78,
      phase: idx * 0.29,
      speed: 0.36 + (idx % 3) * 0.08,
    });
  });

  // Two continuous silky liquid honey rivulets bridging frame bottom smoothly into collection basin
  for (const [rx, rz, rTop, rBot] of [[-0.08, 0.06, 0.028, 0.019], [0.22, 0.02, 0.020, 0.015]]) {
    const thread = new THREE.Mesh(
      createGravityPourGeometry({
        start: new THREE.Vector3(rx, dripBaseY + 0.06, rz),
        dropX: rx - 0.02,
        dropZ: rz + 0.02,
        bottomY: -0.80,
        topRadius: rTop,
        waistRadius: rBot * 0.74,
        bottomRadius: rBot,
        radialSegments: 16,
        heightSegments: 24,
      }),
      dripMat
    );
    root.add(thread);
  }

  // ------------------------------------------------------------------
  // 2. SCULPTED WOOD & ANTIQUE BRASS HONEY-CATCHING COLLECTION CHANNEL
  //    Angled forward slightly so gleaming golden pool & flush spout channel read clearly
  // ------------------------------------------------------------------
  const collectorGroup = new THREE.Group();
  collectorGroup.position.set(0.02, -0.82, 0.08);
  collectorGroup.rotation.set(0.16, 0.0, 0.0);
  root.add(collectorGroup);

  // Outer carved cedar catching bowl/cradle + subtle flared rim
  const segs = isMobile ? 28 : 40;
  const bowlOuterPts = [
    new THREE.Vector2(0.0, -0.14),
    new THREE.Vector2(0.46, -0.14),
    new THREE.Vector2(0.76, -0.05),
    new THREE.Vector2(0.88, 0.11),
    new THREE.Vector2(0.84, 0.14),
    new THREE.Vector2(0.74, 0.03),
    new THREE.Vector2(0.0, -0.04),
  ];
  const woodBowlGeo = new THREE.LatheGeometry(bowlOuterPts, segs);
  woodBowlGeo.scale(1.22, 1.0, 0.80);
  const woodBowl = new THREE.Mesh(woodBowlGeo, woodMat);
  collectorGroup.add(woodBowl);

  // Antique brushed-brass inner honey-collecting trough liner + front tapered pouring channel
  const brassLinerPts = [
    new THREE.Vector2(0.0, -0.048),
    new THREE.Vector2(0.72, 0.022),
    new THREE.Vector2(0.82, 0.135),
    new THREE.Vector2(0.77, 0.142),
    new THREE.Vector2(0.67, 0.045),
    new THREE.Vector2(0.0, -0.022),
  ];
  const brassLinerGeo = new THREE.LatheGeometry(brassLinerPts, segs);
  brassLinerGeo.scale(1.18, 1.0, 0.76);
  const brassLiner = new THREE.Mesh(brassLinerGeo, brassMat);
  collectorGroup.add(brassLiner);

  // Smooth rounded low-profile brass pouring spout cradle flush with front bowl rim (zero sharp horns)
  const spoutShape = new THREE.Shape();
  spoutShape.moveTo(-0.15, 0.038);
  spoutShape.quadraticCurveTo(-0.08, 0.0, 0.0, -0.012);
  spoutShape.quadraticCurveTo(0.08, 0.0, 0.15, 0.038);
  spoutShape.quadraticCurveTo(0.16, 0.018, 0.14, 0.002);
  spoutShape.quadraticCurveTo(0.07, -0.034, 0.0, -0.040);
  spoutShape.quadraticCurveTo(-0.07, -0.034, -0.14, 0.002);
  spoutShape.quadraticCurveTo(-0.16, 0.018, -0.15, 0.038);

  const lipChannelGeo = new THREE.ExtrudeGeometry(spoutShape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 16,
  });
  const spoutLipGroup = new THREE.Group();
  spoutLipGroup.position.set(-0.03, 0.056, 0.46);
  spoutLipGroup.rotation.set(0.16, -0.05, 0);
  const lipMesh = new THREE.Mesh(lipChannelGeo, brassMat);
  spoutLipGroup.add(lipMesh);

  // Smooth golden honey tongue filling the U-spout lip cleanly
  const honeyTongueCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.024, -0.02),
    new THREE.Vector3(0, 0.014, 0.16),
    new THREE.Vector3(0, -0.004, 0.32),
    new THREE.Vector3(0, -0.036, 0.35),
  ]);
  const honeyTongue = new THREE.Mesh(
    new THREE.TubeGeometry(honeyTongueCurve, 18, 0.042, 12, false),
    dripMat
  );
  spoutLipGroup.add(honeyTongue);
  collectorGroup.add(spoutLipGroup);

  // Pooled liquid honey surface inside catching basin catching drips
  const poolGeo = new THREE.CircleGeometry(0.75, segs);
  poolGeo.rotateX(-Math.PI / 2);
  poolGeo.scale(1.16, 1.0, 0.74);
  const poolMesh = new THREE.Mesh(poolGeo, liveHoneyMat);
  poolMesh.position.set(0, 0.052, 0);
  collectorGroup.add(poolMesh);

  // Soft ripples at drop impact points in the pool
  const impactRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.018, 10, 28),
    liveHoneyMat
  );
  impactRing.rotation.x = Math.PI / 2;
  impactRing.position.set(-0.06, 0.058, 0.06);
  collectorGroup.add(impactRing);

  // Exact world anchor at end of V-spout lip where continuous vertical stream enters Section 2
  const spoutAnchor = new THREE.Object3D();
  spoutAnchor.position.set(0, -0.036, 0.35);
  spoutLipGroup.add(spoutAnchor);

  const updateDrips = (t) => {
    liveHoneyMat.uniforms.uTime.value = t;
    dripMat.uniforms.uTime.value = t;

    frameDrops.forEach((d) => {
      const cycle = (t * d.speed + d.phase) % 1.0;
      // Stay coalescing on bottom bar for first 25%, then accelerate smoothly down into basin
      const fall = cycle < 0.28 ? 0 : Math.pow((cycle - 0.28) / 0.72, 1.65);
      const currY = THREE.MathUtils.lerp(d.startY, d.endY, fall);
      const stretchY = cycle < 0.28
        ? THREE.MathUtils.lerp(0.65, 1.25, cycle / 0.28)
        : THREE.MathUtils.lerp(1.25, 0.85, fall);
      const radialScale = cycle > 0.90 ? THREE.MathUtils.lerp(1.0, 0.2, (cycle - 0.90) / 0.10) : 1.0;

      d.mesh.position.set(d.x, currY, d.z);
      d.mesh.scale.set(radialScale, stretchY, radialScale);
    });

    const ringPulse = 0.85 + Math.sin(t * 3.4) * 0.18;
    impactRing.scale.set(ringPulse, ringPulse, 1.0);
  };

  return {
    group: root,
    frameGroup,
    collectorGroup,
    spoutAnchor,
    liveHoneyMat,
    dripMat,
    updateDrips,
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

