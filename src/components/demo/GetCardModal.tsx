import { useState } from 'react';
import type { RunCard } from '../../demo/types';
import { useDemo, useDemoDispatch } from '../../demo/store';
import { acquireCard } from '../../services/mockCardService';
import { confirmWithWalletSignature, PhantomNotInstalledError, WalletRejectedError } from '../../services/realWalletService';
import { RollButton } from '../shared';
import Modal from './Modal';

const CARD_PRICE = 10;

export default function GetCardModal({ card, onClose }: { card: RunCard; onClose: () => void }) {
  const { user } = useDemo();
  const dispatch = useDemoDispatch();
  const [status, setStatus] = useState<'review' | 'confirming' | 'processing' | 'done' | 'cancelled' | 'error'>('review');
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!user.walletConnected) return;
    setStatus('confirming');
    try {
      await confirmWithWalletSignature(`Confirm purchase of ${card.name} for $${CARD_PRICE.toFixed(2)} on RUN.`);
    } catch (err) {
      if (err instanceof WalletRejectedError) {
        setStatus('cancelled');
      } else if (err instanceof PhantomNotInstalledError) {
        setError('Phantom is not installed.');
        setStatus('error');
      } else {
        setError(err instanceof Error ? err.message : 'Wallet confirmation failed.');
        setStatus('error');
      }
      return;
    }
    setStatus('processing');
    await acquireCard(card.id);
    dispatch({ type: 'ACQUIRE_CARD', cardId: card.id });
    setStatus('done');
  };

  return (
    <Modal title="Get Card" onClose={onClose}>
      {status === 'review' && (
        <>
          <div className="panel" style={{ marginBottom: '1.2rem' }}>
            <p className="section-label">{card.isOfficial ? 'Official RUN Card' : `Creator · ${card.creatorHandle}`}</p>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{card.name}</p>
            <p className="app-sub" style={{ marginTop: 6 }}>
              Reward rate: {card.rewardRate}% · Active campaigns: {card.campaignIds.length}
            </p>
          </div>
          <div className="status-line" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
            <span>Price</span>
            <strong style={{ color: 'var(--ink)' }}>${CARD_PRICE.toFixed(2)}</strong>
          </div>
          <p className="app-sub" style={{ marginBottom: '1rem' }}>
            Confirming with your wallet adds this card to Cards I Use.
          </p>
          {!user.walletConnected && <p className="field-error" style={{ marginBottom: '1rem' }}>Connect your wallet to continue.</p>}
          <RollButton text={`Pay $${CARD_PRICE.toFixed(2)}`} onClick={confirm} disabled={!user.walletConnected} />
        </>
      )}

      {status === 'confirming' && (
        <div className="status-line">
          <span className="spinner" aria-hidden="true" />
          <span>Waiting for Phantom confirmation...</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="status-line">
          <span className="spinner" aria-hidden="true" />
          <span>Processing...</span>
        </div>
      )}

      {status === 'cancelled' && (
        <>
          <p className="field-error" style={{ marginBottom: '1rem' }}>
            Payment confirmation cancelled.
          </p>
          <RollButton text="Try Again" onClick={() => setStatus('review')} />
        </>
      )}

      {status === 'error' && (
        <>
          <p className="field-error" style={{ marginBottom: '1rem' }}>
            {error}
          </p>
          <RollButton text="Try Again" onClick={() => setStatus('review')} />
        </>
      )}

      {status === 'done' && (
        <>
          <div className="status-line" style={{ marginBottom: '1.2rem' }}>
            <span className="status-dot is-live" aria-hidden="true" />
            <span>Card successfully added.</span>
          </div>
          <RollButton text="Done" onClick={onClose} />
        </>
      )}
    </Modal>
  );
}
