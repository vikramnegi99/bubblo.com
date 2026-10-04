'use strict';

const express = require('express');
const reviewService = require('../../services/reviewService');

const router = express.Router();

/** GET /api/admin/reviews?approved=0|1 — moderation queue. */
router.get('/', (req, res) => {
  let approved;
  if (req.query.approved === '0') approved = false;
  if (req.query.approved === '1') approved = true;
  res.json({ reviews: reviewService.listAll({ approved }) });
});

/** PATCH /api/admin/reviews/:id — approve or unapprove. */
router.patch('/:id', (req, res) => {
  const result = reviewService.setApproved(req.params.id, !!req.body.approved);
  if (result.error) return res.status(404).json({ error: 'not_found', message: 'Review not found.' });
  res.json({ ok: true });
});

/** DELETE /api/admin/reviews/:id */
router.delete('/:id', (req, res) => {
  const result = reviewService.remove(req.params.id);
  if (!result.ok) return res.status(404).json({ error: 'not_found', message: 'Review not found.' });
  res.json({ ok: true });
});

module.exports = router;
