'use strict';

const express = require('express');
const { validateBody } = require('../../middleware/validate');
const { settingsSchema } = require('../../validation/schemas');
const settingsService = require('../../services/settingsService');

const router = express.Router();

/** GET /api/admin/settings — full settings object. */
router.get('/', (req, res) => {
  res.json({ settings: settingsService.getAll() });
});

/** PUT /api/admin/settings — partial update (shipping, COD, brand, policies…). */
router.put('/', validateBody(settingsSchema), (req, res) => {
  const next = settingsService.update(req.body);
  res.json({ settings: next });
});

module.exports = router;
