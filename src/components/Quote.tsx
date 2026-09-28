import { useEffect, useMemo, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCopy } from '../lib/i18n';
import { useViewportGrid } from '../lib/hooks';
import { shuffledIndices } from '../lib/random';
import { HoverPixels } from './shared';

/** Black pixels fill the section as it scrolls in; the quote inverts against them. */
export default function Quote() {
  const t = useCopy();
  const grid = useViewportGrid((w) => (w < 700 ? 6 : 11));
  const section = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const count = grid.cols * grid.rows;
  const order = useMemo(() => shuffledIndices(count), [count]);

  useEffect(() => {
    const cells = fill.current ? (Array.from(fill.current.children) as HTMLElement[]) : [];
    let shown = -1;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top 70%',
      end: 'top 5%',
      onUpdate: ({ progress }) => {
        const k = Math.round(progress * cells.length);
        if (k === shown) return;
        shown = k;
        order.forEach((cellIndex, rank) => {
          cells[cellIndex].style.visibility = rank < k ? 'visible' : 'hidden';
        });
      },
    });
    return () => st.kill();
  }, [order]);

  return (
    <section className="quote" ref={section}>
      <div
        className="quote__fill"
        ref={fill}
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}
        aria-hidden="true"
      >
        {order.map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <HoverPixels cols={grid.cols} rows={grid.rows} className="quote__hover" />
      <blockquote className="quote__inner">
        <p className="display">{t.quote}</p>
      </blockquote>
    </section>
  );
}
