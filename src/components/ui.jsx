import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../scroll.js';

export function useInView(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function Counter({ to, duration = 1600, locale = 'en' }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [val, setVal] = useState(reducedMotion ? to : 0);
  useEffect(() => {
    if (!inView || reducedMotion) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  const fmt = locale === 'fr' ? 'fr-FR' : 'en-US';
  return <span ref={ref}>{val.toLocaleString(fmt)}</span>;
}

const I = ({ children, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
);

export const Icon = {
  arrow: (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>,
  external: (p) => <I {...p}><path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" /></I>,
  check: (p) => <I {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></I>,
  dash: (p) => <I {...p}><path d="M8 12h8" /></I>,
  up: (p) => <I {...p}><path d="M12 19V5M6 11l6-6 6 6" /></I>,
  menu: (p) => <I {...p}><path d="M4 8h16M4 16h16" /></I>,
  close: (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>,
};

export function Logo({ size = 'nav' }) {
  // The official lockup, untouched, on its white ground (as the guideline presents it).
  const src = `${import.meta.env.BASE_URL}${size === 'nav' ? 'logo-720.webp' : 'logo-1400.webp'}`;
  return (
    <span className={`logo-plate logo-plate--${size}`}>
      <img src={src} alt="ORN SKY 27 — المعرض الدولي للطائرات" width="1400" height="639" />
    </span>
  );
}
