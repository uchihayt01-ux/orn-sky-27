import * as THREE from 'three';

/*
 * Geometry for a narrow-body twin-jet, loosely proportioned on the A320 family.
 * Model space: nose → +Z, up → +Y. 1 unit ≈ 8.5 m (length 4.4 ≈ 37.6 m).
 */

export const FUSE = { R: 0.28, tail: -2.2, nose: 2.2 };

/* Fuselage outline: radius and centre-line height along the length. */
export function fuselageAt(z) {
  const { R } = FUSE;
  if (z > 1.2) {
    // nose: blunt ogive, drooped so the cockpit sits on top
    const t = Math.min(1, (z - 1.2) / 1.0);
    return { r: R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.1)), 0.48), cy: -0.075 * t * t };
  }
  if (z < -0.75) {
    // tail cone: crown stays almost level, belly sweeps up to the APU
    const t = Math.min(1, (-0.75 - z) / 1.45);
    const r = R * (1 - 0.88 * Math.pow(t, 1.35));
    return { r, cy: (R - r) * 0.84 };
  }
  return { r: R, cy: 0 };
}

export function buildFuselage() {
  const { tail, nose } = FUSE;
  const N = 240;
  const pts = [new THREE.Vector2(0, tail)];
  for (let j = 0; j <= N; j++) {
    const z = tail + ((nose - tail) * j) / N;
    pts.push(new THREE.Vector2(Math.max(fuselageAt(z).r, 1e-4), z));
  }
  const segments = 112;
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2); // lathe axis (Y) → Z

  // UVs: u = along the length (tail → nose), v = around (belly → +X side → crown → −X side → belly)
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const perRing = pts.length;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const seg = Math.floor(i / perRing);
    uv.setXY(i, (z - tail) / (nose - tail), seg / segments);
    pos.setY(i, pos.getY(i) * 1.03 + fuselageAt(z).cy);
  }
  g.computeVertexNormals();
  return g;
}

/* NACA 4-digit section as a closed loop: TE → upper → LE → lower → TE. */
function airfoil(n, thickness, camber = 0, p = 0.4) {
  const up = [];
  const lo = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos((i / n) * Math.PI)) / 2;
    const yt = 5 * thickness * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    let yc = 0;
    let dyc = 0;
    if (camber > 0) {
      if (x < p) { yc = (camber / p ** 2) * (2 * p * x - x * x); dyc = ((2 * camber) / p ** 2) * (p - x); }
      else { yc = (camber / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x * x); dyc = ((2 * camber) / (1 - p) ** 2) * (p - x); }
    }
    const th = Math.atan(dyc);
    up.push([x - yt * Math.sin(th), yc + yt * Math.cos(th)]);
    lo.push([x + yt * Math.sin(th), yc - yt * Math.cos(th)]);
  }
  return [...up.reverse(), ...lo.slice(1)];
}

/*
 * Loft an aerofoil surface through stations.
 * Each station: o = leading-edge point, c = chord, t = thickness ratio,
 * camber, twist (rad, + = leading edge up), roll (rad, tilts the section's
 * "up" towards −X: dihedral, winglets, fins).
 */
export function loft(stations, { mirror = false, n = 26, cap = true } = {}) {
  const ring = 2 * n + 1;
  const pos = [];
  const ups = [];
  for (const st of stations) {
    const prof = airfoil(n, st.t, st.camber || 0);
    const tw = st.twist || 0;
    const rl = st.roll || 0;
    const A = new THREE.Vector3(0, -Math.sin(tw), -Math.cos(tw));
    const U = new THREE.Vector3(0, Math.cos(tw), -Math.sin(tw));
    const roll = (v) => v.set(v.x * Math.cos(rl) - v.y * Math.sin(rl), v.x * Math.sin(rl) + v.y * Math.cos(rl), v.z);
    roll(A); roll(U);
    ups.push(U.clone());
    for (const [s, h] of prof) {
      const x = st.o[0] + (A.x * s + U.x * h) * st.c;
      pos.push(mirror ? -x : x, st.o[1] + (A.y * s + U.y * h) * st.c, st.o[2] + (A.z * s + U.z * h) * st.c);
    }
  }
  const idx = [];
  for (let k = 0; k < stations.length - 1; k++) {
    for (let i = 0; i < ring - 1; i++) {
      const a = k * ring + i;
      idx.push(a, a + ring, a + 1, a + 1, a + ring, a + ring + 1);
    }
  }
  if (cap) {
    const base = (stations.length - 1) * ring;
    const c = [0, 0, 0];
    for (let i = 0; i < ring; i++) for (let d = 0; d < 3; d++) c[d] += pos[(base + i) * 3 + d] / ring;
    const ci = pos.length / 3;
    pos.push(...c);
    for (let i = 0; i < ring - 1; i++) idx.push(base + i, base + i + 1, ci);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();

  // Make sure faces point outwards: an upper-surface vertex at mid-chord must face "up".
  const probe = Math.floor(n / 2);
  const nrm = g.attributes.normal;
  const U0 = ups[0].clone();
  if (mirror) U0.x *= -1;
  if (nrm.getX(probe) * U0.x + nrm.getY(probe) * U0.y + nrm.getZ(probe) * U0.z < 0) {
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    g.setIndex(idx);
    g.computeVertexNormals();
  }
  return g;
}

const DIHEDRAL = THREE.MathUtils.degToRad(5);
const dy = (x) => Math.max(0, x - 0.3) * Math.tan(DIHEDRAL);

/* Main wing with yehudi kink, washout and a blended sharklet. */
export const WING_STATIONS = [
  { o: [0.0, 0, 0.44], c: 0.98, t: 0.15, camber: 0.02, twist: 0.04 },
  { o: [0.3, 0, 0.36], c: 0.88, t: 0.14, camber: 0.02, twist: 0.035, roll: DIHEDRAL },
  { o: [0.8, dy(0.8), 0.101], c: 0.5, t: 0.12, camber: 0.02, twist: 0.02, roll: DIHEDRAL },
  { o: [1.5, dy(1.5), -0.262], c: 0.31, t: 0.11, camber: 0.02, twist: 0.0, roll: DIHEDRAL },
  { o: [2.0, dy(2.0), -0.52], c: 0.19, t: 0.1, camber: 0.015, twist: -0.02, roll: DIHEDRAL },
  { o: [2.055, dy(2.0) + 0.012, -0.555], c: 0.172, t: 0.1, twist: -0.02, roll: 0.45 },
  { o: [2.09, dy(2.0) + 0.06, -0.6], c: 0.15, t: 0.1, roll: 1.1 },
  { o: [2.105, dy(2.0) + 0.16, -0.67], c: 0.11, t: 0.1, roll: 1.42 },
  { o: [2.112, dy(2.0) + 0.27, -0.75], c: 0.065, t: 0.1, roll: 1.48 },
];
export const WINGTIP = [2.06, dy(2.0) + 0.02, -0.7];

export const STAB_STATIONS = [
  { o: [0.0, 0, -1.56], c: 0.5, t: 0.11 },
  { o: [0.22, 0.022, -1.65], c: 0.42, t: 0.11, roll: 0.1 },
  { o: [0.84, 0.085, -2.0], c: 0.17, t: 0.09, roll: 0.1 },
];

export const FIN_STATIONS = [
  { o: [0, 0.1, -0.92], c: 1.3, t: 0.035, roll: Math.PI / 2 },
  { o: [0, 0.24, -1.33], c: 0.9, t: 0.11, roll: Math.PI / 2 },
  { o: [0, 0.6, -1.62], c: 0.62, t: 0.1, roll: Math.PI / 2 },
  { o: [0, 1.04, -1.97], c: 0.31, t: 0.1, roll: Math.PI / 2 },
];

export function buildPylon() {
  return loft(
    [
      { o: [0, 0.09, 0.17], c: 0.62, t: 0.1, roll: Math.PI / 2 },
      { o: [0, 0.13, 0.12], c: 0.68, t: 0.1, roll: Math.PI / 2 },
      { o: [0, 0.19, 0.07], c: 0.6, t: 0.08, roll: Math.PI / 2 },
    ],
    { n: 14 }
  );
}

/* Turbofan nacelle (LEAP-like): outer cowl, metal lip, inner duct. */
export function lathe(points, segments = 64) {
  const g = new THREE.LatheGeometry(points.map(([r, z]) => new THREE.Vector2(r, z)), segments);
  g.rotateX(Math.PI / 2);
  return g;
}

export const NACELLE = {
  cowl: [[0.076, -0.33], [0.092, -0.25], [0.112, -0.1], [0.12, 0.04], [0.121, 0.14], [0.116, 0.24], [0.108, 0.29]],
  lip: [[0.108, 0.29], [0.101, 0.312], [0.094, 0.318], [0.088, 0.312], [0.086, 0.296]],
  duct: [[0.086, 0.296], [0.087, 0.25], [0.089, 0.17]],
  core: [[0.0, -0.53], [0.022, -0.5], [0.045, -0.42], [0.06, -0.33], [0.066, -0.26]],
  spinner: [[0.036, 0.165], [0.033, 0.185], [0.024, 0.215], [0.012, 0.236], [0.0, 0.245]],
};

/* Teardrop fairing (flap tracks), nose towards +Z. */
export function teardrop(len, rad) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16; // 0 = tail, 1 = nose
    pts.push([Math.max(rad * Math.pow(Math.sin(Math.PI * Math.pow(t, 1.4)), 0.7), 1e-4), -len / 2 + len * t]);
  }
  return lathe(pts, 20);
}
