'use strict';

const express = require('express');
const orderService = require('../../services/orderService');

const router = express.Router();

/** GET /api/admin/summary — sales overview for the dashboard. */
router.get('/', (req, res) => {
  res.json(orderService.summary());
});

module.exports = router;
