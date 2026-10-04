'use strict';

const express = require('express');
const campaignService = require('../services/campaignService');

const router = express.Router();

/**
 * GET /api/campaign — storefront-safe campaign view.
 * Returns `active: false` (and no countdown) whenever the campaign is off,
 * has no end date, or the end date has passed. Never a fake countdown.
 */
router.get('/', (req, res) => {
  res.json({ campaign: campaignService.getPublic() });
});

module.exports = router;
