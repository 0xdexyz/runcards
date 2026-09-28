import { useEffect, useRef, useState } from 'react';
import { useDemo, useDemoDispatch } from '../../demo/store';
import { useClickOutside } from '../../lib/useClickOutside';
import { reconnectPhantomIfTrusted, getPhantomProvider } from '../../services/realWalletService';
import { RollButton } from '../shared';
import ConnectWalletModal from './ConnectWalletModal';
import ConnectXModal from './ConnectXModal';
import WalletPanel from './WalletPanel';

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function UtilCluster() {
  const { user, notifications } = useDemo();
  const dispatch = useDemoDispatch();
  const [walletModal, setWalletModal] = useState(false);
  const [xModal, setXModal] = useState(false);
  const [openPanel, setOpenPanel] = useState<'wallet' | 'notif' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpenPanel(null));

  // Restore a previously-trusted Phantom session on load — real state, no fabricated address.
  useEffect(() => {
    if (user.walletConnected) return;
    reconnectPhantomIfTrusted().then((address) => {
      if (address) dispatch({ type: 'CONNECT_WALLET', provider: 'phantom', address, network: 'Solana' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stay in sync if Phantom itself disconnects or the account changes outside RUN.
  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;
    const onDisconnect = () => dispatch({ type: 'DISCONNECT_WALLET' });
    const onAccountChanged = (...args: unknown[]) => {
      const pub = args[0] as { toString(): string } | null;
      if (pub) dispatch({ type: 'CONNECT_WALLET', provider: 'phantom', address: pub.toString(), network: 'Solana' });
      else dispatch({ type: 'DISCONNECT_WALLET' });
    };
    provider.on('disconnect', onDisconnect);
    provider.on('accountChanged', onAccountChanged);
    return () => {
      provider.off?.('disconnect', onDisconnect);
      provider.off?.('accountChanged', onAccountChanged);
    };
  }, [dispatch]);

  const unread = notifications.filter((n) => !n.read).length;

  const toggleNotif = () => {
    setOpenPanel((p) => (p === 'notif' ? null : 'notif'));
    if (openPanel !== 'notif') dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };

  return (
    <div className="util-cluster" ref={ref}>
      <a
        href="https://x.com/TryRunCards"
        target="_blank"
        rel="noreferrer"
        className="util-btn util-btn--x"
        aria-label="RUN on X"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </a>

      {!user.xConnected ? (
        <RollButton text="Connect X" onClick={() => setXModal(true)} />
      ) : (
        <RollButton text={user.xHandle!} onClick={() => setXModal(true)} />
      )}

      {!user.walletConnected ? (
        <RollButton text="Connect Wallet" onClick={() => setWalletModal(true)} />
      ) : (
        <RollButton text={shortAddress(user.walletAddress!)} onClick={() => setOpenPanel((p) => (p === 'wallet' ? null : 'wallet'))} />
      )}

      <button type="button" className="util-btn" aria-label="Notifications" onClick={toggleNotif}>
        {unread > 0 && <span className="util-btn__dot" aria-hidden="true" />}
        ◔
      </button>

      {openPanel === 'notif' && (
        <div className="util-panel">
          <p className="section-label">Notifications</p>
          {notifications.length === 0 ? (
            <p className="app-sub">Nothing yet — actions you take will show up here.</p>
          ) : (
            notifications.slice(0, 12).map((n) => (
              <div className="util-panel__item" key={n.id}>
                <p>{n.message}</p>
                <p className="app-sub" style={{ marginTop: 2 }}>
                  {timeAgo(n.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {walletModal && <ConnectWalletModal onClose={() => setWalletModal(false)} />}
      {xModal && <ConnectXModal onClose={() => setXModal(false)} />}
      {openPanel === 'wallet' && <WalletPanel onClose={() => setOpenPanel(null)} />}
    </div>
  );
}
