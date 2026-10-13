import * as THREE from 'three';
import { FUSE } from './geometry.js';

/*
 * Paints the fuselage texture. Canvas x = along the fuselage (tail → nose),
 * canvas y = around it (see buildFuselage UVs). Positions are given as
 * z (model units) and e (elevation in degrees above the side line).
 */

const LEN = FUSE.nose - FUSE.tail;
const RAD = Math.PI / 180;

const PAINT = '#f3f2ef';
const BELLY = '#d3d4d6';
const LION_RED = '#d70015';
const GARNET = '#8e1b1e';
const NIGHT = '#161010';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d') };
}

// Smooth interpolation through (z, value) control points.
function curve(points) {
  return (z) => {
    if (z >= points[0][0]) return points[0][1];
    for (let i = 0; i < points.length - 1; i++) {
      const [z0, v0] = points[i];
      const [z1, v1] = points[i + 1];
      if (z <= z0 && z >= z1) {
        const t = (z0 - z) / (z0 - z1);
        return v0 + (v1 - v0) * (0.5 - 0.5 * Math.cos(Math.PI * t));
      }
    }
    return points[points.length - 1][1];
  };
}

const TOP = curve([[1.52, -30], [1.1, -21], [0.2, -15], [-0.9, -10], [-1.18, -5], [-1.32, 16], [-1.48, 50], [-1.64, 90]]);
const BOTTOM = curve([[1.52, -30], [1.2, -41], [0.6, -56], [0.0, -71], [-0.6, -90]]);

const WINDOW_E = 13.4;
const WINDOWS = [];
for (let z = 1.2; z >= -1.17; z -= 0.062) WINDOWS.push(+z.toFixed(3));
const EXITS = [-0.068, -0.13];

function painter(W, H) {
  const k = W / LEN; // px per unit
  const X = (z) => (z - FUSE.tail) * k;
  const Y = (e, side) => {
    const phi = Math.PI - side * (Math.PI / 2 - e * RAD);
    return (1 - phi / (2 * Math.PI)) * H;
  };
  const P = (z, e, side) => [X(z), Y(e, side)];
  // arc length (units) ↔ degrees at the constant section
  const arcDeg = (a) => (a / FUSE.R) / RAD;
  return { k, X, Y, P, arcDeg };
}

function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(Math.min(x, x + w), Math.min(y, y + h), Math.abs(w), Math.abs(h), r);
}

// Run fn in a coordinate frame centred on (z, e) of a side, in pixels,
// oriented so that the drawing reads correctly when that side is viewed.
function decal(ctx, pt, side, fn) {
  const [cx, cy] = pt;
  ctx.save();
  if (side > 0) ctx.setTransform(-1, 0, 0, 1, cx, cy);
  else ctx.setTransform(1, 0, 0, -1, cx, cy);
  fn();
  ctx.restore();
}

function drawFlag(ctx, w, h) {
  ctx.fillStyle = '#006233';
  ctx.fillRect(-w / 2, -h / 2, w / 2, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, -h / 2, w / 2, h);
  ctx.fillStyle = '#d21034';
  const r = h * 0.25;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(r * 0.25, 0, r * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d21034';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.18 : r * 0.42;
    ctx.lineTo(r * 0.55 + Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
}

function paintColor(ctx, W, H, logo) {
  const { k, X, Y, P, arcDeg } = painter(W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAINT;
  ctx.fillRect(0, 0, W, H);

  for (const side of [1, -1]) {
    // grey belly
    const g = ctx.createLinearGradient(0, Y(-46, side), 0, Y(-56, side));
    g.addColorStop(0, PAINT);
    g.addColorStop(1, BELLY);
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.min(Y(-46, side), Y(-90, side)), W, Math.abs(Y(-90, side) - Y(-46, side)));

    // red sweep from under the cockpit into the tail
    const top = [];
    const bot = [];
    for (let z = 1.52; z >= FUSE.tail; z -= 0.01) {
      top.push(P(z, TOP(z), side));
      bot.push(P(z, BOTTOM(z), side));
    }
    ctx.fillStyle = LION_RED;
    poly(ctx, [...top, ...bot.reverse()]);
    ctx.fill();

    // garnet pinstripe riding above the sweep
    const s1 = [];
    const s2 = [];
    for (let z = 1.36; z >= -1.5; z -= 0.01) {
      const taper = Math.min(1, (1.36 - z) / 0.5);
      const e = TOP(z);
      if (e > 84) break;
      s1.push(P(z, e + 2.2, side));
      s2.push(P(z, e + 2.2 + 2.6 * taper, side));
    }
    ctx.fillStyle = GARNET;
    poly(ctx, [...s1, ...s2.reverse()]);
    ctx.fill();

    // cabin windows
    const ww = 0.027 * k;
    const wh = 0.04 * k;
    for (const z of WINDOWS) {
      const [x, y] = P(z, WINDOW_E, side);
      const yTop = Y(WINDOW_E + arcDeg(0.02), side);
      const gr = ctx.createLinearGradient(0, yTop, 0, 2 * y - yTop);
      gr.addColorStop(0, '#59616c');
      gr.addColorStop(0.45, '#262a31');
      gr.addColorStop(1, '#14161a');
      ctx.fillStyle = gr;
      roundRect(ctx, x - ww / 2, y - wh / 2, ww, wh, ww * 0.42);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,124,130,0.55)';
      ctx.lineWidth = Math.max(1, k * 0.0016);
      ctx.stroke();
    }

    // doors and over-wing exits
    ctx.strokeStyle = 'rgba(70,74,80,0.55)';
    ctx.lineWidth = Math.max(1.2, k * 0.0022);
    for (const z of [1.34, -1.3]) {
      const [x, y] = P(z, 2, side);
      roundRect(ctx, x - 0.043 * k, y - 0.1 * k, 0.086 * k, 0.2 * k, 0.014 * k);
      ctx.stroke();
      const [wx, wy] = P(z, WINDOW_E + 2, side);
      ctx.fillStyle = '#23272d';
      roundRect(ctx, wx - 0.011 * k, wy - 0.016 * k, 0.022 * k, 0.032 * k, 0.009 * k);
      ctx.fill();
    }
    for (const z of EXITS) {
      const [x, y] = P(z, WINDOW_E - 2, side);
      roundRect(ctx, x - 0.028 * k, y - 0.052 * k, 0.056 * k, 0.104 * k, 0.01 * k);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    for (const z of [0.9, -0.82]) {
      const [x, y] = P(z, -38, side);
      roundRect(ctx, x - 0.08 * k, y - 0.07 * k, 0.16 * k, 0.14 * k, 0.01 * k);
      ctx.stroke();
    }

    // flight-deck glazing
    const panes = [
      [[1.935, 47], [1.952, 87], [1.875, 87], [1.858, 50]],
      [[1.846, 45], [1.855, 70], [1.795, 72], [1.782, 43]],
      [[1.768, 44], [1.772, 66], [1.733, 66], [1.728, 46]],
    ];
    for (const pane of panes) {
      ctx.fillStyle = '#171a1f';
      poly(ctx, pane.map(([z, e]) => P(z, e, side)));
      ctx.fill();
      ctx.strokeStyle = 'rgba(40,40,44,0.8)';
      ctx.stroke();
    }

    // logo lockup (official artwork) above the window line
    if (logo) {
      const h = 0.22 * k;
      const w = h * (logo.width / logo.height);
      decal(ctx, P(0.6, 41, side), side, () => ctx.drawImage(logo, -w / 2, -h / 2, w, h));
    }

    // registration and flag on the rear fuselage
    decal(ctx, P(-0.93, 34, side), side, () => {
      ctx.fillStyle = NIGHT;
      ctx.font = `700 ${Math.round(0.044 * k)}px "Plus Jakarta Sans", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7T-ORN', 0, 0);
    });
    decal(ctx, P(-0.72, 34, side), side, () => drawFlag(ctx, 0.066 * k, 0.044 * k));
  }

  // APU exhaust
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#3b3b3d';
  ctx.fillRect(0, 0, X(-2.175), H);
}

function paintBump(ctx, W, H) {
  const { k, X, Y, P } = painter(W, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#5c5c5c';
  ctx.lineWidth = Math.max(1, k * 0.0018);

  for (const z of [-1.92, -1.62, -1.24, -0.88, -0.44, 0.02, 0.48, 0.96, 1.46, 1.72]) {
    ctx.beginPath();
    ctx.moveTo(X(z), 0);
    ctx.lineTo(X(z), H);
    ctx.stroke();
  }
  for (const side of [1, -1]) {
    for (const e of [-62, -28, 34, 64]) {
      ctx.beginPath();
      ctx.moveTo(X(-1.9), Y(e, side));
      ctx.lineTo(X(1.66), Y(e, side));
      ctx.stroke();
    }
    ctx.fillStyle = '#4a4a4a';
    for (const z of WINDOWS) {
      const [x, y] = P(z, WINDOW_E, side);
      roundRect(ctx, x - 0.0145 * k, y - 0.021 * k, 0.029 * k, 0.042 * k, 0.012 * k);
      ctx.fill();
    }
    for (const z of [1.34, -1.3]) {
      const [x, y] = P(z, 2, side);
      roundRect(ctx, x - 0.043 * k, y - 0.1 * k, 0.086 * k, 0.2 * k, 0.014 * k);
      ctx.stroke();
    }
    for (const z of [0.9, -0.82]) {
      const [x, y] = P(z, -38, side);
      roundRect(ctx, x - 0.08 * k, y - 0.07 * k, 0.16 * k, 0.14 * k, 0.01 * k);
      ctx.stroke();
    }
  }
}

// Turn the logo's white ground transparent without altering how it reads on white.
function whiteToAlpha(img) {
  const { c, ctx } = makeCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const a = data.data;
  for (let i = 0; i < a.length; i += 4) {
    const alpha = 1 - Math.min(a[i], a[i + 1], a[i + 2]) / 255;
    if (alpha < 0.01) { a[i + 3] = 0; continue; }
    for (let ch = 0; ch < 3; ch++) a[i + ch] = (a[i + ch] - 255 * (1 - alpha)) / alpha;
    a[i + 3] = alpha * 255;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

export function createLivery({ low = false, anisotropy = 8 } = {}) {
  const W = low ? 2048 : 4096;
  const H = Math.round((W * 2 * Math.PI * FUSE.R) / LEN);
  const color = makeCanvas(W, H);
  const bump = makeCanvas(W, H);

  const map = new THREE.CanvasTexture(color.c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = anisotropy;
  const bumpMap = new THREE.CanvasTexture(bump.c);
  bumpMap.anisotropy = anisotropy;

  let logo = null;
  const repaint = () => {
    paintColor(color.ctx, W, H, logo);
    map.needsUpdate = true;
  };
  repaint();
  paintBump(bump.ctx, W, H);
  bumpMap.needsUpdate = true;

  const img = new Image();
  img.onload = () => { logo = whiteToAlpha(img); repaint(); };
  img.src = `${import.meta.env.BASE_URL}logo-1400.webp`;
  document.fonts?.ready.then(repaint);

  return { map, bumpMap };
}
