'use strict';

/**
 * BUBBLO — Cloudinary asset manifest.
 *
 * All product imagery is served from Cloudinary (cloud account: `acqrwkcn`).
 * This file is the SINGLE source of truth for which asset belongs to which
 * product. Nothing here is a secret — these are public delivery URLs.
 *
 * Delivery URL pattern:
 *   https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<public_id>.jpg
 *
 * Example transforms: `f_auto,q_auto,w_800`
 * Responsive variants: w_600 / w_1200 (see buildImageUrl below).
 *
 * IMPORTANT:
 *  - Do NOT use Cloudinary *collection* page URLs as an <img src>.
 *  - Do NOT mix assets between products. Product 1's collection also contains
 *    a butterfly image — that image belongs ONLY to product 3 and must never
 *    be attached to product 1.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'acqrwkcn';
const DELIVERY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/** Public IDs grouped by product slug. Keys match the product `slug` column. */
const PRODUCT_ASSETS = {
  'lotus-bubble-wand': {
    hero: 'file_000000000888821194c4ce42bfed7d24',
    gallery: [
      'file_0000000017308208a5855b5ee68fdfad',
      'file_0000000055908211becd645686892190',
      'file_000000000888821194c4ce42bfed7d24',
    ],
  },
  'automatic-bubble-gun': {
    hero: 'file_000000002f94820889ce9296fd1838e3',
    gallery: [
      'file_000000002f94820889ce9296fd1838e3',
      'file_000000009c58820898f11758e9b312c2',
      'file_00000000eb6882118927549965131b14',
    ],
  },
  'fairy-butterfly-bubble-wand': {
    hero: 'file_00000000e62882118326d5fff23e310c',
    gallery: [
      'file_00000000e62882118326d5fff23e310c',
      'file_00000000c88c8211acca0f122f930bf3',
      'file_00000000c0d482119e80da247b5c2563',
    ],
  },
};

/** Homepage / site-wide imagery (kept separate from product galleries). */
const SITE_ASSETS = {
  hero: 'file_000000000888821194c4ce42bfed7d24',
  gift: 'file_00000000e62882118326d5fff23e310c',
};

/** Responsive widths the storefront requests. */
const WIDTHS = {
  thumb: 300,
  card: 600,
  hero: 800,
  wide: 1200,
};

/**
 * Build a Cloudinary delivery URL for a public_id.
 * @param {string} publicId
 * @param {{width?: number, transforms?: string}} [opts]
 * @returns {string}
 */
function buildImageUrl(publicId, opts = {}) {
  if (!publicId) return '';
  const transforms =
    opts.transforms ||
    `f_auto,q_auto,w_${opts.width || WIDTHS.hero}`;
  return `${DELIVERY_BASE}/${transforms}/${publicId}.jpg`;
}

/**
 * Build a `srcset` string (w_600 + w_1200 variants) for a public_id.
 * @param {string} publicId
 * @returns {string}
 */
function buildSrcSet(publicId) {
  if (!publicId) return '';
  return [
    `${buildImageUrl(publicId, { width: WIDTHS.card })} ${WIDTHS.card}w`,
    `${buildImageUrl(publicId, { width: WIDTHS.wide })} ${WIDTHS.wide}w`,
  ].join(', ');
}

/**
 * Resolve the full image set for a product slug.
 * Returns null if the slug has no manifest entry (caller should fall back to
 * whatever is stored in the DB, but never invent assets).
 * @param {string} slug
 */
function getProductAssets(slug) {
  const entry = PRODUCT_ASSETS[slug];
  if (!entry) return null;
  return {
    hero: {
      publicId: entry.hero,
      url: buildImageUrl(entry.hero, { width: WIDTHS.hero }),
      srcset: buildSrcSet(entry.hero),
    },
    gallery: entry.gallery.map((publicId, i) => ({
      publicId,
      position: i,
      url: buildImageUrl(publicId, { width: WIDTHS.hero }),
      thumb: buildImageUrl(publicId, { width: WIDTHS.thumb }),
      srcset: buildSrcSet(publicId),
    })),
  };
}

module.exports = {
  CLOUD_NAME,
  DELIVERY_BASE,
  PRODUCT_ASSETS,
  SITE_ASSETS,
  WIDTHS,
  buildImageUrl,
  buildSrcSet,
  getProductAssets,
};
