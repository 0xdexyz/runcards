import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCopy } from '../lib/i18n';
import RouteRollLink from './demo/RouteRollLink';

/** Steps that open a real, connected part of the app — the rest stay plain (no single matching page). */
const STEP_LINKS: Record<number, string> = {
  1: '/marketplace', // Discover
  2: '/launchpad/create', // Run your card
  3: '/campaigns', // Campaigns
  4: '/campaigns', // Participate
  5: '/rewards', // Rewards
  6: '/analytics', // Grow
};

function Skills() {
  const t = useCopy();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rows = ref.current?.querySelectorAll('.skill');
    if (!rows) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    rows.forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <div className="skills" ref={ref}>
      {t.skills.map((skill, i) => {
        const to = STEP_LINKS[i];
        const rowInner = (
          <>
            <span className="skill__bar" aria-hidden="true" />
            <p className="skill__index">[ {String(i + 1).padStart(2, '0')} ]</p>
            <h3 className="skill__title">{skill.title}</h3>
            <div>
              <p className="skill__copy">{skill.copy}</p>
              <p className="skill__copy" style={{ opacity: 0.6, marginTop: '0.4rem' }}>
                {skill.visual}
              </p>
            </div>
          </>
        );
        const rowStyle = { '--row-delay': `${i * 0.08}s` } as React.CSSProperties;
        return to ? (
          <Link className="skill" to={to} key={i} style={rowStyle}>
            {rowInner}
          </Link>
        ) : (
          <div className="skill" key={i} style={rowStyle}>
            {rowInner}
          </div>
        );
      })}
    </div>
  );
}

export default function About() {
  const t = useCopy();

  return (
    <section className="about" id="about">
      <div className="about__inner">
        <div>
          <p className="about__heading display">How it works</p>
          <p className="about__sub">One ecosystem. Cards, campaigns, community, rewards.</p>
        </div>

        <Skills />

        <div>
          <p className="about__sub" style={{ marginTop: 0 }}>
            Connect. Discover. Run your card. Build campaigns. Participate. Earn. Grow.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <RouteRollLink text="Explore RUN" to="/marketplace" />
            <RouteRollLink text={t.nav.create} to="/launchpad/create" />
          </div>
        </div>
      </div>
    </section>
  );
}
