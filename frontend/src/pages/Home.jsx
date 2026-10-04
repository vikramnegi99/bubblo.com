import { useState } from 'react';
import Hero from '../components/home/Hero';
import CampaignSection from '../components/home/CampaignSection';
import GiftReveal from '../components/home/GiftReveal';
import WhosItFor from '../components/home/WhosItFor';
import Showcase from '../components/home/Showcase';
import GiftingSection from '../components/home/GiftingSection';
import Comparison from '../components/home/Comparison';
import HowItWorks from '../components/home/HowItWorks';
import BigReaction from '../components/home/BigReaction';
import ReviewsSection from '../components/home/ReviewsSection';
import TrustStrip from '../components/TrustStrip';
import QuickView from '../components/QuickView';
import Accordion from '../components/Accordion';
import { useStore } from '../context/StoreContext';
import { useSeo, organizationJsonLd, faqJsonLd } from '../lib/seo';

const HOME_FAQS = [
  { q: 'Is Cash on Delivery available?', a: 'Yes. Every COD order is confirmed by a quick phone call before it ships.' },
  { q: 'Do I need to verify with an OTP?', a: 'No. There is no OTP. You place the order and we call you to confirm it.' },
  { q: 'How long does delivery take?', a: 'Orders are usually dispatched within 1–3 business days after confirmation.' },
  { q: 'Can I return an item?', a: 'If something is not right, contact us within 7 days of delivery and we will help make it right.' },
];

export default function Home() {
  const [quick, setQuick] = useState(null);
  const { settings } = useStore();

  useSeo({
    title: 'BUBBLO — Bubble Gifts, Fun & Magical Moments',
    description: 'BUBBLO — bubble wands, bubble guns and glow. Make Moments Magical. Cash on Delivery, confirmed by a quick call.',
    canonical: '/',
    jsonLd: [organizationJsonLd(settings), faqJsonLd(HOME_FAQS)],
  });

  return (
    <>
      <Hero />
      <CampaignSection />
      <GiftReveal />
      <WhosItFor />
      <Showcase onQuickView={setQuick} />
      <GiftingSection />
      <Comparison />
      <HowItWorks />
      <BigReaction />
      <ReviewsSection />
      <TrustStrip />

      <section className="section" id="faq">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="center" style={{ marginBottom: 18 }}>
            <div className="eyebrow">Questions</div>
            <h2>FAQ</h2>
          </div>
          <Accordion items={HOME_FAQS} />
        </div>
      </section>

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </>
  );
}
