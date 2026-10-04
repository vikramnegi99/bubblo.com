'use strict';

const { getDb } = require('../db');
const productService = require('./productService');

/**
 * Campaign logic.
 *
 * A campaign carries a start (`start_date`) and end (`end_date`) datetime.
 * The storefront-safe view reports whether the campaign is ACTIVE right now —
 * i.e. the admin has enabled it AND the current time sits between the start
 * and end (an unset bound is treated as "no constraint on that side").
 *
 * A countdown is only ever surfaced when the campaign is active AND a real
 * end date exists in the future. We NEVER fake or auto-reset a countdown: when
 * the campaign is inactive or has ended, `active: false` is returned and the
 * frontend hides the countdown and the "limited-time" label, showing normal
 * pricing instead.
 */

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** First defined value among the given candidates (skips undefined only). */
function firstDefined(...values) {
  for (const v of values) if (v !== undefined) return v;
  return undefined;
}

function getRaw() {
  const db = getDb();
  const row = db.prepare('SELECT * FROM campaign WHERE id = 1').get();
  if (!row) return null;
  const products = db
    .prepare('SELECT product_slug FROM campaign_products WHERE campaign_id = 1')
    .all()
    .map((r) => r.product_slug);
  return { ...row, products };
}

/** Compute the public (storefront-safe) campaign view. */
function getPublic(now = new Date()) {
  const raw = getRaw();
  if (!raw) {
    return {
      active: false,
      isActive: false,
      showCountdown: false,
      name: null,
      headline: null,
      description: null,
      accent: null,
      startsAt: null,
      endsAt: null,
      campaignStart: null,
      campaignEnd: null,
      started: false,
      ended: false,
      products: [],
      offers: [],
    };
  }

  const start = parseDate(raw.start_date);
  const end = parseDate(raw.end_date);
  const nowMs = now.getTime();

  const started = start ? start.getTime() <= nowMs : true;
  const ended = end ? end.getTime() <= nowMs : false;
  const withinWindow = started && !ended;

  const active = !!raw.active && withinWindow;

  // Offers are only surfaced while the campaign is genuinely active.
  let offers = [];
  if (active) {
    const all = productService.listPublic();
    const wanted = new Set(raw.products);
    offers = all
      .filter((p) => p.showDiscount && (wanted.size === 0 || wanted.has(p.slug)))
      .slice(0, 3)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        tag: p.tag,
        price: p.price,
        mrp: p.mrp,
        discount: p.discount,
        hero: p.hero,
      }));
  }

  return {
    active,
    isActive: active,
    showCountdown: active && !!end,
    name: raw.name,
    headline: raw.headline,
    description: raw.description,
    accent: raw.accent,
    startsAt: raw.start_date || null,
    endsAt: raw.end_date || null,
    campaignStart: raw.start_date || null,
    campaignEnd: raw.end_date || null,
    started,
    ended,
    products: raw.products,
    offers,
  };
}

function update(patch) {
  const db = getDb();
  const current = getRaw() || {};

  // Accept both the camelCase (`startDate`/`endDate`) and the campaign-prefixed
  // (`campaignStart`/`campaignEnd`) names, plus the raw snake_case columns.
  const startDate = firstDefined(patch.campaignStart, patch.startDate, patch.start_date);
  const endDate = firstDefined(patch.campaignEnd, patch.endDate, patch.end_date);

  const next = {
    name: patch.name ?? current.name ?? null,
    headline: patch.headline ?? current.headline ?? null,
    description: patch.description ?? current.description ?? null,
    accent: patch.accent ?? current.accent ?? null,
    start_date: startDate !== undefined ? startDate : current.start_date ?? null,
    end_date: endDate !== undefined ? endDate : current.end_date ?? null,
    active: patch.active !== undefined ? (patch.active ? 1 : 0) : current.active ?? 0,
  };

  db.prepare(`
    INSERT INTO campaign (id, name, headline, description, accent, start_date, end_date, active, updated_at)
    VALUES (1, @name, @headline, @description, @accent, @start_date, @end_date, @active, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name=@name, headline=@headline, description=@description, accent=@accent,
      start_date=@start_date, end_date=@end_date, active=@active, updated_at=datetime('now')
  `).run(next);

  if (Array.isArray(patch.products)) {
    const del = db.prepare('DELETE FROM campaign_products WHERE campaign_id = 1');
    const ins = db.prepare('INSERT OR IGNORE INTO campaign_products (campaign_id, product_slug) VALUES (1, ?)');
    const tx = db.transaction(() => {
      del.run();
      patch.products.forEach((slug) => ins.run(slug));
    });
    tx();
  }

  return getRaw();
}

module.exports = { getRaw, getPublic, update };
