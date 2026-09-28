import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo, useDemoDispatch } from '../demo/store';
import { yourCards } from '../demo/selectors';
import { createCampaign } from '../services/mockCampaignService';
import CampaignsShell from '../components/demo/CampaignsShell';
import { RollButton } from '../components/shared';

export default function CampaignsCreate() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const navigate = useNavigate();
  const cards = yourCards(state).filter((c) => c.runState !== 'draft');

  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('Grow card activations');
  const [rewardPool, setRewardPool] = useState(5000);
  const [durationDays, setDurationDays] = useState(30);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'done'>('idle');

  if (cards.length === 0) {
    return (
      <CampaignsShell title="Create Campaign" subtitle="Promote and grow one of your running cards.">
        <div className="empty-state">You need a running card before you can create a campaign.</div>
      </CampaignsShell>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCampaign({ cardId, title, objective, rewardPool, durationDays });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create campaign.');
      return;
    }
    setStatus('creating');
    await new Promise((r) => setTimeout(r, 900));
    dispatch({ type: 'CREATE_CAMPAIGN', cardId, campaign: { title, objective, rewardPool, durationDays } });
    setStatus('done');
  };

  if (status === 'done') {
    return (
      <CampaignsShell title="Create Campaign" subtitle="Promote and grow one of your running cards.">
        <div className="panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p>Campaign created and visible in Discover Campaigns.</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <RollButton text="View Campaigns" onClick={() => navigate('/campaigns')} />
          </div>
        </div>
      </CampaignsShell>
    );
  }

  return (
    <CampaignsShell title="Create Campaign" subtitle="Promote and grow one of your running cards.">
      <form className="panel" onSubmit={submit} style={{ maxWidth: 480 }}>
        <div className="field">
          <label htmlFor="camp-card">Card</label>
          <select id="camp-card" value={cardId} onChange={(e) => setCardId(e.target.value)}>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="camp-name">Campaign Name</label>
          <input id="camp-name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Promote your card" />
        </div>
        <div className="field">
          <label htmlFor="camp-objective">Objective</label>
          <input id="camp-objective" value={objective} onChange={(e) => setObjective(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="camp-pool">Reward Pool ($)</label>
            <input id="camp-pool" type="number" min={0} value={rewardPool} onChange={(e) => setRewardPool(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="field">
            <label htmlFor="camp-duration">Duration (days)</label>
            <input id="camp-duration" type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 1)} />
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        {status === 'creating' ? (
          <div className="status-line"><span className="spinner" aria-hidden="true" /><span>Creating...</span></div>
        ) : (
          <RollButton text="Create Campaign" type="submit" />
        )}
      </form>
    </CampaignsShell>
  );
}
