/**
 * honey-assets.js — Procedural 3D assets, textures, studio PMREM lighting,
 * branded "نحل الذهب" honey jar, wooden dipper, bees, flowers, and honeycomb.
 */
import * as THREE from './vendor/three.module.min.js';
import { createJarHoneyMaterial, createLiquidHoneyMaterial } from './honey-shaders.js';

/**
 * Generates a warm sunlit studio environment map via PMREMGenerator so glass,
 * brushed gold lids, and liquid honey catch crisp natural highlights.
 */
export function createHoneyEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#EFE2C6');

  // Overhead warm sunlight softbox
  const topPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.05, 1.78), side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 8, 1);
  topPanel.rotation.x = Math.PI / 2;
  envScene.add(topPanel);

  // Key studio rim strip (right-front) for crisp vertical bottle highlights
  const keyStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 14),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.75, 1.95), side: THREE.DoubleSide })
  );
  keyStrip.position.set(7.5, 1.5, 5.5);
  keyStrip.lookAt(0, 0, 0);
  envScene.add(keyStrip);

  // Warm amber fill strip (left-back) for honey translucency
  const fillStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.1, 1.45, 0.52), side: THREE.DoubleSide })
  );
  fillStrip.position.set(-7.5, 0.5, -4);
  fillStrip.lookAt(0, 0, 0);
  envScene.add(fillStrip);

  // Dark warm espresso contrast panels so glass edges read crisply against light cream
  const darkLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 14),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#2E1907'), side: THREE.DoubleSide })
  );
  darkLeft.position.set(-8.5, 0, 3.5);
  darkLeft.lookAt(0, 0, 0);
  envScene.add(darkLeft);

  const darkRight = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 14),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#3B210B'), side: THREE.DoubleSide })
  );
  darkRight.position.set(9.2, -1, -2.5);
  darkRight.lookAt(0, 0, 0);
  envScene.add(darkRight);

  const renderTarget = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  return renderTarget.texture;
}

/**
 * Draws a natural warm beech/olive wood grain texture for the honey dipper & hive frame.
 */
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#BA854B');
  base.addColorStop(0.5, '#A9723B');
  base.addColorStop(1, '#925F2D');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Organic wood fibers
  for (let i = 0; i < 160; i++) {
    const x = (i / 160) * 512 + Math.sin(i * 1.7) * 4;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(72, 39, 14, 0.16)' : 'rgba(235, 194, 140, 0.14)';
    ctx.lineWidth = 1 + (i % 3) * 0.8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= 512; y += 32) {
      ctx.lineTo(x + Math.sin(y * 0.025 + i * 0.5) * 6, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Draws the gold jar lid rim texture with subtle Arabic brand motif ("نحل الذهب · عسل نحل طبيعي").
 */
export function createGoldCapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 192);
  grad.addColorStop(0, '#F5D680');
  grad.addColorStop(0.28, '#DFAC48');
  grad.addColorStop(0.7, '#C48A25');
  grad.addColorStop(1, '#9D6712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 192);

  // Subtle brushed metal lines
  ctx.strokeStyle = 'rgba(255, 250, 224, 0.15)';
  ctx.lineWidth = 1;
  for (let y = 4; y < 192; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Fine repeating Arabic script band along skirt
  ctx.fillStyle = 'rgba(73, 42, 13, 0.62)';
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
 * Draws the authentic oval "نحل الذهب" brand label matching the product jars,
 * compositing the existing logo PNG when loaded.
 */
export function createBrandLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const cx = 512;
  const cy = 512;
  const rx = 438;
  const ry = 438;

  const paintLabel = (logoImg) => {
    ctx.clearRect(0, 0, 1024, 1024);

    // Outer metallic gold ring
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    const goldBorder = ctx.createLinearGradient(100, 100, 924, 924);
    goldBorder.addColorStop(0, '#F5D678');
    goldBorder.addColorStop(0.35, '#C5811C');
    goldBorder.addColorStop(0.7, '#F7DC8C');
    goldBorder.addColorStop(1, '#9E5E0B');
    ctx.fillStyle = goldBorder;
    ctx.fill();
    ctx.restore();

    // Inner warm cream oval card
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 18, ry - 18, 0, 0, Math.PI * 2);
    const cream = ctx.createRadialGradient(cx, cy - 60, 40, cx, cy, ry);
    cream.addColorStop(0, '#FFFDF7');
    cream.addColorStop(0.75, '#FAF0D9');
    cream.addColorStop(1, '#EFE0BC');
    ctx.fillStyle = cream;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#9D6214';
    ctx.stroke();
    ctx.restore();

    // Top hexagon + bee crest (matching the real product label emblem)
    ctx.save();
    ctx.translate(cx, 255);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = Math.cos(a) * 108;
      const py = Math.sin(a) * 108;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#2B1807';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#DF9E32';
    ctx.stroke();

    // Stylized golden bee inside crest
    // Wings
    ctx.fillStyle = 'rgba(255, 245, 214, 0.9)';
    ctx.beginPath();
    ctx.ellipse(-42, -16, 46, 20, -0.32, 0, Math.PI * 2);
    ctx.ellipse(42, -16, 46, 20, 0.32, 0, Math.PI * 2);
    ctx.fill();
    // Body & golden stripes
    ctx.fillStyle = '#E8A93C';
    ctx.beginPath();
    ctx.ellipse(0, 14, 24, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2B1807';
    ctx.fillRect(-20, 2, 40, 9);
    ctx.fillRect(-18, 22, 36, 9);
    // Head
    ctx.beginPath();
    ctx.arc(0, -34, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#2B1807';
    ctx.fill();
    ctx.restore();

    // Brand Logo Image or Crisp Arabic Title
    if (logoImg) {
      const targetW = 540;
      const ratio = logoImg.height / logoImg.width;
      const targetH = targetW * ratio;
      ctx.drawImage(logoImg, cx - targetW / 2, 405, targetW, targetH);
    } else {
      ctx.fillStyle = '#3C2712';
      ctx.font = '800 108px "Tajawal", "Almarai", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('نحل الذهب', cx, 470);
    }

    // Subtitle divider rules + copy
    ctx.strokeStyle = '#C98A28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(155, 576);
    ctx.lineTo(295, 576);
    ctx.moveTo(729, 576);
    ctx.lineTo(869, 576);
    ctx.stroke();

    ctx.fillStyle = '#492A0D';
    ctx.font = '700 32px "Tajawal", "Almarai", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('عسل النحل الطبيعي ومشتقاته', cx, 576);

    // Dark warm brown ribbon banner ("عسل طبيعي مصري ١٠٠٪")
    ctx.save();
    ctx.fillStyle = '#3E2209';
    ctx.beginPath();
    ctx.roundRect(cx - 265, 624, 530, 74, 37);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#DF9F37';
    ctx.stroke();
    ctx.fillStyle = '#FAF0D9';
    ctx.font = '700 35px "Tajawal", "Almarai", sans-serif';
    ctx.fillText('عسل مصري خام ١٠٠٪', cx, 663);
    ctx.restore();

    // Botanical golden leaves & clover accents at bottom
    ctx.save();
    ctx.translate(cx, 788);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.fillStyle = '#C88420';
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
    // Small golden honey drop icon
    ctx.fillStyle = '#D6861E';
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

  // Upgrade with the real brand logo image once loaded
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    paintLabel(img);
    texture.needsUpdate = true;
  };
  img.src = 'assets/img/logo-nahl-al-thahab.png';

  return texture;
}

/**
 * Helper: computes octagonal prism radial multiplier rotated by PI/8 so a flat
 * front glass wall faces directly toward +Z (behind the brand oval label).
 */
function getOctagonalScale(x, z) {
  const angle = Math.atan2(z, x) + Math.PI / 8;
  const mod = ((angle % (Math.PI / 4)) + Math.PI / 4) % (Math.PI / 4) - Math.PI / 8;
  return Math.min(1 / Math.cos(mod), 1.07);
}

/**
 * Builds the 3D Hexagonal/Octagonal Glass Honey Jar matching Nahl Al-Thahab's packaging.
 * Returns { group, lidGroup, glassMesh, labelMesh, honeyMat, surfaceMesh, updateFill }
 */
export function createHoneyJar({ isMobile = false, initialFill = 0.88 } = {}) {
  const group = new THREE.Group();

  // Outer faceted glass jar profile
  const glassPoints = [
    new THREE.Vector2(0.0, -1.05),
    new THREE.Vector2(0.68, -1.05),
    new THREE.Vector2(0.84, -0.92),
    new THREE.Vector2(0.88, -0.78),
    new THREE.Vector2(0.88, 0.56),
    new THREE.Vector2(0.82, 0.72),
    new THREE.Vector2(0.66, 0.84),
    new THREE.Vector2(0.64, 1.02),
    new THREE.Vector2(0.68, 1.05),
    new THREE.Vector2(0.60, 1.06),
    new THREE.Vector2(0.56, 0.90),
  ];

  const radialSegs = isMobile ? 24 : 32;
  const glassGeo = new THREE.LatheGeometry(glassPoints, radialSegs);

  // Octagonal facet shaping with a broad flat front facet facing +Z
  const pos = glassGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.7 && y > -0.9 && y < 0.7) {
      const oct = getOctagonalScale(x, z);
      const blend = THREE.MathUtils.smoothstep(y, -0.9, -0.7) * (1 - THREE.MathUtils.smoothstep(y, 0.55, 0.72));
      const scale = THREE.MathUtils.lerp(1.0, oct, blend * 0.88);
      pos.setX(i, x * scale);
      pos.setZ(i, z * scale);
    }
  }
  glassGeo.computeVertexNormals();

  // Back-wall subtle glass rim shell so glass thickness at bottom/neck stays visible even when unfilled
  const glassBackMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFF8EA'),
    metalness: 0.04,
    roughness: 0.08,
    clearcoat: 0.9,
    envMapIntensity: 1.4,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const glassBackMesh = new THREE.Mesh(glassGeo, glassBackMat);
  glassBackMesh.renderOrder = 0;
  group.add(glassBackMesh);

  // Inner rising golden honey volume (opaque Beer-Lambert amber core + bubbles)
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
      const scale = THREE.MathUtils.lerp(1.0, oct, blend * 0.85);
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

  // Top honey surface meniscus cap (floats dynamically at fillY)
  const surfGeo = new THREE.CircleGeometry(0.79, radialSegs);
  surfGeo.rotateX(-Math.PI / 2);
  const surfMat = createLiquidHoneyMaterial();
  surfMat.uniforms.uCoreColor.value.set('#A84B08');
  surfMat.uniforms.uMidColor.value.set('#E6951D');
  const surfaceMesh = new THREE.Mesh(surfGeo, surfMat);
  surfaceMesh.renderOrder = 2;
  group.add(surfaceMesh);

  // Crystal-clear front glass shell (studio speculars without blocking inner amber honey)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFFBF2'),
    metalness: 0.06,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 1.0,
    envMapIntensity: 2.4,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.renderOrder = 3;
  group.add(glassMesh);

  // Curved Oval Brand Label conformed cleanly OUTSIDE the front octagonal wall (zero clipping!)
  const labelTex = createBrandLabelTexture();
  const labelGeo = new THREE.CylinderGeometry(0.915, 0.915, 0.98, 40, 12, true, -0.62, 1.24);
  const lpos = labelGeo.attributes.position;
  for (let i = 0; i < lpos.count; i++) {
    const x = lpos.getX(i);
    const z = lpos.getZ(i);
    const oct = getOctagonalScale(x, z);
    const desiredScale = THREE.MathUtils.lerp(1.0, oct, 0.88);
    lpos.setX(i, x * desiredScale);
    lpos.setZ(i, z * desiredScale);
  }
  labelGeo.computeVertexNormals();

  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    transparent: true,
    alphaTest: 0.12,
    roughness: 0.36,
    metalness: 0.08,
    envMapIntensity: 0.95,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = -0.10;
  labelMesh.renderOrder = 4;
  group.add(labelMesh);

  // Gold Screw Cap Assembly (can be lifted or rotated independently!)
  const lidGroup = new THREE.Group();
  const capTex = createGoldCapTexture();
  const capGeo = new THREE.CylinderGeometry(0.71, 0.72, 0.26, 36, 1, true);
  const capSkirtMat = new THREE.MeshStandardMaterial({
    map: capTex,
    metalness: 0.78,
    roughness: 0.24,
    envMapIntensity: 1.5,
  });
  const capSkirt = new THREE.Mesh(capGeo, capSkirtMat);
  capSkirt.position.y = 1.03;
  lidGroup.add(capSkirt);

  const capTopGeo = new THREE.CylinderGeometry(0.69, 0.71, 0.04, 36);
  const capTopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E3AF49'),
    metalness: 0.85,
    roughness: 0.20,
    envMapIntensity: 1.55,
  });
  const capTop = new THREE.Mesh(capTopGeo, capTopMat);
  capTop.position.y = 1.15;
  lidGroup.add(capTop);

  // Small bevel ring on top of lid
  const rimGeo = new THREE.TorusGeometry(0.66, 0.025, 10, 36);
  rimGeo.rotateX(Math.PI / 2);
  const capRim = new THREE.Mesh(rimGeo, capTopMat);
  capRim.position.y = 1.16;
  lidGroup.add(capRim);

  group.add(lidGroup);

  const updateFill = (level, ripple = 0, time = 0) => {
    const clamped = THREE.MathUtils.clamp(level, 0.0, 1.0);
    honeyMat.uniforms.uFillLevel.value = clamped;
    honeyMat.uniforms.uRipple.value = ripple;
    honeyMat.uniforms.uTime.value = time;
    surfMat.uniforms.uTime.value = time;

    const minY = honeyMat.uniforms.uMinY.value;
    const maxY = honeyMat.uniforms.uMaxY.value;
    const y = THREE.MathUtils.lerp(minY, maxY, clamped);
    surfaceMesh.visible = clamped > 0.02;
    surfaceMesh.position.y = y + 0.004;
    const shoulderShrink = y > 0.56 ? THREE.MathUtils.lerp(1.0, 0.72, (y - 0.56) / 0.34) : 1.0;
    surfaceMesh.scale.set(shoulderShrink, 1, shoulderShrink);
  };

  updateFill(initialFill, 0, 0);

  return { group, lidGroup, glassMesh, labelMesh, honeyMat, surfaceMesh, updateFill };
}

/**
 * Builds a tilted wooden honey dipper with 5 iconic honey-collecting rings and
 * a rich, glossy golden honey glaze clinging around the lower grooves.
 */
export function createHoneyDipper() {
  const group = new THREE.Group();
  const woodTex = createWoodTexture();

  // Lathe profile: handle at top (y = +2.3) down to grooved dipper head (y = -0.54)
  const pts = [
    new THREE.Vector2(0.0, 2.30),
    new THREE.Vector2(0.085, 2.24),
    new THREE.Vector2(0.095, 2.10),
    new THREE.Vector2(0.072, 1.85),
    new THREE.Vector2(0.068, 0.45),
    new THREE.Vector2(0.09, 0.35),
  ];

  // Add 5 sculpted rounded grooves on the dipper bulb
  const grooves = 5;
  const topY = 0.30;
  const step = 0.145;
  for (let i = 0; i < grooves; i++) {
    const yc = topY - i * step;
    const envelope = Math.sin(((i + 0.65) / (grooves + 0.3)) * Math.PI);
    const outerR = 0.21 + 0.105 * envelope;
    const innerR = 0.125 + 0.03 * envelope;
    pts.push(new THREE.Vector2(innerR, yc + step * 0.42));
    pts.push(new THREE.Vector2(outerR, yc + step * 0.18));
    pts.push(new THREE.Vector2(outerR, yc - step * 0.18));
    pts.push(new THREE.Vector2(innerR, yc - step * 0.42));
  }
  pts.push(new THREE.Vector2(0.09, -0.50));
  pts.push(new THREE.Vector2(0.0, -0.54));

  const dipperGeo = new THREE.LatheGeometry(pts.reverse(), 32);
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.45,
    metalness: 0.04,
    envMapIntensity: 0.95,
  });
  const woodMesh = new THREE.Mesh(dipperGeo, woodMat);
  group.add(woodMesh);

  // Conformal plump golden honey bulb coating the bottom ring cleanly outside the wood
  const glazePts = [
    new THREE.Vector2(0.0,   -0.215),
    new THREE.Vector2(0.148, -0.219),
    new THREE.Vector2(0.268, -0.254),
    new THREE.Vector2(0.268, -0.306),
    new THREE.Vector2(0.215, -0.365),
    new THREE.Vector2(0.175, -0.445),
    new THREE.Vector2(0.132, -0.515),
    new THREE.Vector2(0.075, -0.562),
    new THREE.Vector2(0.0,   -0.580),
  ];
  // LatheGeometry needs bottom-to-top profile ordering for outward front-face normals
  const glazeGeo = new THREE.LatheGeometry(glazePts.reverse(), 32);
  const glazeMat = createLiquidHoneyMaterial();
  glazeMat.uniforms.uCoreColor.value.set('#C46B08');
  glazeMat.uniforms.uMidColor.value.set('#EA9A1C');
  glazeMat.uniforms.uGoldColor.value.set('#FDE274');
  const glazeMesh = new THREE.Mesh(glazeGeo, glazeMat);
  group.add(glazeMesh);

  return { group, woodMesh, glazeMesh, glazeMat };
}

/**
 * Builds an articulated 3D Honeybee whose wings flap smoothly in the animation loop.
 */
function createHoneybee() {
  const bee = new THREE.Group();

  const amberMat = new THREE.MeshStandardMaterial({ color: '#E89B24', roughness: 0.38, metalness: 0.06 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: '#2B1706', roughness: 0.48, metalness: 0.05 });
  const wingMat  = new THREE.MeshStandardMaterial({
    color: '#FFFDF5',
    roughness: 0.15,
    transparent: true,
    opacity: 0.76,
    side: THREE.DoubleSide,
  });

  // Abdomen with stripes
  const abd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), amberMat);
  abd.scale.set(0.95, 0.9, 1.48);
  abd.position.z = -0.15;
  bee.add(abd);

  for (const zOff of [-0.09, -0.17, -0.25]) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.019, 6, 14), darkMat);
    stripe.position.z = zOff;
    bee.add(stripe);
  }

  // Thorax
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.098, 12, 10), darkMat);
  thorax.position.z = 0.02;
  bee.add(thorax);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), darkMat);
  head.position.z = 0.14;
  bee.add(head);

  // Two translucent flapping wings
  const wingGeo = new THREE.CircleGeometry(0.16, 14);
  wingGeo.scale(0.56, 1.28, 1);
  wingGeo.translate(0, 0.16, 0);

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
 * Builds Stage 01: Sunlit wildflowers (clover & citrus blossoms) + flying honeybees.
 */
export function createStage01FloraAndBees({ isMobile = false } = {}) {
  const group = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({ color: '#658035', roughness: 0.68 });
  const petalWhiteMat = new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.36, side: THREE.DoubleSide });
  const petalCreamMat = new THREE.MeshStandardMaterial({ color: '#FCE59B', roughness: 0.40, side: THREE.DoubleSide });
  const pollenMat = new THREE.MeshStandardMaterial({
    color: '#EC9D1E',
    emissive: '#B86408',
    emissiveIntensity: 0.35,
    roughness: 0.45,
  });

  // Positioned tightly around local Stage 01 center so all blossoms frame cleanly in view
  const flowerAnchors = [
    { pos: [-1.15, 0.35, 0.35], scale: 1.48, kind: 'citrus', rot: 0.14 },
    { pos: [0.35, -0.15, 0.72], scale: 1.25, kind: 'clover', rot: -0.12 },
    { pos: [1.35, 0.45, 0.15], scale: 1.38, kind: 'citrus', rot: -0.18 },
    { pos: [-0.35, -0.95, 0.55], scale: 1.15, kind: 'citrus', rot: 0.10 },
    { pos: [1.10, -1.05, -0.25], scale: 1.05, kind: 'clover', rot: -0.08 },
  ];

  const flowers = [];
  const count = isMobile ? 3 : flowerAnchors.length;
  for (let i = 0; i < count; i++) {
    const spec = flowerAnchors[i];
    const f = new THREE.Group();
    f.position.set(...spec.pos);
    f.scale.setScalar(spec.scale);

    // Stem + pair of leaves
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 1.85, 8), stemMat);
    stem.position.y = -0.92;
    f.add(stem);

    for (const side of [-1, 1]) {
      const leafGeo = new THREE.SphereGeometry(0.18, 10, 8);
      leafGeo.scale(0.55, 0.12, 1.4);
      const leaf = new THREE.Mesh(leafGeo, stemMat);
      leaf.position.set(side * 0.18, -0.58 - (side > 0 ? 0.22 : 0), 0.05);
      leaf.rotation.set(0.2, side * 0.5, side * -0.45);
      f.add(leaf);
    }

    // Sculpted Blossom head tilted toward viewer for crisp silhouette
    const head = new THREE.Group();
    if (spec.kind === 'citrus') {
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), pollenMat);
      head.add(center);
      const petalGeo = new THREE.SphereGeometry(0.28, 12, 8);
      petalGeo.scale(0.58, 0.16, 1.28);
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        const pet = new THREE.Mesh(petalGeo, p % 2 === 0 ? petalWhiteMat : petalCreamMat);
        pet.position.set(Math.cos(a) * 0.34, -0.02, Math.sin(a) * 0.34);
        pet.rotation.y = -a + Math.PI / 2;
        pet.rotation.x = 0.24;
        head.add(pet);
      }
      head.rotation.x = 0.85;
    } else {
      // Sculpted Clover cluster blossom
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 10), pollenMat);
      head.add(center);
      for (let p = 0; p < 12; p++) {
        const a = p * 2.39996;
        const r = 0.16 + (p % 2) * 0.10;
        const floret = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), p % 3 === 0 ? petalCreamMat : petalWhiteMat);
        floret.position.set(Math.cos(a) * r, 0.05 + (p % 3) * 0.05, Math.sin(a) * r);
        head.add(floret);
      }
      head.rotation.x = 0.48;
    }
    f.add(head);
    f.userData = { baseRotZ: spec.rot, phase: i * 1.3 };
    flowers.push(f);
    group.add(f);
  }

  // Animated Honeybees orbiting the wildflowers
  const bees = [];
  const beeCount = isMobile ? 3 : 5;
  for (let i = 0; i < beeCount; i++) {
    const bee = createHoneybee();
    bee.scale.setScalar(1.42);
    bee.userData.orbitCenter = new THREE.Vector3(
      (i - 2) * 0.58,
      0.1 + (i % 2) * 0.45,
      0.75 + (i % 3) * 0.28
    );
    bee.userData.orbitRadius = 0.45 + (i % 3) * 0.16;
    bee.userData.orbitSpeed = 0.95 + i * 0.22;
    bees.push(bee);
    group.add(bee);
  }

  return { group, flowers, bees };
}

/**
 * Builds Stage 02 & 03: Organic hexagonal beeswax honeycomb clusters with
 * rich liquid golden honey filling inside the cells.
 */
export function createHoneycombStage({ isMobile = false } = {}) {
  const group = new THREE.Group();

  // Extruded hollow-look hexagon wall + inner liquid honey core
  const hexShape = new THREE.Shape();
  const R = 0.34;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    if (i === 0) hexShape.moveTo(x, y);
    else hexShape.lineTo(x, y);
  }
  hexShape.closePath();

  const hole = new THREE.Path();
  const rIn = 0.275;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const x = Math.cos(a) * rIn;
    const y = Math.sin(a) * rIn;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  hole.closePath();
  hexShape.holes.push(hole);

  const waxGeo = new THREE.ExtrudeGeometry(hexShape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
  });
  waxGeo.center();

  const waxMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E3A63D'),
    roughness: 0.48,
    metalness: 0.04,
    envMapIntensity: 0.95,
  });

  // Liquid honey fill inside each cell (uses rich luminous amber shader)
  const fillShape = new THREE.Shape();
  const rFill = 0.272;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const x = Math.cos(a) * rFill;
    const y = Math.sin(a) * rFill;
    if (i === 0) fillShape.moveTo(x, y);
    else fillShape.lineTo(x, y);
  }
  fillShape.closePath();
  const fillGeo = new THREE.ExtrudeGeometry(fillShape, { depth: 0.19, bevelEnabled: false });
  fillGeo.center();

  const liquidCellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#DE8310'),
    emissive: new THREE.Color('#8A3402'),
    emissiveIntensity: 0.42,
    roughness: 0.05,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.8,
  });

  // Organic hexagonal coordinates (broken natural comb silhouette)
  const coords = [
    [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1],
    [2, -1], [2, 0], [-2, 1], [-2, 0], [1, 1], [-1, -1],
    [0, 2], [-1, 2], [1, -2], [2, -2], [-2, 2],
  ];
  const cellCount = isMobile ? 12 : coords.length;

  const waxInst = new THREE.InstancedMesh(waxGeo, waxMat, cellCount);
  const fillInst = new THREE.InstancedMesh(fillGeo, liquidCellMat, cellCount);

  const dummy = new THREE.Object3D();
  const cellMeta = [];

  for (let i = 0; i < cellCount; i++) {
    const [q, r] = coords[i];
    const x = R * 1.56 * q;
    const y = R * Math.sqrt(3) * (r + q / 2);
    const zJitter = Math.sin(i * 2.1) * 0.03;

    dummy.position.set(x, y, zJitter);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    waxInst.setMatrixAt(i, dummy.matrix);

    cellMeta.push({ x, y, zJitter, threshold: i / cellCount });
  }
  waxInst.instanceMatrix.needsUpdate = true;

  // Bees working closely across the comb without clipping neighboring story cards
  const combBees = [];
  const beeCount = isMobile ? 2 : 4;
  for (let i = 0; i < beeCount; i++) {
    const bee = createHoneybee();
    bee.scale.setScalar(1.22);
    bee.userData.orbitCenter = new THREE.Vector3((i - 1.5) * 0.44, (i % 2 === 0 ? 0.34 : -0.34), 0.38);
    bee.userData.orbitRadius = 0.28;
    bee.userData.orbitSpeed = 0.65 + i * 0.18;
    combBees.push(bee);
    group.add(bee);
  }

  group.add(waxInst, fillInst);

  const updateCellFill = (fillAmount) => {
    for (let i = 0; i < cellCount; i++) {
      const m = cellMeta[i];
      const localFill = THREE.MathUtils.clamp((fillAmount * 1.35 - m.threshold * 0.55), 0.05, 1.0);
      dummy.position.set(m.x, m.y, m.zJitter - (1 - localFill) * 0.06);
      dummy.scale.set(0.95, 0.95, localFill);
      dummy.updateMatrix();
      fillInst.setMatrixAt(i, dummy.matrix);
    }
    fillInst.instanceMatrix.needsUpdate = true;
  };

  updateCellFill(0.5);

  return { group, bees: combBees, updateCellFill };
}

/**
 * Draws a rich tactile hexagonal honeycomb sheet texture (color + bump relief)
 * for Stage 04's apiary harvest wooden frame.
 */
function createHarvestCombTextures() {
  const w = 512;
  const h = 360;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');

  const bg = cCtx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#E9AC3A');
  bg.addColorStop(0.5, '#D48114');
  bg.addColorStop(1, '#BA6308');
  cCtx.fillStyle = bg;
  cCtx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#505050';
  bCtx.fillRect(0, 0, w, h);

  const r = 18;
  const dx = r * 1.5;
  const dy = r * Math.sqrt(3);
  for (let col = -1; col <= Math.ceil(w / dx) + 1; col++) {
    for (let row = -1; row <= Math.ceil(h / dy) + 1; row++) {
      const cx = col * dx;
      const cy = row * dy + (col % 2 === 0 ? 0 : dy * 0.5);

      // Draw filled glossy amber hex interior
      cCtx.beginPath();
      bCtx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        const px = cx + Math.cos(a) * (r - 1.5);
        const py = cy + Math.sin(a) * (r - 1.5);
        if (k === 0) { cCtx.moveTo(px, py); bCtx.moveTo(px, py); }
        else { cCtx.lineTo(px, py); bCtx.lineTo(px, py); }
      }
      cCtx.closePath();
      bCtx.closePath();

      // Alternate capped warm wax & glistening uncovered golden honey cells
      const capped = ((col * 7 + row * 13) & 3) === 0;
      cCtx.fillStyle = capped ? '#F4D47A' : '#DF8C14';
      cCtx.fill();
      cCtx.lineWidth = 2.6;
      cCtx.strokeStyle = '#F7DA88';
      cCtx.stroke();

      bCtx.fillStyle = capped ? '#D8D8D8' : '#707070';
      bCtx.fill();
      bCtx.lineWidth = 3.2;
      bCtx.strokeStyle = '#FFFFFF';
      bCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = 4;

  return { map, bumpMap };
}

/**
 * Builds Stage 04: Wooden apiary harvest comb frame & brushed-gold harvest sieve ring.
 */
export function createHarvestStage() {
  const group = new THREE.Group();
  const woodTex = createWoodTexture();

  const frameMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.52,
    metalness: 0.05,
  });

  // Wooden hive top bar + side bars (authentic Egyptian apiary harvest frame)
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.17, 0.36), frameMat);
  topBar.position.y = 0.94;
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.13, 0.32), frameMat);
  botBar.position.y = -0.94;
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.88, 0.32), frameMat);
  leftBar.position.x = -1.34;
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.88, 0.32), frameMat);
  rightBar.position.x = 1.34;
  group.add(topBar, botBar, leftBar, rightBar);

  // Embossed hexagonal honeycomb core sheet inside wooden frame
  const { map: combMap, bumpMap: combBump } = createHarvestCombTextures();
  const sheetMat = new THREE.MeshPhysicalMaterial({
    map: combMap,
    bumpMap: combBump,
    bumpScale: 0.045,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.85,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.35,
  });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.50, 1.70, 0.14), sheetMat);
  group.add(sheet);

  // Thin stainless/brass guide wires stretched across the harvest frame (authentic Langstroth comb wire)
  const wireMat = new THREE.MeshStandardMaterial({ color: '#E0C070', metalness: 0.85, roughness: 0.25 });
  for (const wy of [-0.42, 0.0, 0.42]) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.52, 8), wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, wy, 0.075);
    group.add(wire);
  }

  // Brushed-gold fine harvest sieve / ring below frame
  const sieveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D9A545'),
    metalness: 0.86,
    roughness: 0.22,
    envMapIntensity: 1.5,
  });
  const sieveRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.06, 16, 44), sieveMat);
  sieveRing.rotation.x = Math.PI / 2 - 0.18;
  sieveRing.position.set(0, -1.45, 0.25);
  group.add(sieveRing);

  return { group, sheetMat: null };
}
