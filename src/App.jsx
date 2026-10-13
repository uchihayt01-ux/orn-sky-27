import { lazy, Suspense, useEffect } from 'react';
import { LangProvider, useLang } from './i18n.jsx';
import { startScroll } from './scroll.js';
import Nav from './components/Nav.jsx';
import { Hero, Overview, Figures, Sectors, Why, Sponsors, Venue, Cta, Footer } from './components/Sections.jsx';

// The WebGL scene loads in its own chunk so text paints first.
const Scene = lazy(() => import('./three/Scene.jsx'));

function Page() {
  const { t, lang } = useLang();
  useEffect(() => startScroll(), []);

  return (
    <div className={`app lang-${lang}`}>
      <Suspense fallback={<div className="scene scene--fallback" />}>
        <Scene rtl={t.dir === 'rtl'} />
      </Suspense>
      <Nav />
      <main>
        <Hero />
        <Overview />
        <Figures />
        <Sectors />
        <Why />
        <Sponsors />
        <Venue />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  );
}
