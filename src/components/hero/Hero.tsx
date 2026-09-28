import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile, type CityId } from '../../content';
import { useCopy } from '../../lib/i18n';
import { useViewportGrid } from '../../lib/hooks';
import { useDemo } from '../../demo/store';
import { RollHeading, RollButton } from '../shared';
import GetCardModal from '../demo/GetCardModal';
import RouteRollLink from '../demo/RouteRollLink';
import { BlobScene } from './BlobScene';
import MusicPlayer from './MusicPlayer';

function formatTime(timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(new Date());
}

/** Vertical ticker that alternates between two values. */
function Ticker({ items, index }: { items: string[]; index: number }) {
  const prev = (index + items.length - 1) % items.length;
  return (
    <span className="ticker">
      <span className="ticker__sizer" aria-hidden="true">
        {items.reduce((a, b) => (b.length > a.length ? b : a), '')}
      </span>
      {items.map((item, i) => (
        <span key={i} className={`ticker__item${i === index ? ' is-active' : i === prev ? ' is-prev' : ''}`} aria-hidden={i !== index}>
          {item}
        </span>
      ))}
    </span>
  );
}

function Location() {
  const t = useCopy();
  const [index, setIndex] = useState(0);
  const [, setNow] = useState(0);
  useEffect(() => {
    const swap = window.setInterval(() => setIndex((i) => (i + 1) % profile.locations.length), 3200);
    const clock = window.setInterval(() => setNow(Date.now()), 15000);
    return () => {
      window.clearInterval(swap);
      window.clearInterval(clock);
    };
  }, []);
  const cities = profile.locations.map((l) => t.hero.cities[l.id as CityId]);
  const times = profile.locations.map((l) => formatTime(l.timeZone));
  return (
    <div className="hero__meta-right">
      <p className="hero__meta">
        {t.hero.location}: <Ticker items={cities} index={index} />
      </p>
      <p className="hero__meta">
        <Ticker items={times} index={index} />
      </p>
    </div>
  );
}

/** Fixed orange pixel grid scrubbed by scroll: fills over the hero, clears over the About section. */
function PixelWipe({ stage, onCovered }: { stage: React.RefObject<HTMLElement | null>; onCovered: (covered: boolean) => void }) {
  const grid = useViewportGrid((w) => (w < 700 ? 4 : 6));
  const ref = useRef<HTMLDivElement>(null);
  const count = grid.cols * grid.rows;
  const thresholds = useMemo(
    () => Array.from({ length: count }, () => ({ a: 0.05 + Math.random() * 0.9, b: 0.05 + Math.random() * 0.9 })),
    [count],
  );

  useEffect(() => {
    const cells = ref.current ? (Array.from(ref.current.children) as HTMLElement[]) : [];
    let covered = false;
    const st = ScrollTrigger.create({
      trigger: stage.current,
      start: () => `top+=${window.innerHeight * 1.62} top`,
      end: () => `top+=${window.innerHeight * 2.38} top`,
      invalidateOnRefresh: true,
      onUpdate: ({ progress: p }) => {
        cells.forEach((cell, i) => {
          const { a, b } = thresholds[i];
          const on = p < 0.5 ? p * 2 >= a : p * 2 - 1 < b;
          cell.style.opacity = p <= 0 || p >= 1 ? '0' : on ? '1' : '0';
        });
        const nowCovered = p >= 0.5;
        if (nowCovered !== covered) {
          covered = nowCovered;
          onCovered(covered);
        }
      },
    });
    return () => st.kill();
  }, [stage, thresholds, onCovered]);

  return (
    <div className="hero-wipe" ref={ref} style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }} aria-hidden="true">
      {thresholds.map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

export default function Hero({ intro }: { intro: boolean }) {
  const t = useCopy();
  const state = useDemo();
  const stage = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scene = useRef<BlobScene | null>(null);
  const [getCard, setGetCard] = useState(false);
  const runCard = state.cards.find((c) => c.id === 'run-card');

  useEffect(() => {
    if (!canvas.current) return;
    const blob = new BlobScene(canvas.current);
    scene.current = blob;
    if (import.meta.env.DEV) (window as unknown as { __blob: BlobScene }).__blob = blob;
    const st = ScrollTrigger.create({
      trigger: stage.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => blob.setScroll(self.progress),
    });
    return () => {
      st.kill();
      blob.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    const root = panel.current;
    if (!root) return;
    const titles = root.querySelectorAll('.hero__title-inner');
    const fades = root.querySelectorAll('[data-hero-fade]');
    if (!intro) {
      gsap.set(titles, { yPercent: 110 });
      gsap.set(fades, { autoAlpha: 0, y: 14 });
      return;
    }
    scene.current?.intro();
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(titles, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12 }).to(
      fades,
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 },
      0.35,
    );
    return () => {
      tl.kill();
    };
  }, [intro]);

  const onCovered = useMemo(() => (covered: boolean) => scene.current?.setActive(!covered), []);

  return (
    <section className="hero" id="top" ref={stage}>
      <div className="hero__track">
        <div className="hero__sticky">
          <canvas className="hero__canvas" ref={canvas} aria-label="Interactive 3D crypto card — drag to spin" />
        </div>
      </div>

      <div className="hero__content">
        <div className="hero__panel" ref={panel}>
          <h1 className="hero__title">
            <span className="hero__mask">
              <span className="hero__title-inner">{profile.role[0]}</span>
            </span>
          </h1>

          <div className="hero__bottom">
            <div className="hero__meta-row" data-hero-fade>
              <p className="hero__meta">{t.hero.about}</p>
              <Location />
            </div>
            <div className="hero__split">
              <p className="hero__copy" data-hero-fade>
                {t.hero.copy}
              </p>
              <p className="hero__title hero__title--right">
                <span className="hero__mask">
                  <span className="hero__title-inner">{profile.role[1]}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="hero__player" data-hero-fade>
            <MusicPlayer />
            {runCard && (runCard.ownedByUser ? (
              <RouteRollLink text="View RUN Card" to="/card/run-card" />
            ) : (
              <RollButton text="Get RUN Card" onClick={() => setGetCard(true)} />
            ))}
          </div>
        </div>

        <div className="manifesto">
          <RollHeading className="manifesto__left" text={t.manifesto.left} />
          <RollHeading className="manifesto__right" text={t.manifesto.right} />
        </div>
      </div>

      <PixelWipe stage={stage} onCovered={onCovered} />
      {getCard && runCard && <GetCardModal card={runCard} onClose={() => setGetCard(false)} />}
    </section>
  );
}
