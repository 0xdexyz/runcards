import { useEffect, useState } from 'react';
import { useDemoDispatch } from '../../demo/store';
import { connectPhantom, PhantomNotInstalledError, WalletRejectedError, waitForPhantomProvider } from '../../services/realWalletService';
import { RollButton } from '../shared';
import Modal from './Modal';

type Status = 'checking' | 'idle' | 'connecting' | 'connected' | 'cancelled' | 'not-installed' | 'error';

export default function ConnectWalletModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDemoDispatch();
  const [status, setStatus] = useState<Status>('checking');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    waitForPhantomProvider().then((provider) => {
      if (!cancelled) setStatus(provider ? 'idle' : 'not-installed');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = async () => {
    setStatus('connecting');
    try {
      const res = await connectPhantom();
      dispatch({ type: 'CONNECT_WALLET', provider: 'phantom', address: res.address, network: 'Solana' });
      setAddress(res.address);
      setStatus('connected');
    } catch (err) {
      if (err instanceof WalletRejectedError) {
        setStatus('cancelled');
      } else if (err instanceof PhantomNotInstalledError) {
        setStatus('not-installed');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    }
  };

  return (
    <Modal title="Connect Wallet" onClose={onClose}>
      {status === 'checking' && (
        <div className="status-line" style={{ padding: '1.5rem 0' }}>
          <span className="spinner" aria-hidden="true" />
          <span>Looking for Phantom...</span>
        </div>
      )}

      {status === 'not-installed' && (
        <>
          <p className="app-sub" style={{ marginBottom: '1.2rem' }}>
            Phantom isn't installed in this browser. Install it to connect a real Solana wallet to RUN.
          </p>
          <a href="https://phantom.app/download" target="_blank" rel="noreferrer" className="roll-btn" style={{ marginBottom: '0.8rem' }}>
            <span className="roll-btn__fill" aria-hidden="true" />
            <span className="roll-btn__text" data-text="Install Phantom">
              <span>Install Phantom</span>
            </span>
          </a>
          <RollButton
            text="I've installed it — Retry"
            onClick={() => {
              setStatus('checking');
              waitForPhantomProvider().then((provider) => setStatus(provider ? 'idle' : 'not-installed'));
            }}
          />
        </>
      )}

      {status === 'idle' && (
        <>
          <p className="app-sub" style={{ marginBottom: '1rem' }}>
            This opens Phantom's real connection approval — RUN never sees your seed phrase or private key.
          </p>
          <div className="provider-row" onClick={connect}>
            <span>Phantom</span>
            <span aria-hidden="true">→</span>
          </div>
        </>
      )}

      {status === 'connecting' && (
        <div className="status-line" style={{ padding: '1.5rem 0' }}>
          <span className="spinner" aria-hidden="true" />
          <span>Waiting for Phantom...</span>
        </div>
      )}

      {status === 'cancelled' && (
        <>
          <p className="field-error" style={{ marginBottom: '1rem' }}>
            Wallet connection cancelled.
          </p>
          <RollButton text="Try Again" onClick={() => setStatus('idle')} />
        </>
      )}

      {status === 'error' && (
        <>
          <p className="field-error" style={{ marginBottom: '1rem' }}>
            {error}
          </p>
          <RollButton text="Try Again" onClick={() => setStatus('idle')} />
        </>
      )}

      {status === 'connected' && (
        <>
          <div className="status-line" style={{ marginBottom: '1rem' }}>
            <span className="status-dot is-live" aria-hidden="true" />
            <span>Wallet connected</span>
          </div>
          <p className="app-sub" style={{ marginBottom: '1.2rem' }}>
            Address: <strong style={{ color: 'var(--ink)' }}>{address}</strong>
          </p>
          <RollButton text="Done" onClick={onClose} />
        </>
      )}
    </Modal>
  );
}
