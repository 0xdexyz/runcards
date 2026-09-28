import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CROSSES = ['tl', 'tc', 'tr', 'bl', 'bc', 'br'] as const;

/** Fixed registration marks; the centre pair collapses while the page scrolls. */
export function CornerCrosses() {
  return (
    <div className="crosses" aria-hidden="true">
      {CROSSES.map((pos) => (
        <span key={pos} className={`cross cross--${pos}`} />
      ))}
    </div>
  );
}

/** Animated film grain multiplied over the whole page. */
export function NoiseLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const tile = 128;
    const patterns = Array.from({ length: 5 }, () => {
      const c = document.createElement('canvas');
      c.width = c.height = tile;
      const x = c.getContext('2d')!;
      const img = x.createImageData(tile, tile);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      return ctx.createPattern(c, 'repeat')!;
    });

    let frame = 0;
    const paint = () => {
      ctx.save();
      ctx.translate(-Math.random() * tile, -Math.random() * tile);
      ctx.fillStyle = patterns[frame++ % patterns.length];
      ctx.fillRect(0, 0, canvas.width + tile, canvas.height + tile);
      ctx.restore();
    };
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      paint();
    };
    resize();
    window.addEventListener('resize', resize);

    let last = 0;
    const tick = (time: number) => {
      if (time - last < 0.07) return;
      last = time;
      paint();
    };
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate) gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('resize', resize);
      gsap.ticker.remove(tick);
    };
  }, []);

  return <canvas ref={ref} className="noise" aria-hidden="true" />;
}

/** Orange dot that trails the pointer, inverted against whatever it sits over. */
export function CursorOrb() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.classList.add('is-visible');
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const leave = () => {
      el.classList.remove('is-visible');
      shown = false;
    };
    const down = () => el.classList.add('is-pressed');
    const up = () => el.classList.remove('is-pressed');

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <div ref={ref} className="cursor-orb" aria-hidden="true" />;
}
