'use strict';

const { getDb } = require('../db');
const { generateOrderId } = require('../utils/orderId');
const { normalizePhone, formatPhone, telLink, localDigits } = require('../utils/phone');
const { waLink, buildOrderConfirmationMessage } = require('../utils/whatsapp');
const { priceBreakdown } = require('../utils/pricing');
const productService = require('./productService');
const settingsService = require('./settingsService');

/**
 * Order lifecycle. There is NO OTP anywhere — an order is created the moment
 * the checkout form is submitted and is then confirmed MANUALLY by the store
 * owner over a phone call.
 */
const ORDER_STATUSES = [
  'New Order',
  'Call Pending',
  'Call Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

/** Statuses the public tracking pipeline exposes (in order). */
const TRACKING_PIPELINE = [
  'Call Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

function toApi(row) {
  if (!row) return null;
  const order = {
    orderId: row.order_id,
    customerName: row.customer_name,
    phone: row.phone,
    phoneDisplay: formatPhone(row.phone),
    callLink: telLink(row.phone),
    email: row.email || '',
    address: {
      house: row.house,
      street: row.street,
      landmark: row.landmark || '',
      pincode: row.pincode,
      city: row.city,
      state: row.state,
      type: row.address_type,
      formatted: [row.house, row.street, row.landmark, `${row.city} ${row.pincode}`, row.state]
        .filter(Boolean)
        .join(', '),
    },
    productSlug: row.product_slug,
    productName: row.product_name,
    variant: row.variant || '',
    quantity: row.quantity,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
    discount: row.discount,
    shippingCharge: row.shipping_charge,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Admin "WhatsApp Customer" deep link, pre-filled with a confirmation
  // message. No secrets involved — safe to return in the admin API.
  order.whatsappLink = waLink(row.phone, buildOrderConfirmationMessage(order));
  return order;
}

/**
 * Create an order immediately (no OTP step).
 * @param {object} input validated payload from the checkout form
 */
function createOrder(input) {
  const db = getDb();

  const product = productService.getRawBySlug(input.productSlug);
  if (!product || !product.visible) {
    return { error: 'product_unavailable' };
  }

  const phone = normalizePhone(input.phone);
  if (!phone) return { error: 'invalid_phone' };

  const settings = settingsService.getAll();
  if (input.paymentMethod === 'COD' && !settings.cod_enabled) {
    return { error: 'cod_disabled' };
  }

  const shipping = Number(settings.shipping_charge) || 0;
  const breakdown = priceBreakdown(product, input.quantity, shipping);
  const orderId = generateOrderId();

  db.prepare(`
    INSERT INTO orders
      (order_id, customer_name, phone, email, house, street, landmark, pincode, city, state,
       address_type, product_slug, product_name, variant, quantity, unit_price, subtotal,
       discount, shipping_charge, total, payment_method, payment_status, order_status, notes)
    VALUES
      (@order_id, @customer_name, @phone, @email, @house, @street, @landmark, @pincode, @city, @state,
       @address_type, @product_slug, @product_name, @variant, @quantity, @unit_price, @subtotal,
       @discount, @shipping_charge, @total, 'COD', 'Pending', 'New Order', @notes)
  `).run({
    order_id: orderId,
    customer_name: input.customerName,
    phone,
    email: input.email || null,
    house: input.house,
    street: input.street,
    landmark: input.landmark || null,
    pincode: input.pincode,
    city: input.city,
    state: input.state,
    address_type: input.addressType || 'Home',
    product_slug: product.slug,
    product_name: product.name,
    variant: input.variant || null,
    quantity: breakdown.quantity,
    unit_price: breakdown.unitPrice,
    subtotal: breakdown.subtotal,
    discount: breakdown.discount,
    shipping_charge: breakdown.shippingCharge,
    total: breakdown.total,
    notes: input.notes || null,
  });

  db.prepare(
    `INSERT INTO order_events (order_id, from_status, to_status, note, actor)
     VALUES (?, NULL, 'New Order', 'Order placed (COD) — no OTP; manual confirmation required.', 'system')`
  ).run(orderId);

  return { order: getByOrderId(orderId) };
}

function getByOrderId(orderId) {
  const row = getDb().prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  return toApi(row);
}

/** Public tracking: requires BOTH order id and matching mobile number. */
function track(orderId, phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return { error: 'invalid_phone' };
  const row = getDb().prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!row) return { error: 'not_found' };
  if (row.phone !== normalized) return { error: 'not_found' }; // do not leak existence

  const idx = TRACKING_PIPELINE.indexOf(row.order_status);
  const cancelled = row.order_status === 'Cancelled';
  const steps = TRACKING_PIPELINE.map((status, i) => ({
    status,
    reached: idx >= 0 ? i <= idx : false,
  }));

  return {
    order: {
      orderId: row.order_id,
      productName: row.product_name,
      quantity: row.quantity,
      total: row.total,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      orderStatus: row.order_status,
      createdAt: row.created_at,
    },
    cancelled,
    steps,
  };
}

function list({ search, status, limit = 100, offset = 0 } = {}) {
  const clauses = [];
  const params = {};
  if (status && ORDER_STATUSES.includes(status)) {
    clauses.push('order_status = @status');
    params.status = status;
  }
  if (search) {
    clauses.push(`(
      order_id LIKE @q OR customer_name LIKE @q OR phone LIKE @q OR city LIKE @q OR product_name LIKE @q
    )`);
    params.q = `%${search}%`;
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = getDb()
    .prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: Number(limit) || 100, offset: Number(offset) || 0 });
  return rows.map(toApi);
}

/** Change an order's status (admin only). Delivered ⇒ payment Paid. */
function setStatus(orderId, status, { note, actor = 'admin' } = {}) {
  if (!ORDER_STATUSES.includes(status)) return { error: 'invalid_status' };
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
  if (!row) return { error: 'not_found' };

  const paymentStatus = status === 'Delivered' ? 'Paid' : row.payment_status;

  db.prepare(`
    UPDATE orders SET order_status = ?, payment_status = ?, updated_at = datetime('now')
    WHERE order_id = ?
  `).run(status, paymentStatus, orderId);

  db.prepare(
    `INSERT INTO order_events (order_id, from_status, to_status, note, actor)
     VALUES (?, ?, ?, ?, ?)`
  ).run(orderId, row.order_status, status, note || null, actor);

  return { order: getByOrderId(orderId) };
}

function events(orderId) {
  return getDb()
    .prepare('SELECT * FROM order_events WHERE order_id = ? ORDER BY id ASC')
    .all(orderId);
}

/** Sales summary for the admin dashboard. */
function summary() {
  const db = getDb();
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(SUM(CASE WHEN order_status = 'Delivered' THEN total ELSE 0 END), 0) AS deliveredRevenue,
      COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN total ELSE 0 END), 0) AS paidRevenue
    FROM orders
  `).get();

  const byStatus = db.prepare(`
    SELECT order_status AS status, COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue
    FROM orders GROUP BY order_status
  `).all();

  const byProduct = db.prepare(`
    SELECT product_slug AS slug, product_name AS name,
           COUNT(*) AS orders, COALESCE(SUM(quantity),0) AS units,
           COALESCE(SUM(total),0) AS revenue
    FROM orders GROUP BY product_slug ORDER BY revenue DESC
  `).all();

  const pendingCall = db.prepare(`
    SELECT COUNT(*) AS n FROM orders WHERE order_status IN ('New Order','Call Pending')
  `).get().n;

  return {
    totals: {
      orders: totals.orders,
      revenue: totals.revenue,
      deliveredRevenue: totals.deliveredRevenue,
      paidRevenue: totals.paidRevenue,
      pendingCall,
    },
    byStatus,
    byProduct,
  };
}

module.exports = {
  ORDER_STATUSES,
  TRACKING_PIPELINE,
  toApi,
  createOrder,
  getByOrderId,
  track,
  list,
  setStatus,
  events,
  summary,
};
