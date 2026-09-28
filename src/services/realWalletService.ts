/**
 * REAL Phantom wallet integration — no mocking here. Phantom injects a Solana provider
 * on `window`; this talks to it directly (no @solana/web3.js needed for connect/disconnect).
 * Docs: https://docs.phantom.app/solana/establishing-a-connection
 */

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array, display?: 'utf8' | 'hex'): Promise<{ signature: Uint8Array }>;
  on(event: 'connect' | 'disconnect' | 'accountChanged', handler: (...args: unknown[]) => void): void;
  off?(event: 'connect' | 'disconnect' | 'accountChanged', handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  }
}

export class PhantomNotInstalledError extends Error {
  constructor() {
    super('Phantom is not installed.');
    this.name = 'PhantomNotInstalledError';
  }
}

export class WalletRejectedError extends Error {
  constructor() {
    super('Wallet connection was cancelled.');
    this.name = 'WalletRejectedError';
  }
}

export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null;
  const injected = window.phantom?.solana ?? window.solana;
  return injected?.isPhantom ? injected : null;
}

export function isPhantomInstalled(): boolean {
  return getPhantomProvider() !== null;
}

/**
 * Phantom injects `window.phantom.solana` asynchronously after page load, so a single
 * synchronous check right at mount can race the extension and wrongly report "not installed".
 * This polls briefly (and listens for Phantom's own ready event) before giving up.
 */
export function waitForPhantomProvider(timeoutMs = 2000): Promise<PhantomProvider | null> {
  const existing = getPhantomProvider();
  if (existing) return Promise.resolve(existing);
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (provider: PhantomProvider | null) => {
      if (settled) return;
      settled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      window.removeEventListener('phantom#initialized', onReady);
      resolve(provider);
    };
    const onReady = () => finish(getPhantomProvider());
    window.addEventListener('phantom#initialized', onReady);
    const interval = window.setInterval(() => {
      const provider = getPhantomProvider();
      if (provider) finish(provider);
    }, 100);
    const timeout = window.setTimeout(() => finish(getPhantomProvider()), timeoutMs);
  });
}

/** Opens the real Phantom approval popup and waits for the user to approve or reject it. */
export async function connectPhantom(): Promise<{ address: string; provider: PhantomProvider }> {
  const provider = getPhantomProvider();
  if (!provider) throw new PhantomNotInstalledError();
  try {
    const res = await provider.connect();
    return { address: res.publicKey.toString(), provider };
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4001) throw new WalletRejectedError();
    throw err;
  }
}

/** Silent reconnect using Phantom's own remembered trust — no popup, used on page load. */
export async function reconnectPhantomIfTrusted(): Promise<string | null> {
  const provider = getPhantomProvider();
  if (!provider) return null;
  try {
    const res = await provider.connect({ onlyIfTrusted: true });
    return res.publicKey.toString();
  } catch {
    return null;
  }
}

export async function disconnectPhantom(): Promise<void> {
  const provider = getPhantomProvider();
  if (!provider) return;
  await provider.disconnect();
}

/**
 * Opens Phantom's real signature-request popup so the user genuinely confirms an action
 * with their wallet. This only ever signs a plain text message — it is not a transaction,
 * so no funds, tokens, or fees are ever involved, on any network.
 */
export async function confirmWithWalletSignature(message: string): Promise<void> {
  const provider = getPhantomProvider();
  if (!provider) throw new PhantomNotInstalledError();
  try {
    // The app's own "connected" state can outlive Phantom's real session (e.g. the
    // extension was locked, the account was switched, or this state was restored from
    // storage). Re-asserting connect() first guarantees signMessage has an authorized
    // session to work with — Phantom resolves it instantly if one already exists.
    await provider.connect();
    const encoded = new TextEncoder().encode(message);
    await provider.signMessage(encoded, 'utf8');
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4001) throw new WalletRejectedError();
    if (code === 4100) throw new Error('Your wallet session expired. Reconnect your wallet and try again.');
    throw err;
  }
}
