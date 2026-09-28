import { useEffect, useMemo, useRef, useState } from 'react';
import { useViewportGrid } from '../lib/hooks';
import { registerSectionTransition, sectionOffset, type SectionId } from '../lib/navigation';
import { jumpTo, prefersReducedMotion } from '../lib/scroll';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Orange pixel wipe that covers the screen while the page jumps to another section. */
export default function SectionTransition() {
  const grid = useViewportGrid((w) => (w < 700 ? 5 : 8));
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const busy = useRef(false);
  const count = grid.cols * grid.rows;
  const delays = useMemo(
    () => Array.from({ length: count }, () => ({ in: Math.random() * 0.32, out: Math.random() * 0.32 })),
    [count],
  );

  useEffect(() => {
    registerSectionTransition(async (id: SectionId) => {
      if (busy.current) return;
      if (prefersReducedMotion()) {
        jumpTo(sectionOffset(id));
        return;
      }
      busy.current = true;
      setPhase('in');
      await wait(420);
      jumpTo(sectionOffset(id));
      await wait(90);
      setPhase('out');
      await wait(420);
      setPhase('idle');
      busy.current = false;
    });
    return () => registerSectionTransition(null);
  }, []);

  return (
    <div className={`px-wipe${phase === 'idle' ? '' : ` is-${phase}`}`} aria-hidden="true">
      <div className="px-wipe__grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}>
        {delays.map((d, i) => (
          <span
            key={i}
            className="px-wipe__cell"
            style={{ '--d-in': `${d.in}s`, '--d-out': `${d.out}s` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
