import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shuffledIndices } from '../lib/random';

/* ---------- RollButton: bordered button whose fill rises and text rolls ---------- */

export function RollInner({ text }: { text: string }) {
  return (
    <>
      <span className="roll-btn__fill" aria-hidden="true" />
      <span className="roll-btn__text" data-text={text}>
        <span>{text}</span>
      </span>
    </>
  );
}

export function RollButton({
  text,
  active,
  className = '',
  ...rest
}: { text: string; active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`roll-btn${active ? ' is-active' : ''} ${className}`} {...rest}>
      <RollInner text={text} />
    </button>
  );
}

export function RollLink({ text, className = '', ...rest }: { text: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`roll-btn ${className}`} {...rest}>
      <RollInner text={text} />
    </a>
  );
}

/* ---------- Scribble: vertical rule with a marker that travels with scroll ---------- */

export function Scribble({ tone = 'orange' }: { tone?: 'orange' | 'ink' }) {
  const ref = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tween = gsap.fromTo(
      marker.current,
      { top: '0%', autoAlpha: 0 },
      {
        top: '100%',
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 35%', scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className={`scribble scribble--${tone}`} ref={ref} aria-hidden="true">
      <span className="scribble__line" />
      <span className="scribble__marker" ref={marker} />
    </div>
  );
}

/* ---------- RollHeading: words that rise in on scroll and roll on hover ---------- */

export function RollHeading({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fronts = el.querySelectorAll('.roll__front');
    gsap.set(fronts, { yPercent: 105 });
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () =>
        gsap.to(fronts, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, overwrite: true }),
      onLeaveBack: () =>
        gsap.to(fronts, { yPercent: 105, duration: 0.4, ease: 'power2.in', stagger: 0.02, overwrite: true }),
    });
    if (st.scroll() >= st.start) gsap.set(fronts, { yPercent: 0 });
    return () => st.kill();
  }, [text]);

  const roll = (word: HTMLElement) => {
    const front = word.querySelector('.roll__front');
    const back = word.querySelector('.roll__back');
    if (!front || !back || gsap.isTweening(front) || gsap.getProperty(front, 'yPercent') !== 0) return;
    gsap
      .timeline({ onComplete: () => gsap.set(front, { yPercent: 0 }) })
      .fromTo(front, { yPercent: 0 }, { yPercent: 105, duration: 0.55, ease: 'expo.inOut' })
      .fromTo(back, { yPercent: -105 }, { yPercent: 0, duration: 0.55, ease: 'expo.inOut' }, 0)
      .set(back, { yPercent: -105 });
  };

  return (
    <h2 ref={ref} className={`roll ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="roll__unit" aria-hidden="true">
          <span className="roll__word" onMouseEnter={(e) => roll(e.currentTarget)}>
            <span className="roll__front">{w}</span>
            <span className="roll__back">{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </h2>
  );
}

/* ---------- PixelReveal: image uncovered by cells that blink away in random order ---------- */

export function PixelReveal({
  src,
  alt,
  cols = 6,
  rows = 8,
  className = '',
}: {
  src: string;
  alt: string;
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cells = cover.current?.children;
    if (!cells || !ref.current) return;
    gsap.set(cells, { autoAlpha: 1 });
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 82%',
      onEnter: () =>
        gsap.to(cells, { autoAlpha: 0, duration: 0.01, stagger: { amount: 0.9, from: 'random' }, overwrite: true }),
      onLeaveBack: () =>
        gsap.to(cells, { autoAlpha: 1, duration: 0.01, stagger: { amount: 0.4, from: 'random' }, overwrite: true }),
    });
    const parallax = gsap.fromTo(
      image.current,
      { yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
    return () => {
      st.kill();
      parallax.scrollTrigger?.kill();
      parallax.kill();
    };
  }, []);

  return (
    <figure ref={ref} className={`pxreveal ${className}`}>
      <div className="pxreveal__image" ref={image} role="img" aria-label={alt} style={{ backgroundImage: src ? `url(${src})` : undefined }} />
      <div className="pxreveal__cover" ref={cover} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
        {Array.from({ length: cols * rows }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </figure>
  );
}

/* ---------- PixelSwap: cross-dissolves between images one cell at a time ---------- */

export function PixelSwap({ src, alt, cols = 8, rows = 9 }: { src: string; alt: string; cols?: number; rows?: number }) {
  const [base, setBase] = useState(src);
  const layer = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!src || src === base) return;
    const cells = layer.current ? Array.from(layer.current.children) as HTMLElement[] : [];
    if (!base || !cells.length) {
      setBase(src);
      return;
    }
    timeline.current?.kill();
    cells.forEach((c) => {
      c.style.backgroundImage = `url(${src})`;
      c.style.visibility = 'hidden';
    });
    const order = shuffledIndices(cells.length).map((i) => cells[i]);
    timeline.current = gsap.timeline({
      onComplete: () => {
        setBase(src);
        requestAnimationFrame(() => cells.forEach((c) => (c.style.visibility = 'hidden')));
      },
    });
    timeline.current.to(order, { visibility: 'visible', duration: 0.01, stagger: 0.5 / cells.length });
    // base is intentionally read from the render that triggered the swap
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => void timeline.current?.kill(), []);

  return (
    <div className="pxswap">
      <div className="pxswap__base" role="img" aria-label={alt} style={{ backgroundImage: base ? `url(${base})` : undefined }} />
      <div className="pxswap__layer" ref={layer} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          return (
            <span
              key={i}
              style={{
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- HoverPixels: blue cells that light up under the pointer and fade ---------- */

export function HoverPixels({ cols, rows, className = '' }: { cols: number; rows: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    const host = grid?.parentElement;
    if (!grid || !host || !window.matchMedia('(pointer: fine)').matches) return;
    const cells = Array.from(grid.children) as HTMLElement[];
    const timers = new Map<number, number>();

    const light = (i: number, hold: number) => {
      const cell = cells[i];
      if (!cell) return;
      cell.style.visibility = 'visible';
      window.clearTimeout(timers.get(i));
      timers.set(i, window.setTimeout(() => (cell.style.visibility = 'hidden'), hold));
    };

    const move = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const c = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
      const r = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      light(r * cols + c, 260 + Math.random() * 180);
      if (Math.random() < 0.35) {
        const nc = Math.min(cols - 1, Math.max(0, c + Math.round(Math.random() * 2 - 1)));
        const nr = Math.min(rows - 1, Math.max(0, r + Math.round(Math.random() * 2 - 1)));
        light(nr * cols + nc, 160 + Math.random() * 140);
      }
    };

    host.addEventListener('pointermove', move);
    return () => {
      host.removeEventListener('pointermove', move);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [cols, rows]);

  return (
    <div ref={ref} className={`hover-px ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
      {Array.from({ length: cols * rows }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

export function Mask({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`mask ${className}`}>{children}</span>;
}
