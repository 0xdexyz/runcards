import { useState } from 'react';
import { useDemoDispatch } from '../../demo/store';
import { confirmWithWalletSignature, PhantomNotInstalledError, WalletRejectedError } from '../../services/realWalletService';
import { delay } from '../../services/delay';
import { RollButton } from '../shared';
import Modal from './Modal';

const PRESETS = [25, 50, 100, 250];

export default function AddFundsModal({ cardId, cardName, onClose }: { cardId: string; cardName: string; onClose: () => void }) {
  const dispatch = useDemoDispatch();
  const [amount, setAmount] = useState(50);
  const [status, setStatus] = useState<'review' | 'confirming' | 'processing' | 'done' | 'cancelled' | 'error'>('review');
  const [error, setError] = useState('');

  const confirm = async () => {
    setStatus('confirming');
    try {
      await confirmWithWalletSignature(`Confirm adding $${amount.toFixed(2)} to ${cardName} on RUN.`);
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
    await delay(1400 + Math.random() * 800);
    dispatch({ type: 'ADD_FUNDS', cardId, amount });
    setStatus('done');
  };

  return (
    <Modal title="Add Funds" onClose={onClose}>
      {status === 'review' && (
        <>
          <p className="app-sub" style={{ marginBottom: '1rem' }}>
            Choose an amount to add to {cardName}.
          </p>
          <div className="filter-row" style={{ marginBottom: '1.2rem' }}>
            {PRESETS.map((p) => (
              <RollButton key={p} text={`$${p}`} active={amount === p} onClick={() => setAmount(p)} />
            ))}
          </div>
          <div className="field" style={{ marginBottom: '1.2rem' }}>
            <label htmlFor="fund-amount">Custom amount</label>
            <input
              id="fund-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
            />
          </div>
          <RollButton text={`Add $${amount.toFixed(2)}`} onClick={confirm} />
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
          <span>Processing transaction...</span>
        </div>
      )}

      {status === 'cancelled' && (
        <>
          <p className="field-error" style={{ marginBottom: '1rem' }}>
            Confirmation cancelled.
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
            <span>${amount.toFixed(2)} added to {cardName}.</span>
          </div>
          <RollButton text="Done" onClick={onClose} />
        </>
      )}
    </Modal>
  );
}
