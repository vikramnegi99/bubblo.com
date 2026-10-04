'use strict';

/**
 * WhatsApp deep-link helpers for the admin "WhatsApp Customer" action.
 *
 * Produces a `https://wa.me/<country><number>?text=<url-encoded message>`
 * link. The pre-filled message is a plain confirmation request — no secrets
 * are involved, so it is safe to build here and return in the admin API.
 */

const { extractDigits } = require('./phone');

/**
 * Build a wa.me link for a stored phone number.
 * @param {string} stored e.g. "+919528097342"
 * @param {string} [text] pre-filled, URL-encoded message
 * @returns {string}
 */
function waLink(stored, text) {
  const digits = extractDigits(stored); // "+91..." → "91..."
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * A friendly, ready-to-send order-confirmation message for the customer.
 * @param {object} order normalised order (see orderService.toApi)
 * @returns {string}
 */
function buildOrderConfirmationMessage(order) {
  const name = order.customerName || 'there';
  const variant = order.variant ? ` (${order.variant})` : '';
  const qty = order.quantity || 1;
  const total = `₹${Math.round(Number(order.total) || 0).toLocaleString('en-IN')}`;
  return (
    `Hello ${name}, this is BUBBLO 👋\n\n` +
    `We received your Cash on Delivery order ${order.orderId} for ` +
    `${order.productName}${variant} × ${qty} — total ${total}.\n\n` +
    `Please confirm this order by replying here or answering our call, and we'll ` +
    `dispatch it right away. Thank you!`
  );
}

module.exports = { waLink, buildOrderConfirmationMessage };
