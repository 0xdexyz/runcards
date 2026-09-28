export type DiscoverVisual = 'run' | 'maya' | 'jordan' | 'kai' | 'luca' | 'ava';

const RUN_GRID = [
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 1, 0, 0],
];

/** Small chip + contactless glyphs shared across every card face, matching the RUN card language. */
function Chip({ fill }: { fill: string }) {
  return (
    <g transform="translate(56,56)">
      <rect width="88" height="64" rx="8" fill={fill} opacity="0.92" />
      <path d="M0 32H88M29 0V64M59 0V64" stroke="black" strokeOpacity="0.18" strokeWidth="2" />
    </g>
  );
}

function Contactless({ stroke }: { stroke: string }) {
  return (
    <g transform="translate(700,70)" stroke={stroke} strokeWidth="9" strokeLinecap="round" fill="none">
      <path d="M-10 -34A48 48 0 0 1 -10 34" opacity="0.5" />
      <path d="M14 -50A72 72 0 0 1 14 50" opacity="0.75" />
      <path d="M38 -66A96 96 0 0 1 38 66" />
    </g>
  );
}

function Wordmark({ text, fill }: { text: string; fill: string }) {
  return (
    <text x="56" y="430" fontFamily="'Avahivo Variable', sans-serif" fontWeight="900" fontSize="46" letterSpacing="-1" fill={fill}>
      {text}
    </text>
  );
}

export default function DiscoverCardArt({ variant, name }: { variant: DiscoverVisual; name: string }) {
  const common = { viewBox: '0 0 792 500', width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' } as const;

  if (variant === 'run') {
    const cell = 500 / RUN_GRID.length;
    return (
      <svg {...common} aria-hidden="true">
        <rect width="792" height="500" rx="26" fill="#f4f1ea" />
        {RUN_GRID.map((row, r) =>
          row.map((on, c) =>
            on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#ff641c" /> : null,
          ),
        )}
        <Chip fill="#c9c9c9" />
        <Contactless stroke="#0a0a0a" />
        <rect x="20" y="20" width="140" height="40" rx="6" fill="#0a0a0a" />
        <text x="40" y="47" fontFamily="Avahivo Variable, sans-serif" fontWeight="900" fontSize="20" letterSpacing="1" fill="#f4f1ea">
          OFFICIAL
        </text>
        <Wordmark text={name} fill="#0a0a0a" />
      </svg>
    );
  }

  if (variant === 'maya') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="792" height="500" rx="26" fill="#f4f1ea" />
        <path d="M0 200C140 130 260 280 400 210S660 90 792 170" stroke="#0a0a0a" strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M0 260C160 210 300 330 440 260S680 160 792 230" stroke="#0a0a0a" strokeWidth="2" fill="none" opacity="0.35" />
        <rect x="700" y="360" width="36" height="36" fill="#ff641c" />
        <Chip fill="#c9c9c9" />
        <Contactless stroke="#0a0a0a" />
        <Wordmark text={name} fill="#0a0a0a" />
      </svg>
    );
  }

  if (variant === 'jordan') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="792" height="500" rx="26" fill="#0a0a0a" />
        <g stroke="#ff641c" fill="none" strokeWidth="2.5">
          <circle cx="560" cy="180" r="70" opacity="0.9" />
          <circle cx="560" cy="180" r="120" opacity="0.55" />
          <circle cx="560" cy="180" r="170" opacity="0.3" />
        </g>
        <circle cx="630" cy="110" r="9" fill="#ff641c" />
        <Chip fill="#3a3a3a" />
        <Contactless stroke="#f4f1ea" />
        <Wordmark text={name} fill="#f4f1ea" />
      </svg>
    );
  }

  if (variant === 'kai') {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="kaiMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e6e6ea" />
            <stop offset="1" stopColor="#8f8f97" />
          </linearGradient>
        </defs>
        <rect width="792" height="500" rx="26" fill="#1c1c20" />
        <polygon points="560,90 660,140 660,260 560,320 460,260 460,140" fill="none" stroke="url(#kaiMetal)" strokeWidth="3" opacity="0.85" />
        <polygon points="560,140 610,165 610,240 560,270 510,240 510,165" fill="none" stroke="url(#kaiMetal)" strokeWidth="2" opacity="0.6" />
        <Chip fill="url(#kaiMetal)" />
        <Contactless stroke="#cfcfd4" />
        <Wordmark text={name} fill="#e8e8ec" />
      </svg>
    );
  }

  if (variant === 'luca') {
    return (
      <svg {...common} aria-hidden="true">
        <rect width="792" height="500" rx="26" fill="#faf8f2" />
        <path
          d="M0 250H160L200 150L250 340L300 200L340 250H792"
          stroke="#ff641c"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <Chip fill="#d8d8dc" />
        <Contactless stroke="#0a0a0a" />
        <Wordmark text={name} fill="#0a0a0a" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect width="792" height="500" rx="26" fill="#efece3" />
      <polygon points="792,0 792,260 560,0" fill="#0a0a0a" />
      <polygon points="792,60 792,260 640,60" fill="#ff641c" opacity="0.9" />
      <polygon points="500,500 700,500 600,360" fill="#0a0a0a" opacity="0.08" />
      <Chip fill="#cfcfd4" />
      <Contactless stroke="#0a0a0a" />
      <Wordmark text={name} fill="#0a0a0a" />
    </svg>
  );
}
