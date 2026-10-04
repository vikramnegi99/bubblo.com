'use strict';

const express = require('express');
const { validateBody } = require('../middleware/validate');
const { reviewSchema } = require('../validation/schemas');
const reviewService = require('../services/reviewService');

const router = express.Router();

/**
 * POST /api/reviews — a customer submits a review. It is stored as PENDING
 * and only appears on the storefront once an admin approves it. We never seed
 * or fabricate reviews.
 */
router.post('/', validateBody(reviewSchema), (req, res) => {
  const result = reviewService.submit(req.body);
  if (result.error === 'product_not_found') {
    return res.status(404).json({ error: 'not_found', message: 'Product not found.' });
  }
  res.status(201).json({
    message: 'Thank you! Your review will appear once it is approved.',
  });
});

module.exports = router;
