/** Simulated network latency, used by every mock service so loading states feel real. */
export function delay(ms = 900) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
