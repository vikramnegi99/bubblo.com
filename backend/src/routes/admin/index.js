'use strict';

const express = require('express');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// Public admin auth (login + session check).
router.use('/', require('./auth'));

// Everything below requires a valid admin JWT.
router.use('/products', requireAdmin, require('./products'));
router.use('/orders', requireAdmin, require('./orders'));
router.use('/settings', requireAdmin, require('./settings'));
router.use('/campaign', requireAdmin, require('./campaign'));
router.use('/reviews', requireAdmin, require('./reviews'));
router.use('/summary', requireAdmin, require('./summary'));

module.exports = router;
