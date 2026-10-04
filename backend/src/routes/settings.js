'use strict';

const express = require('express');
const settingsService = require('../services/settingsService');

const router = express.Router();

/**
 * GET /api/settings — the public subset of store settings the storefront needs.
 * (Admin-only keys are never exposed here.)
 */
router.get('/', (req, res) => {
  const s = settingsService.getAll();
  res.json({
    settings: {
      brandName: s.brand_name,
      tagline: s.tagline,
      heroHeadline: s.hero_headline,
      heroSubheadline: s.hero_subheadline,
      contact: {
        phone: s.contact_phone,
        email: s.contact_email,
        address: s.contact_address,
      },
      shippingCharge: s.shipping_charge,
      freeShippingThreshold: s.free_shipping_threshold,
      codEnabled: !!s.cod_enabled,
      currency: s.currency || 'INR',
      policies: s.policies,
      social: s.social,
    },
  });
});

module.exports = router;
