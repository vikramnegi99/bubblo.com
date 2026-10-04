'use strict';

const express = require('express');
const { validateBody } = require('../middleware/validate');
const { orderLimiter } = require('../middleware/rateLimit');
const { createOrderSchema, trackSchema } = require('../validation/schemas');
const orderService = require('../services/orderService');
const emailService = require('../services/email');

const router = express.Router();

/**
 * POST /api/orders — create a COD order immediately.
 *
 * There is NO OTP step. The payload is validated and, if valid, the order is
 * created right away with status "New Order". The store owner then calls the
 * customer to confirm. Returns the new order_id.
 *
 * After a successful create we notify the store owner by email IN THE
 * BACKGROUND. This is fire-and-forget: the response is returned first, and an
 * email failure is logged server-side only — it can never fail the order and
 * its status is never exposed to the client.
 */
router.post('/', orderLimiter, validateBody(createOrderSchema), (req, res, next) => {
  try {
    const result = orderService.createOrder(req.body);
    if (result.error === 'product_unavailable') {
      return res.status(409).json({ error: 'product_unavailable', message: 'This product is currently unavailable.' });
    }
    if (result.error === 'invalid_phone') {
      return res.status(422).json({ error: 'validation_error', message: 'Please enter a valid 10-digit mobile number.', fields: { phone: 'Please enter a valid 10-digit mobile number.' } });
    }
    if (result.error === 'cod_disabled') {
      return res.status(409).json({ error: 'cod_disabled', message: 'Cash on Delivery is currently unavailable.' });
    }

    // Notify the owner in the background — never awaited, never blocks, never
    // fails the response. The helper swallows and logs any error itself.
    emailService.notifyOwnerOfNewOrder(result.order);

    return res.status(201).json({
      order: result.order,
      message: "We'll contact you shortly to confirm your COD order.",
    });
  } catch (err) {
    return next(err);
  }
});

/** POST /api/orders/track — order id + mobile number. */
router.post('/track', validateBody(trackSchema), (req, res) => {
  const result = orderService.track(req.body.orderId, req.body.phone);
  if (result.error) {
    return res.status(404).json({ error: 'not_found', message: 'We could not find an order with that Order ID and mobile number.' });
  }
  res.json(result);
});

module.exports = router;
