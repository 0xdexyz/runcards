import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useCopy } from '../../lib/i18n';
import { useMediaQuery } from '../../lib/hooks';
import { shuffledIndices } from '../../lib/random';
import { useDemo } from '../../demo/store';
import { Scribble } from '../shared';
import { DISCOVER_CARDS } from './discoverCards';
import DiscoverCardArt from './DiscoverCardArt';

const N = DISCOVER_CARDS.length;
const DISCOVER_DESCRIPTION = 'Powered by crypto. Shaped by the people who run it. Discover cards created by the community.';

export default function Tools() {
  const t = useCopy();
  const { cards } = useDemo();
  const desktop = useMediaQuery('(min-width: 901px)');
  const [index, setIndex] = useState(0);
  const pin = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pixels = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!pin.current || !desktop) return;
    const st = ScrollTrigger.create({
      trigger: pin.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setIndex(Math.min(N - 1, Math.floor(self.progress * N))),
    });
    return () => st.kill();
  }, [desktop]);

  useEffect(() => {
    const root = strip.current;
    if (!root) return;
    const duration = first.current ? 0 : 0.95;
    first.current = false;
    gsap.to(track.current, { xPercent: -100 * index, duration, ease: 'expo.inOut', overwrite: true });
    root.querySelectorAll('.strip__stack').forEach((stack) => {
      gsap.to(stack, { yPercent: (-100 * index) / N, duration, ease: 'expo.inOut', overwrite: true });
    });
    if (!duration || !pixels.current) return;
    const cells = Array.from(pixels.current.children);
    const picked = shuffledIndices(cells.length)
      .slice(0, Math.round(cells.length * 0.35))
      .map((i) => cells[i]);
    const tl = gsap
      .timeline()
      .set(picked, { visibility: 'visible', stagger: { amount: 0.25 } })
      .set(picked, { visibility: 'hidden', stagger: { amount: 0.3, from: 'random' } }, 0.35);
    return () => {
      tl.kill();
      gsap.set(cells, { visibility: 'hidden' });
    };
  }, [index]);

  const step = (dir: number) => setIndex((i) => Math.min(N - 1, Math.max(0, i + dir)));

  const subtitles = DISCOVER_CARDS.map((card) => {
    const live = cards.find((c) => c.id === card.id);
    if (!live) return card.category;
    return `${live.creatorHandle} · ${live.rewardRate}% reward · ${live.activeUsers.toLocaleString()} holders`;
  });

  const stack = (items: string[], className: string) => (
    <div className="strip__stack">
      {items.map((item, i) => (
        <p key={i} className={className} aria-hidden={i !== index}>
          {item}
        </p>
      ))}
    </div>
  );

  return (
    <section className="tools" id="tools">
      <div className="tools__mark">
        <Scribble tone="ink" />
      </div>
      <div className="tools__pin" ref={pin} data-nav-anchor>
        <div className="tools__sticky">
          <p className="tools__label display">{t.tools.label}</p>
          <div className="strip" ref={strip}>
            <span className="strip__rule" />
            <div className="strip__meta">
              <div className="strip__mask strip__mask--copy">
                <p className="strip__copy">{DISCOVER_DESCRIPTION}</p>
              </div>
              <div className="strip__label">
                {t.tools.scroll} #
                <div className="strip__mask strip__mask--mini">{stack(DISCOVER_CARDS.map((_, i) => String(i)), 'strip__mini')}</div>
              </div>
            </div>

            <div className="strip__stage">
              <div className="strip__pixels" ref={pixels} aria-hidden="true">
                {Array.from({ length: 16 * 7 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="strip__window">
                <div className="strip__track" ref={track}>
                  {DISCOVER_CARDS.map((card, i) => (
                    <div className={`strip__slide${i === index ? ' is-active' : ''}`} key={card.id} aria-hidden={i !== index}>
                      <div className="strip__media">
                        <Link to={`/card/${card.id}`} tabIndex={i === index ? 0 : -1} aria-label={`View ${card.name} card`} style={{ display: 'block', width: '100%', height: '100%' }}>
                          <DiscoverCardArt variant={card.visual} name={card.name} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="strip__footer">
              <div className="strip__title-block">
                <div className="strip__mask strip__mask--title">{stack(DISCOVER_CARDS.map((card) => card.name), 'strip__title')}</div>
                <div className="strip__mask strip__mask--sub">{stack(subtitles, 'strip__subtitle')}</div>
              </div>
              <div className="strip__arrows">
                <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label={t.a11y.prev}>
                  ‹
                </button>
                <button type="button" onClick={() => step(1)} disabled={index === N - 1} aria-label={t.a11y.next}>
                  ›
                </button>
              </div>
              <div className="strip__mask strip__mask--counter">
                {stack(DISCOVER_CARDS.map((_, i) => String(i + 1).padStart(3, '0')), 'strip__counter')}
              </div>
            </div>
            <span className="strip__rule" />
          </div>
        </div>
      </div>
      <div className="tools__progress">
        <Scribble />
      </div>
    </section>
  );
}
