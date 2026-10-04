'use strict';

const express = require('express');
const productService = require('../services/productService');
const reviewService = require('../services/reviewService');

const router = express.Router();

/** GET /api/products — visible products only. */
router.get('/', (req, res) => {
  res.json({ products: productService.listPublic() });
});

/** GET /api/products/:slug — single visible product, with approved reviews. */
router.get('/:slug', (req, res) => {
  const product = productService.getBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'not_found', message: 'Product not found.' });
  }
  const reviews = reviewService.listApproved(product.slug);
  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;
  res.json({ product, reviews, reviewSummary: { count: reviews.length, average: avg } });
});

module.exports = router;
