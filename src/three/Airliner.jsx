import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  FUSE, buildFuselage, loft, lathe, teardrop, buildPylon,
  WING_STATIONS, STAB_STATIONS, FIN_STATIONS, WINGTIP, NACELLE,
} from './geometry.js';
import { createLivery } from './livery.js';

const LION_RED = '#d70015';
const WING_Y = -0.15;

/* Interpolated wing planform at span x (inboard of the sharklet). */
function wingAt(x) {
  const s = WING_STATIONS;
  for (let i = 0; i < 4; i++) {
    const a = s[i], b = s[i + 1];
    if (x >= a.o[0] && x <= b.o[0]) {
      const t = (x - a.o[0]) / (b.o[0] - a.o[0]);
      return { y: a.o[1] + (b.o[1] - a.o[1]) * t, z: a.o[2] + (b.o[2] - a.o[2]) * t, c: a.c + (b.c - a.c) * t };
    }
  }
  return { y: 0, z: 0, c: 0.5 };
}

function useMaterials(low) {
  const { gl } = useThree();
  return useMemo(() => {
    const livery = createLivery({ low, anisotropy: Math.min(8, gl.capabilities.getMaxAnisotropy()) });
    return {
      paint: new THREE.MeshPhysicalMaterial({
        map: livery.map, bumpMap: livery.bumpMap, bumpScale: 0.6,
        roughness: 0.34, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12,
      }),
      wing: new THREE.MeshPhysicalMaterial({ color: '#c4c7cb', roughness: 0.42, metalness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
      red: new THREE.MeshPhysicalMaterial({ color: LION_RED, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14 }),
      fairing: new THREE.MeshPhysicalMaterial({ color: '#dcdcdd', roughness: 0.4, metalness: 0.05, clearcoat: 0.6 }),
      lip: new THREE.MeshStandardMaterial({ color: '#dcdde0', roughness: 0.2, metalness: 1 }),
      duct: new THREE.MeshStandardMaterial({ color: '#2a2b2f', roughness: 0.55, metalness: 0.6, side: THREE.DoubleSide }),
      fan: new THREE.MeshStandardMaterial({ color: '#3a3b40', roughness: 0.35, metalness: 0.85 }),
      spinner: new THREE.MeshStandardMaterial({ color: '#1d1e22', roughness: 0.3, metalness: 0.6 }),
      core: new THREE.MeshStandardMaterial({ color: '#8a8c91', roughness: 0.35, metalness: 0.85 }),
      antenna: new THREE.MeshStandardMaterial({ color: '#9a9ca0', roughness: 0.5, metalness: 0.4 }),
    };
  }, [low, gl]);
}

function Engine({ side, m, geo }) {
  const fan = useRef();
  useLayoutEffect(() => {
    const q = new THREE.Object3D();
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      q.position.set(Math.cos(a) * 0.062, Math.sin(a) * 0.062, 0.172);
      q.rotation.set(0, 0, a);
      q.rotateX(0.62); // blade pitch
      q.updateMatrix();
      fan.current.setMatrixAt(i, q.matrix);
    }
    fan.current.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame((_, dt) => { fan.current.rotation.z += dt * 2.2 * side; });

  return (
    <group position={[0.62 * side, -0.31, 0.2]}>
      <mesh geometry={geo.cowl} material={m.red} />
      <mesh geometry={geo.lip} material={m.lip} />
      <mesh geometry={geo.duct} material={m.duct} />
      <instancedMesh ref={fan} args={[geo.blade, m.fan, 22]} />
      <group rotation={[0, 0, 0]}>
        <mesh geometry={geo.spinner} material={m.spinner} />
      </group>
      <mesh position={[0, 0, 0.168]} geometry={geo.hub} material={m.duct} />
      <mesh geometry={geo.core} material={m.core} />
      <mesh geometry={geo.pylon} material={m.fairing} />
    </group>
  );
}

function NavLight({ position, color, flash = false, size = 0.14 }) {
  const glow = useRef();
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useFrame(({ clock }) => {
    if (!flash || !glow.current) return;
    const p = clock.elapsedTime % 1.3;
    glow.current.material.opacity = p < 0.05 || (p > 0.14 && p < 0.19) ? 1 : 0;
  });
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.008, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite ref={glow} scale={size}>
        <spriteMaterial map={tex} color={color} transparent opacity={flash ? 0 : 0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

export default function Airliner({ low = false }) {
  const root = useRef();
  const m = useMaterials(low);

  const geo = useMemo(() => {
    const seg = low ? 18 : 26;
    const main = WING_STATIONS.slice(0, 5);
    const shark = WING_STATIONS.slice(4);
    return {
      fuselage: buildFuselage(),
      wingR: loft(main, { n: seg, cap: false }),
      wingL: loft(main, { n: seg, cap: false, mirror: true }),
      sharkR: loft(shark, { n: seg }),
      sharkL: loft(shark, { n: seg, mirror: true }),
      stabR: loft(STAB_STATIONS, { n: seg }),
      stabL: loft(STAB_STATIONS, { n: seg, mirror: true }),
      fin: loft(FIN_STATIONS, { n: seg }),
      cowl: lathe(NACELLE.cowl),
      lip: lathe(NACELLE.lip),
      duct: lathe(NACELLE.duct),
      core: lathe(NACELLE.core, 40),
      spinner: lathe(NACELLE.spinner, 32),
      hub: new THREE.CircleGeometry(0.089, 40),
      blade: new THREE.BoxGeometry(0.052, 0.002, 0.026),
      pylon: buildPylon(),
      track: teardrop(0.34, 0.022),
    };
  }, [low]);

  useLayoutEffect(() => {
    root.current.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
  }, []);

  const tracks = [0.55, 0.95, 1.38].map((x) => {
    const w = wingAt(x);
    return { x, y: w.y - 0.03, z: w.z - w.c * 0.82 };
  });

  return (
    <group ref={root}>
      <mesh geometry={geo.fuselage} material={m.paint} />

      {/* belly fairing */}
      <mesh position={[0, -0.215, -0.04]} scale={[0.27, 0.11, 0.86]} material={m.fairing}>
        <sphereGeometry args={[1, 48, 24]} />
      </mesh>

      <group position={[0, WING_Y, 0]}>
        <mesh geometry={geo.wingR} material={m.wing} />
        <mesh geometry={geo.wingL} material={m.wing} />
        <mesh geometry={geo.sharkR} material={m.red} />
        <mesh geometry={geo.sharkL} material={m.red} />
        {tracks.map((t) => [1, -1].map((s) => (
          <mesh key={`${t.x}${s}`} geometry={geo.track} material={m.wing} position={[t.x * s, t.y, t.z]} />
        )))}
        {/* navigation lights: red port (+X), green starboard (−X), white strobes */}
        <NavLight position={[WINGTIP[0], WINGTIP[1], WINGTIP[2] + 0.12]} color="#ff2020" />
        <NavLight position={[-WINGTIP[0], WINGTIP[1], WINGTIP[2] + 0.12]} color="#22ff66" />
        <NavLight position={[WINGTIP[0], WINGTIP[1], WINGTIP[2]]} color="#ffffff" flash size={0.4} />
        <NavLight position={[-WINGTIP[0], WINGTIP[1], WINGTIP[2]]} color="#ffffff" flash size={0.4} />
      </group>

      <Engine side={1} m={m} geo={geo} />
      <Engine side={-1} m={m} geo={geo} />

      <group position={[0, 0.08, 0]}>
        <mesh geometry={geo.stabR} material={m.wing} />
        <mesh geometry={geo.stabL} material={m.wing} />
      </group>
      <mesh geometry={geo.fin} material={m.red} />

      {/* antennas */}
      <mesh position={[0, FUSE.R * 1.03 + 0.018, 0.55]} rotation={[-0.4, 0, 0]} material={m.antenna}>
        <boxGeometry args={[0.005, 0.04, 0.028]} />
      </mesh>
      <mesh position={[0, FUSE.R * 1.03 + 0.012, -0.35]} rotation={[-0.4, 0, 0]} material={m.antenna}>
        <boxGeometry args={[0.005, 0.026, 0.02]} />
      </mesh>
      <mesh position={[0, -FUSE.R * 1.03 - 0.016, 1.05]} rotation={[0.4, 0, 0]} material={m.antenna}>
        <boxGeometry args={[0.005, 0.034, 0.024]} />
      </mesh>

      {/* anti-collision beacons */}
      <NavLight position={[0, FUSE.R * 1.03 + 0.006, 0.1]} color="#ff2a10" flash size={0.22} />
      <NavLight position={[0, -0.33, 0.25]} color="#ff2a10" flash size={0.22} />
    </group>
  );
}
