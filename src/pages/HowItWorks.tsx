import RouteRollLink from '../components/demo/RouteRollLink';

const STEPS = [
  { title: 'RUN Card', copy: 'Use the official RUN Card — live, spendable, and ready from day one.' },
  { title: 'RUN Your Card', copy: 'Create your own custom card through the Launchpad in a few guided steps.' },
  { title: 'Build a Campaign', copy: 'Create rewards and activities that give your community a reason to participate.' },
  { title: 'Connect X', copy: 'Connect your X account so campaign activity can be verified.' },
  { title: 'Grow', copy: 'Community members discover your card and promote it through campaigns.' },
  { title: 'Reward', copy: "Eligible participants receive the rewards you've configured." },
];

export default function HowItWorks() {
  return (
    <div className="app-page">
      <div className="app-header">
        <div>
          <h1 className="app-title">How It Works</h1>
          <p className="app-sub">The full RUN ecosystem, end to end.</p>
        </div>
      </div>

      <div className="panel">
        {STEPS.map((s, i) => (
          <div className="task-row" key={s.title} style={{ alignItems: 'flex-start' }}>
            <div className="task-row__meta" style={{ flexDirection: 'row', alignItems: 'baseline', gap: '1rem' }}>
              <span className="app-sub">[ {String(i + 1).padStart(2, '0')} ]</span>
              <div>
                <p className="task-row__title" style={{ fontSize: 14 }}>{s.title.toUpperCase()}</p>
                <p className="app-sub" style={{ marginTop: 4, maxWidth: '52ch' }}>{s.copy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <RouteRollLink text="Explore Marketplace" to="/marketplace" />
        <RouteRollLink text="RUN Your Card" to="/launchpad/create" />
      </div>
    </div>
  );
}
