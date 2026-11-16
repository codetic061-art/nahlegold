/**
 * honey-shaders.js — Custom GLSL materials for physically believable liquid honey
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
 * Viscous flowing honey stream material for the 3D winding TubeGeometry.
 * Uses vertex attribute `aCurveT` (0..1 along the spline) and `aCenter` (spine center point)
 * so the tube tapers smoothly into a rounded droplet head at `uFlowProgress` without
 * rebuilding geometry every scroll frame!
 */
export function createHoneyStreamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime:         { value: 0 },
      uFlowProgress: { value: 0.02 },
      uLightDir:     { value: new THREE.Vector3(0.55, 0.78, 0.45).normalize() },
      uFillLightDir: { value: new THREE.Vector3(-0.6, 0.25, 0.65).normalize() },
      uCoreColor:    { value: new THREE.Color('#B55206') },
      uAmberColor:   { value: new THREE.Color('#E38E16') },
      uGoldColor:    { value: new THREE.Color('#F9CC5E') },
      uSpecColor:    { value: new THREE.Color('#FFF8E4') },
      uOpacity:      { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      attribute float aCurveT;
      attribute vec3 aCenter;

      uniform float uTime;
      uniform float uFlowProgress;

      varying float vCurveT;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vWorldPos;
      varying float vTipMask;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        vCurveT = aCurveT;
        vUv = uv;

        vec3 radial = position - aCenter;

        // Subtle viscous peristalsis bulge traveling along the stream
        float pulse = snoise(vec3(aCurveT * 14.0 - uTime * 0.55, uv.y * 2.0, uTime * 0.22));
        float thickWave = 1.0 + 0.12 * pulse;

        // Smooth organic taper at the traveling droplet tip while flowing;
        // once settled into Stage 05 jar mouth (uFlowProgress -> 1.0), keep continuous pour column
        float headDist = uFlowProgress - aCurveT;
        float settle = smoothstep(0.94, 0.995, uFlowProgress);
        float rawTipScale = smoothstep(-0.002, 0.024, headDist);
        float tipScale = mix(rawTipScale, 1.0, settle);
        float bulb = exp(-pow((headDist - 0.016) / 0.013, 2.0)) * 0.28 * step(0.0, headDist) * (1.0 - settle);

        // Gentle taper leaving dipper and narrowing naturally as a pouring ribbon into jar
        float startTaper = mix(0.24, 1.0, smoothstep(0.0, 0.055, aCurveT));
        float endTaper   = mix(1.0, 0.72, smoothstep(0.90, 1.0, aCurveT));

        float finalScale = max(0.0001, tipScale * (thickWave * startTaper * endTaper + bulb));
        vTipMask = mix(smoothstep(-0.003, 0.006, headDist), 1.0, settle);

        vec3 displaced = aCenter + radial * finalScale;
        vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uFlowProgress;
      uniform vec3 uLightDir;
      uniform vec3 uFillLightDir;
      uniform vec3 uCoreColor;
      uniform vec3 uAmberColor;
      uniform vec3 uGoldColor;
      uniform vec3 uSpecColor;
      uniform float uOpacity;

      varying float vCurveT;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vWorldPos;
      varying float vTipMask;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        if (vCurveT > uFlowProgress + 0.002 || vTipMask < 0.02) discard;

        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);

        // Micro surface viscosity normal perturbation
        float swirlA = snoise(vec3(vCurveT * 18.0 - uTime * 0.6, vUv.y * 4.0, uTime * 0.15));
        float swirlB = snoise(vec3(vCurveT * 32.0 - uTime * 0.9, vUv.y * 7.0 + 3.1, uTime * 0.25));
        N = normalize(N + vec3(swirlA * 0.07, swirlB * 0.07, swirlA * 0.05));

        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.5);

        // Beer-Lambert optical thickness: bright backlit gold rims + glowing amber core
        float thickness = pow(NdotV, 0.85);
        vec3 bodyColor = mix(uGoldColor, uAmberColor, smoothstep(0.15, 0.72, thickness));
        bodyColor = mix(bodyColor, uCoreColor, smoothstep(0.68, 1.0, thickness) * 0.58);

        // Internal flowing honey ribbons
        float ribbons = smoothstep(-0.1, 0.65, swirlA * 0.65 + swirlB * 0.35);
        bodyColor = mix(bodyColor, uGoldColor * 1.12, ribbons * (1.0 - thickness * 0.50) * 0.48);

        // Tiny suspended golden air bubbles flowing down the stream
        float bNoise = snoise(vec3(vCurveT * 58.0 - uTime * 1.15, vUv.y * 14.0, 2.4));
        float bubbles = smoothstep(0.73, 0.88, bNoise);
        bodyColor += uSpecColor * bubbles * 0.42;

        // Primary studio key light + soft fill + crisp specular reflections
        float diffKey  = max(dot(N, uLightDir), 0.0);
        float diffFill = max(dot(N, uFillLightDir), 0.0);
        vec3 H1 = normalize(uLightDir + V);
        vec3 H2 = normalize(uFillLightDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 110.0) * 1.38;
        float spec2 = pow(max(dot(N, H2), 0.0), 42.0) * 0.48;
        float broadSheen = pow(max(dot(N, H1), 0.0), 14.0) * 0.28;

        // Subsurface backlighting warmth
        float backLight = pow(clamp(dot(-uLightDir, V), 0.0, 1.0), 2.5) * 0.38;

        vec3 color = bodyColor * (0.74 + diffKey * 0.46 + diffFill * 0.24 + backLight);
        color += mix(uGoldColor, uSpecColor, 0.65) * fresnel * 0.64;
        color += uSpecColor * (spec1 + spec2 + broadSheen);

        // Subtle translucent edge alpha so it feels truly liquid, denser in core
        float alpha = mix(0.86, 0.98, thickness) * vTipMask * uOpacity;

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

/**
 * Faint ivory-gold trace filament showing the winding curve path gently ahead
 * of the active golden stream (echoing Reference Image B's soft future path).
 */
export function createPathGuideMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uFlowProgress: { value: 0.02 },
      uColor:        { value: new THREE.Color('#B59A72') },
      uOpacity:      { value: 0.16 },
    },
    vertexShader: /* glsl */ `
      attribute float aCurveT;
      varying float vCurveT;
      varying vec3 vNormalW;
      varying vec3 vWorldPos;
      void main() {
        vCurveT = aCurveT;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFlowProgress;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vCurveT;
      varying vec3 vNormalW;
      varying vec3 vWorldPos;
      void main() {
        if (vCurveT < uFlowProgress - 0.01) discard;
        vec3 V = normalize(cameraPosition - vWorldPos);
        float rim = 1.0 - abs(dot(normalize(vNormalW), V));
        float aheadFade = smoothstep(uFlowProgress - 0.01, uFlowProgress + 0.05, vCurveT);
        float tailFade = 1.0 - smoothstep(0.88, 1.0, vCurveT);
        gl_FragColor = vec4(uColor, uOpacity * (0.45 + rim * 0.55) * aheadFade * tailFade);
      }
    `,
  });
}

/**
 * Liquid honey inside the glass jar with scroll-controlled fill level (`uFillLevel`),
 * realistic capillary meniscus, surface ripple, and warm golden amber absorption.
 * Kept opaque (`transparent: false`) so it renders reliably inside the clear outer
 * glass shell without transmission background bleed-through.
 */
export function createJarHoneyMaterial() {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime:       { value: 0 },
      uFillLevel:  { value: 0.88 },  // 0..1 height inside jar body
      uMinY:       { value: -0.95 },
      uMaxY:       { value: 0.85 },
      uRipple:     { value: 0.0 },
      uCoreColor:  { value: new THREE.Color('#7B2C02') },
      uMidColor:   { value: new THREE.Color('#D57B0E') },
      uBrightGold: { value: new THREE.Color('#F8CB5C') },
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
        // Subtle upward capillary meniscus near the glass edge + gentle pour wave
        float wave = sin(distFromCenter * 9.0 - uTime * 3.8) * 0.016 * (0.25 + uRipple);
        float meniscus = smoothstep(0.45, 0.85, distFromCenter) * 0.032;
        float surfaceY = fillY + wave + meniscus;

        if (vLocalPos.y > surfaceY || uFillLevel <= 0.01) discard;

        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);
        float NdotV = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.1);

        // Height gradient + optical core depth (rich warm amber at center, sunlit gold toward rims)
        float hNorm = clamp((vLocalPos.y - uMinY) / max(0.001, (surfaceY - uMinY)), 0.0, 1.0);
        vec3 col = mix(uCoreColor, uMidColor, 0.30 + 0.58 * hNorm);
        col = mix(col, uBrightGold, fresnel * 0.82 + smoothstep(0.76, 1.0, hNorm) * 0.38);

        // Sunlit subsurface side bounce so jar glows like Reference Image A
        float sideGlow = pow(max(0.0, N.x * -0.5 + N.z * 0.3), 1.6);
        col += uBrightGold * sideGlow * 0.28;

        // Slow rising micro-bubbles inside the honey jar
        float b = snoise(vec3(vLocalPos.x * 10.5, vLocalPos.y * 10.5 - uTime * 0.22, vLocalPos.z * 10.5));
        float bubble = smoothstep(0.74, 0.88, b);
        col += uSpecColor * bubble * 0.32;

        // Crisp vertical studio speculars
        float diff = max(dot(N, uLightDir), 0.0);
        vec3 H = normalize(uLightDir + V);
        float spec = pow(max(dot(N, H), 0.0), 96.0) * 1.15;
        col *= (0.85 + diff * 0.35);
        col += uSpecColor * (spec + fresnel * 0.22);

        // Top meniscus golden highlight line
        float topEdge = smoothstep(surfaceY - 0.05, surfaceY, vLocalPos.y);
        col += uBrightGold * topEdge * 0.42;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Glossy optical honey shader for drips, teardrops, honey puddle, dipper glaze,
 * and filled honeycomb cells — delivers warm golden amber translucency & crisp
 * studio speculars without milky WebGL transmission wash-out.
 */
export function createLiquidHoneyMaterial() {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime:         { value: 0 },
      uLightDir:     { value: new THREE.Vector3(0.55, 0.78, 0.48).normalize() },
      uFillLightDir: { value: new THREE.Vector3(-0.65, 0.32, 0.58).normalize() },
      uCoreColor:    { value: new THREE.Color('#B85605') },
      uMidColor:     { value: new THREE.Color('#EA9418') },
      uGoldColor:    { value: new THREE.Color('#FCE06E') },
      uSpecColor:    { value: new THREE.Color('#FFF8E4') },
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
      uniform float uTime;
      uniform vec3 uLightDir;
      uniform vec3 uFillLightDir;
      uniform vec3 uCoreColor;
      uniform vec3 uMidColor;
      uniform vec3 uGoldColor;
      uniform vec3 uSpecColor;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec3 vLocalPos;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(cameraPosition - vWorldPos);

        float swirl = snoise(vec3(vWorldPos * 3.5 - vec3(0.0, uTime * 0.25, 0.0)));
        N = normalize(N + vec3(swirl * 0.04, swirl * 0.03, swirl * 0.04));

        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 2.2);

        // Beer-Lambert optical golden core to sunlit amber rim (deepens toward horizontal pool centers too)
        float upward = smoothstep(0.45, 0.96, max(0.0, N.y));
        float thickness = mix(pow(NdotV, 0.82), 0.86, upward * 0.72);
        vec3 col = mix(uGoldColor, uMidColor, smoothstep(0.14, 0.72, thickness));
        col = mix(col, uCoreColor, smoothstep(0.64, 1.0, thickness) * 0.58);

        float diffKey = max(dot(N, uLightDir), 0.0);
        float diffFill = max(dot(N, uFillLightDir), 0.0);
        vec3 topDir = normalize(vec3(0.12, 0.92, 0.36));
        vec3 H1 = normalize(uLightDir + V);
        vec3 H2 = normalize(uFillLightDir + V);
        vec3 Htop = normalize(topDir + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 120.0) * 1.48;
        float spec2 = pow(max(dot(N, H2), 0.0), 48.0) * 0.52;
        float specTop = pow(max(dot(N, Htop), 0.0), 72.0) * 0.78 * upward;
        float sheen = pow(max(dot(N, H1), 0.0), 16.0) * 0.30;

        col = col * (0.80 + diffKey * 0.42 + diffFill * 0.24);
        col += mix(uGoldColor, uSpecColor, 0.58) * fresnel * 0.54;
        col += uSpecColor * (spec1 + spec2 + specTop + sheen);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Full-screen golden caustic shader used on the portal dome during the final
 * "Enter the Honey Jar" transition (`t = 0.90 -> 1.00`).
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
      uGoldB:    { value: new THREE.Color('#F7CA63') },
      uCream:    { value: new THREE.Color('#F8F1DE') },
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

        // Swirling honey caustics as camera plunges through the golden surface
        float angle = atan(p.y, p.x);
        float n1 = snoise(vec3(p * 2.4 + vec2(cos(angle), sin(angle)) * 0.35, uTime * 0.32));
        float n2 = snoise(vec3(p * 4.8 - vec2(0.0, uTime * 0.22), uTime * 0.45));
        float caustic = smoothstep(0.05, 0.72, n1 * 0.65 + n2 * 0.35 + 0.32);

        // Tunnel radial glow
        float centerBright = 1.0 - smoothstep(0.0, 1.15, r);
        vec3 col = mix(uGoldA, uGoldB, caustic);
        col = mix(col, uCream, clamp(centerBright * 0.65 + smoothstep(0.55, 1.0, uStrength) * 0.75, 0.0, 1.0));

        // Soft luminous bubbles
        float b = smoothstep(0.74, 0.9, snoise(vec3(p * 7.5, uTime * 0.4)));
        col += vec3(1.0, 0.96, 0.84) * b * 0.4;

        float alpha = smoothstep(0.0, 0.35, uStrength) * (1.0 - smoothstep(0.84, 1.0, uStrength));
        gl_FragColor = vec4(col, alpha * 0.92);
      }
    `,
  });
}
