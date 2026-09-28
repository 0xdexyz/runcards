import type { CardTheme } from '../../demo/types';
import { cardExpiry, cardNumber } from '../../lib/cardIdentity';

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 8a6 6 0 0 1 0 8" opacity="0.55" />
      <path d="M11 5a10 10 0 0 1 0 14" opacity="0.8" />
      <path d="M14 2a14 14 0 0 1 0 20" />
    </svg>
  );
}

export default function CardVisual({
  theme,
  accentColor,
  symbol,
  name,
  official,
  id,
  createdAt,
  style,
}: {
  theme: CardTheme;
  accentColor?: string;
  symbol: string;
  name: string;
  official?: boolean;
  id: string;
  createdAt?: number;
  style?: React.CSSProperties;
}) {
  if (official) {
    return (
      <div className="card-tile__swatch card-tile__swatch--official" style={style}>
        <img src="/card-front.webp" alt={name} className="card-visual__official-img" />
        <span className="card-tile__official">OFFICIAL</span>
      </div>
    );
  }

  return (
    <div
      className={`card-tile__swatch theme-${theme}`}
      style={theme === 'custom' && accentColor ? ({ '--accent': accentColor, ...style } as React.CSSProperties) : style}
    >
      <div className="card-visual__sheen" aria-hidden="true" />
      <div className="card-visual__row">
        <span className="card-visual__symbol">{symbol}</span>
        <span className="card-visual__contactless"><ContactlessIcon /></span>
      </div>
      <span className="card-visual__chip" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="card-visual__number">{cardNumber(id)}</span>
      <div className="card-visual__row" style={{ alignItems: 'flex-end' }}>
        <span className="card-visual__name">{name}</span>
        <span className="card-visual__exp">{cardExpiry(id, createdAt)}</span>
      </div>
    </div>
  );
}
