import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CampaignTask } from '../demo/types';
import { useDemo, useDemoDispatch } from '../demo/store';
import { formatMinutesAgo, formatNum, formatUsd, recentActivity } from '../demo/selectors';
import Breadcrumb from '../components/demo/Breadcrumb';
import StatusPill from '../components/demo/StatusPill';
import XActivitySimulator from '../components/demo/XActivitySimulator';
import ShareXModal from '../components/demo/ShareXModal';
import RouteRollLink from '../components/demo/RouteRollLink';
import { RollButton } from '../components/shared';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const [activeTask, setActiveTask] = useState<CampaignTask | null>(null);
  const [share, setShare] = useState(false);

  const campaign = state.campaigns.find((c) => c.id === id);
  if (!campaign) {
    return (
      <div className="app-page">
        <p className="empty-state">Campaign not found.</p>
        <RollButton text="Back to Campaigns" onClick={() => navigate('/campaigns')} />
      </div>
    );
  }

  const card = state.cards.find((c) => c.id === campaign.cardId);
  const daysLeft = Math.max(0, Math.ceil((campaign.endDate - Date.now()) / 86_400_000));

  const join = () => dispatch({ type: 'JOIN_CAMPAIGN', campaignId: campaign.id });

  return (
    <div className="app-page">
      <Breadcrumb items={[{ label: 'Campaigns', to: '/campaigns' }, { label: campaign.title }]} />

      <div className="app-header">
        <div>
          <p className="section-label">{card?.name} · {campaign.creatorHandle}</p>
          <h1 className="app-title" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>{campaign.title}</h1>
          <p className="app-sub">{campaign.description}</p>
        </div>
        <StatusPill status={campaign.status} />
      </div>

      <div className="panel-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-tile">
          <p className="stat-tile__label">Reward Pool</p>
          <p className="stat-tile__value is-orange">{formatUsd(campaign.rewardPool)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Participants</p>
          <p className="stat-tile__value">{formatNum(campaign.participants)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Deadline</p>
          <p className="stat-tile__value">{daysLeft}d left</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Progress</p>
          <div className="progress" style={{ marginTop: 8 }}>
            <span className="progress__fill" style={{ width: `${Math.round(campaign.progress * 100)}%` }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {!campaign.joined ? <RollButton text="Join Campaign" onClick={join} /> : <RollButton text="Share" onClick={() => setShare(true)} />}
        {card && <RouteRollLink text="View Card" to={`/card/${card.id}`} />}
      </div>

      <p className="section-label">Tasks</p>
      {!campaign.joined && (
        <p className="field-error" style={{ marginBottom: '0.6rem' }}>
          Join the campaign above to unlock these tasks.
        </p>
      )}
      <div className="panel">
        {campaign.tasks.map((t) => (
          <div className={`task-row${t.status === 'verified' ? ' is-verified' : ''}`} key={t.id}>
            <div className="task-row__meta">
              <span className="task-row__title">{t.title}</span>
              <span className="task-row__reward">Reward: {t.reward} pts</span>
            </div>
            {t.status === 'verified' ? (
              <StatusPill status="verified" />
            ) : (
              <RollButton
                text="Verify X Activity"
                onClick={() => setActiveTask(t)}
                disabled={!campaign.joined}
                title={campaign.joined ? undefined : 'Join the campaign first'}
              />
            )}
          </div>
        ))}
      </div>

      <p className="section-label" style={{ marginTop: '2rem' }}>Recent Activity</p>
      <div className="panel">
        {recentActivity(campaign, 6).map((a, i) => (
          <div className="data-row" key={i} style={{ gridTemplateColumns: '1fr auto' }}>
            <span><strong>{a.handle}</strong> {a.verb}</span>
            <span className="app-sub">{formatMinutesAgo(a.minutesAgo)}</span>
          </div>
        ))}
      </div>

      {activeTask && <XActivitySimulator campaignId={campaign.id} task={activeTask} onClose={() => setActiveTask(null)} />}
      {share && card && <ShareXModal cardName={card.name} onClose={() => setShare(false)} />}
    </div>
  );
}
