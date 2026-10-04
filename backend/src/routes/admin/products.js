'use strict';

const express = require('express');
const { validateBody } = require('../../middleware/validate');
const { productPatchSchema } = require('../../validation/schemas');
const productService = require('../../services/productService');
const { PRODUCT_ASSETS, buildImageUrl, WIDTHS } = require('../../config/cloudinary');

const router = express.Router();

/** GET /api/admin/products — all products (including hidden). */
router.get('/', (req, res) => {
  res.json({ products: productService.listAll() });
});

/** GET /api/admin/products/assets — the Cloudinary manifest, for the editor. */
router.get('/assets', (req, res) => {
  const manifest = Object.entries(PRODUCT_ASSETS).map(([slug, entry]) => ({
    slug,
    hero: { publicId: entry.hero, url: buildImageUrl(entry.hero, { width: WIDTHS.hero }) },
    gallery: entry.gallery.map((pid) => ({ publicId: pid, url: buildImageUrl(pid, { width: WIDTHS.hero }) })),
  }));
  res.json({ cloudName: require('../../config/cloudinary').CLOUD_NAME, manifest });
});

/** PATCH /api/admin/products/:slug — edit any product field. */
router.patch('/:slug', validateBody(productPatchSchema), (req, res) => {
  const result = productService.updateProduct(req.params.slug, req.body);
  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'not_found', message: 'Product not found.' });
  }
  if (result.error === 'asset_mismatch') {
    return res.status(422).json({
      error: 'asset_mismatch',
      message: `These images do not belong to this product: ${result.bad.join(', ')}`,
    });
  }
  res.json({ product: result.product });
});

module.exports = router;
