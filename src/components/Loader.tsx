import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCopy } from '../lib/i18n';
import { useViewportGrid } from '../lib/hooks';
import Runner from './Runner';

const MIN_DURATION = 1800;

interface LoaderProps {
  ready: boolean;
  onReveal: () => void;
  onDone: () => void;
}

type Phase = 'loading' | 'revealing' | 'done';

/** Black pixel grid over the page; cells blink away in random order once assets are ready. */
export default function Loader({ ready, onReveal, onDone }: LoaderProps) {
  const t = useCopy();
  const grid = useViewportGrid((w) => (w < 700 ? 6 : 11));
  const [phase, setPhase] = useState<Phase>('loading');
  const cellsRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    if (!ready || phase !== 'loading') return;
    const wait = Math.max(0, MIN_DURATION - (performance.now() - startedAt.current));
    const timer = window.setTimeout(() => setPhase('revealing'), wait);
    return () => window.clearTimeout(timer);
  }, [ready, phase]);

  useEffect(() => {
    if (phase !== 'revealing' || !cellsRef.current) return;
    onReveal();
    const tween = gsap.to(cellsRef.current.children, {
      autoAlpha: 0,
      duration: 0.01,
      delay: 0.2,
      stagger: { amount: 0.8, from: 'random' },
      onComplete: () => setPhase('done'),
    });
    return () => {
      tween.kill();
    };
  }, [phase, onReveal]);

  useEffect(() => {
    if (phase === 'done') onDone();
  }, [phase, onDone]);

  if (phase === 'done') return null;

  return (
    <div className={`loader${phase === 'revealing' ? ' is-revealing' : ''}`} role="status" aria-live="polite">
      <div
        ref={cellsRef}
        className="loader__grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }, (_, i) => (
          <span key={i} className="loader__cell" />
        ))}
      </div>
      <div className="loader__inner">
        <Runner className="loader__runner" speed={1.5} />
        <p className="loader__label">{t.loading}</p>
      </div>
    </div>
  );
}
