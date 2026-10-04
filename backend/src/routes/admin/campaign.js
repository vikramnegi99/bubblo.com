'use strict';

const express = require('express');
const { validateBody } = require('../../middleware/validate');
const { campaignSchema } = require('../../validation/schemas');
const campaignService = require('../../services/campaignService');

const router = express.Router();

/** GET /api/admin/campaign — raw campaign config + computed public view. */
router.get('/', (req, res) => {
  res.json({ campaign: campaignService.getRaw(), public: campaignService.getPublic() });
});

/**
 * PUT /api/admin/campaign — configure the campaign (name, headline, dates,
 * active flag, accent, products). A countdown only ever appears on the
 * storefront when a real end date is set and the campaign is active.
 */
router.put('/', validateBody(campaignSchema), (req, res) => {
  const campaign = campaignService.update(req.body);
  res.json({ campaign, public: campaignService.getPublic() });
});

module.exports = router;
