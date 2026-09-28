import { useState } from 'react';
import type { RunCard } from '../../demo/types';
import { useDemo } from '../../demo/store';
import { cardCvv, cardExpiry, cardNumber } from '../../lib/cardIdentity';
import { RollButton } from '../shared';
import Modal from './Modal';

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value.replace(/\s/g, '')).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="data-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
      <span className="app-sub">{label}</span>
      <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
      <RollButton text={copied ? 'Copied ✓' : 'Copy'} onClick={copy} />
    </div>
  );
}

export default function CardDetailsModal({ card, onClose }: { card: RunCard; onClose: () => void }) {
  const { user } = useDemo();
  const number = card.isOfficial ? '4321 8700 5678 9012' : cardNumber(card.id);
  const expiry = card.isOfficial ? '12/28' : cardExpiry(card.id, card.createdAt);
  const cvv = cardCvv(card.id);
  const holder = (user.xHandle ?? user.name).replace('@', '').toUpperCase();

  return (
    <Modal title="Card Details" onClose={onClose}>
      <p className="app-sub" style={{ marginBottom: '1rem' }}>
        Use these details to pay with {card.name} wherever RUN cards are accepted.
      </p>
      <div className="panel" style={{ marginBottom: '1.2rem' }}>
        <CopyRow label="Card Number" value={number} />
        <CopyRow label="Expiry" value={expiry} />
        <CopyRow label="CVV" value={cvv} />
        <div className="data-row" style={{ gridTemplateColumns: '1fr auto' }}>
          <span className="app-sub">Cardholder</span>
          <strong>{holder}</strong>
        </div>
        <div className="data-row" style={{ gridTemplateColumns: '1fr auto' }}>
          <span className="app-sub">Balance</span>
          <strong style={{ color: 'var(--orange)' }}>${card.balanceUsd.toFixed(2)}</strong>
        </div>
      </div>
      <RollButton text="Done" onClick={onClose} />
    </Modal>
  );
}
