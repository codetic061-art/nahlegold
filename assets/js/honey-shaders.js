/**
 * honey-shaders.js — Optical GLSL materials for real-time viscous liquid honey,
 * crystal-clear refractive glass on warm cream (#FAF4E4), jar volumetric amber depth,
 * and the Stage 05 Enter-the-Jar golden caustic portal.
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
 * Dual-wall refractive clear crown glass (IOR 1.52) engineered to read sharply
 * against warm cream (#FAF4E4) while transmitting golden internal bounce where
 * filled with honey (`uFillLevel`).
 */
export function createClearGlassMaterial({ backSide = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: backSide ? THREE.BackSide : THREE.FrontSide,
    uniforms: {
      uKeyDir:     { value: new THREE.Vector3(0.58, 0.72, 0.45).normalize() },
      uFillDir:    { value: new THREE.Vector3(-0.68, 0.35, 0.48).normalize() },
      uTopDir:     { value: new THREE.Vector3(0.08, 0.94, 0.32).normalize() },
      uRimDark:    { value: new THREE.Color('#20150A') },
      uRimCool:    { value: new THREE.Color('#5A4328') },
      uGlassTint:  { value: new THREE.Color('#F5EFE2') },
      uHoneyBounce:{ value: new THREE.Color('#F3A826') },
      uSpecColor:  { value: new THREE.Color('#FFFFFF') },
      uIsBack:     { value: backSide ? 1.0 : 0.0 },
      uFillLevel:  { value: 0.25 },
      uMinY:       { value: -0.94 },
      uMaxY:       { value: 0.84 },
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
      uniform vec3 uHoneyBounce;
      uniform vec3 uSpecColor;
      uniform float uIsBack;
      uniform float uFillLevel;
      uniform float uMinY;
      uniform float uMaxY;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;

      void main() {
        vec3 N = normalize(vNormalW);
        if (uIsBack > 0.5) N = -N;
        vec3 V = normalize(cameraPosition - vWorldPos);

        // Crown glass Schlick Fresnel (IOR 1.52 -> F0 ~= 0.043) + architectural edge emphasis
        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float schlick = 0.043 + 0.957 * pow(1.0 - NdotV, 4.2);
        float rim = pow(1.0 - NdotV, 1.85);
        float hardEdge = pow(1.0 - NdotV, 3.8);

        // Refracted ray direction for glass wall caustic/bounce lookup
        vec3 R = refract(-V, N, 1.0 / 1.52);

        // Thick glass accumulation at bottom punt, screw neck, and upper shoulder
        float puntBand = 1.0 - smoothstep(-1.05, -0.72, vLocalPos.y);
        float neckBand = smoothstep(0.68, 1.00, vLocalPos.y);
        float thickMass = max(puntBand * 0.72, neckBand * 0.50);

        float fillY = mix(uMinY, uMaxY, clamp(uFillLevel, 0.0, 1.0));
        float submerged = 1.0 - smoothstep(fillY - 0.06, fillY + 0.04, vLocalPos.y);
        float internalRefr = clamp(abs(R.x) * 0.65 + (1.0 - NdotV) * 0.55, 0.0, 1.0);

        // Negative-fill dark refraction border so clear glass stands out unmistakably on #FAF4E4
        vec3 col = mix(uGlassTint, uRimCool, rim * 0.66 + thickMass * 0.36);
        col = mix(col, uRimDark, hardEdge * 0.88 + puntBand * rim * 0.40);

        // Golden internal light transmission along submerged refracting walls & heavy punt glass
        float honeyGlow = submerged * internalRefr * 0.58 + puntBand * submerged * 0.45;
        col = mix(col, uHoneyBounce, clamp(honeyGlow * 0.68, 0.0, 0.72));

        // Vertical octagonal facet reflection strips & crisp studio softbox speculars
        vec3 H1 = normalize(uKeyDir + V);
        vec3 H2 = normalize(uFillDir + V);
        vec3 Htop = normalize(uTopDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 175.0) * 1.65;
        float spec2 = pow(max(dot(N, H2), 0.0), 105.0) * 0.95;
        float specTop = pow(max(dot(N, Htop), 0.0), 130.0) * 0.78;
        float softboxStrip = smoothstep(0.84, 0.96, abs(N.x * 0.92 + N.z * 0.38)) * 0.28;
        float backStrip = smoothstep(0.76, 0.93, abs(R.x)) * 0.14 * (1.0 - uIsBack);

        float totalSpec = (spec1 + spec2 + specTop + softboxStrip + backStrip) * (1.0 - uIsBack * 0.62);
        col = mix(col, uSpecColor, clamp(totalSpec, 0.0, 1.0));

        float baseAlpha = uIsBack > 0.5 ? 0.06 : 0.075;
        float alpha = baseAlpha
          + rim * (uIsBack > 0.5 ? 0.30 : 0.44)
          + schlick * 0.28
          + hardEdge * 0.32
          + thickMass * 0.18;
        alpha += clamp(totalSpec * 0.82, 0.0, 0.76);
        alpha = clamp(alpha, 0.0, 0.95);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/**
 * Volumetric golden-amber honey inside the Stage 05 jar with Beer-Lambert depth
 * absorption, capillary wall meniscus, concentric surface ripples, and rising micro-bubbles.
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
      uCoreColor:  { value: new THREE.Color('#7C2C02') },
      uMidColor:   { value: new THREE.Color('#DC820E') },
      uBrightGold: { value: new THREE.Color('#FCD866') },
      uSpecColor:  { value: new THREE.Color('#FFFBF0') },
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
        float wave = sin(distFromCenter * 12.0 - uTime * 4.0) * 0.014 * (0.20 + uRipple);
        float meniscus = smoothstep(0.42, 0.84, distFromCenter) * 0.038;
        float surfaceY = fillY + wave + meniscus;

        if (vLocalPos.y > surfaceY || uFillLevel <= 0.01) discard;

        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);
        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.0);

        // Beer-Lambert optical path depth: luminous translucent gold near surface/walls, deep amber inside
        float hNorm = clamp((vLocalPos.y - uMinY) / max(0.001, (surfaceY - uMinY)), 0.0, 1.0);
        float opticalDepth = mix(0.85, 0.25, hNorm) * (0.45 + 0.55 * NdotV);
        vec3 col = mix(uBrightGold, uMidColor, smoothstep(0.10, 0.55, opticalDepth));
        col = mix(col, uCoreColor, smoothstep(0.55, 0.98, opticalDepth) * 0.78);

        // Warm backlit subsurface scatter from side studio fill
        float sideGlow = pow(max(0.0, N.x * -0.45 + N.z * 0.35), 1.4) + fresnel * 0.55;
        col += uBrightGold * sideGlow * 0.34;

        // Refracted upper-surface caustic ribbons just beneath the liquid meniscus
        float depthFromTop = max(0.0, surfaceY - vLocalPos.y);
        float causticZone = 1.0 - smoothstep(0.0, 0.32, depthFromTop);
        float cNoise = snoise(vec3(vLocalPos.x * 5.2, vLocalPos.y * 4.5 - uTime * 0.35, vLocalPos.z * 5.2));
        col += uBrightGold * smoothstep(0.18, 0.78, cNoise) * causticZone * 0.38;

        // Slow-rising trapped air micro-bubbles inside raw viscous honey
        float b1 = snoise(vec3(vLocalPos.x * 12.0, vLocalPos.y * 12.0 - uTime * 0.22, vLocalPos.z * 12.0));
        float b2 = snoise(vec3(vLocalPos.x * 22.0 + 4.1, vLocalPos.y * 22.0 - uTime * 0.31, vLocalPos.z * 22.0));
        float bubble = smoothstep(0.75, 0.90, b1) * 0.8 + smoothstep(0.80, 0.93, b2) * 0.55;
        col += uSpecColor * bubble * 0.36;

        float diff = max(dot(N, uLightDir), 0.0);
        vec3 H = normalize(uLightDir + V);
        float spec = pow(max(dot(N, H), 0.0), 120.0) * 1.25;
        col *= (0.86 + diff * 0.34);
        col += uSpecColor * (spec + fresnel * 0.20);

        // Capillary bright golden meniscus band right along the top glass boundary
        float topEdge = smoothstep(surfaceY - 0.058, surfaceY, vLocalPos.y);
        col += uBrightGold * topEdge * 0.44;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Real-time optical viscous honey shader for continuous flowing 3D streams,
 * over-comb accumulation sheets, hanging droplets, and the underside collection pool.
 * Implements Beer-Lambert golden/amber transmission, dielectric Fresnel highlights (IOR 1.49),
 * gravity-advected peristaltic flow ripples, and optional soft origin feathering (`originFeather`)
 * so honey visibly oozes from the honeycomb PNG edges without hard polygon seams.
 */
export function createLiquidHoneyMaterial({
  animatedFlow = false,
  warmGolden = true,
  flowAxis = 'uvy',
  flowSpeed = 2.4,
  pulseAmp = 0.075,
  swayAmp = 0.005,
  originFeather = 0.0,
  endFeather = 0.0,
  uvScale = 1.0,
} = {}) {
  const coreHex = warmGolden ? '#B86204' : '#A44803';
  const midHex  = warmGolden ? '#EC9F16' : '#E28910';
  const goldHex = warmGolden ? '#FFE668' : '#FCD858';
  const specHex = '#FFFDF5';

  return new THREE.ShaderMaterial({
    transparent: originFeather > 0 || endFeather > 0,
    depthWrite: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime:         { value: 0 },
      uLightDir:     { value: new THREE.Vector3(0.55, 0.78, 0.48).normalize() },
      uFillLightDir: { value: new THREE.Vector3(-0.65, 0.32, 0.58).normalize() },
      uCoreColor:    { value: new THREE.Color(coreHex) },
      uMidColor:     { value: new THREE.Color(midHex) },
      uGoldColor:    { value: new THREE.Color(goldHex) },
      uSpecColor:    { value: new THREE.Color(specHex) },
      uAnimatedFlow: { value: animatedFlow ? 1.0 : 0.0 },
      uFlowAxisX:    { value: flowAxis === 'uvx' ? 1.0 : 0.0 },
      uFlowSpeed:    { value: flowSpeed },
      uPulseAmp:     { value: pulseAmp },
      uSwayAmp:      { value: swayAmp },
      uWarmGolden:   { value: warmGolden ? 1.0 : 0.0 },
      uOriginFeather:{ value: originFeather },
      uEndFeather:   { value: endFeather },
      uUvScale:      { value: uvScale },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uAnimatedFlow;
      uniform float uFlowAxisX;
      uniform float uFlowSpeed;
      uniform float uPulseAmp;
      uniform float uSwayAmp;
      uniform float uUvScale;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        vUv = uv;
        vec3 pos = position;
        vec3 nrm = normal;

        if (uAnimatedFlow > 0.5) {
          // flowCoord runs 0 at emergence origin -> 1 at downstream bottom
          float flowCoord = mix(1.0 - uv.y, uv.x, uFlowAxisX);
          float endFade = smoothstep(0.0, 0.14, flowCoord) * smoothstep(1.0, 0.86, flowCoord);

          if (uFlowAxisX > 0.5) {
            // Gravity-accelerated viscous peristalsis along spline tubes/ribbons
            float gravPhase = flowCoord * (1.0 + 0.18 * flowCoord);
            float wave = sin(gravPhase * 15.0 * uUvScale - uTime * uFlowSpeed * 1.40) * 0.55
                       + sin(gravPhase * 24.0 * uUvScale - uTime * uFlowSpeed * 2.05 + 1.1) * 0.45;
            float n = snoise(vec3(pos.x * 4.0, pos.y * 4.0 + uTime * 0.95, pos.z * 4.0));
            pos += nrm * ((wave * 0.60 + n * 0.40) * uPulseAmp * endFade);
          } else {
            // Vertical stretched honey stream: slow traveling gravity bulges + subtle rope-coiling sway near base
            float vDown = 1.0 - uv.y;
            float bulge = sin(vDown * 12.5 * uUvScale - uTime * uFlowSpeed * 1.35) * 0.55
                        + snoise(vec3(pos.x * 3.4, uv.y * 3.6 + uTime * (uFlowSpeed * 0.68), pos.z * 3.4)) * 0.45;
            float pulse = 1.0 + bulge * uPulseAmp * (0.28 + 0.72 * endFade);
            pos.x *= pulse;
            pos.z *= pulse;
            float midSway = sin(uv.y * 3.14159);
            float coilBias = smoothstep(0.65, 1.0, vDown);
            pos.x += sin(uTime * 2.3 + vDown * 4.8) * (uSwayAmp * midSway + uSwayAmp * 0.85 * coilBias);
            pos.z += cos(uTime * 2.1 + vDown * 4.2) * (uSwayAmp * 0.75 * midSway + uSwayAmp * 0.85 * coilBias);
          }
        }

        vLocalPos = pos;
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * nrm);
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
      uniform float uFlowAxisX;
      uniform float uFlowSpeed;
      uniform float uWarmGolden;
      uniform float uOriginFeather;
      uniform float uEndFeather;
      uniform float uUvScale;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        float flowCoord = mix(1.0 - vUv.y, vUv.x, uFlowAxisX);
        float alpha = 1.0;
        if (uOriginFeather > 0.001) {
          alpha *= smoothstep(0.0, uOriginFeather, flowCoord);
        }
        if (uEndFeather > 0.001) {
          alpha *= smoothstep(1.0, 1.0 - uEndFeather, flowCoord);
        }
        if (alpha < 0.02) discard;

        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);

        float scrollSpeed = uAnimatedFlow > 0.5 ? uFlowSpeed : 0.35;
        vec3 flowCoordA = uFlowAxisX > 0.5
          ? vec3(vUv.x * 8.5 * uUvScale - uTime * (scrollSpeed * 0.62), vUv.y * 5.0, vWorldPos.z * 3.0)
          : vec3(vWorldPos.x * 4.8, vWorldPos.y * 5.0 + uTime * scrollSpeed, vWorldPos.z * 4.8);
        vec3 flowCoordB = uFlowAxisX > 0.5
          ? vec3(vUv.x * 17.0 * uUvScale - uTime * (scrollSpeed * 1.02), vUv.y * 9.0, vWorldPos.y * 3.8)
          : vec3(vWorldPos.x * 10.5, vWorldPos.y * 10.5 + uTime * (scrollSpeed * 1.42), vWorldPos.z * 10.5);

        float swirlA = snoise(flowCoordA);
        float swirlB = snoise(flowCoordB);
        N = normalize(N + vec3(swirlA * 0.055, swirlB * 0.032, swirlA * 0.055));

        // Dielectric honey Fresnel (IOR 1.49 -> F0 ~= 0.039)
        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fresnel = 0.039 + 0.961 * pow(1.0 - NdotV, 2.25);

        // Beer-Lambert volumetric amber absorption: bright sunlit gold at thin edges, deep golden-amber core
        float upward = smoothstep(0.35, 0.96, max(0.0, N.y));
        float thickness = mix(pow(NdotV, 0.78), 0.68, upward * 0.50);
        vec3 col = mix(uGoldColor, uMidColor, smoothstep(0.08, 0.66, thickness));
        col = mix(col, uCoreColor, smoothstep(0.62, 1.0, thickness) * mix(0.62, 0.34, uWarmGolden));

        // Advected luminous golden caustic ribbons & tiny internal air bubbles moving with flow
        float streak = smoothstep(0.08, 0.76, swirlA * 0.65 + swirlB * 0.35);
        col = mix(col, uGoldColor * 1.14, streak * (1.0 - thickness * 0.42) * 0.54);
        float microBubble = smoothstep(0.79, 0.93, swirlB);
        col += uSpecColor * microBubble * 0.24;

        // Glossy studio key + fill + overhead softbox specular highlights
        float diffKey = max(dot(N, uLightDir), 0.0);
        float diffFill = max(dot(N, uFillLightDir), 0.0);
        vec3 topDir = normalize(vec3(0.12, 0.92, 0.36));
        vec3 H1 = normalize(uLightDir + V);
        vec3 H2 = normalize(uFillLightDir + V);
        vec3 Htop = normalize(topDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 135.0) * 1.55;
        float spec2 = pow(max(dot(N, H2), 0.0), 54.0) * 0.55;
        float specTop = pow(max(dot(N, Htop), 0.0), 78.0) * 0.85 * upward;
        float sheen = pow(max(dot(N, H1), 0.0), 16.0) * 0.32;

        col = col * (0.90 + diffKey * 0.40 + diffFill * 0.28);
        col += mix(uGoldColor, uSpecColor, 0.52) * fresnel * 0.58;
        col += uSpecColor * (spec1 + spec2 + specTop + sheen);

        gl_FragColor = vec4(col, alpha);
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
