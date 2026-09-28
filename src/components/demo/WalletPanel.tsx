import { useState } from 'react';
import { useDemo, useDemoDispatch } from '../../demo/store';
import { disconnectPhantom } from '../../services/realWalletService';
import { RollButton } from '../shared';
import Modal from './Modal';

export default function WalletPanel({ onClose }: { onClose: () => void }) {
  const { user } = useDemo();
  const dispatch = useDemoDispatch();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!user.walletAddress) return;
    navigator.clipboard?.writeText(user.walletAddress).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const disconnect = async () => {
    await disconnectPhantom();
    dispatch({ type: 'DISCONNECT_WALLET' });
    onClose();
  };

  const resetData = () => {
    if (window.confirm('Reset all data? This clears your cards, campaigns and rewards.')) {
      dispatch({ type: 'RESET_DEMO' });
      onClose();
    }
  };

  if (!user.walletConnected || !user.walletAddress) return null;

  return (
    <Modal title="Wallet Connected" onClose={onClose}>
      <div className="panel" style={{ marginBottom: '1.2rem' }}>
        <p className="section-label">Address</p>
        <p style={{ fontSize: 15, fontWeight: 700, wordBreak: 'break-all' }}>{user.walletAddress}</p>
        <p className="section-label" style={{ marginTop: '0.9rem' }}>
          Network
        </p>
        <p>{user.walletNetwork ?? 'Solana'}</p>
        <div className="status-line" style={{ marginTop: '0.9rem' }}>
          <span className="status-dot is-live" aria-hidden="true" />
          <span>Connected</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <RollButton text={copied ? 'Copied ✓' : 'Copy Address'} onClick={copyAddress} />
        <RollButton text="Disconnect" onClick={disconnect} />
      </div>
      <div style={{ marginTop: '1.2rem' }}>
        <button type="button" onClick={resetData} style={{ color: 'var(--orange)', background: 'none', border: 0, padding: 0, fontSize: 12 }}>
          Reset Data
        </button>
      </div>
    </Modal>
  );
}
