import { useState } from 'react';
import { DICT, useLang } from '../i18n.jsx';
import { EVENT, mailto } from '../config.js';
import { scrollToId } from '../scroll.js';
import { Counter, Icon, Logo, Reveal, useInView } from './ui.jsx';
import { LangSwitch } from './Nav.jsx';

const AR_NAME = 'المعرض الدولي للطائرات';
const MAP_QUERY = 'Le Méridien Oran Hotel & Convention Centre';

function SectionHead({ label, title, intro, light = false }) {
  return (
    <div className="head">
      <div>
        <Reveal as="p" className={`eyebrow ${light ? 'eyebrow--light' : ''}`}>{label}</Reveal>
        <Reveal as="h2" className="h2" delay={60}>{title}</Reveal>
      </div>
      {intro && <Reveal as="p" className="head__intro" delay={120}>{intro}</Reveal>}
    </div>
  );
}

/* ───────── Hero (sky) ───────── */
export function Hero() {
  const { t, lang } = useLang();
  const h = t.hero;
  return (
    <section id="top" className="hero" data-pose="hero" data-sky>
      <div className="wrap hero__inner">
        <p className="hero__label load" style={{ '--d': '300ms' }}>{h.label}</p>
        <h1 className="hero__title load" style={{ '--d': '420ms' }}>
          ORN SKY <span>27</span>
        </h1>
        {lang !== 'ar' && <p className="hero__ar load" lang="ar" dir="rtl" style={{ '--d': '520ms' }}>{AR_NAME}</p>}
        <p className="hero__lead load" style={{ '--d': '620ms' }}>{h.lead}</p>
        <div className="actions load" style={{ '--d': '740ms' }}>
          <a className="btn btn--primary" href="#sponsorship" onClick={(e) => { e.preventDefault(); scrollToId('sponsorship'); }}>
            {h.primary} <Icon.arrow className="btn__icon" />
          </a>
          <a className="btn btn--outline-light" href={mailto(t.cta.mailSecondary)}>{h.secondary}</a>
        </div>
      </div>
      <div className="hero__bar load" style={{ '--d': '900ms' }}>
        <dl className="wrap hero__facts">
          <div><dt>{h.dateK}</dt><dd>{h.date}</dd></div>
          <div><dt>{h.venueK}</dt><dd>{h.venue}</dd></div>
          <div><dt>{h.cityK}</dt><dd>{h.city}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ───────── Overview (panel) ───────── */
export function Overview() {
  const { t } = useLang();
  const o = t.overview;
  return (
    <section id="overview" className="panel overview">
      <div className="wrap split">
        <div>
          <Reveal as="p" className="eyebrow">{o.label}</Reveal>
          <Reveal as="h2" className="h2" delay={60}>{o.title}</Reveal>
        </div>
        <div>
          <Reveal as="p" className="lede" delay={100}>{o.p1}</Reveal>
          <Reveal as="p" className="text" delay={140}>{o.p2}</Reveal>
          <Reveal delay={180}>
            <table className="facts">
              <caption>{o.factsTitle}</caption>
              <tbody>
                {o.rows.map((r) => (
                  <tr key={r.k}><th scope="row">{r.k}</th><td>{r.v}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Key figures (sky) ───────── */
export function Figures() {
  const { t, lang } = useLang();
  const f = t.figures;
  const [barRef, barIn] = useInView({ threshold: 0.6 });
  const pct = (EVENT.exhibitorsConfirmed / EVENT.exhibitorsCapacity) * 100;
  return (
    <section id="figures" className="figures" data-pose="figures" data-sky>
      <div className="wrap">
        <Reveal as="p" className="eyebrow eyebrow--light">{f.label}</Reveal>
        <dl className="figures__grid">
          {f.items.map((it, i) => (
            <Reveal key={it.k} className="figure" delay={i * 80}>
              <dd className="figure__num">
                {it.prefix && <span className="figure__pre">{it.prefix}</span>}
                <Counter to={EVENT[it.k]} locale={lang} />
                {it.unit && <span className="figure__unit">{it.unit}</span>}
              </dd>
              <dt className="figure__label">{it.l}</dt>
            </Reveal>
          ))}
        </dl>
        <Reveal className="booking" delay={120}>
          <div className="booking__row">
            <span>{f.booked}</span>
            <span className="num">{EVENT.exhibitorsConfirmed} / {EVENT.exhibitorsCapacity}</span>
          </div>
          <div ref={barRef} className="booking__bar"><span style={{ width: barIn ? `${pct}%` : '0%' }} /></div>
          <p className="booking__left"><span className="num">{EVENT.exhibitorsCapacity - EVENT.exhibitorsConfirmed}</span> {f.left}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Sectors (panel) ───────── */
export function Sectors() {
  const { t, lang } = useLang();
  const s = t.sectors;
  // bilingual rows: Arabic names beside Latin ones (English beside Arabic in RTL)
  const alt = lang === 'ar' ? DICT.en.sectors.items : DICT.ar.sectors.items;
  return (
    <section id="sectors" className="panel sectors">
      <div className="wrap">
        <SectionHead label={s.label} title={s.title} intro={s.intro} />
        <ol className="rows">
          {s.items.map((it, i) => (
            <Reveal as="li" key={i} className="row" delay={i * 50}>
              <span className="row__n num">{String(i + 1).padStart(2, '0')}</span>
              <div className="row__title">
                <h3>{it.t}</h3>
                <span className="row__alt" lang={lang === 'ar' ? 'en' : 'ar'} dir={lang === 'ar' ? 'ltr' : 'rtl'}>{alt[i].t}</span>
              </div>
              <p className="row__desc">{it.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────── Why sponsor (panel) ───────── */
export function Why() {
  const { t } = useLang();
  const w = t.why;
  return (
    <section className="panel why">
      <div className="wrap">
        <SectionHead label={w.label} title={w.title} />
        <div className="why__grid">
          {w.items.map((it, i) => (
            <Reveal key={i} className="why__item" delay={i * 70}>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Sponsorship packages (panel) ───────── */
function Cell({ v }) {
  if (v === true) return <Icon.check className="mark mark--yes" aria-label="✓" />;
  if (v === false) return <Icon.dash className="mark mark--no" aria-label="—" />;
  return <span>{v}</span>;
}

export function Sponsors() {
  const { t } = useLang();
  const s = t.sponsors;
  const [tier, setTier] = useState(0);
  return (
    <section id="sponsorship" className="panel panel--tint sponsors">
      <div className="wrap">
        <SectionHead label={s.label} title={s.title} intro={s.intro} />

        <div className="tier-tabs" role="tablist" aria-label={s.title}>
          {s.tiers.map((tr, i) => (
            <button key={tr.name} role="tab" type="button" aria-selected={tier === i} className={tier === i ? 'on' : ''} onClick={() => setTier(i)}>
              {tr.name}
            </button>
          ))}
        </div>

        <Reveal className="matrix-wrap" data-tier={tier}>
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col" className="matrix__benefit">{s.benefit}</th>
                {s.tiers.map((tr, i) => (
                  <th scope="col" key={tr.name} className={`tier-col tier-col--${i}`}>
                    <span className="matrix__tier">{tr.name}</span>
                    <span className="matrix__role">{tr.role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.k}>
                  <th scope="row">{r.k}</th>
                  {r.v.map((v, i) => <td key={i} className={`tier-col tier-col--${i}`}><Cell v={v} /></td>)}
                </tr>
              ))}
              <tr className="matrix__strong">
                <th scope="row">{s.availability.k}</th>
                {s.availability.v.map((v, i) => <td key={i} className={`tier-col tier-col--${i}`}>{v}</td>)}
              </tr>
              <tr className="matrix__strong">
                <th scope="row">{s.price.k}</th>
                {s.tiers.map((tr, i) => <td key={i} className={`tier-col tier-col--${i}`}>{s.price.v}</td>)}
              </tr>
            </tbody>
          </table>
        </Reveal>

        <div className="sponsors__foot">
          <Reveal className="custom">
            <h3>{s.customTitle}</h3>
            <p>{s.customBody} <span className="custom__list">{s.custom.join(' · ')}</span></p>
          </Reveal>
          <Reveal className="sponsors__cta" delay={80}>
            <p>{s.note}</p>
            <a className="btn btn--primary" href={mailto(t.cta.mailPrimary)}>{s.cta} <Icon.arrow className="btn__icon" /></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Venue (panel) ───────── */
export function Venue() {
  const { t } = useLang();
  const v = t.venue;
  const q = encodeURIComponent(MAP_QUERY);
  return (
    <section id="venue" className="panel venue">
      <div className="wrap split">
        <div>
          <Reveal as="p" className="eyebrow">{v.label}</Reveal>
          <Reveal as="h2" className="h2" delay={60}>{v.title}</Reveal>
          <Reveal as="p" className="text" delay={100}>{v.body}</Reveal>
          <Reveal delay={140}>
            <dl className="venue__facts">
              {v.facts.map((f) => (
                <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
              ))}
            </dl>
          </Reveal>
        </div>
        <Reveal className="map" delay={120}>
          <iframe
            title={v.mapTitle}
            src={`https://maps.google.com/maps?q=${q}&z=14&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="map__link" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
            {v.map} <Icon.external className="btn__icon" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Contact (sky) ───────── */
export function Cta() {
  const { t } = useLang();
  const c = t.cta;
  return (
    <section id="contact" className="contact" data-pose="cta" data-sky>
      <div className="wrap contact__inner">
        <div>
          <Reveal as="p" className="eyebrow eyebrow--light">{c.label}</Reveal>
          <Reveal as="h2" className="h2 h2--light" delay={60}>{c.title}</Reveal>
          <Reveal as="p" className="contact__body" delay={100}>{c.body}</Reveal>
          <Reveal className="actions" delay={140}>
            <a className="btn btn--white" href={mailto(c.mailPrimary)}>{c.primary} <Icon.arrow className="btn__icon" /></a>
            <a className="btn btn--outline-light" href={mailto(c.mailSecondary)}>{c.secondary}</a>
          </Reveal>
        </div>
        <Reveal className="contact__card" delay={160}>
          <span className="contact__k">{c.emailK}</span>
          <a className="contact__v" href={`mailto:${EVENT.email}`}>{EVENT.email}</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Footer ───────── */
export function Footer() {
  const { t } = useLang();
  const links = ['overview', 'figures', 'sectors', 'sponsorship', 'venue'];
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Logo size="footer" />
          <p>{t.footer.tagline}</p>
        </div>
        <div>
          <h4>{t.footer.event}</h4>
          <ul>
            {links.map((id) => (
              <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>{t.nav[id]}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>{t.footer.contact}</h4>
          <ul>
            <li><a href={`mailto:${EVENT.email}`}>{EVENT.email}</a></li>
            <li>{t.hero.venue}</li>
            <li>{t.hero.city}</li>
          </ul>
        </div>
        <div className="footer__lang">
          <LangSwitch tone="light" />
        </div>
      </div>
      <div className="wrap footer__base">
        <span>© 2027 ORN SKY 27. {t.footer.rights}</span>
        <button type="button" onClick={() => scrollToId('top')}><Icon.up className="btn__icon" /> {t.footer.top}</button>
      </div>
    </footer>
  );
}
