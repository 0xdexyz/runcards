import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCopy } from '../lib/i18n';
import { useMediaQuery } from '../lib/hooks';
import { cardArtDataUri } from '../lib/cardArtDataUri';
import { useDemo } from '../demo/store';
import { getCampaignsForCard, formatNum, formatUsd } from '../demo/selectors';
import { DISCOVER_CARDS } from './tools/discoverCards';
import RouteRollLink from './demo/RouteRollLink';
import { HoverPixels, PixelReveal, PixelSwap } from './shared';

const N = DISCOVER_CARDS.length;

function Digits({ value }: { value: number }) {
  const text = String(value).padStart(2, '0');
  return (
    <p className="work__index" aria-label={text}>
      {text.split('').map((digit, i) => (
        <span className="digits" key={i} aria-hidden="true">
          <span className="digits__stack" style={{ transform: `translateY(${-Number(digit) * 10}%)` }}>
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d}>{d}</span>
            ))}
          </span>
        </span>
      ))}
    </p>
  );
}

function CampaignCopy({ index }: { index: number }) {
  const state = useDemo();
  const card = DISCOVER_CARDS[index];
  const runCard = state.cards.find((c) => c.id === card.id);
  const campaign = getCampaignsForCard(state, card.id)[0];
  return (
    <div className="work__copy">
      <div className="work__label">
        <p>{runCard?.name ?? card.name}</p>
        <p>Creator: {runCard?.creatorHandle ?? `@${card.id}`}</p>
        <p>Reward: {runCard?.rewardRate ?? 0}%</p>
        <p>{campaign?.status === 'active' ? 'Status: Active' : 'Status: —'}</p>
      </div>
      <p className="work__detail">{campaign?.description ?? ''}</p>
      {campaign && (
        <p className="work__detail" style={{ marginTop: '0.6rem', opacity: 0.7 }}>
          {campaign.objective} · {formatUsd(campaign.rewardPool)} pool · {formatNum(campaign.participants)} participants
        </p>
      )}
      <div style={{ marginTop: '1rem' }}>
        <RouteRollLink text="View Campaign" to={campaign ? `/campaign/${campaign.id}` : `/card/${card.id}`} />
      </div>
    </div>
  );
}

export default function Work() {
  const t = useCopy();
  const state = useDemo();
  const desktop = useMediaQuery('(min-width: 1001px)');
  const [index, setIndex] = useState(0);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!desktop || !pin.current) return;
    const st = ScrollTrigger.create({
      trigger: pin.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setIndex(Math.min(N - 1, Math.floor(self.progress * N))),
    });
    return () => st.kill();
  }, [desktop]);

  const campaignLink = (cardId: string) => {
    const campaign = getCampaignsForCard(state, cardId)[0];
    return campaign ? `/campaign/${campaign.id}` : `/card/${cardId}`;
  };

  const card = DISCOVER_CARDS[index];

  return (
    <section className="work" id="work">
      {desktop ? (
        <div className="work__pin" ref={pin} style={{ height: `${N * 100}vh` }} data-nav-anchor>
          <div className="work__sticky">
            <p className="work__heading display">{t.work.label}</p>
            <div className="work__row">
              <div className="work__col work__col--index">
                <Digits value={index + 1} />
                <RouteRollLink text={t.work.view} to={campaignLink(card.id)} className="work__view" />
              </div>
              <div className="work__col work__col--media">
                <PixelSwap src={cardArtDataUri(card.visual, card.name)} alt={card.name} />
                <HoverPixels cols={8} rows={9} />
              </div>
              <div className="work__col work__col--copy">
                {DISCOVER_CARDS.map((c, i) => (
                  <div className={`work__layer${i === index ? ' is-active' : ''}`} key={c.id} aria-hidden={i !== index}>
                    <CampaignCopy index={i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="work__list" data-nav-anchor>
          <p className="work__heading display">{t.work.label}</p>
          {DISCOVER_CARDS.map((c, i) => (
            <article className="work__item" key={c.id}>
              <Digits value={i + 1} />
              <PixelReveal src={cardArtDataUri(c.visual, c.name)} alt={c.name} cols={8} rows={5} className="work__figure" />
              <CampaignCopy index={i} />
              <RouteRollLink text={t.work.view} to={campaignLink(c.id)} className="work__view work__view--inline" />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
