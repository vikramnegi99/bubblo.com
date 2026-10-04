'use strict';

/**
 * Seed BUBBLO with the three products, default settings, and an inactive
 * campaign. Run with `npm run seed` (or `npm run reset` for a clean slate).
 *
 * There are NO OTP-related rows, providers, or config here by design.
 * No reviews are seeded — the storefront shows an honest empty state
 * ("Your review could be the first.").
 */

const { getDb, applySchema } = require('./index');
const { PRODUCT_ASSETS } = require('../config/cloudinary');

function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

const PRODUCTS = [
  {
    slug: 'lotus-bubble-wand',
    name: 'LED Lotus Flower Bubble Wand',
    tag: 'Glow + Bubbles',
    short_description:
      'A lotus-shaped wand that lights up and streams bubbles — a little bit of magic in your hand.',
    description:
      'The LED Lotus Flower Bubble Wand opens into a glowing lotus and sends out a stream of bubbles. ' +
      'It is easy to hold, simple to use, and made for birthdays, celebrations, and everyday moments that ' +
      'deserve a little sparkle. Reusable — just top up with bubble solution and keep the magic going.',
    price: 999,
    mrp: 1499,
    benefits: [
      { title: 'Glow + Bubbles', text: 'A softly glowing lotus head paired with a steady stream of bubbles.' },
      { title: 'Easy To Hold', text: 'Lightweight, kid-friendly shape that is comfortable in small hands.' },
      { title: 'Reusable Fun', text: 'Refill the bubble solution and use it again and again.' },
    ],
    whats_included: [
      '1 x LED Lotus Flower Bubble Wand',
      'Bubble solution bottle',
      'Simple usage guide',
    ],
    how_it_works: [
      { step: 1, text: 'Fill the reservoir with the included bubble solution.' },
      { step: 2, text: 'Press the button to light up the lotus and start the bubbles.' },
      { step: 3, text: 'Wave, twirl and enjoy — refill whenever you like.' },
    ],
    faqs: [
      { q: 'Is bubble solution included?', a: 'Yes — a bubble solution bottle is included with the wand.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes. COD is available and every COD order is confirmed over a quick phone call.' },
      { q: 'Is it safe for kids?', a: 'It is designed for children to enjoy under adult supervision, especially around the bubble solution.' },
    ],
  },
  {
    slug: 'automatic-bubble-gun',
    name: 'Automatic Bubble Gun',
    tag: 'Maximum Bubble Fun',
    short_description:
      'Point, press, and fill the air with bubbles. Endless fun for parties and playtime.',
    description:
      'The Automatic Bubble Gun makes bubble play effortless — press the trigger and a stream of bubbles ' +
      'bursts out. It is the easiest way to turn a party, a park visit, or a lazy afternoon into something ' +
      'everyone remembers. Reusable and refillable.',
    price: 349,
    mrp: 599,
    benefits: [
      { title: 'One-Press Bubbles', text: 'A simple trigger action that keeps the bubbles flowing.' },
      { title: 'Party Ready', text: 'Perfect for birthdays, playdates, and outdoor fun.' },
      { title: 'Refillable', text: 'Top up the bubble solution and keep playing.' },
    ],
    whats_included: [
      '1 x Automatic Bubble Gun',
      'Bubble solution bottle',
      'Simple usage guide',
    ],
    how_it_works: [
      { step: 1, text: 'Fill the reservoir with the included bubble solution.' },
      { step: 2, text: 'Press the trigger to release a stream of bubbles.' },
      { step: 3, text: 'Refill and repeat whenever the fun calls for it.' },
    ],
    faqs: [
      { q: 'Is bubble solution included?', a: 'Yes — a bubble solution bottle is included.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes. COD is available and every COD order is confirmed over a quick phone call.' },
      { q: 'Can I use it indoors?', a: 'You can, though we recommend outdoors or a wipe-friendly space — bubbles can make surfaces slippery.' },
    ],
  },
  {
    slug: 'fairy-butterfly-bubble-wand',
    name: 'LED Fairy / Butterfly Bubble Wand',
    tag: 'Gift-Worthy Magic',
    short_description:
      'A fairy-butterfly wand that glows and makes bubbles — a gift that gets an instant reaction.',
    description:
      'The LED Fairy / Butterfly Bubble Wand pairs a glowing butterfly design with a gentle stream of ' +
      'bubbles. It is the kind of gift that gets an instant reaction — beautiful to look at, easy to use, ' +
      'and made for photos, parties and special moments. Reusable and refillable.',
    price: 1250,
    mrp: 1999,
    benefits: [
      { title: 'Gift-Worthy Magic', text: 'A glowing fairy-butterfly design that feels special the moment it is opened.' },
      { title: 'Glow + Bubbles', text: 'A soft LED glow paired with a stream of bubbles.' },
      { title: 'Made For Moments', text: 'Great for birthdays, photos, parties, and gifting.' },
    ],
    whats_included: [
      '1 x LED Fairy / Butterfly Bubble Wand',
      'Bubble solution bottle',
      'Simple usage guide',
    ],
    how_it_works: [
      { step: 1, text: 'Fill the reservoir with the included bubble solution.' },
      { step: 2, text: 'Switch on the LED and start the bubbles.' },
      { step: 3, text: 'Enjoy the glow — refill whenever you like.' },
    ],
    faqs: [
      { q: 'Is bubble solution included?', a: 'Yes — a bubble solution bottle is included with the wand.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes. COD is available and every COD order is confirmed over a quick phone call.' },
      { q: 'Is it a good gift?', a: 'It is designed to be gift-worthy — a glowing wand that gets an instant reaction.' },
    ],
  },
];

const DEFAULT_SETTINGS = {
  brand_name: 'BUBBLO',
  tagline: 'Make Moments Magical.',
  hero_headline: 'Make Moments Magical.',
  hero_subheadline:
    'Bubble wands, bubble guns and glow — little things that turn ordinary moments into memories.',
  contact_phone: '+91 90000 00000',
  contact_email: 'hello@bubblo.example',
  contact_address: 'BUBBLO Studio, India',
  shipping_charge: 49,
  free_shipping_threshold: 999,
  cod_enabled: true,
  currency: 'INR',
  policies: {
    shipping: 'Orders are usually dispatched within 1–3 business days. COD orders are confirmed over a phone call before dispatch.',
    returns: 'If something is not right, contact us within 7 days of delivery and we will help make it right.',
    privacy: 'We only use your details to process and deliver your order. We never sell your data.',
    terms: 'By placing an order you agree to our delivery and returns terms.',
  },
  social: {
    instagram: '',
    facebook: '',
    youtube: '',
    whatsapp: '',
  },
};

function seed() {
  applySchema();
  const db = getDb();

  const upsertProduct = db.prepare(`
    INSERT INTO products
      (slug, name, tag, short_description, description, price, mrp, discount, visible,
       hero_image, lifestyle_image, gallery, benefits, whats_included, how_it_works, faqs, sort_order)
    VALUES
      (@slug, @name, @tag, @short_description, @description, @price, @mrp, @discount, @visible,
       @hero_image, @lifestyle_image, @gallery, @benefits, @whats_included, @how_it_works, @faqs, @sort_order)
    ON CONFLICT(slug) DO UPDATE SET
      name=excluded.name, tag=excluded.tag, short_description=excluded.short_description,
      description=excluded.description, price=excluded.price, mrp=excluded.mrp,
      discount=excluded.discount, visible=excluded.visible, hero_image=excluded.hero_image,
      lifestyle_image=excluded.lifestyle_image, gallery=excluded.gallery, benefits=excluded.benefits,
      whats_included=excluded.whats_included, how_it_works=excluded.how_it_works, faqs=excluded.faqs,
      sort_order=excluded.sort_order, updated_at=datetime('now')
  `);

  const tx = db.transaction(() => {
    PRODUCTS.forEach((p, i) => {
      const assets = PRODUCT_ASSETS[p.slug];
      upsertProduct.run({
        slug: p.slug,
        name: p.name,
        tag: p.tag,
        short_description: p.short_description,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        discount: discountPct(p.price, p.mrp),
        visible: 1,
        hero_image: assets.hero,
        lifestyle_image: assets.gallery[assets.gallery.length - 1],
        gallery: JSON.stringify(assets.gallery),
        benefits: JSON.stringify(p.benefits),
        whats_included: JSON.stringify(p.whats_included),
        how_it_works: JSON.stringify(p.how_it_works),
        faqs: JSON.stringify(p.faqs),
        sort_order: i,
      });
    });

    const setSetting = db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')
    `);
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      setSetting.run(key, JSON.stringify(value));
    }

    // Campaign starts INACTIVE with no end date — the storefront therefore
    // shows no sale banner and never renders a countdown until the owner
    // configures a real start/end window and flips it active.
    db.prepare(`
      INSERT INTO campaign (id, name, headline, description, accent, start_date, end_date, active)
      VALUES (1, @name, @headline, @description, @accent, @start_date, @end_date, @active)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, headline=excluded.headline, description=excluded.description,
        accent=excluded.accent, start_date=excluded.start_date, end_date=excluded.end_date,
        active=excluded.active, updated_at=datetime('now')
    `).run({
      name: 'Bubble Mega Days',
      headline: 'Bubble Mega Days',
      description: 'Limited-time savings across the BUBBLO collection.',
      accent: '#c026d3',
      start_date: null,
      end_date: null,
      active: 0,
    });

    const linkCampaignProduct = db.prepare(
      `INSERT OR IGNORE INTO campaign_products (campaign_id, product_slug) VALUES (1, ?)`
    );
    PRODUCTS.forEach((p) => linkCampaignProduct.run(p.slug));
  });

  tx();

  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  // eslint-disable-next-line no-console
  console.log(`[seed] done — ${count} products, settings, inactive campaign. No OTP anywhere.`);
}

if (require.main === module) seed();

module.exports = { seed, DEFAULT_SETTINGS, PRODUCTS, discountPct };
