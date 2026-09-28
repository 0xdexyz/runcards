import { useState } from 'react';
import { useDemo, useDemoDispatch } from '../demo/store';
import { formatUsd } from '../demo/selectors';
import { claimRewards } from '../services/mockRewardService';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function Rewards() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const [claiming, setClaiming] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      await claimRewards(state.rewards.available);
      dispatch({ type: 'CLAIM_REWARDS' });
    } finally {
      setClaiming(false);
      setConfirm(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">Rewards</h1>
          <p className="app-sub">Earn from campaigns, referrals and card activity.</p>
        </div>
        <RouteRollLink text="Creator Rewards" to="/rewards/creator" />
      </div>

      <div className="panel-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Available</p>
          <p className="stat-tile__value is-orange">{formatUsd(state.rewards.available)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Pending</p>
          <p className="stat-tile__value">{formatUsd(state.rewards.pending)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Claimed</p>
          <p className="stat-tile__value">{formatUsd(state.rewards.claimed)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Lifetime</p>
          <p className="stat-tile__value">{formatUsd(state.rewards.lifetime)}</p>
        </div>
      </div>

      {!confirm ? (
        <RollButton text="Claim Rewards" onClick={() => setConfirm(true)} disabled={state.rewards.available <= 0} />
      ) : (
        <div className="panel" style={{ maxWidth: 420 }}>
          <p style={{ marginBottom: '1rem' }}>Claim {formatUsd(state.rewards.available)} in rewards?</p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <RollButton text={claiming ? 'Claiming...' : 'Confirm'} onClick={claim} disabled={claiming} />
            <RollButton text="Cancel" onClick={() => setConfirm(false)} />
          </div>
        </div>
      )}

      <p className="section-label">Reward History</p>
      {state.transactions.length === 0 ? (
        <div className="empty-state">No reward activity yet.</div>
      ) : (
        <div className="panel">
          {state.transactions.slice(0, 20).map((t) => (
            <div className="data-row" key={t.id}>
              <span>{t.type === 'claim' ? 'Reward claim' : t.merchant}</span>
              <span>{formatUsd(t.type === 'payment' ? t.rewardGenerated : t.amount)}</span>
              <span>{new Date(t.timestamp).toLocaleDateString()}</span>
              <span style={{ textTransform: 'capitalize' }}>{t.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
