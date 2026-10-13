import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import Airliner from './Airliner.jsx';
import { SkyBackdrop, SkyDome, sky } from './Sky.jsx';
import { POSES } from './poses.js';
import { scroll, reducedMotion } from '../scroll.js';

const CAM_Z = 10;
const isMobileView = () => window.innerWidth < 768;
const pageProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
};
// Key light: low golden sun from screen-right, lifted a little so the upper surfaces catch it.
const LIGHT_DIR = new THREE.Vector3(0.82, 0.38, -0.42).normalize();

const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function readAnchors() {
  const vh = window.innerHeight;
  return [...document.querySelectorAll('[data-pose]')].map((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    return { key: el.dataset.pose, at: Math.max(0, top + Math.min(r.height, vh) / 2 - vh / 2) };
  });
}

function resolvePose(key, mobile, rtl) {
  const base = POSES[key] || POSES.hero;
  const p = mobile && base.m ? { ...base, ...base.m } : base;
  const flip = rtl ? -1 : 1;
  return { fx: p.f[0] * flip, fy: p.f[1], z: p.z, rx: p.r[0], ry: p.r[1] * flip, rz: p.r[2] * flip, s: p.s, sky: p.sky };
}

const lerpPose = (a, b, t) => {
  const o = {};
  for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
};

function FlightRig({ rtl, low }) {
  const plane = useRef();
  const sun = useRef();
  const anchors = useRef([]);
  const cur = useRef(null);
  const motion = useRef({ prevRy: null, prevY: null, bank: 0, climb: 0 });
  const introStart = useRef(0);
  const { viewport, camera } = useThree();

  useEffect(() => {
    const refresh = () => { anchors.current = readAnchors(); };
    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    const id = setInterval(refresh, 2000);
    return () => { ro.disconnect(); clearInterval(id); };
  }, [rtl]);

  useFrame((state, rawDt) => {
    const dt = THREE.MathUtils.clamp(rawDt, 1 / 240, 0.1); // first frame can report 0
    const list = anchors.current;
    if (!list.length) return;
    const mobile = isMobileView();

    // pose from scroll position
    const y = window.scrollY;
    let target;
    if (y <= list[0].at) target = resolvePose(list[0].key, mobile, rtl);
    else if (y >= list[list.length - 1].at) target = resolvePose(list[list.length - 1].key, mobile, rtl);
    else {
      let i = 0;
      while (i < list.length - 1 && y > list[i + 1].at) i++;
      const a = list[i], b = list[i + 1];
      const t = ease(THREE.MathUtils.clamp((y - a.at) / Math.max(1, b.at - a.at), 0, 1));
      target = lerpPose(resolvePose(a.key, mobile, rtl), resolvePose(b.key, mobile, rtl), t);
    }

    // approach from the distance on first load (wall-clock based)
    let intro = 1;
    if (!reducedMotion) {
      const now = performance.now();
      if (!introStart.current) introStart.current = now;
      intro = Math.min(1, (now - introStart.current) / 4200);
      if (intro < 1) target = lerpPose(resolvePose('intro', mobile, rtl), target, 1 - Math.pow(1 - intro, 3));
    }

    if (!cur.current) cur.current = { ...target };
    const c = cur.current;
    const lambda = intro < 1 ? 40 : 2.4;
    for (const k in target) c[k] = THREE.MathUtils.damp(c[k], target[k], lambda, dt);

    // coordinated turns: bank into the rate of turn; pitch with the rate of climb
    const mo = motion.current;
    if (mo.prevRy === null) { mo.prevRy = c.ry; mo.prevY = c.fy; }
    const turnRate = (c.ry - mo.prevRy) / dt;
    const climbRate = (c.fy - mo.prevY) / dt;
    mo.prevRy = c.ry;
    mo.prevY = c.fy;
    mo.bank = THREE.MathUtils.damp(mo.bank, THREE.MathUtils.clamp(-turnRate * 0.9, -0.6, 0.6), 3, dt);
    mo.climb = THREE.MathUtils.damp(mo.climb, THREE.MathUtils.clamp(-climbRate * 0.35, -0.15, 0.15), 3, dt);

    // light turbulence
    const t = state.clock.elapsedTime;
    const k = reducedMotion ? 0 : 1;
    const tPitch = (Math.sin(t * 0.71) * 0.008 + Math.sin(t * 1.93) * 0.003) * k;
    const tRoll = (Math.sin(t * 0.53) * 0.016 + Math.sin(t * 1.37) * 0.006) * k;
    const tAlt = (Math.sin(t * 0.43) * 0.035 + Math.sin(t * 1.11) * 0.012) * k;

    const depth = (CAM_Z - c.z) / CAM_Z;
    const g = plane.current;
    g.position.set(c.fx * (viewport.width / 2) * depth, c.fy * (viewport.height / 2) * depth + tAlt, c.z);
    g.rotation.set(c.rx + mo.climb + tPitch, c.ry, c.rz + mo.bank + tRoll, 'YXZ');
    const scale = c.s * (mobile ? Math.min(1, viewport.width / 4.6) : 1);
    g.scale.setScalar(scale);

    // sun + shadow camera follow the aircraft
    const L = sun.current;
    L.position.copy(g.position).addScaledVector(LIGHT_DIR, 8);
    L.target.position.copy(g.position);
    L.target.updateMatrixWorld();
    const ext = 2.7 * scale;
    const sc = L.shadow.camera;
    if (Math.abs(sc.right - ext) > 0.01) {
      sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext;
      sc.updateProjectionMatrix();
    }

    // the cloud sea moves against the direction of flight
    const speed = 1.1 + Math.min(Math.abs(scroll.velocity) * 0.06, 2.5);
    if (!reducedMotion) {
      sky.offset.x += Math.sin(c.ry) * speed * dt;
      sky.offset.y += Math.cos(c.ry) * speed * dt;
    }
    sky.pitch = c.sky;
    sky.dusk = THREE.MathUtils.damp(sky.dusk, Math.min(1, pageProgress() * 1.1), 2, dt);

    // slight pointer parallax on desktop
    if (!mobile && !reducedMotion) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.3, 2, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, state.pointer.y * 0.18, 2, dt);
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <directionalLight
        ref={sun}
        color="#ffd2a6"
        intensity={3.4}
        castShadow
        shadow-mapSize={low ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.012}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      <group ref={plane}>
        <Airliner low={low} />
      </group>
    </>
  );
}

/* Stop rendering while opaque content panels cover the whole sky. */
function RenderGate() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setFrameloop(visible.size ? 'always' : 'never');
    });
    const watch = () => document.querySelectorAll('[data-sky]').forEach((el) => io.observe(el));
    watch();
    return () => io.disconnect();
  }, [setFrameloop]);
  return null;
}

export default function Scene({ rtl }) {
  const low = typeof window !== 'undefined' && (isMobileView() || (navigator.hardwareConcurrency || 8) <= 4);
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, low ? 1.5 : 2]}
        camera={{ position: [0, 0, CAM_Z], fov: 35, near: 0.1, far: 120 }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}      >
        <SkyBackdrop />
        <Environment resolution={256} frames={1} environmentIntensity={0.9}>
          <SkyDome />
        </Environment>
        <hemisphereLight args={['#8d9cc4', '#b07858', 0.75]} />
        <FlightRig rtl={rtl} low={low} />
        <RenderGate />
      </Canvas>
    </div>
  );
}
