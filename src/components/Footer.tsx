import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { LANGS, profile } from '../content';
import { useLang } from '../lib/i18n';
import { goToSection } from '../lib/navigation';
import Runner from './Runner';
import { RollButton } from './shared';

const EDGE_ROWS = [
  (c: number) => c % 4 === 1,
  (c: number) => c % 2 === 0,
  (c: number) => c % 4 !== 3,
  (c: number) => c % 8 !== 5,
];

/** Staircase of orange pixels leading into the footer. */
function PixelEdge() {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(20);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const size = parseFloat(getComputedStyle(el).getPropertyValue('--edge-size')) || 80;
      setCols(Math.ceil(el.clientWidth / size) + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.2 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className={`edge${visible ? ' is-visible' : ''}`} ref={ref} aria-hidden="true">
      {EDGE_ROWS.map((filled, r) => (
        <div className="edge__row" key={r}>
          {Array.from({ length: cols }, (_, c) =>
            filled(c) ? (
              <span key={c} className="edge__cell" style={{ animationDelay: `${(3 - r) * 0.09 + c * 0.012}s` }} />
            ) : (
              <span key={c} className="edge__cell is-gap" />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** Surname set in an SVG whose viewBox hugs the glyphs, so it always spans the width. */
function Wordmark() {
  const text = useRef<SVGTextElement>(null);
  const [box, setBox] = useState('0 0 1000 200');

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive || !text.current) return;
      const b = text.current.getBBox();
      setBox(`${b.x} ${b.y + b.height * 0.2} ${b.width} ${b.height * 0.62}`);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="wordmark">
      <span className="wordmark__runner">
        <Runner speed={1.3} />
      </span>
      <svg className="wordmark__svg" viewBox={box} role="img" aria-label={profile.lastName}>
        <text ref={text} x="0" y="200" className="wordmark__text">
          /{profile.lastName.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

export default function Footer() {
  const { t, lang, setLang } = useLang();
  const [status, setStatus] = useState<'idle' | 'sent' | 'invalid'>('idle');

  const links: { id: string; label: string; to?: string; anchor?: boolean; create?: boolean }[] = [
    { id: 'about', label: t.nav.about, anchor: true },
    { id: 'marketplace', label: t.nav.tools, to: '/marketplace' },
    { id: 'campaigns', label: t.nav.work, to: '/campaigns' },
    { id: 'create', label: t.nav.create, to: '/launchpad/create', create: true },
  ];

  const navigate = (e: MouseEvent) => {
    e.preventDefault();
    goToSection('about');
  };

  // No backend here: validate locally and acknowledge. Wire this to your form service.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim())) {
      setStatus('invalid');
      return;
    }
    setStatus('sent');
    input.value = '';
  };

  return (
    <footer className="footer" id="contact">
      <PixelEdge />
      <div className="footer__frame" data-nav-anchor>
        {['tl', 'tr', 'bl', 'br'].map((c) => (
          <span key={c} className={`footer__corner footer__corner--${c}`} aria-hidden="true" />
        ))}
        <div className="footer__grid">
          <div className="footer__col">
            <p className="footer__lead">{t.footer.lead}</p>
            <p className="footer__sublead">{t.footer.sublead}</p>
            <p className="footer__small">
              © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
            </p>
          </div>
          <div className="footer__col">
            <p className="footer__title">{t.footer.links}</p>
            <nav className="footer__list" aria-label="Footer">
              {links.map((l) =>
                l.anchor ? (
                  <a key={l.id} href="#about" onClick={navigate}>
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.id} to={l.to!} className={l.create ? 'is-create' : undefined}>
                    {l.label}
                  </Link>
                ),
              )}
            </nav>
            <p className="footer__small">{t.footer.language}</p>
            <div className="footer__langs">
              {LANGS.map((l) => (
                <RollButton key={l.id} text={l.label} active={l.id === lang} aria-pressed={l.id === lang} onClick={() => setLang(l.id)} />
              ))}
            </div>
          </div>
          <div className="footer__col">
            <p className="footer__title">{t.footer.contact}</p>
            <div className="footer__list">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
            <form className="footer__form" onSubmit={submit} noValidate>
              <label className="sr-only" htmlFor="footer-email">
                {t.footer.emailLabel}
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.footer.emailPlaceholder}
                onInput={() => status !== 'idle' && setStatus('idle')}
              />
              <button type="submit">{t.footer.send}</button>
            </form>
            <p className="footer__status" role="status">
              {status === 'sent' ? t.footer.thanks : status === 'invalid' ? t.footer.invalid : ''}
            </p>
          </div>
        </div>
        <div className="footer__bottom">
          <Wordmark />
        </div>
      </div>
    </footer>
  );
}
