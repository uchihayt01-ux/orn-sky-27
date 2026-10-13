import { useEffect, useState } from 'react';
import { useLang, LANGS } from '../i18n.jsx';
import { scroll, scrollToId } from '../scroll.js';
import { Icon, Logo } from './ui.jsx';

const LINKS = ['overview', 'figures', 'sectors', 'sponsorship', 'venue', 'contact'];

export function LangSwitch({ tone = 'auto' }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`lang lang--${tone}`} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.id} type="button" className={lang === l.id ? 'on' : ''} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function Nav() {
  const { t } = useLang();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (scroll.lenis) open ? scroll.lenis.stop() : scroll.lenis.start();
  }, [open]);

  const go = (id) => {
    const wasOpen = open;
    setOpen(false);
    setTimeout(() => scrollToId(id), wasOpen ? 250 : 0);
  };

  return (
    <header className={`nav ${solid || open ? 'nav--solid' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__brand" onClick={(e) => { e.preventDefault(); go('top'); }} aria-label="ORN SKY 27">
          <Logo size="nav" />
        </a>

        <nav className="nav__links" aria-label="Main">
          {LINKS.map((id) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{t.nav[id]}</a>
          ))}
        </nav>

        <div className="nav__end">
          <LangSwitch />
          <a href="#sponsorship" className="btn btn--primary btn--sm nav__cta" onClick={(e) => { e.preventDefault(); go('sponsorship'); }}>
            {t.nav.cta}
          </a>
          <button type="button" className="nav__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <Icon.close /> : <Icon.menu />}
          </button>
        </div>
      </div>

      <div className={`drawer ${open ? 'drawer--open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map((id) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} tabIndex={open ? 0 : -1}>
              {t.nav[id]}
            </a>
          ))}
        </nav>
        <div className="drawer__foot">
          <LangSwitch tone="light" />
          <a href="#sponsorship" className="btn btn--primary" onClick={(e) => { e.preventDefault(); go('sponsorship'); }} tabIndex={open ? 0 : -1}>{t.nav.cta}</a>
        </div>
      </div>
    </header>
  );
}
