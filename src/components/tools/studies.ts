import type { ToolId } from '../../content';

/**
 * Live canvas studies for the Tools reel. Each one draws into its own canvas
 * and only animates while `running` is true.
 */

export interface Study {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, pointer: { x: number; y: number }) => void;
  setup?: (w: number, h: number) => void;
}

const BG = '#dbdbda';
const INK = '#050505';
const ORANGE = '#ff641c';

/* cheap smooth 2D value noise */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function flowField(): Study {
  let particles: { x: number; y: number; hot: boolean }[] = [];
  let fresh = true;
  return {
    setup(w, h) {
      particles = Array.from({ length: 1400 }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, hot: i % 23 === 0 }));
      fresh = true;
    },
    draw(ctx, w, h, t) {
      if (fresh) {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);
        fresh = false;
      }
      ctx.fillStyle = 'rgba(219,219,218,0.07)';
      ctx.fillRect(0, 0, w, h);
      const scale = 0.0028;
      for (const p of particles) {
        const angle = noise(p.x * scale, p.y * scale + t * 0.08) * Math.PI * 4;
        p.x += Math.cos(angle) * 1.4;
        p.y += Math.sin(angle) * 1.4;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }
        ctx.fillStyle = p.hot ? ORANGE : INK;
        ctx.fillRect(p.x, p.y, p.hot ? 2.2 : 1.3, p.hot ? 2.2 : 1.3);
      }
    },
  };
}

function ditherWave(): Study {
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const low = document.createElement('canvas');
  const lctx = low.getContext('2d')!;
  let img: ImageData | null = null;
  return {
    setup(w, h) {
      low.width = Math.max(8, Math.round(w / 4));
      low.height = Math.max(8, Math.round(h / 4));
      img = lctx.createImageData(low.width, low.height);
    },
    draw(ctx, w, h, t, pointer) {
      if (!img) return;
      const lw = low.width;
      const lh = low.height;
      const px = pointer.x * lw;
      const py = pointer.y * lh;
      const d = img.data;
      for (let y = 0; y < lh; y++) {
        for (let x = 0; x < lw; x++) {
          const r = Math.hypot(x - px, y - py);
          let v = Math.sin(x * 0.09 + t * 1.3) + Math.sin(y * 0.11 - t * 0.9) + Math.sin(r * 0.16 - t * 2.2);
          v = (v + 3) / 6;
          const on = v > bayer[(y % 4) * 4 + (x % 4)];
          const i = (y * lw + x) * 4;
          const c = on ? 219 : 5;
          d[i] = c;
          d[i + 1] = on ? 219 : 5;
          d[i + 2] = on ? 218 : 5;
          d[i + 3] = 255;
        }
      }
      lctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(low, 0, 0, w, h);
    },
  };
}

function glyphGrid(): Study {
  const ramp = ' .·:-=+*%#@';
  return {
    draw(ctx, w, h, t, pointer) {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      const cols = 44;
      const cell = w / cols;
      const rows = Math.ceil(h / cell);
      ctx.font = `600 ${cell * 0.9}px "Geist Mono Variable", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cx = pointer.x * cols;
      const cy = pointer.y * rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const r = Math.hypot(x - cx, (y - cy) * 1.1);
          const wave = Math.sin(r * 0.55 - t * 3.2) * 0.5 + 0.5;
          const fall = Math.max(0, 1 - r / 26);
          const v = wave * fall;
          const ch = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
          if (ch === ' ') continue;
          ctx.fillStyle = v > 0.82 ? ORANGE : INK;
          ctx.fillText(ch, x * cell + cell / 2, y * cell + cell / 2);
        }
      }
    },
  };
}

function orbit(): Study {
  const count = 900;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    return [Math.cos(a) * r, y, Math.sin(a) * r] as const;
  });
  const ring = Array.from({ length: 220 }, (_, i) => {
    const a = (i / 220) * Math.PI * 2;
    return [Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55] as const;
  });
  return {
    draw(ctx, w, h, t, pointer) {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      const ry = t * 0.35 + (pointer.x - 0.5) * 1.2;
      const rx = 0.35 + (pointer.y - 0.5) * 0.6;
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const size = Math.min(w, h) * 0.3;
      const plot = (p: readonly [number, number, number], color: string, base: number) => {
        const x1 = p[0] * cy - p[2] * sy;
        const z1 = p[0] * sy + p[2] * cy;
        const y2 = p[1] * cx - z1 * sx;
        const z2 = p[1] * sx + z1 * cx;
        const persp = 3 / (3 + z2);
        const r = base * persp * (z2 < 0 ? 1.25 : 0.7);
        ctx.globalAlpha = z2 < 0 ? 1 : 0.35;
        ctx.fillStyle = color;
        ctx.fillRect(w / 2 + x1 * size * persp - r / 2, h / 2 + y2 * size * persp - r / 2, r, r);
      };
      points.forEach((p) => plot(p, INK, 2.4));
      ring.forEach((p) => plot(p, ORANGE, 3));
      ctx.globalAlpha = 1;
    },
  };
}

export function createStudy(id: Exclude<ToolId, 'runner'>): Study {
  switch (id) {
    case 'flow':
      return flowField();
    case 'dither':
      return ditherWave();
    case 'glyph':
      return glyphGrid();
    case 'orbit':
      return orbit();
  }
}
