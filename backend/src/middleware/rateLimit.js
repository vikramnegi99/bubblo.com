'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const common = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Too many requests. Please slow down and try again shortly.' },
};

/** Global API limiter. */
const apiLimiter = rateLimit({ ...common, max: env.RATE_LIMIT_MAX });

/** Tighter limiter for order creation (public write endpoint). */
const orderLimiter = rateLimit({ ...common, max: env.ORDER_RATE_LIMIT_MAX });

/** Tight limiter for admin login attempts. */
const loginLimiter = rateLimit({ ...common, max: 10 });

module.exports = { apiLimiter, orderLimiter, loginLimiter };
