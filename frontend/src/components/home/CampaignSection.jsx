import { useStore } from '../../context/StoreContext';
import Countdown from '../Countdown';

/**
 * Bubble Mega Days — compact premium promo card.
 *
 * Renders only when the campaign is genuinely active (now between the
 * configured start and end). No product cards here — those live in the
 * product section below. Never fakes a deadline.
 */
export default function CampaignSection() {
  const { campaign } = useStore();
  const active = campaign ? campaign.isActive ?? campaign.active : false;
  if (!campaign || !active) return null;
  const showCountdown = !!campaign.showCountdown && !!campaign.endsAt;

  return (
    <section className="campaign-card-wrap" id="campaign">
      <div className="container">
        <div className="campaign-card">
          {showCountdown && <span className="eyebrow" style={{ color: '#ffc2dd' }}>BUBBLE MEGA DAYS</span>}
          <h2 className="campaign-card__h">{campaign.headline || campaign.name || 'LIMITED TIME BUBBLE DROP'}</h2>
          <p className="campaign-card__sub">{campaign.description || 'Special launch prices for a limited time.'}</p>
          {showCountdown && (
            <div className="campaign-card__timer">
              <Countdown endsAt={campaign.endsAt} accent={campaign.accent} />
            </div>
          )}
          <div className="campaign-card__cta">
            <a href="#shop" className="btn btn--primary">SHOP NOW →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
