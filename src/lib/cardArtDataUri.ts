import type { DiscoverVisual } from '../components/tools/DiscoverCardArt';

/**
 * String-template twin of components/tools/DiscoverCardArt.tsx, producing the same five
 * card faces as a data URI so they can feed PixelSwap/PixelReveal (which composite via
 * CSS background-image, not React children) without touching that animation code.
 */

const CHIP = (fill: string) =>
  `<g transform="translate(56,56)"><rect width="88" height="64" rx="8" fill="${fill}" opacity="0.92"/><path d="M0 32H88M29 0V64M59 0V64" stroke="black" stroke-opacity="0.18" stroke-width="2"/></g>`;

const CONTACTLESS = (stroke: string) =>
  `<g transform="translate(700,70)" stroke="${stroke}" stroke-width="9" stroke-linecap="round" fill="none"><path d="M-10 -34A48 48 0 0 1 -10 34" opacity="0.5"/><path d="M14 -50A72 72 0 0 1 14 50" opacity="0.75"/><path d="M38 -66A96 96 0 0 1 38 66"/></g>`;

const WORDMARK = (text: string, fill: string) =>
  `<text x="56" y="430" font-family="Avahivo Variable, sans-serif" font-weight="900" font-size="46" letter-spacing="-1" fill="${fill}">${text}</text>`;

const RUN_GRID: number[][] = [
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 1, 0, 0],
];

function runGridSquares(): string {
  const cell = 500 / RUN_GRID.length;
  const squares: string[] = [];
  RUN_GRID.forEach((row, r) => {
    row.forEach((on, c) => {
      if (on) squares.push(`<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="#ff641c"/>`);
    });
  });
  return squares.join('');
}

function svgFor(variant: DiscoverVisual, name: string): string {
  const label = name.toUpperCase();
  switch (variant) {
    case 'run':
      return `<rect width="792" height="500" rx="26" fill="#f4f1ea"/>
        ${runGridSquares()}
        ${CHIP('#c9c9c9')}${CONTACTLESS('#0a0a0a')}
        <rect x="20" y="20" width="140" height="40" rx="6" fill="#0a0a0a"/>
        <text x="40" y="47" font-family="Avahivo Variable, sans-serif" font-weight="900" font-size="20" letter-spacing="1" fill="#f4f1ea">OFFICIAL</text>
        ${WORDMARK(label, '#0a0a0a')}`;
    case 'maya':
      return `<rect width="792" height="500" rx="26" fill="#f4f1ea"/>
        <path d="M0 200C140 130 260 280 400 210S660 90 792 170" stroke="#0a0a0a" stroke-width="3" fill="none" opacity="0.7"/>
        <path d="M0 260C160 210 300 330 440 260S680 160 792 230" stroke="#0a0a0a" stroke-width="2" fill="none" opacity="0.35"/>
        <rect x="700" y="360" width="36" height="36" fill="#ff641c"/>
        ${CHIP('#c9c9c9')}${CONTACTLESS('#0a0a0a')}${WORDMARK(label, '#0a0a0a')}`;
    case 'jordan':
      return `<rect width="792" height="500" rx="26" fill="#0a0a0a"/>
        <g stroke="#ff641c" fill="none" stroke-width="2.5">
          <circle cx="560" cy="180" r="70" opacity="0.9"/>
          <circle cx="560" cy="180" r="120" opacity="0.55"/>
          <circle cx="560" cy="180" r="170" opacity="0.3"/>
        </g>
        <circle cx="630" cy="110" r="9" fill="#ff641c"/>
        ${CHIP('#3a3a3a')}${CONTACTLESS('#f4f1ea')}${WORDMARK(label, '#f4f1ea')}`;
    case 'kai':
      return `<defs><linearGradient id="vm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e6ea"/><stop offset="1" stop-color="#8f8f97"/></linearGradient></defs>
        <rect width="792" height="500" rx="26" fill="#1c1c20"/>
        <polygon points="560,90 660,140 660,260 560,320 460,260 460,140" fill="none" stroke="url(#vm)" stroke-width="3" opacity="0.85"/>
        <polygon points="560,140 610,165 610,240 560,270 510,240 510,165" fill="none" stroke="url(#vm)" stroke-width="2" opacity="0.6"/>
        ${CHIP('url(#vm)')}${CONTACTLESS('#cfcfd4')}${WORDMARK(label, '#e8e8ec')}`;
    case 'luca':
      return `<rect width="792" height="500" rx="26" fill="#faf8f2"/>
        <path d="M0 250H160L200 150L250 340L300 200L340 250H792" stroke="#ff641c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
        ${CHIP('#d8d8dc')}${CONTACTLESS('#0a0a0a')}${WORDMARK(label, '#0a0a0a')}`;
    case 'ava':
    default:
      return `<rect width="792" height="500" rx="26" fill="#efece3"/>
        <polygon points="792,0 792,260 560,0" fill="#0a0a0a"/>
        <polygon points="792,60 792,260 640,60" fill="#ff641c" opacity="0.9"/>
        <polygon points="500,500 700,500 600,360" fill="#0a0a0a" opacity="0.08"/>
        ${CHIP('#cfcfd4')}${CONTACTLESS('#0a0a0a')}${WORDMARK(label, '#0a0a0a')}`;
  }
}

export function cardArtDataUri(variant: DiscoverVisual, name: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 792 500">${svgFor(variant, name)}</svg>`;
  // encodeURIComponent leaves ( ) unescaped, which breaks unquoted CSS url(...) parsing
  // once the SVG's own transform="translate(...)" parens land inside it.
  const encoded = encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `data:image/svg+xml,${encoded}`;
}
