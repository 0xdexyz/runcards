import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Stroke-built running figure with a procedural run cycle.
 * Joints are solved every frame from a single phase value, so there are no assets to load.
 */

type Point = { x: number; y: number };

const L = { thigh: 20, shin: 20, upper: 13, fore: 12, torso: 24, neck: 8 };
const TAU = Math.PI * 2;

function pose(phase: number) {
  const bounce = -2.2 * Math.cos(2 * phase);
  const lean = 0.2 + 0.03 * Math.sin(2 * phase);
  const hip: Point = { x: -3, y: bounce + 2 };
  const along = (from: Point, angle: number, length: number): Point => ({
    x: from.x + Math.sin(angle) * length,
    y: from.y + Math.cos(angle) * length,
  });

  const neck = along(hip, Math.PI - lean, L.torso);
  const head = along(neck, Math.PI - lean - 0.15, L.neck);
  const shoulder = along(hip, Math.PI - lean, L.torso * 0.86);

  // theta is the limb's own phase; sin(theta) > 0 means the thigh swings forward.
  const leg = (theta: number): Point[] => {
    const thigh = 0.1 + 0.62 * Math.sin(theta);
    const bend = 0.2 + 1.45 * Math.pow(Math.max(0, Math.cos(theta + 0.55)), 3);
    const knee = along(hip, thigh, L.thigh);
    const shin = thigh - bend;
    const ankle = along(knee, shin, L.shin);
    const toe = along(ankle, shin + Math.PI / 2 - 0.25 * Math.sin(theta), 6);
    return [hip, knee, ankle, toe];
  };

  // Arms swing against the leg on the same side.
  const arm = (theta: number): Point[] => {
    const upper = -0.08 - 0.75 * Math.sin(theta);
    const elbow = along(shoulder, upper, L.upper);
    const hand = along(elbow, upper + 1.75 + 0.3 * Math.sin(theta), L.fore);
    return [shoulder, elbow, hand];
  };

  return {
    torso: [hip, neck],
    head,
    nearLeg: leg(phase),
    farLeg: leg(phase + Math.PI),
    nearArm: arm(phase),
    farArm: arm(phase + Math.PI),
  };
}

const toPath = (points: Point[]) =>
  points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('');

interface RunnerProps {
  className?: string;
  /** Strides per second. */
  speed?: number;
}

export default function Runner({ className, speed = 1.35 }: RunnerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const farArm = useRef<SVGPathElement>(null);
  const farLeg = useRef<SVGPathElement>(null);
  const torso = useRef<SVGPathElement>(null);
  const head = useRef<SVGCircleElement>(null);
  const nearLeg = useRef<SVGPathElement>(null);
  const nearArm = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(svg);

    const draw = (phase: number) => {
      const p = pose(phase);
      farArm.current?.setAttribute('d', toPath(p.farArm));
      farLeg.current?.setAttribute('d', toPath(p.farLeg));
      torso.current?.setAttribute('d', toPath(p.torso));
      nearLeg.current?.setAttribute('d', toPath(p.nearLeg));
      nearArm.current?.setAttribute('d', toPath(p.nearArm));
      head.current?.setAttribute('cx', p.head.x.toFixed(2));
      head.current?.setAttribute('cy', p.head.y.toFixed(2));
    };

    draw(0.9);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => io.disconnect();

    const tick = (time: number) => {
      if (visible) draw(time * speed * TAU);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [speed]);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="-46 -52 92 104"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g opacity="0.5">
        <path ref={farArm} strokeWidth="6.5" />
        <path ref={farLeg} strokeWidth="8" />
      </g>
      <path ref={torso} strokeWidth="12" />
      <circle ref={head} r="6.5" fill="currentColor" stroke="none" />
      <path ref={nearLeg} strokeWidth="8" />
      <path ref={nearArm} strokeWidth="6.5" />
    </svg>
  );
}
