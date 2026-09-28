/** Deterministic, card-unique display details — cosmetic only, never a real PAN. */

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function cardNumber(id: string): string {
  const seed = hashSeed(id);
  const digits = Array.from({ length: 16 }, (_, i) => {
    const n = (seed >>> (i % 24)) ^ (seed * (i + 7));
    return Math.abs(n) % 10;
  });
  const groups = [];
  for (let i = 0; i < 16; i += 4) groups.push(digits.slice(i, i + 4).join(''));
  return groups.join(' ');
}

export function cardExpiry(id: string, createdAt?: number): string {
  const base = createdAt ?? hashSeed(id);
  const year = (new Date(createdAt ?? Date.now()).getFullYear() + 4) % 100;
  const month = 1 + (hashSeed(`${id}-${base}`) % 12);
  return `${String(month).padStart(2, '0')}/${String(year).padStart(2, '0')}`;
}

export function cardCvv(id: string): string {
  const n = hashSeed(`${id}-cvv`) % 1000;
  return String(n).padStart(3, '0');
}
