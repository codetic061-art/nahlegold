/**
 * honey-shaders.js — Custom GLSL materials for crystal-clear glass on white (#FFFFFF),
 * liquid honey streams, jar interior amber depth, and the Stage 05 caustic portal.
 * Built for Three.js r172+
 */
import * as THREE from './vendor/three.module.min.js';

const SIMPLEX_NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

/**
 * High-contrast architectural clear glass shader specifically engineered to read
 * unmistakably against a pure #FFFFFF white backdrop:
 * - Strong charcoal/espresso Fresnel grazing edges (like real thick refractive glass on white paper)
 * - Sharp studio specular reflections along shoulder curve & octagonal bevel ribs
 * - Nearly invisible interior window so inner honey color & brand label shine cleanly
 */
export function createClearGlassMaterial({ backSide = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: backSide ? THREE.BackSide : THREE.FrontSide,
    uniforms: {
      uKeyDir:   { value: new THREE.Vector3(0.58, 0.72, 0.45).normalize() },
      uFillDir:  { value: new THREE.Vector3(-0.68, 0.35, 0.48).normalize() },
      uTopDir:   { value: new THREE.Vector3(0.08, 0.94, 0.32).normalize() },
      uRimDark:  { value: new THREE.Color('#1E150B') },
      uRimCool:  { value: new THREE.Color('#4F3A22') },
      uGlassTint:{ value: new THREE.Color('#F3EDE0') },
      uSpecColor:{ value: new THREE.Color('#FFFFFF') },
      uIsBack:   { value: backSide ? 1.0 : 0.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uKeyDir;
      uniform vec3 uFillDir;
      uniform vec3 uTopDir;
      uniform vec3 uRimDark;
      uniform vec3 uRimCool;
      uniform vec3 uGlassTint;
      uniform vec3 uSpecColor;
      uniform float uIsBack;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;

      void main() {
        vec3 N = normalize(vNormalW);
        if (uIsBack > 0.5) N = -N;
        vec3 V = normalize(cameraPosition - vWorldPos);

        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float rim = pow(1.0 - NdotV, 1.9);
        float hardEdge = pow(1.0 - NdotV, 3.6);

        // Thicker glass accumulation at bottom punt, jar neck/lip, and upper shoulder
        float puntBand = 1.0 - smoothstep(-1.04, -0.74, vLocalPos.y);
        float neckBand = smoothstep(0.68, 0.98, vLocalPos.y);
        float thickMass = max(puntBand * 0.65, neckBand * 0.45);

        // Dark negative-fill edge refraction so glass perimeter stands out clearly on #FFFFFF white
        vec3 col = mix(uGlassTint, uRimCool, rim * 0.72 + thickMass * 0.35);
        col = mix(col, uRimDark, hardEdge * 0.88 + puntBand * rim * 0.35);

        // Vertical facet highlight bands & sharp studio softbox reflections
        vec3 H1 = normalize(uKeyDir + V);
        vec3 H2 = normalize(uFillDir + V);
        vec3 Htop = normalize(uTopDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 150.0) * 1.45;
        float spec2 = pow(max(dot(N, H2), 0.0), 90.0) * 0.85;
        float specTop = pow(max(dot(N, Htop), 0.0), 120.0) * 0.70;
        float strip = smoothstep(0.86, 0.96, abs(N.x + N.z * 0.28)) * 0.22;

        float totalSpec = (spec1 + spec2 + specTop + strip) * (1.0 - uIsBack * 0.68);
        col = mix(col, uSpecColor, clamp(totalSpec, 0.0, 1.0));

        // Transparency: clear window in center face, opaque dark silhouette along refractive walls
        float baseAlpha = uIsBack > 0.5 ? 0.07 : 0.09;
        float alpha = baseAlpha + rim * (uIsBack > 0.5 ? 0.32 : 0.48) + hardEdge * 0.32 + thickMass * 0.16;
        alpha += clamp(totalSpec * 0.78, 0.0, 0.72);
        alpha = clamp(alpha, 0.0, 0.94);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/**
 * Liquid honey inside the glass jar with scroll-controlled fill level (`uFillLevel`),
 * realistic capillary meniscus, surface ripple, and warm golden amber absorption.
 */
export function createJarHoneyMaterial() {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime:       { value: 0 },
      uFillLevel:  { value: 0.72 },
      uMinY:       { value: -0.94 },
      uMaxY:       { value: 0.84 },
      uRipple:     { value: 0.0 },
      uCoreColor:  { value: new THREE.Color('#7C2D03') },
      uMidColor:   { value: new THREE.Color('#D97E0F') },
      uBrightGold: { value: new THREE.Color('#FAD05E') },
      uSpecColor:  { value: new THREE.Color('#FFF8E4') },
      uLightDir:   { value: new THREE.Vector3(0.58, 0.72, 0.42).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      void main() {
        vLocalPos = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFillLevel;
      uniform float uMinY;
      uniform float uMaxY;
      uniform float uRipple;
      uniform vec3 uCoreColor;
      uniform vec3 uMidColor;
      uniform vec3 uBrightGold;
      uniform vec3 uSpecColor;
      uniform vec3 uLightDir;

      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        float fillY = mix(uMinY, uMaxY, clamp(uFillLevel, 0.0, 1.0));
        float distFromCenter = length(vLocalPos.xz);
        float wave = sin(distFromCenter * 10.0 - uTime * 4.2) * 0.015 * (0.25 + uRipple);
        float meniscus = smoothstep(0.42, 0.84, distFromCenter) * 0.032;
        float surfaceY = fillY + wave + meniscus;

        if (vLocalPos.y > surfaceY || uFillLevel <= 0.01) discard;

        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);
        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.0);

        float hNorm = clamp((vLocalPos.y - uMinY) / max(0.001, (surfaceY - uMinY)), 0.0, 1.0);
        vec3 col = mix(uCoreColor, uMidColor, 0.30 + 0.58 * hNorm);
        col = mix(col, uBrightGold, fresnel * 0.85 + smoothstep(0.75, 1.0, hNorm) * 0.36);

        float sideGlow = pow(max(0.0, N.x * -0.45 + N.z * 0.35), 1.5);
        col += uBrightGold * sideGlow * 0.25;

        float b = snoise(vec3(vLocalPos.x * 11.0, vLocalPos.y * 11.0 - uTime * 0.28, vLocalPos.z * 11.0));
        float bubble = smoothstep(0.72, 0.88, b);
        col += uSpecColor * bubble * 0.34;

        float diff = max(dot(N, uLightDir), 0.0);
        vec3 H = normalize(uLightDir + V);
        float spec = pow(max(dot(N, H), 0.0), 105.0) * 1.2;
        col *= (0.86 + diff * 0.34);
        col += uSpecColor * (spec + fresnel * 0.18);

        float topEdge = smoothstep(surfaceY - 0.055, surfaceY, vLocalPos.y);
        col += uBrightGold * topEdge * 0.40;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Glossy optical honey shader for continuous flowing 3D streams (from metal drum tap
 * and into Stage 05 jar mouth), falling ripples, and liquid meniscus caps.
 * Features live upward/downward liquid shear wave perturbations so streams look fluid & alive.
 */
export function createLiquidHoneyMaterial({ animatedFlow = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime:         { value: 0 },
      uLightDir:     { value: new THREE.Vector3(0.55, 0.78, 0.48).normalize() },
      uFillLightDir: { value: new THREE.Vector3(-0.65, 0.32, 0.58).normalize() },
      uCoreColor:    { value: new THREE.Color('#B24E04') },
      uMidColor:     { value: new THREE.Color('#E89314') },
      uGoldColor:    { value: new THREE.Color('#FCE06E') },
      uSpecColor:    { value: new THREE.Color('#FFFBF0') },
      uAnimatedFlow: { value: animatedFlow ? 1.0 : 0.0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uAnimatedFlow;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;

        if (uAnimatedFlow > 0.5) {
          // Subtle viscous downward peristalsis thickness wave anchored cleanly at top/bottom ends
          float vCoord = uv.y;
          float n = snoise(vec3(pos.x * 3.5, vCoord * 3.4 + uTime * 1.9, pos.z * 3.5));
          float endFade = smoothstep(0.0, 0.14, vCoord) * smoothstep(1.0, 0.86, vCoord);
          float pulse = 1.0 + n * 0.08 * (0.35 + 0.65 * endFade);
          pos.x *= pulse;
          pos.z *= pulse;
          // Delicate graceful micro-sway only along mid-column so bottom inlet alignment stays exact
          float midSway = sin(vCoord * 3.14159);
          pos.x += sin(uTime * 2.2 + vCoord * 4.2) * 0.004 * midSway;
          pos.z += cos(uTime * 1.8 + vCoord * 3.6) * 0.003 * midSway;
        }

        vLocalPos = pos;
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uLightDir;
      uniform vec3 uFillLightDir;
      uniform vec3 uCoreColor;
      uniform vec3 uMidColor;
      uniform vec3 uGoldColor;
      uniform vec3 uSpecColor;
      uniform float uAnimatedFlow;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);

        float scrollSpeed = uAnimatedFlow > 0.5 ? 2.6 : 0.35;
        float swirlA = snoise(vec3(vWorldPos.x * 5.0, vWorldPos.y * 5.2 + uTime * scrollSpeed, vWorldPos.z * 5.0));
        float swirlB = snoise(vec3(vWorldPos.x * 11.0, vWorldPos.y * 11.0 + uTime * (scrollSpeed * 1.45), vWorldPos.z * 11.0));
        N = normalize(N + vec3(swirlA * 0.06, swirlB * 0.03, swirlA * 0.06));

        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.15);

        float upward = smoothstep(0.45, 0.96, max(0.0, N.y));
        float thickness = mix(pow(NdotV, 0.85), 0.85, upward * 0.72);
        vec3 col = mix(uGoldColor, uMidColor, smoothstep(0.14, 0.72, thickness));
        col = mix(col, uCoreColor, smoothstep(0.62, 1.0, thickness) * 0.62);

        // Internal luminous honey veins flowing downward
        float streak = smoothstep(0.15, 0.78, swirlA * 0.65 + swirlB * 0.35);
        col = mix(col, uGoldColor * 1.10, streak * (1.0 - thickness * 0.45) * 0.38);

        float diffKey = max(dot(N, uLightDir), 0.0);
        float diffFill = max(dot(N, uFillLightDir), 0.0);
        vec3 topDir = normalize(vec3(0.12, 0.92, 0.36));
        vec3 H1 = normalize(uLightDir + V);
        vec3 H2 = normalize(uFillLightDir + V);
        vec3 Htop = normalize(topDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 125.0) * 1.55;
        float spec2 = pow(max(dot(N, H2), 0.0), 50.0) * 0.52;
        float specTop = pow(max(dot(N, Htop), 0.0), 75.0) * 0.80 * upward;
        float sheen = pow(max(dot(N, H1), 0.0), 16.0) * 0.32;

        col = col * (0.82 + diffKey * 0.42 + diffFill * 0.24);
        col += mix(uGoldColor, uSpecColor, 0.56) * fresnel * 0.52;
        col += uSpecColor * (spec1 + spec2 + specTop + sheen);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Full-screen golden caustic shader used during the Stage 05 finale
 * "Enter the Honey Jar" transition.
 */
export function createCausticPortalMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime:     { value: 0 },
      uStrength: { value: 0.0 },
      uGoldA:    { value: new THREE.Color('#D6861E') },
      uGoldB:    { value: new THREE.Color('#F8CC5B') },
      uCream:    { value: new THREE.Color('#FAF5EA') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uStrength;
      uniform vec3 uGoldA;
      uniform vec3 uGoldB;
      uniform vec3 uCream;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        if (uStrength <= 0.005) discard;
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);

        float angle = atan(p.y, p.x);
        float n1 = snoise(vec3(p * 2.4 + vec2(cos(angle), sin(angle)) * 0.35, uTime * 0.36));
        float n2 = snoise(vec3(p * 4.8 - vec2(0.0, uTime * 0.24), uTime * 0.48));
        float caustic = smoothstep(0.05, 0.72, n1 * 0.65 + n2 * 0.35 + 0.32);

        float centerBright = 1.0 - smoothstep(0.0, 1.15, r);
        vec3 col = mix(uGoldA, uGoldB, caustic);
        col = mix(col, uCream, clamp(centerBright * 0.58 + smoothstep(0.55, 1.0, uStrength) * 0.80, 0.0, 1.0));

        float b = smoothstep(0.74, 0.9, snoise(vec3(p * 7.5, uTime * 0.4)));
        col += vec3(1.0, 0.96, 0.84) * b * 0.42;

        float alpha = smoothstep(0.0, 0.32, uStrength) * (1.0 - smoothstep(0.84, 1.0, uStrength));
        gl_FragColor = vec4(col, alpha * 0.94);
      }
    `,
  });
}
