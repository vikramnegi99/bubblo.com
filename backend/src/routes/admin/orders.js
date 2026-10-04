'use strict';

const express = require('express');
const { validateBody } = require('../../middleware/validate');
const { orderStatusSchema } = require('../../validation/schemas');
const orderService = require('../../services/orderService');

const router = express.Router();

/** GET /api/admin/orders — list / search / filter. */
router.get('/', (req, res) => {
  const { search, status, limit, offset } = req.query;
  res.json({
    orders: orderService.list({ search, status, limit, offset }),
    statuses: orderService.ORDER_STATUSES,
  });
});

/** GET /api/admin/orders/:orderId — single order + status history. */
router.get('/:orderId', (req, res) => {
  const order = orderService.getByOrderId(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found.' });
  res.json({ order, events: orderService.events(req.params.orderId) });
});

/**
 * PATCH /api/admin/orders/:orderId/status — move an order through the
 * lifecycle. Moving to "Delivered" also marks payment as Paid.
 */
router.patch('/:orderId/status', validateBody(orderStatusSchema), (req, res) => {
  const result = orderService.setStatus(req.params.orderId, req.body.status, { note: req.body.note, actor: req.admin.email });
  if (result.error === 'not_found') return res.status(404).json({ error: 'not_found', message: 'Order not found.' });
  if (result.error === 'invalid_status') return res.status(422).json({ error: 'invalid_status', message: 'Unknown status.' });
  res.json({ order: result.order, message: `Order marked as ${req.body.status}.` });
});

module.exports = router;
