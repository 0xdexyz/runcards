import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import gsap from 'gsap';
import { Link, useLocation } from 'react-router-dom';
import { profile } from '../content';
import { useCopy } from '../lib/i18n';
import { useViewportGrid } from '../lib/hooks';
import { goToSection } from '../lib/navigation';
import { lockScroll, onScroll } from '../lib/scroll';
import NavDropdown from './demo/NavDropdown';
import UtilCluster from './demo/UtilCluster';

type MenuState = 'closed' | 'open' | 'closing';

interface MenuItem {
  label: string;
  to?: string;
  anchor?: boolean;
  create?: boolean;
}

export default function Topbar({ intro }: { intro: boolean }) {
  const t = useCopy();
  const location = useLocation();
  const onLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuState>('closed');
  const menuRef = useRef(menu);
  menuRef.current = menu;

  useEffect(() => onScroll(({ scroll }) => setScrolled(scroll > 8)), []);

  const closeMenu = () => {
    setMenu('closing');
    lockScroll(false);
    window.setTimeout(() => setMenu('closed'), 620);
  };

  const toggleMenu = () => {
    if (menu === 'open') closeMenu();
    else if (menu === 'closed') {
      setMenu('open');
      lockScroll(true);
    }
  };

  useEffect(() => {
    if (menu !== 'open') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const goHome = (e: MouseEvent) => {
    if (!onLanding) return;
    e.preventDefault();
    if (menu === 'open') closeMenu();
    goToSection('top');
  };

  const goAbout = (e: MouseEvent) => {
    if (!onLanding) return;
    e.preventDefault();
    if (menu === 'open') closeMenu();
    goToSection('about');
  };

  const mobileLinks: MenuItem[] = [
    { label: 'Home', to: '/' },
    { label: t.nav.about, to: '/', anchor: true },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Campaigns', to: '/campaigns' },
    { label: 'Rewards', to: '/rewards' },
    { label: 'Cards I Use', to: '/my-cards' },
    { label: 'Cards I Run', to: '/your-cards' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Profile', to: '/profile' },
    { label: t.nav.create, to: '/launchpad/create', create: true },
  ];

  return (
    <>
      <header className={`topbar${!intro ? ' is-hidden' : ''}${scrolled ? ' is-scrolled' : ''}`}>
        <div className="topbar__row">
          {onLanding ? (
            <a href="#top" className="topbar__name" onClick={goHome}>
              {profile.firstName} {profile.lastName}
            </a>
          ) : (
            <Link to="/" className="topbar__name">
              {profile.firstName} {profile.lastName}
            </Link>
          )}

          <nav className="topbar__nav" aria-label="Primary">
            <a href="#about" onClick={goAbout}>
              {t.nav.about}
            </a>
            <NavDropdown
              label="Marketplace"
              to="/marketplace"
              items={[
                { label: 'Explore Cards', to: '/marketplace' },
                { label: 'RUN Card', to: '/card/run-card' },
                { label: 'Trending Cards', to: '/marketplace?filter=trending' },
                { label: 'New Cards', to: '/marketplace?filter=new' },
              ]}
            />
            <NavDropdown
              label="Campaigns"
              to="/campaigns"
              items={[
                { label: 'Discover Campaigns', to: '/campaigns' },
                { label: 'My Campaigns', to: '/campaigns/mine' },
                { label: 'Create Campaign', to: '/campaigns/create' },
              ]}
            />
            <NavDropdown
              label="Rewards"
              to="/rewards"
              items={[
                { label: 'My Rewards', to: '/rewards' },
                { label: 'Creator Rewards', to: '/rewards/creator' },
              ]}
            />
            <Link to="/my-cards">Cards I Use</Link>
            <Link to="/your-cards">Cards I Run</Link>
            <NavDropdown
              label="Analytics"
              to="/analytics"
              items={[
                { label: 'Overview', to: '/analytics' },
                { label: 'Card Analytics', to: '/analytics?tab=card' },
                { label: 'Campaign Analytics', to: '/analytics?tab=campaign' },
                { label: 'Creator Analytics', to: '/analytics?tab=creator' },
              ]}
            />
            <Link to="/launchpad/create" className="is-create">
              {t.nav.create}
            </Link>
          </nav>

          <UtilCluster />

          <button
            type="button"
            className={`topbar__toggle${menu === 'open' ? ' is-open' : ''}`}
            aria-expanded={menu === 'open'}
            aria-controls="site-menu"
            aria-label={menu === 'open' ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={toggleMenu}
          />
        </div>
      </header>
      <MobileMenu state={menu} links={mobileLinks} onLanding={onLanding} onClose={closeMenu} />
    </>
  );
}

function MobileMenu({
  state,
  links,
  onLanding,
  onClose,
}: {
  state: MenuState;
  links: MenuItem[];
  onLanding: boolean;
  onClose: () => void;
}) {
  const grid = useViewportGrid((w) => (w < 600 ? 6 : 11));
  const count = grid.cols * grid.rows;
  const delays = useMemo(
    () => Array.from({ length: count }, () => ({ in: Math.random() * 0.3, out: Math.random() * 0.26 })),
    [count],
  );
  const cls = state === 'open' ? ' is-open' : state === 'closing' ? ' is-closing' : '';

  return (
    <div id="site-menu" className={`menu${cls}`} aria-hidden={state !== 'open'}>
      <div className="menu__pixels" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}>
        {delays.map((d, i) => (
          <span key={i} className="menu__cell" style={{ '--d-in': `${d.in}s`, '--d-out': `${d.out}s` } as React.CSSProperties} />
        ))}
      </div>
      <nav className="menu__nav" aria-label="Menu">
        {links.map((link) => (
          <MenuLink key={link.label} link={link} tabIndex={state === 'open' ? 0 : -1} onLanding={onLanding} onClose={onClose} />
        ))}
      </nav>
    </div>
  );
}

function MenuLink({
  link,
  tabIndex,
  onLanding,
  onClose,
}: {
  link: MenuItem;
  tabIndex: number;
  onLanding: boolean;
  onClose: () => void;
}) {
  const pixels = useRef<HTMLSpanElement>(null);
  const hover = (on: boolean) => {
    const cells = pixels.current?.children;
    if (!cells) return;
    gsap.killTweensOf(cells);
    gsap.to(cells, {
      autoAlpha: on ? 1 : 0,
      duration: 0.01,
      stagger: { amount: on ? 0.22 : 0.16, from: 'random' },
    });
  };

  const inner = (
    <>
      <span className="menu__hover" ref={pixels} aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} />
        ))}
      </span>
      <span className="menu__label">{link.label}</span>
    </>
  );

  const shared = {
    className: link.create ? 'is-create' : undefined,
    tabIndex,
    onMouseEnter: () => hover(true),
    onMouseLeave: () => hover(false),
  };

  if (link.anchor) {
    const onClick = (e: MouseEvent) => {
      onClose();
      if (!onLanding) return;
      e.preventDefault();
      window.setTimeout(() => goToSection('about'), 640);
    };
    return (
      <a href="/#about" {...shared} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={link.to!} {...shared} onClick={onClose}>
      {inner}
    </Link>
  );
}
