import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Countdown from '../Countdown';
import { inr } from '../../lib/format';

/**
 * Bubble Mega Days campaign section.
 *
 * If the campaign is not active (inactive, no end date, or end date in the
 * past) the API returns active:false and this section renders NOTHING — no
 * banner, no countdown. We never fake a deadline.
 */
export default function CampaignSection() {
  const { campaign } = useStore();

  // `isActive` is the authoritative flag (now between campaign start and end);
  // fall back to `active` for older payloads.
  const active = campaign ? campaign.isActive ?? campaign.active : false;
  if (!campaign || !active) return null;
  const offers = campaign.offers || [];
  if (!offers.length) return null;

  // The "Limited Time" label and countdown only appear when the campaign is
  // genuinely active AND a real end date exists. Otherwise: normal pricing.
  const showCountdown = !!campaign.showCountdown && !!campaign.endsAt;

  return (
    <section className="section" style={{ background: 'var(--grad-soft)' }} id="campaign">
      <div className="container">
        <div className="center" style={{ marginBottom: 26 }}>
          {showCountdown && <div className="eyebrow">Limited Time</div>}
          <h2>{campaign.headline || campaign.name || 'Bubble Mega Days'}</h2>
          {campaign.description && <p style={{ maxWidth: 620, margin: '0 auto' }}>{campaign.description}</p>}
          {showCountdown && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Countdown endsAt={campaign.endsAt} accent={campaign.accent} />
            </div>
          )}
        </div>

        <div className="grid grid--products">
          {offers.map((o) => (
            <div className="card" key={o.slug} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                {o.hero && <img src={o.hero.url} srcSet={o.hero.srcset} sizes="(max-width: 820px) 100vw, 360px" alt={o.name} loading="lazy" />}
              </div>
              <div style={{ padding: 16 }}>
                <span className="chip chip--discount">{o.discount}% OFF</span>
                <h3 style={{ margin: '10px 0 6px', fontSize: '1.05rem' }}>{o.name}</h3>
                <div className="pcard__price">
                  <span className="price-now">{inr(o.price)}</span>
                  <span className="price-mrp">{inr(o.mrp)}</span>
                </div>
                <Link to={`/products/${o.slug}`} className="btn btn--primary btn--sm btn--block" style={{ marginTop: 12 }}>
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
