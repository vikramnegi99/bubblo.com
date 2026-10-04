'use strict';

const { getDb } = require('../db');
const { buildImageUrl, buildSrcSet, WIDTHS, PRODUCT_ASSETS } = require('../config/cloudinary');
const { effectiveDiscount, showDiscount, sanitizeDiscount, computeDiscountPct } = require('../utils/pricing');

/** Parse a JSON column that is expected to hold an array. */
function parseArray(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function image(publicId, width = WIDTHS.hero) {
  if (!publicId) return null;
  return {
    publicId,
    url: buildImageUrl(publicId, { width }),
    thumb: buildImageUrl(publicId, { width: WIDTHS.thumb }),
    srcset: buildSrcSet(publicId),
  };
}

/**
 * Convert a raw DB row into the API shape the frontend consumes.
 * Image URLs are derived from Cloudinary public_ids via the manifest helpers.
 */
function toApi(row) {
  if (!row) return null;
  const galleryIds = parseArray(row.gallery);
  const discount = effectiveDiscount(row);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tag: row.tag || '',
    shortDescription: row.short_description || '',
    description: row.description || '',
    price: row.price,
    mrp: row.mrp,
    discount,
    showDiscount: showDiscount(row),
    visible: !!row.visible,
    hero: image(row.hero_image, WIDTHS.hero),
    lifestyle: image(row.lifestyle_image, WIDTHS.hero),
    gallery: galleryIds.map((pid, i) => ({ ...image(pid, WIDTHS.hero), position: i })),
    benefits: parseArray(row.benefits),
    whatsIncluded: parseArray(row.whats_included),
    howItWorks: parseArray(row.how_it_works),
    faqs: parseArray(row.faqs),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** The set of Cloudinary public_ids that legitimately belong to a slug. */
function allowedPublicIds(slug) {
  const entry = PRODUCT_ASSETS[slug];
  if (!entry) return null;
  return new Set([entry.hero, ...entry.gallery]);
}

function listPublic() {
  const rows = getDb()
    .prepare('SELECT * FROM products WHERE visible = 1 ORDER BY sort_order ASC, id ASC')
    .all();
  return rows.map(toApi);
}

function listAll() {
  const rows = getDb()
    .prepare('SELECT * FROM products ORDER BY sort_order ASC, id ASC')
    .all();
  return rows.map(toApi);
}

function getBySlug(slug, { includeHidden = false } = {}) {
  const row = getDb().prepare('SELECT * FROM products WHERE slug = ?').get(slug);
  if (!row) return null;
  if (!includeHidden && !row.visible) return null;
  return toApi(row);
}

function getRawBySlug(slug) {
  return getDb().prepare('SELECT * FROM products WHERE slug = ?').get(slug) || null;
}

function updateProduct(slug, patch) {
  const db = getDb();
  const current = getRawBySlug(slug);
  if (!current) return { error: 'not_found' };

  // Guard against mixing Cloudinary assets between products.
  if (patch.gallery !== undefined) {
    const allowed = allowedPublicIds(slug);
    if (allowed) {
      const bad = patch.gallery.filter((pid) => !allowed.has(pid));
      if (bad.length) {
        return { error: 'asset_mismatch', bad };
      }
    }
  }

  const next = {
    name: patch.name ?? current.name,
    tag: patch.tag ?? current.tag,
    short_description: patch.shortDescription ?? current.short_description,
    description: patch.description ?? current.description,
    price: patch.price !== undefined ? Math.max(0, Math.round(Number(patch.price))) : current.price,
    mrp: patch.mrp !== undefined ? Math.max(0, Math.round(Number(patch.mrp))) : current.mrp,
    visible: patch.visible !== undefined ? (patch.visible ? 1 : 0) : current.visible,
    hero_image: patch.heroImage ?? current.hero_image,
    lifestyle_image: patch.lifestyleImage ?? current.lifestyle_image,
    gallery: patch.gallery !== undefined ? JSON.stringify(patch.gallery) : current.gallery,
    benefits: patch.benefits !== undefined ? JSON.stringify(patch.benefits) : current.benefits,
    whats_included: patch.whatsIncluded !== undefined ? JSON.stringify(patch.whatsIncluded) : current.whats_included,
    how_it_works: patch.howItWorks !== undefined ? JSON.stringify(patch.howItWorks) : current.how_it_works,
    faqs: patch.faqs !== undefined ? JSON.stringify(patch.faqs) : current.faqs,
    sort_order: patch.sortOrder !== undefined ? Math.round(Number(patch.sortOrder)) : current.sort_order,
  };

  // Discount is admin-configurable but defaults to the truthful computed value.
  let discount;
  if (patch.discount !== undefined) {
    discount = sanitizeDiscount(patch.discount);
  } else {
    discount = computeDiscountPct(next.price, next.mrp);
  }
  // If MRP <= price there is no real discount — force it to zero.
  if (next.mrp <= next.price) discount = 0;

  db.prepare(`
    UPDATE products SET
      name=@name, tag=@tag, short_description=@short_description, description=@description,
      price=@price, mrp=@mrp, discount=@discount, visible=@visible, hero_image=@hero_image,
      lifestyle_image=@lifestyle_image, gallery=@gallery, benefits=@benefits,
      whats_included=@whats_included, how_it_works=@how_it_works, faqs=@faqs,
      sort_order=@sort_order, updated_at=datetime('now')
    WHERE slug=@slug
  `).run({ ...next, discount, slug });

  return { product: getBySlug(slug, { includeHidden: true }) };
}

module.exports = {
  toApi,
  parseArray,
  allowedPublicIds,
  listPublic,
  listAll,
  getBySlug,
  getRawBySlug,
  updateProduct,
};
