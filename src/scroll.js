import Lenis from 'lenis';

// Mutable scroll state shared between the DOM layer and the WebGL scene.
// The scene reads it every frame, so it is a plain object, not React state.
export const scroll = {
  y: 0,
  velocity: 0,
  progress: 0,
  lenis: null,
};

export const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startScroll() {
  const update = () => {
    scroll.y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.progress = max > 0 ? scroll.y / max : 0;
  };

  if (reducedMotion) {
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }

  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  scroll.lenis = lenis;
  lenis.on('scroll', (l) => {
    update();
    scroll.velocity = l.velocity;
  });

  let raf;
  const loop = (time) => {
    lenis.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  update();

  return () => {
    cancelAnimationFrame(raf);
    lenis.destroy();
    scroll.lenis = null;
  };
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroll.lenis) scroll.lenis.scrollTo(el, { offset: -20 });
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}
