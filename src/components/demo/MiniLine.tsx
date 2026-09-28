/** Lightweight inline line chart — no charting library, matches the site's flat mono aesthetic. */
export default function MiniLine({ values, height = 120 }: { values: number[]; height?: number }) {
  const width = Math.max(1, values.length - 1) * 80;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(1, max - min);
  const pad = 8;

  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="mini-line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--orange)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--orange)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mini-line-fill)" stroke="none" />
      <path d={path} fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4 : 2.5} fill={i === points.length - 1 ? 'var(--orange)' : 'var(--ink)'} />
      ))}
    </svg>
  );
}
