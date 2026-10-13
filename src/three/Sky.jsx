import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { reducedMotion } from '../scroll.js';

// Shared, mutated by the flight rig every frame.
export const sky = {
  pitch: 0.07, // camera look-up angle for the backdrop (rad)
  yaw: 0,
  dusk: 0, // 0 golden hour → 1 blue hour
  offset: new THREE.Vector2(),
  sun: new THREE.Vector3(0.88, 0.07, -0.62).normalize(),
};

const common = /* glsl */ `
  uniform vec3 uSun;
  uniform float uDusk;

  vec3 horizonColor(vec3 rd) {
    float az = dot(normalize(rd.xz + 1e-5), normalize(uSun.xz));
    vec3 warm = mix(vec3(1.0, 0.63, 0.38), vec3(0.93, 0.38, 0.24), uDusk);
    vec3 cool = mix(vec3(0.66, 0.6, 0.66), vec3(0.3, 0.26, 0.36), uDusk);
    return mix(cool, warm, smoothstep(-0.5, 1.0, az));
  }

  vec3 skyColor(vec3 rd) {
    vec3 zenith = mix(vec3(0.09, 0.13, 0.24), vec3(0.025, 0.035, 0.08), uDusk);
    vec3 mid = mix(vec3(0.36, 0.43, 0.6), vec3(0.15, 0.17, 0.29), uDusk);
    float h = max(rd.y, 0.0);
    vec3 c = mix(horizonColor(rd), mid, smoothstep(0.0, 0.22, h));
    c = mix(c, zenith, smoothstep(0.15, 0.85, h));
    float mu = max(dot(rd, uSun), 0.0);
    c += vec3(1.0, 0.56, 0.3) * (pow(mu, 5.0) * 0.32 + pow(mu, 48.0) * 0.55) * (1.0 - uDusk * 0.55);
    c += vec3(1.0, 0.88, 0.66) * smoothstep(0.99935, 0.9998, dot(rd, uSun)) * 4.0 * (1.0 - uDusk);
    return c;
  }
`;

const backdropVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const backdropFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTanHalf;
  uniform float uPitch;
  uniform float uYaw;
  uniform vec2 uOffset;
  uniform float uTime;
  ${common}

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
  float fbm(vec2 p, int oct) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * noise(p); p = ROT * p; a *= 0.5; }
    return s;
  }

  void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 rd = normalize(vec3(ndc.x * uTanHalf * uRes.x / uRes.y, ndc.y * uTanHalf, -1.0));
    float cp = cos(uPitch), sp = sin(uPitch);
    rd = vec3(rd.x, rd.y * cp - rd.z * sp, rd.y * sp + rd.z * cp);
    float cy = cos(uYaw), sy = sin(uYaw);
    rd = vec3(rd.x * cy + rd.z * sy, rd.y, -rd.x * sy + rd.z * cy);

    vec3 horiz = horizonColor(rd);
    vec3 col = skyColor(rd);
    float toSun = smoothstep(-0.4, 1.0, dot(normalize(rd.xz + 1e-5), normalize(uSun.xz)));

    if (rd.y > 0.0) {
      // high cirrus, stretched by the jet stream
      float t = 1.0 / rd.y;
      vec2 p = rd.xz * t * 0.35 + uOffset * 0.02 + vec2(uTime * 0.004, 0.0);
      float c = fbm(p * vec2(0.55, 2.6), 5);
      c = smoothstep(0.52, 0.86, c) * smoothstep(0.0, 0.12, rd.y) * exp(-t * 0.06);
      vec3 cc = mix(horiz * 1.05, vec3(1.0, 0.8, 0.66), toSun * 0.5 * (1.0 - uDusk));
      col = mix(col, cc, c * 0.55);

      // first stars at blue hour
      vec2 sp2 = vec2(atan(rd.x, -rd.z), asin(rd.y)) * 420.0;
      float st = step(0.9985, hash(floor(sp2))) * smoothstep(0.12, 0.5, rd.y) * smoothstep(0.55, 1.0, uDusk);
      col += st * 0.7;
    } else {
      // sea of cloud below
      float t = 1.0 / -rd.y;
      vec2 p = rd.xz * t + uOffset;
      float near = clamp(1.0 - t / 40.0, 0.0, 1.0);
      vec2 q = p * 0.16;
      float base = fbm(q, 6);
      float d = smoothstep(0.34, 0.7, base + (fbm(q * 3.3 + 7.1, 4) - 0.5) * 0.3 * near);
      vec2 sdir = normalize(uSun.xz);
      float lit = clamp(0.5 + (base - fbm(q + sdir * 0.07, 6)) * 7.0, 0.0, 1.3);
      vec3 cLit = mix(vec3(1.0, 0.74, 0.52), vec3(0.88, 0.45, 0.34), uDusk);
      vec3 cShade = mix(vec3(0.38, 0.4, 0.52), vec3(0.16, 0.16, 0.25), uDusk);
      vec3 cloud = mix(cShade, cLit, lit * mix(0.55, 1.0, toSun));
      vec3 ground = mix(vec3(0.07, 0.08, 0.11), vec3(0.03, 0.035, 0.06), uDusk);
      vec3 surf = mix(ground, cloud, d);
      col = mix(surf, horiz, 1.0 - exp(-t * 0.045));
    }

    // gentle filmic shoulder, vignette and grain
    col = col / (1.0 + col * 0.18);
    vec2 v = vUv - 0.5;
    col *= 1.0 - dot(v, v) * 0.55;
    col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.018;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function SkyBackdrop() {
  const mat = useRef();
  const { size, camera } = useThree();
  const uniforms = useMemo(() => ({
    uRes: { value: new THREE.Vector2(1, 1) },
    uTanHalf: { value: Math.tan(THREE.MathUtils.degToRad(17.5)) },
    uPitch: { value: sky.pitch },
    uYaw: { value: 0 },
    uOffset: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uSun: { value: sky.sun },
    uDusk: { value: 0 },
  }), []);

  useFrame((_, dt) => {
    const u = mat.current.uniforms;
    u.uRes.value.set(size.width, size.height);
    u.uTanHalf.value = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    u.uPitch.value = sky.pitch + camera.position.y * 0.01;
    u.uYaw.value = sky.yaw - camera.position.x * 0.012;
    u.uOffset.value.copy(sky.offset);
    u.uDusk.value = sky.dusk;
    if (!reducedMotion) u.uTime.value += dt;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={backdropVert} fragmentShader={backdropFrag} uniforms={uniforms} depthWrite={false} depthTest={false} toneMapped={false} />
    </mesh>
  );
}

/* Low-cost version of the same sky, rendered once into the environment map for reflections. */
export function SkyDome() {
  const uniforms = useMemo(() => ({ uSun: { value: sky.sun }, uDusk: { value: 0.15 } }), []);
  return (
    <mesh scale={50}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={/* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={/* glsl */ `
          varying vec3 vDir;
          ${common}
          void main() {
            vec3 rd = normalize(vDir);
            vec3 c = rd.y > 0.0 ? skyColor(rd) : mix(vec3(0.62, 0.5, 0.46), horizonColor(rd), exp(rd.y * 6.0));
            gl_FragColor = vec4(c * 1.15, 1.0);
          }`}
      />
    </mesh>
  );
}
