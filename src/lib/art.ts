import { useSyncExternalStore } from 'react';
import { mulberry32 } from './random';

/**
 * Procedural artwork used for the gallery and the project covers.
 * Everything is drawn on a canvas at load time, so the repo ships no images.
 * Replace `loadArt` with real image URLs when you have your own work.
 */

export interface ArtSet {
  gallery: string[];
  covers: Record<string, string>;
}

let current: ArtSet = { gallery: [], covers: {} };
let pending: Promise<ArtSet> | null = null;
const subscribers = new Set<() => void>();

const DISPLAY = '"Archivo Variable", "Arial Black", sans-serif';
const GROTESK = '"Inter Tight Variable", "Helvetica Neue", Arial, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';

type Ctx = CanvasRenderingContext2D;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')!];
}

function toUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/jpeg', 0.88)),
      'image/jpeg',
      0.88,
    );
  });
}

function grain(ctx: Ctx, w: number, h: number, amount: number, seed: number) {
  const rand = mulberry32(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function vignette(ctx: Ctx, w: number, h: number, strength: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function setFont(ctx: Ctx, font: string, opts: { stretch?: CanvasFontStretch; spacing?: string } = {}) {
  ctx.font = font;
  if ('fontStretch' in ctx) ctx.fontStretch = opts.stretch ?? 'normal';
  if ('letterSpacing' in ctx) ctx.letterSpacing = opts.spacing ?? '0px';
}

const gray = (v: number) => {
  const c = Math.round(Math.min(255, Math.max(0, v)));
  return `rgb(${c},${c},${c})`;
};

/* ---------- gallery: moody studio "photographs" (shown in grayscale) ---------- */

function sphereStudy() {
  const W = 800;
  const H = 1000;
  const [canvas, ctx] = makeCanvas(W, H);
  const horizon = 640;

  let g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#8f8f8d');
  g.addColorStop(1, '#d4d4d2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);

  g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, '#c2c2c0');
  g.addColorStop(1, '#646462');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, horizon - 3, W, 5);

  ctx.save();
  ctx.translate(440, 800);
  ctx.scale(1, 0.2);
  g = ctx.createRadialGradient(0, 0, 10, 0, 0, 320);
  g.addColorStop(0, 'rgba(0,0,0,0.6)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const cx = 400;
  const cy = 560;
  const r = 235;
  g = ctx.createRadialGradient(cx - 95, cy - 120, 16, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.3, '#dcdcda');
  g.addColorStop(0.78, '#686866');
  g.addColorStop(1, '#353533');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 3, Math.PI * 0.08, Math.PI * 0.62);
  ctx.stroke();

  vignette(ctx, W, H, 0.4);
  grain(ctx, W, H, 28, 11);
  return canvas;
}

function archStudy() {
  const W = 800;
  const H = 1000;
  const [canvas, ctx] = makeCanvas(W, H);
  ctx.fillStyle = '#e2e2e0';
  ctx.fillRect(0, 0, W, H);

  const layers = 7;
  for (let i = 0; i < layers; i++) {
    const k = i / layers;
    const w = 660 * (1 - k * 0.78);
    const h = 900 * (1 - k * 0.62);
    const x = W / 2 - w / 2;
    const bottom = H - k * 190;
    const top = bottom - h;
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top + w / 2);
    ctx.arc(W / 2, top + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, bottom);
    ctx.closePath();
    const base = i % 2 === 0 ? 70 + i * 16 : 214 - i * 9;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, gray(base - 38));
    g.addColorStop(0.55, gray(base + 6));
    g.addColorStop(1, gray(base + 30));
    ctx.fillStyle = g;
    ctx.fill();
  }

  const light = ctx.createLinearGradient(0, 0, W, H);
  light.addColorStop(0, 'rgba(255,255,255,0.28)');
  light.addColorStop(0.5, 'rgba(255,255,255,0)');
  light.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);

  vignette(ctx, W, H, 0.3);
  grain(ctx, W, H, 24, 23);
  return canvas;
}

function duneStudy() {
  const W = 800;
  const H = 1000;
  const [canvas, ctx] = makeCanvas(W, H);

  let g = ctx.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, '#a4a4a2');
  g.addColorStop(1, '#efefed');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createRadialGradient(560, 300, 10, 560, 300, 190);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 600);

  const rand = mulberry32(5);
  const bands = 22;
  for (let i = 0; i < bands; i++) {
    const y0 = 440 + i * 27;
    const f1 = 0.004 + rand() * 0.006;
    const f2 = 0.012 + rand() * 0.01;
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;
    const a1 = 18 + i * 1.6;
    const a2 = 5 + rand() * 6;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      ctx.lineTo(x, y0 + Math.sin(x * f1 + p1) * a1 + Math.sin(x * f2 + p2) * a2);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    const tone = 214 - i * 7.5;
    const band = ctx.createLinearGradient(0, y0 - a1, 0, y0 + 90);
    band.addColorStop(0, gray(tone + 22));
    band.addColorStop(1, gray(tone - 40));
    ctx.fillStyle = band;
    ctx.fill();
  }

  vignette(ctx, W, H, 0.35);
  grain(ctx, W, H, 26, 37);
  return canvas;
}

/* ---------- project covers ---------- */

function monoLabel(ctx: Ctx, text: string, x: number, y: number, color: string, align: CanvasTextAlign = 'left') {
  setFont(ctx, `500 26px ${MONO}`, { spacing: '1px' });
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text.toUpperCase(), x, y);
}

function coverNorthwind() {
  const S = 1200;
  const [canvas, ctx] = makeCanvas(S, S);
  ctx.fillStyle = '#ff641c';
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(5,5,5,0.16)';
  ctx.lineWidth = 2;
  for (let p = 100; p < S; p += 100) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, S);
    ctx.moveTo(0, p);
    ctx.lineTo(S, p);
    ctx.stroke();
  }

  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(780, 460, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ff641c';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(780, 460, 196, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ff641c';
  ctx.beginPath();
  ctx.arc(780, 460, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(5,5,5,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, S);
  ctx.lineTo(S, 0);
  ctx.stroke();

  setFont(ctx, `900 238px ${DISPLAY}`, { stretch: 'expanded', spacing: '-12px' });
  ctx.fillStyle = '#050505';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('NORTH', 44, 960);
  ctx.fillText('WIND', 44, 1150);

  monoLabel(ctx, '(01)', 50, 50, '#050505');
  monoLabel(ctx, 'Studio website', 600, 50, '#050505', 'center');
  monoLabel(ctx, '2026', S - 50, 50, '#050505', 'right');

  grain(ctx, S, S, 18, 101);
  return canvas;
}

function coverHalcyon() {
  const S = 1200;
  const [canvas, ctx] = makeCanvas(S, S);
  let g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#0aa4ee');
  g.addColorStop(1, '#062f78');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  g = ctx.createRadialGradient(640, 430, 20, 640, 430, 420);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 120);
  ctx.lineTo(S - 50, 120);
  ctx.moveTo(50, S - 250);
  ctx.lineTo(S - 50, S - 250);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(400, 120);
  ctx.lineTo(400, S - 250);
  ctx.moveTo(800, 120);
  ctx.lineTo(800, S - 250);
  ctx.stroke();

  // faux body-copy columns
  const rand = mulberry32(77);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (const x of [60, 880]) {
    for (let line = 0; line < 14; line++) {
      const short = line % 5 === 4;
      ctx.fillRect(x, 180 + line * 34, short ? 90 + rand() * 60 : 220 + rand() * 40, 10);
    }
  }

  setFont(ctx, `600 250px ${GROTESK}`, { spacing: '-10px' });
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Halcyon', 40, S - 40);

  monoLabel(ctx, 'Issue 07', 50, 60, '#ffffff');
  monoLabel(ctx, 'Editorial system', 600, 60, '#ffffff', 'center');
  monoLabel(ctx, '2025', S - 50, 60, '#ffffff', 'right');

  grain(ctx, S, S, 16, 202);
  return canvas;
}

function coverParallax() {
  const S = 1200;
  const [canvas, ctx] = makeCanvas(S, S);
  ctx.fillStyle = '#0e0e0e';
  ctx.fillRect(0, 0, S, S);

  const cx = 640;
  const plates = 6;
  const w = 720;
  const h = 360;
  const depth = 28;
  for (let i = 0; i < plates; i++) {
    const cy = 900 - i * 82;
    const top = i === plates - 1;
    const face = top ? '#ff641c' : gray(26 + i * 9);
    const side = top ? '#b8410f' : gray(14 + i * 6);

    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy);
    ctx.lineTo(cx, cy + h / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.lineTo(cx + w / 2, cy + depth);
    ctx.lineTo(cx, cy + h / 2 + depth);
    ctx.lineTo(cx - w / 2, cy + depth);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.lineTo(cx, cy + h / 2);
    ctx.lineTo(cx - w / 2, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(219,219,218,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  setFont(ctx, `900 150px ${DISPLAY}`, { stretch: 'expanded', spacing: '-7px' });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#dbdbda';
  ctx.fillText('PARALLAX', 44, 290);
  ctx.fillStyle = '#ff641c';
  ctx.fillText('LABS', 44, 430);

  monoLabel(ctx, '(03)', 50, 50, '#dbdbda');
  monoLabel(ctx, 'WebGL + motion', 600, 50, '#dbdbda', 'center');
  monoLabel(ctx, '2025', S - 50, 50, '#dbdbda', 'right');

  grain(ctx, S, S, 20, 303);
  return canvas;
}

async function build(): Promise<ArtSet> {
  await Promise.all([
    document.fonts.load(`900 100px ${DISPLAY}`),
    document.fonts.load(`600 100px ${GROTESK}`),
    document.fonts.load(`500 20px ${MONO}`),
  ]).catch(() => undefined);

  const [gallery, covers] = await Promise.all([
    Promise.all([sphereStudy(), archStudy(), duneStudy()].map(toUrl)),
    Promise.all([coverNorthwind(), coverHalcyon(), coverParallax()].map(toUrl)),
  ]);

  return {
    gallery,
    covers: { northwind: covers[0], halcyon: covers[1], parallax: covers[2] },
  };
}

export function loadArt() {
  if (!pending) {
    pending = build().then((set) => {
      current = set;
      subscribers.forEach((fn) => fn());
      return set;
    });
  }
  return pending;
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

export function useArt() {
  return useSyncExternalStore(subscribe, () => current);
}
