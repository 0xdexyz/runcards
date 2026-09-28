import { useState } from 'react';
import { RollButton } from '../shared';
import Modal from './Modal';

export default function ShareXModal({ cardName, onClose, onShared }: { cardName: string; onClose: () => void; onShared?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'shared'>('idle');
  const post = `Just discovered the ${cardName} on RUN. Check out the campaign and rewards.`;

  const copy = () => {
    navigator.clipboard?.writeText(post).catch(() => {});
  };

  const share = () => {
    const url = `https://x.com/intent/post?text=${encodeURIComponent(post)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus('shared');
    onShared?.();
  };

  return (
    <Modal title="Share on X" onClose={onClose}>
      <div className="panel" style={{ marginBottom: '1.2rem', fontFamily: 'var(--f-grotesk)', textTransform: 'none' }}>
        <p>{post}</p>
      </div>
      {status === 'idle' ? (
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <RollButton text="Copy Post" onClick={copy} />
          <RollButton text="Post to X" onClick={share} />
        </div>
      ) : (
        <div className="status-line">
          <span className="status-dot is-live" aria-hidden="true" />
          <span>X activity recorded</span>
        </div>
      )}
    </Modal>
  );
}
