/**
 * honey-assets.js — Studio 3D Assets for Nahl Al-Thahab:
 *  - High-contrast studio PMREM environment for clear glass, gold cap, & honey highlights
 *  - Real-time 3D Hero Liquid Honey Flow System aligned to the transparent Honeycomb PNG:
 *    over-comb accumulation ribbons, lower V-apex meniscus, gravity-stretched continuous streams,
 *    left-piece tributary flow, occasional surface-tension droplets, underside collection opening
 *    with pooled coiling honey, and continuous exit stream feeding into #journey.
 *  - Upgraded Stage 05 Crystal-Clear Octagonal "نحل الذهب" Jar with sculpted capillary meniscus,
 *    viscous honey rope-coiling mound, internal glass honey bounce, and contact shadow.
 */
import * as THREE from './vendor/three.module.min.js';
import {
  createClearGlassMaterial,
  createJarHoneyMaterial,
  createLiquidHoneyMaterial,
} from './honey-shaders.js';

/**
 * Generates a studio PMREM environment map with dark negative-fill reflector cards
 * and crisp softbox strips so glass jar walls, gold caps, and viscous honey streams
 * catch razor-sharp specular reflections against warm cream (#FAF4E4).
 */
export function createHoneyEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#D8D4CE');

  const topPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.55, 2.45), side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 8, 1);
  topPanel.rotation.x = Math.PI / 2;
  envScene.add(topPanel);

  const keyStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 15),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 4.0, 3.65), side: THREE.DoubleSide })
  );
  keyStrip.position.set(6.8, 1.5, 5.5);
  keyStrip.lookAt(0, 0, 0);
  envScene.add(keyStrip);

  const fillStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.75, 0.72), side: THREE.DoubleSide })
  );
  fillStrip.position.set(-7.2, 0.5, -4);
  fillStrip.lookAt(0, 0, 0);
  envScene.add(fillStrip);

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

  return new THREE.CanvasTexture(canvas);
}

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

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1C140A';
    ctx.fill();
    ctx.restore();

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
 * Builds a sculpted capillary meniscus disc (concentric radial rings with upturned glass-wetting
 * rim) + a multi-turn viscous honey rope-coiling mound for the pouring impact center inside the jar.
 */
function createJarMeniscusAndCoil(radialSegs) {
  const rings = 14;
  const maxR = 0.79;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let rIdx = 0; rIdx <= rings; rIdx++) {
    const f = rIdx / rings;
    const rad = f * maxR;
    // Upturned concave capillary edge near jar wall + slight center pooling depression/mound
    const capillary = Math.pow(THREE.MathUtils.smoothstep(f, 0.56, 1.0), 1.65) * 0.040;
    const baseRimY = capillary;

    for (let s = 0; s <= radialSegs; s++) {
      const a = (s / radialSegs) * Math.PI * 2;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const oct = f > 0.35 ? THREE.MathUtils.lerp(1.0, getOctagonalScale(x, z), (f - 0.35) / 0.65 * 0.86) : 1.0;
      positions.push(x * oct, baseRimY, z * oct);
      uvs.push(0.5 + (x / (maxR * 2)), 0.5 + (z / (maxR * 2)));
    }
  }

  const stride = radialSegs + 1;
  for (let rIdx = 0; rIdx < rings; rIdx++) {
    for (let s = 0; s < radialSegs; s++) {
      const a = rIdx * stride + s;
      const b = a + 1;
      const c = (rIdx + 1) * stride + s;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const surfGeo = new THREE.BufferGeometry();
  surfGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  surfGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  surfGeo.setIndex(indices);
  surfGeo.computeVertexNormals();

  // Save rest Y values so tick loop can ripple concentric waves physically
  surfGeo.userData.baseY = new Float32Array(positions.length / 3);
  for (let i = 0; i < surfGeo.userData.baseY.length; i++) {
    surfGeo.userData.baseY[i] = positions[i * 3 + 1];
  }

  // Sculpted viscous rope-coiling honey mound (2.3-turn spiral tapering cleanly down into meniscus)
  const coilPts = [];
  const turns = 2.25;
  const steps = 42;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const rad = THREE.MathUtils.lerp(0.012, 0.145, Math.pow(t, 0.88));
    const y = THREE.MathUtils.lerp(0.056, -0.004, Math.pow(t, 0.80));
    coilPts.push(new THREE.Vector3(Math.cos(angle) * rad, y, Math.sin(angle) * rad));
  }
  const coilGeo = createTaperedBridgeGeometry({
    points: coilPts,
    radiusStart: 0.026,
    radiusMid: 0.023,
    radiusEnd: 0.010,
    tubularSegments: 42,
    radialSegments: 12,
    flattenZ: 1.0,
  });

  return { surfGeo, coilGeo };
}

/**
 * Stage 05 Clear Glass Octagonal Honey Jar with refractive glass reflections,
 * dynamic honey-level bounce inside glass walls, sculpted capillary meniscus, and
 * viscous coiling pour mound.
 */
export function createHoneyJar({ isMobile = false, initialFill = 0.25 } = {}) {
  const group = new THREE.Group();

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

  const glassBackMat = createClearGlassMaterial({ backSide: true });
  const glassBackMesh = new THREE.Mesh(glassGeo, glassBackMat);
  glassBackMesh.renderOrder = 0;
  group.add(glassBackMesh);

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

  // Sculpted capillary meniscus surface + viscous coiling pour mound
  const { surfGeo, coilGeo } = createJarMeniscusAndCoil(radialSegs);
  const surfMat = createLiquidHoneyMaterial({
    animatedFlow: false,
    warmGolden: true,
    flowSpeed: 0.6,
  });
  surfMat.uniforms.uCoreColor.value.set('#A84B06');
  surfMat.uniforms.uMidColor.value.set('#E6951D');
  const surfaceMesh = new THREE.Mesh(surfGeo, surfMat);
  surfaceMesh.renderOrder = 2;
  group.add(surfaceMesh);

  const coilMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 2.2,
    pulseAmp: 0.005,
  });
  const coilMesh = new THREE.Mesh(coilGeo, coilMat);
  coilMesh.renderOrder = 2;
  group.add(coilMesh);

  const glassFrontMat = createClearGlassMaterial({ backSide: false });
  const glassMesh = new THREE.Mesh(glassGeo, glassFrontMat);
  glassMesh.renderOrder = 3;
  group.add(glassMesh);

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
    glassFrontMat.uniforms.uFillLevel.value = clamped;
    glassBackMat.uniforms.uFillLevel.value = clamped;
    surfMat.uniforms.uTime.value = time;
    coilMat.uniforms.uTime.value = time;

    const minY = honeyMat.uniforms.uMinY.value;
    const maxY = honeyMat.uniforms.uMaxY.value;
    const y = THREE.MathUtils.lerp(minY, maxY, clamped);
    currentSurfaceY = y;

    surfaceMesh.visible = clamped > 0.02;
    surfaceMesh.position.y = y + 0.010;
    const shoulderShrink = y > 0.56 ? THREE.MathUtils.lerp(1.0, 0.71, (y - 0.56) / 0.34) : 1.0;
    surfaceMesh.scale.set(shoulderShrink, 1, shoulderShrink);

    // Subtle real-time concentric ripple displacement on sculpted meniscus disc
    if (surfaceMesh.visible) {
      const sPos = surfGeo.attributes.position;
      const baseY = surfGeo.userData.baseY;
      const amp = 0.008 * (0.18 + ripple);
      for (let i = 0; i < sPos.count; i++) {
        const vx = sPos.getX(i);
        const vz = sPos.getZ(i);
        const rad = Math.hypot(vx, vz);
        const w = Math.sin(rad * 16.0 - time * 4.4) * amp * Math.exp(-rad * 1.4);
        sPos.setY(i, baseY[i] + w);
      }
      sPos.needsUpdate = true;
      surfGeo.computeVertexNormals();
    }

    coilMesh.visible = showCoil && clamped > 0.03;
    if (coilMesh.visible) {
      coilMesh.position.set(0, y + 0.010, 0);
      coilMesh.rotation.y = -time * 2.6;
      const coilScale = (0.94 + Math.sin(time * 4.2) * 0.06) * Math.min(1.0, shoulderShrink * 1.05);
      const coilHeight = showCoil ? (0.45 + 0.55 * Math.min(1.0, ripple + 0.25)) : 0.2;
      coilMesh.scale.set(coilScale, coilHeight, coilScale);
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
 * and `0` at impact.
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
  geo.translate(0, height * 0.5, 0);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = THREE.MathUtils.clamp(y / height, 0, 1);
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
 * Builds a tapered continuous tube ribbon along a CatmullRomCurve3 so viscous
 * honey bridges neck naturally under gravity while swelling smoothly at accumulation endpoints.
 */
function createTaperedBridgeGeometry({
  points,
  radiusStart = 0.048,
  radiusMid = 0.032,
  radiusEnd = 0.046,
  tubularSegments = 32,
  radialSegments = 14,
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
    const bellTop = Math.pow(1.0 - THREE.MathUtils.smoothstep(t, 0.0, 0.32), 1.45);
    const bellBot = Math.pow(THREE.MathUtils.smoothstep(t, 0.68, 1.0), 1.45);
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
 * Builds a single continuous gravity-curved viscous honey column starting cleanly inside
 * a pouring spout (start), curving downward to (dropX, bottomY, dropZ) with physical
 * gravity-thinning waist (`waistRadius`) and subtle bottom arrival flare (`bottomRadius`).
 */
export function createGravityPourGeometry({
  start = new THREE.Vector3(0, 0, 0),
  dropX = 0.0,
  dropZ = 0.0,
  bottomY = -2.2,
  topRadius = 0.046,
  waistRadius = 0.030,
  bottomRadius = 0.036,
  radialSegments = 24,
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
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const tDown = THREE.MathUtils.clamp(0.5 - y, 0, 1);
    const vUp = 1.0 - tDown;

    curve.getPointAt(tDown, pt);
    curve.getTangentAt(tDown, tan).normalize();

    binormal.crossVectors(tan, new THREE.Vector3(0, 0, 1));
    if (binormal.lengthSq() < 0.001) binormal.crossVectors(tan, upVec);
    binormal.normalize();
    normal.crossVectors(binormal, tan).normalize();

    const neck = Math.pow(THREE.MathUtils.smoothstep(vUp, 0.70, 1.0), 1.35);
    const flare = Math.pow(1.0 - THREE.MathUtils.smoothstep(vUp, 0.0, 0.22), 1.4);
    const r = THREE.MathUtils.lerp(waistRadius, topRadius, neck) + (bottomRadius - waistRadius) * flare * 0.50;

    const vx = pt.x + (binormal.x * x + normal.x * z) * r;
    const vy = pt.y + (binormal.y * x + normal.y * z) * r;
    const vz = pt.z + (binormal.z * x + normal.z * z) * r;
    pos.setXYZ(i, vx, vy, vz);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a physical teardrop droplet geometry for occasional surface-tension separation
 * (supplements the thick continuous streams without ever replacing them).
 */
function createTeardropGeometry(radius = 0.032) {
  const pts = [
    new THREE.Vector2(0.0, -radius * 1.15),
    new THREE.Vector2(radius * 0.65, -radius * 0.92),
    new THREE.Vector2(radius * 1.00, -radius * 0.35),
    new THREE.Vector2(radius * 0.92, radius * 0.25),
    new THREE.Vector2(radius * 0.56, radius * 0.82),
    new THREE.Vector2(radius * 0.22, radius * 1.38),
    new THREE.Vector2(0.0, radius * 1.65),
  ];
  const geo = new THREE.LatheGeometry(pts, 18);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Real-Time 3D Hero Liquid Honey Flow System synchronized directly to the rendered
 * bounds of `#heroHoneycombPng`:
 *  1. Upper-comb-to-main-slab over-piece honey flow ribbon
 *  2. Main slab lower-edge accumulation leading to a plump V-apex meniscus reservoir
 *  3. Primary thick continuous stream stretching downward under gravity from the V-apex
 *  4. Secondary continuous stream emerging over the lower edge of the left honeycomb bar
 *  5. Two staggered surface-tension droplets occasionally detaching into the collector below
 *  6. Small underside collection opening (amber collar + swirling liquid pool + spoutAnchor)
 *  7. Continuous exit stream descending from spoutAnchor into the #journey path
 */
export function createHeroHoneyFlowSystem() {
  const root = new THREE.Group();
  const streamGroup = new THREE.Group();
  root.add(streamGroup);

  const cascadeMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 1.75,
    pulseAmp: 0.008,
    originFeather: 0.22,
    endFeather: 0.14,
  });

  const edgeAccumMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 1.55,
    pulseAmp: 0.007,
    originFeather: 0.20,
  });

  const continuousStreamMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvx',
    flowSpeed: 2.35,
    pulseAmp: 0.011,
    originFeather: 0.05,
  });

  const meniscusMat = createLiquidHoneyMaterial({
    animatedFlow: false,
    warmGolden: true,
  });

  const exitPourMat = createLiquidHoneyMaterial({
    animatedFlow: true,
    warmGolden: true,
    flowAxis: 'uvy',
    flowSpeed: 2.65,
    pulseAmp: 0.075,
    swayAmp: 0.004,
  });

  // Dynamic geometry meshes synced to PNG world rect
  const upperCascadeMesh = new THREE.Mesh(new THREE.BufferGeometry(), cascadeMat);
  const mainEdgeAccumMesh = new THREE.Mesh(new THREE.BufferGeometry(), edgeAccumMat);
  const primaryStreamMesh = new THREE.Mesh(new THREE.BufferGeometry(), continuousStreamMat);
  const leftEdgeAccumMesh = new THREE.Mesh(new THREE.BufferGeometry(), edgeAccumMat);
  const leftStreamMesh = new THREE.Mesh(new THREE.BufferGeometry(), continuousStreamMat);
  streamGroup.add(
    upperCascadeMesh,
    mainEdgeAccumMesh,
    primaryStreamMesh,
    leftEdgeAccumMesh,
    leftStreamMesh
  );

  // Sculpted hanging V-apex meniscus reservoir
  const apexPts = [
    new THREE.Vector2(0.0, -0.095),
    new THREE.Vector2(0.036, -0.078),
    new THREE.Vector2(0.078, -0.038),
    new THREE.Vector2(0.098, 0.014),
    new THREE.Vector2(0.082, 0.058),
    new THREE.Vector2(0.044, 0.088),
    new THREE.Vector2(0.0, 0.098),
  ];
  const apexGeo = new THREE.LatheGeometry(apexPts, 24);
  apexGeo.scale(1.16, 1.0, 0.68);
  const apexBeadMesh = new THREE.Mesh(apexGeo, meniscusMat);
  streamGroup.add(apexBeadMesh);

  // Small refined underside collection opening catching all streams cleanly
  const collectionGroup = new THREE.Group();
  root.add(collectionGroup);

  // Warm bronze/amber funnel aperture collar
  const funnelPts = [
    new THREE.Vector2(0.042, -0.072),
    new THREE.Vector2(0.052, -0.038),
    new THREE.Vector2(0.115, 0.002),
    new THREE.Vector2(0.172, 0.036),
    new THREE.Vector2(0.184, 0.052),
    new THREE.Vector2(0.166, 0.058),
    new THREE.Vector2(0.146, 0.042),
    new THREE.Vector2(0.095, 0.008),
    new THREE.Vector2(0.038, -0.036),
    new THREE.Vector2(0.032, -0.072),
  ];
  const funnelGeo = new THREE.LatheGeometry(funnelPts, 32);
  const funnelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B5731B'),
    emissive: new THREE.Color('#331702'),
    emissiveIntensity: 0.22,
    metalness: 0.62,
    roughness: 0.26,
    envMapIntensity: 1.35,
  });
  const funnelMesh = new THREE.Mesh(funnelGeo, funnelMat);
  collectionGroup.add(funnelMesh);

  // Accumulated honey pool sitting inside the collection opening + subtle swirl mound
  const poolGeo = new THREE.CylinderGeometry(0.156, 0.096, 0.042, 28);
  const poolMesh = new THREE.Mesh(poolGeo, meniscusMat);
  poolMesh.position.y = 0.022;
  collectionGroup.add(poolMesh);

  const poolCoilPts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const ang = t * Math.PI * 3.4;
    const r = THREE.MathUtils.lerp(0.008, 0.078, t);
    const y = THREE.MathUtils.lerp(0.052, 0.032, t);
    poolCoilPts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r));
  }
  const poolCoilMesh = new THREE.Mesh(
    createTaperedBridgeGeometry({
      points: poolCoilPts,
      radiusStart: 0.020,
      radiusMid: 0.016,
      radiusEnd: 0.008,
      tubularSegments: 24,
      radialSegments: 10,
    }),
    cascadeMat
  );
  collectionGroup.add(poolCoilMesh);

  const spoutAnchor = new THREE.Object3D();
  spoutAnchor.position.set(0, -0.064, 0);
  collectionGroup.add(spoutAnchor);

  const exitPourMesh = new THREE.Mesh(new THREE.BufferGeometry(), exitPourMat);
  root.add(exitPourMesh);

  // Two staggered surface-tension satellite droplets supplementing the continuous streams
  const dropletGeo = createTeardropGeometry(0.026);
  const dropletA = new THREE.Mesh(dropletGeo, meniscusMat);
  const dropletB = new THREE.Mesh(dropletGeo, meniscusMat);
  root.add(dropletA, dropletB);

  const layoutState = {
    frameScale: 1.0,
    apexBasePos: new THREE.Vector3(),
    poolWorldY: 0,
    dropAOrigin: new THREE.Vector3(),
    dropBOrigin: new THREE.Vector3(),
    poolTargetA: new THREE.Vector3(),
    poolTargetB: new THREE.Vector3(),
    exitBottomRadius: 0.030,
  };

  function replaceGeometry(mesh, nextGeo) {
    if (mesh.geometry) mesh.geometry.dispose();
    mesh.geometry = nextGeo;
  }

  /**
   * Aligns every stream, meniscus bead, droplet anchor, collection opening, and exit pour
   * cleanly to the actual 3D world-space bounds of `#heroHoneycombPng`.
   */
  function syncToPngRect(worldRect, heroBottomY) {
    const s = THREE.MathUtils.clamp(worldRect.height / 3.4, 0.48, 1.25);
    layoutState.frameScale = s;

    const uv = (u, v, z = 0) => new THREE.Vector3(
      worldRect.left + u * worldRect.width,
      worldRect.top - v * worldRect.height,
      z
    );

    // 1. Upper-chunk-to-main-slab flowing honey ribbon (accumulates onto lower comb cells)
    replaceGeometry(upperCascadeMesh, createTaperedBridgeGeometry({
      points: [
        uv(0.415, 0.485, 0.03),
        uv(0.438, 0.532, 0.05),
        uv(0.456, 0.596, 0.055),
        uv(0.478, 0.672, 0.045),
        uv(0.494, 0.735, 0.02),
      ],
      radiusStart: 0.028 * s,
      radiusMid: 0.022 * s,
      radiusEnd: 0.018 * s,
      tubularSegments: 28,
      radialSegments: 12,
      flattenZ: 0.52,
    }));

    // 2. Main slab lower-edge accumulation flowing down into V-apex meniscus
    replaceGeometry(mainEdgeAccumMesh, createTaperedBridgeGeometry({
      points: [
        uv(0.436, 0.786, 0.02),
        uv(0.474, 0.822, 0.048),
        uv(0.514, 0.858, 0.058),
        uv(0.542, 0.880, 0.060),
      ],
      radiusStart: 0.024 * s,
      radiusMid: 0.032 * s,
      radiusEnd: 0.038 * s,
      tubularSegments: 24,
      radialSegments: 14,
      flattenZ: 0.65,
    }));

    const apexPos = uv(0.542, 0.880, 0.056);
    layoutState.apexBasePos.copy(apexPos);
    apexBeadMesh.position.copy(apexPos);
    apexBeadMesh.scale.setScalar(s * 0.82);

    // Collection opening placed directly beneath the honeycomb composition
    const collPos = uv(0.506, 1.022, 0.036);
    collectionGroup.position.copy(collPos);
    collectionGroup.scale.setScalar(s * 0.96);
    layoutState.poolWorldY = collPos.y + 0.028 * s;

    // 3. Primary thick continuous gravity-stretched stream: V-apex -> collection opening
    const primaryMidA = new THREE.Vector3(
      THREE.MathUtils.lerp(apexPos.x, collPos.x, 0.25),
      THREE.MathUtils.lerp(apexPos.y, collPos.y, 0.34),
      0.052
    );
    const primaryMidB = new THREE.Vector3(
      THREE.MathUtils.lerp(apexPos.x, collPos.x, 0.72),
      THREE.MathUtils.lerp(apexPos.y, collPos.y, 0.72),
      0.044
    );
    const primaryEnd = new THREE.Vector3(collPos.x + 0.020 * s, collPos.y + 0.028 * s, collPos.z + 0.005);
    replaceGeometry(primaryStreamMesh, createTaperedBridgeGeometry({
      points: [apexPos.clone().add(new THREE.Vector3(0, -0.04 * s, 0)), primaryMidA, primaryMidB, primaryEnd],
      radiusStart: 0.042 * s,
      radiusMid: 0.023 * s,
      radiusEnd: 0.032 * s,
      tubularSegments: 32,
      radialSegments: 16,
    }));

    // 4. Left vertical honeycomb piece lower-edge accumulation + curved continuous tributary stream
    replaceGeometry(leftEdgeAccumMesh, createTaperedBridgeGeometry({
      points: [
        uv(0.348, 0.865, 0.025),
        uv(0.338, 0.908, 0.045),
        uv(0.318, 0.946, 0.048),
      ],
      radiusStart: 0.020 * s,
      radiusMid: 0.026 * s,
      radiusEnd: 0.028 * s,
      tubularSegments: 18,
      radialSegments: 12,
      flattenZ: 0.65,
    }));

    const leftRoot = uv(0.318, 0.944, 0.048);
    const leftEnd = new THREE.Vector3(collPos.x - 0.036 * s, collPos.y + 0.028 * s, collPos.z);
    replaceGeometry(leftStreamMesh, createTaperedBridgeGeometry({
      points: [
        leftRoot,
        new THREE.Vector3(leftRoot.x + 0.035 * s, leftRoot.y - 0.095 * s, 0.045),
        new THREE.Vector3(THREE.MathUtils.lerp(leftRoot.x, leftEnd.x, 0.62), leftEnd.y + 0.058 * s, 0.040),
        leftEnd,
      ],
      radiusStart: 0.027 * s,
      radiusMid: 0.015 * s,
      radiusEnd: 0.022 * s,
      tubularSegments: 28,
      radialSegments: 14,
    }));

    // 5. Satellite surface-tension droplet anchors
    layoutState.dropAOrigin.copy(uv(0.476, 0.824, 0.052));
    layoutState.poolTargetA.set(collPos.x - 0.010 * s, collPos.y + 0.026 * s, collPos.z + 0.005);
    layoutState.dropBOrigin.copy(uv(0.346, 0.918, 0.048));
    layoutState.poolTargetB.set(collPos.x - 0.052 * s, collPos.y + 0.026 * s, collPos.z);

    // 6. Continuous exit stream pouring vertically out of collection opening down to #journey
    root.updateMatrixWorld(true);
    const spoutWorld = new THREE.Vector3();
    spoutAnchor.getWorldPosition(spoutWorld);
    root.worldToLocal(spoutWorld);

    const exitBottomRadius = 0.031 * s;
    layoutState.exitBottomRadius = exitBottomRadius;
    exitPourMesh.position.set(spoutWorld.x, 0, spoutWorld.z);
    replaceGeometry(exitPourMesh, createGravityPourGeometry({
      start: new THREE.Vector3(0, spoutWorld.y + 0.012 * s, 0),
      dropX: 0,
      dropZ: 0,
      bottomY: Math.min(spoutWorld.y - 0.25, heroBottomY),
      topRadius: 0.038 * s,
      waistRadius: 0.026 * s,
      bottomRadius: exitBottomRadius,
      radialSegments: 24,
      heightSegments: 48,
    }));
  }

  function updateDroplet(mesh, origin, target, t, period, phaseOffset, scaleMul) {
    const s = layoutState.frameScale * scaleMul;
    const cycle = ((t + phaseOffset) % period) / period;

    if (cycle < 0.56) {
      // Slow pendant surface-tension swelling beneath honeycomb edge
      const grow = THREE.MathUtils.smoothstep(cycle, 0.0, 0.56);
      const sz = THREE.MathUtils.lerp(0.18, 0.96, grow);
      mesh.visible = true;
      mesh.position.set(origin.x, origin.y - sz * 0.035 * s, origin.z);
      mesh.scale.set(s * sz, s * sz * THREE.MathUtils.lerp(0.9, 1.35, grow), s * sz);
    } else if (cycle < 0.90) {
      // Pinch off & gravity-driven downward acceleration (d = 0.5 * g * tau^2)
      const fall = (cycle - 0.56) / 0.34;
      const gFrac = fall * fall;
      mesh.visible = true;
      mesh.position.set(
        THREE.MathUtils.lerp(origin.x, target.x, fall * 0.45),
        THREE.MathUtils.lerp(origin.y - 0.034 * s, target.y, gFrac),
        THREE.MathUtils.lerp(origin.z, target.z, fall)
      );
      const stretch = 1.15 + fall * 0.65;
      const thin = 1.0 - fall * 0.22;
      mesh.scale.set(s * thin, s * stretch, s * thin);
    } else {
      // Coalesce smoothly into pooled honey
      const merge = (cycle - 0.90) / 0.10;
      const sz = 1.0 - merge;
      mesh.visible = sz > 0.05;
      mesh.position.copy(target);
      mesh.scale.set(s * (1 + merge * 0.35), s * sz * 0.45, s * (1 + merge * 0.35));
    }
  }

  function update(t) {
    cascadeMat.uniforms.uTime.value = t;
    edgeAccumMat.uniforms.uTime.value = t;
    continuousStreamMat.uniforms.uTime.value = t;
    meniscusMat.uniforms.uTime.value = t;
    exitPourMat.uniforms.uTime.value = t;

    const s = layoutState.frameScale;
    const pulse = 1.0 + Math.sin(t * 2.15) * 0.032;
    apexBeadMesh.scale.set(s * 0.82 * pulse, s * 0.82 * (1.0 + Math.cos(t * 2.15) * 0.025), s * 0.82 * pulse);

    poolCoilMesh.rotation.y = -t * 1.45;
    const poolPulse = 1.0 + Math.sin(t * 2.8) * 0.03;
    poolCoilMesh.scale.set(poolPulse, 1.0, poolPulse);

    updateDroplet(dropletA, layoutState.dropAOrigin, layoutState.poolTargetA, t, 4.8, 0.4, 0.88);
    updateDroplet(dropletB, layoutState.dropBOrigin, layoutState.poolTargetB, t, 5.9, 2.7, 0.76);
  }

  return {
    group: root,
    spoutAnchor,
    getExitBottomRadius: () => layoutState.exitBottomRadius,
    syncToPngRect,
    update,
  };
}
