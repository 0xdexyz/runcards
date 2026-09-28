import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CardTheme } from '../demo/types';
import { useDemo, useDemoDispatch } from '../demo/store';
import { formatUsd } from '../demo/selectors';
import { runCard, saveDraftCard } from '../services/mockCardService';
import { createCampaign as validateCampaign } from '../services/mockCampaignService';
import CardVisual from '../components/demo/CardVisual';
import { RollButton } from '../components/shared';

const STEPS = ['Identity', 'Design', 'Rewards', 'Campaign', 'Review'];
const THEMES: CardTheme[] = ['orange', 'black', 'white', 'custom'];

export default function LaunchpadCreate() {
  const state = useDemo();
  const dispatch = useDemoDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const draftId = params.get('draft') ?? undefined;

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [theme, setTheme] = useState<CardTheme>('orange');
  const [accentColor, setAccentColor] = useState('#009be3');
  const [backTheme, setBackTheme] = useState<CardTheme>('black');
  const [backAccentColor, setBackAccentColor] = useState('#009be3');

  const [userReward, setUserReward] = useState(1.5);
  const [campaignReward, setCampaignReward] = useState(25);
  const [referralReward, setReferralReward] = useState(100);
  const [creatorShare, setCreatorShare] = useState(0.2);

  const [makeCampaign, setMakeCampaign] = useState(true);
  const [campTitle, setCampTitle] = useState('');
  const [campObjective, setCampObjective] = useState('Grow card activations');
  const [campPool, setCampPool] = useState(5000);
  const [campDuration, setCampDuration] = useState(30);

  useEffect(() => {
    if (!draftId) return;
    const draft = state.cards.find((c) => c.id === draftId);
    if (!draft) return;
    setName(draft.name === 'Untitled Card' ? '' : draft.name);
    setSymbol(draft.symbol === 'CARD' ? '' : draft.symbol);
    setDescription(draft.description);
    setTheme(draft.theme);
    if (draft.accentColor) setAccentColor(draft.accentColor);
    setBackTheme(draft.backTheme);
    if (draft.backAccentColor) setBackAccentColor(draft.backAccentColor);
    setUserReward(draft.rewards.userReward);
    setCampaignReward(draft.rewards.campaignReward);
    setReferralReward(draft.rewards.referralReward);
    setCreatorShare(draft.rewards.creatorShare);
    if (!campTitle) setCampTitle(`Promote ${draft.name === 'Untitled Card' ? 'my card' : draft.name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const cardInput = () => ({
    name,
    symbol: symbol.toUpperCase(),
    description,
    theme,
    accentColor: theme === 'custom' ? accentColor : undefined,
    backTheme,
    backAccentColor: backTheme === 'custom' ? backAccentColor : undefined,
    rewards: { userReward, campaignReward, referralReward, creatorShare },
  });

  const next = () => {
    setError('');
    if (step === 0 && !name.trim()) {
      setError('Card name is required.');
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const saveDraft = async () => {
    setError('');
    await saveDraftCard(cardInput());
    dispatch({ type: 'SAVE_DRAFT_CARD', id: draftId, card: cardInput() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const submit = async () => {
    setError('');
    if (!state.user.xConnected) {
      setError('Connect X to participate in verified social campaigns.');
      return;
    }
    try {
      await runCard(cardInput());
      if (makeCampaign) await validateCampaign({ cardId: draftId ?? 'new', title: campTitle || `Promote ${name}`, objective: campObjective, rewardPool: campPool, durationDays: campDuration });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      return;
    }
    dispatch({
      type: 'RUN_CARD',
      id: draftId,
      card: cardInput(),
      campaign: makeCampaign ? { title: campTitle || `Promote ${name}`, objective: campObjective, rewardPool: campPool, durationDays: campDuration } : null,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="app-page">
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p className="section-label">Success</p>
          <h1 className="app-title" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)' }}>Your card is now running on RUN.</h1>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <RollButton text="View Cards I Run" onClick={() => navigate('/your-cards')} />
            <RollButton text="Go to Marketplace" onClick={() => navigate('/marketplace')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">RUN Your Card</h1>
          <p className="app-sub">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
        <RollButton text={saved ? 'Saved ✓' : 'Save Draft'} onClick={saveDraft} />
      </div>

      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`wizard-step${i === step ? ' is-active' : i < step ? ' is-done' : ''}`}>
            {String(i + 1).padStart(2, '0')} — {s.toUpperCase()}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: '2rem' }}>
        <div className="panel">
          {step === 0 && (
            <>
              <p className="section-label">Card Identity</p>
              <div className="field">
                <label htmlFor="c-name">Card Name</label>
                <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya Card" />
              </div>
              <div className="field">
                <label htmlFor="c-desc">Card Description</label>
                <textarea id="c-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this card for?" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-symbol">Card Symbol</label>
                  <input id="c-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.slice(0, 6))} placeholder="MAYA" />
                </div>
                <div className="field">
                  <label>Creator Handle</label>
                  <input value={state.user.xHandle ?? `@${state.user.username}`} disabled />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="section-label">Card Design</p>
              <div className="filter-row" style={{ marginBottom: '1.2rem' }}>
                <RollButton text="Front" active={side === 'front'} onClick={() => setSide('front')} />
                <RollButton text="Back" active={side === 'back'} onClick={() => setSide('back')} />
              </div>
              <div className="field">
                <label>{side === 'front' ? 'Front Theme' : 'Back Theme'}</label>
                <div className="theme-picker">
                  {THEMES.map((th) => (
                    <button
                      key={th}
                      type="button"
                      className={`theme-swatch theme-${th}${(side === 'front' ? theme : backTheme) === th ? ' is-active' : ''}`}
                      style={th === 'custom' ? { background: side === 'front' ? accentColor : backAccentColor } : undefined}
                      onClick={() => (side === 'front' ? setTheme(th) : setBackTheme(th))}
                      aria-label={th}
                    />
                  ))}
                </div>
              </div>
              {(side === 'front' ? theme : backTheme) === 'custom' && (
                <div className="field">
                  <label htmlFor="c-accent">Custom Accent</label>
                  <input
                    id="c-accent"
                    type="color"
                    value={side === 'front' ? accentColor : backAccentColor}
                    onChange={(e) => (side === 'front' ? setAccentColor(e.target.value) : setBackAccentColor(e.target.value))}
                    style={{ padding: 0, height: 42 }}
                  />
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="section-label">Rewards</p>
              <div className="field-row">
                <NumberField label="User Reward (%)" value={userReward} onChange={setUserReward} step={0.1} />
                <NumberField label="Creator Share (%)" value={creatorShare} onChange={setCreatorShare} step={0.05} />
              </div>
              <div className="field-row">
                <NumberField label="Campaign Reward (pts)" value={campaignReward} onChange={setCampaignReward} step={5} />
                <NumberField label="Referral Reward (pts)" value={referralReward} onChange={setReferralReward} step={5} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="section-label">Campaign</p>
              <div className="filter-row" style={{ marginBottom: '1rem' }}>
                <RollButton text="Create campaign now" active={makeCampaign} onClick={() => setMakeCampaign(true)} />
                <RollButton text="Skip for now" active={!makeCampaign} onClick={() => setMakeCampaign(false)} />
              </div>
              {makeCampaign && (
                <>
                  <div className="field">
                    <label htmlFor="camp-title">Campaign Name</label>
                    <input id="camp-title" value={campTitle} onChange={(e) => setCampTitle(e.target.value)} placeholder={`Promote ${name || 'your card'}`} />
                  </div>
                  <div className="field">
                    <label htmlFor="camp-obj">Objective</label>
                    <input id="camp-obj" value={campObjective} onChange={(e) => setCampObjective(e.target.value)} />
                  </div>
                  <div className="field-row">
                    <NumberField label="Reward Pool ($)" value={campPool} onChange={setCampPool} step={100} />
                    <NumberField label="Duration (days)" value={campDuration} onChange={setCampDuration} step={1} />
                  </div>
                </>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <p className="section-label">Review</p>
              <div className="data-row"><span>Card</span><span>{name || '—'}</span></div>
              <div className="data-row"><span>Symbol</span><span>{symbol.toUpperCase() || '—'}</span></div>
              <div className="data-row"><span>Front / Back Theme</span><span>{theme} / {backTheme}</span></div>
              <div className="data-row"><span>Creator</span><span>{state.user.xHandle ?? `@${state.user.username}`}</span></div>
              <div className="data-row"><span>User Reward</span><span>{userReward}%</span></div>
              <div className="data-row"><span>Creator Share</span><span>{creatorShare}%</span></div>
              <div className="data-row"><span>Campaign</span><span>{makeCampaign ? campTitle || `Promote ${name}` : 'Skipped'}</span></div>
              {makeCampaign && <div className="data-row"><span>Reward Pool</span><span>{formatUsd(campPool)}</span></div>}
              <p className="app-sub" style={{ marginTop: '1rem' }}>
                Estimated activity is illustrative only — actual results depend on real community participation.
              </p>
              {!state.user.xConnected && <p className="field-error" style={{ marginTop: '0.6rem' }}>Connect X to participate in verified social campaigns.</p>}
            </>
          )}

          {error && <p className="field-error" style={{ marginTop: '1rem' }}>{error}</p>}

          <div className="wizard-actions">
            <RollButton text="Back" onClick={back} disabled={step === 0} />
            {step < STEPS.length - 1 ? (
              <RollButton text="Next" onClick={next} />
            ) : (
              <RollButton text="RUN CARD" onClick={submit} className="is-active" />
            )}
          </div>
        </div>

        <div>
          <p className="section-label">Live Preview — Front</p>
          <CardVisual theme={theme} accentColor={accentColor} symbol={symbol.toUpperCase() || 'CARD'} name={name || 'Untitled Card'} id={draftId ?? 'draft-preview'} />
          <p className="section-label">Live Preview — Back</p>
          <CardVisual theme={backTheme} accentColor={backAccentColor} symbol={symbol.toUpperCase() || 'CARD'} name={name || 'Untitled Card'} id={draftId ?? 'draft-preview'} />
          <p className="app-sub" style={{ marginTop: '1rem' }}>
            If $10,000 in eligible volume runs through this card, you'd earn an estimated {formatUsd(10_000 * (creatorShare / 100))} in creator revenue.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={value} step={step} min={0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </div>
  );
}
