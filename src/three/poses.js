// Where the aircraft sits while each sky section is centred on screen.
//   f   — position as a fraction of the visible half-frame (x, y), so it adapts to any screen
//   z   — depth (camera at z = 10)
//   r   — [pitch (+ = nose down), heading (0 = towards the viewer, +π/2 = nose to screen-right), roll]
//   s   — scale
//   sky — backdrop camera pitch (rad): + looks up into the sky, − looks down on the clouds
//   m   — overrides for phones
// Bank in turns is added automatically from the rate of turn. Mirrored for Arabic (RTL).
export const POSES = {
  intro: { f: [1.5, 0.32], z: -42, r: [-0.05, -0.62, 0.12], s: 1.05, sky: 0.06, m: { f: [0.9, 0.5] } },
  hero: { f: [0.36, -0.06], z: 0, r: [-0.05, -0.62, 0.08], s: 1.05, sky: 0.06, m: { f: [0.02, 0.36], s: 1.15 } },
  figures: { f: [-0.06, 0.36], z: -1.5, r: [0.0, -1.57, 0.0], s: 0.82, sky: -0.05, m: { f: [0, 0.4], s: 0.95 } },
  cta: { f: [0.3, 0.16], z: -4.5, r: [-0.16, -2.55, 0.0], s: 0.9, sky: 0.15, m: { f: [0.02, 0.34], s: 1 } },
};
