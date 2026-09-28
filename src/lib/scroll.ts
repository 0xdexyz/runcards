import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollState {
  scroll: number;
  direction: number;
  velocity: number;
}

type Listener = (state: ScrollState) => void;

let lenis: Lenis | null = null;
const listeners = new Set<Listener>();

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Boots Lenis, wires it into GSAP's ticker and ScrollTrigger. Returns a teardown. */
export function initSmoothScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const reduce = prefersReducedMotion();
  const instance = new Lenis({ lerp: reduce ? 1 : 0.1, smoothWheel: !reduce });
  lenis = instance;

  const root = document.documentElement;
  let idle = 0;

  instance.on('scroll', (l: Lenis) => {
    ScrollTrigger.update();
    const state = { scroll: l.scroll, direction: l.direction, velocity: l.velocity };
    listeners.forEach((fn) => fn(state));
    root.classList.add('is-scrolling');
    window.clearTimeout(idle);
    idle = window.setTimeout(() => root.classList.remove('is-scrolling'), 160);
  });

  const raf = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    window.clearTimeout(idle);
    root.classList.remove('is-scrolling');
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

export function onScroll(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function lockScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Jumps without easing — used behind the pixel transition. */
export function jumpTo(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
  ScrollTrigger.update();
}
