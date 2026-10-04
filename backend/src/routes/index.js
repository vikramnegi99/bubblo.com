'use strict';

const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bubblo-api', time: new Date().toISOString() });
});

// Public storefront API.
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/campaign', require('./campaign'));
router.use('/settings', require('./settings'));
router.use('/reviews', require('./reviews'));

// Admin API (JWT protected, except login).
router.use('/admin', require('./admin'));

module.exports = router;
