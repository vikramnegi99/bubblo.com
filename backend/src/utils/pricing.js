'use strict';

/**
 * Pricing helpers.
 *
 * A discount is only ever DISPLAYED if it is truthful:
 *   - MRP is strictly greater than the selling price, and
 *   - the configured discount percentage is greater than zero.
 * The storefront uses `effectiveDiscount()` to decide whether to render the
 * strike-through MRP / "% OFF" badge at all. We never invent a discount.
 */

/** Compute the truthful whole-number discount percent from price + MRP. */
function computeDiscountPct(price, mrp) {
  const p = Number(price) || 0;
  const m = Number(mrp) || 0;
  if (m <= p) return 0;
  return Math.round((1 - p / m) * 100);
}

/** Coerce an admin-supplied discount to a safe integer 0–100. */
function sanitizeDiscount(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(100, n);
}

/**
 * The discount actually shown to a customer for a product.
 * @param {{price:number, mrp:number, discount:number}} product
 * @returns {number} 0 when no truthful discount exists
 */
function effectiveDiscount(product) {
  const mrp = Number(product.mrp) || 0;
  const price = Number(product.price) || 0;
  if (mrp <= price) return 0; // never show a discount that is not real
  return sanitizeDiscount(product.discount) || computeDiscountPct(price, mrp);
}

/**
 * Whether a product row should display MRP strike-through + discount badge.
 * @param {{price:number, mrp:number, discount:number}} product
 */
function showDiscount(product) {
  return effectiveDiscount(product) > 0;
}

/**
 * Compute an order line's money breakdown.
 * subtotal (at MRP) − discount (MRP−price) + shipping = total.
 * @param {object} product
 * @param {number} quantity
 * @param {number} shippingCharge
 */
function priceBreakdown(product, quantity, shippingCharge) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || price;
  const unitPrice = price;
  const subtotal = mrp * qty;
  const discount = (mrp - price) * qty;
  const shipping = Math.max(0, Math.floor(Number(shippingCharge) || 0));
  const total = subtotal - discount + shipping;
  return { quantity: qty, unitPrice, subtotal, discount, shippingCharge: shipping, total };
}

module.exports = {
  computeDiscountPct,
  sanitizeDiscount,
  effectiveDiscount,
  showDiscount,
  priceBreakdown,
};
