'use strict';

/**
 * Owner "new COD order" email.
 *
 * Renders a professional, mobile-readable HTML alert (plus a plain-text
 * fallback) that the store owner receives whenever a customer places a COD
 * order. Purely presentational — it reads a normalised order object and
 * never touches secrets.
 */

const { formatINR, formatIST } = require('../utils');

/** Escape a value for safe interpolation into HTML. */
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const COLORS = {
  plum: '#3d1a4d',
  accent: '#c026d3',
  ink: '#241b2b',
  muted: '#6b6478',
  line: '#ece7f1',
  soft: '#faf7fd',
  good: '#0f7b4f',
};

/**
 * Build the email subject. The exact format is part of the product spec:
 *   `New COD Order — BUBBLO #BB-XXXXXX`
 * @param {object} order
 */
function subjectFor(order) {
  return `New COD Order — BUBBLO #${order.orderId}`;
}

/**
 * Render the order email.
 * @param {object} order normalised order (see orderService.toApi)
 * @returns {{subject: string, html: string, text: string}}
 */
function renderCodOrderEmail(order) {
  const a = order.address || {};
  const qty = Math.max(1, Number(order.quantity) || 1);
  const unitMrp = Math.round((Number(order.subtotal) || 0) / qty);
  const lineDiscount = Number(order.discount) || 0;
  const selling = Number(order.unitPrice) || 0;
  const lineTotal = selling * qty;

  const variantRow = order.variant
    ? `<div style="color:${COLORS.muted};font-size:12px;margin-top:2px;">Variant: ${esc(order.variant)}</div>`
    : '';

  const emailRow = order.email
    ? `<tr><td style="${tdLabel()}">Email</td><td style="${tdValue()}">${esc(order.email)}</td></tr>`
    : '';

  const rows = [
    row('Order ID', esc(order.orderId)),
    row('Placed on', esc(formatIST(order.createdAt))),
    row('Customer', esc(order.customerName)),
    row('Mobile', esc(order.phoneDisplay || order.phone)),
    emailRow,
    row('House / Flat', esc(a.house)),
    row('Street / Area', esc(a.street)),
    row('Landmark', esc(a.landmark || '—')),
    row('Pincode', esc(a.pincode)),
    row('City', esc(a.city)),
    row('State', esc(a.state)),
  ]
    .filter(Boolean)
    .join('');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(subjectFor(order))}</title>
</head>
<body style="margin:0;padding:0;background:#f3eef7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
  <div style="max-width:600px;margin:0 auto;padding:20px 12px;">
    <div style="background:${COLORS.plum};border-radius:16px 16px 0 0;padding:20px 22px;color:#fff;">
      <div style="font-size:20px;font-weight:800;letter-spacing:0.02em;">BUBBLO</div>
      <div style="font-size:13px;opacity:0.85;margin-top:2px;">New Cash-on-Delivery order</div>
    </div>

    <div style="background:#ffffff;padding:20px 22px;border:1px solid ${COLORS.line};border-top:0;">
      <div style="display:inline-block;background:#fbeafe;color:${COLORS.accent};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;">
        Action needed · Call to confirm
      </div>
      <h1 style="font-size:19px;margin:14px 0 4px;">Order ${esc(order.orderId)}</h1>
      <p style="margin:0;color:${COLORS.muted};font-size:13px;">
        Placed ${esc(formatIST(order.createdAt))} · Status: <strong style="color:${COLORS.ink};">${esc(order.orderStatus || 'New Order')}</strong>
      </p>
    </div>

    <div style="background:#ffffff;padding:18px 22px;border:1px solid ${COLORS.line};border-top:0;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.muted};margin:0 0 10px;">Customer &amp; delivery</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </div>

    <div style="background:#ffffff;padding:18px 22px;border:1px solid ${COLORS.line};border-top:0;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.muted};margin:0 0 10px;">Items</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="text-align:left;color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">
            <th style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};">Product</th>
            <th style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:center;">Qty</th>
            <th style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;">MRP</th>
            <th style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;">Discount</th>
            <th style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;">Selling</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 6px;border-bottom:1px solid ${COLORS.line};vertical-align:top;">
              <strong>${esc(order.productName)}</strong>
              ${variantRow}
            </td>
            <td style="padding:10px 6px;border-bottom:1px solid ${COLORS.line};text-align:center;vertical-align:top;">${qty}</td>
            <td style="padding:10px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;vertical-align:top;">${esc(formatINR(unitMrp))}</td>
            <td style="padding:10px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;vertical-align:top;color:${COLORS.good};">−${esc(formatINR(lineDiscount))}</td>
            <td style="padding:10px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;vertical-align:top;font-weight:700;">${esc(formatINR(lineTotal))}</td>
          </tr>
        </tbody>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-top:8px;">
        <tr>
          <td style="padding:6px 6px;color:${COLORS.muted};">Subtotal (at MRP)</td>
          <td style="padding:6px 6px;text-align:right;">${esc(formatINR(order.subtotal))}</td>
        </tr>
        <tr>
          <td style="padding:6px 6px;color:${COLORS.muted};">Discount</td>
          <td style="padding:6px 6px;text-align:right;color:${COLORS.good};">−${esc(formatINR(order.discount))}</td>
        </tr>
        <tr>
          <td style="padding:6px 6px;color:${COLORS.muted};">Shipping</td>
          <td style="padding:6px 6px;text-align:right;">${esc(formatINR(order.shippingCharge))}</td>
        </tr>
        <tr>
          <td style="padding:10px 6px;border-top:2px solid ${COLORS.plum};font-weight:800;font-size:16px;">Total payable</td>
          <td style="padding:10px 6px;border-top:2px solid ${COLORS.plum};text-align:right;font-weight:800;font-size:16px;">${esc(formatINR(order.total))}</td>
        </tr>
      </table>
    </div>

    <div style="background:#ffffff;padding:16px 22px;border:1px solid ${COLORS.line};border-top:0;border-radius:0 0 16px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:4px 6px;color:${COLORS.muted};">Payment method</td>
          <td style="padding:4px 6px;text-align:right;font-weight:700;">Cash on Delivery</td>
        </tr>
        <tr>
          <td style="padding:4px 6px;color:${COLORS.muted};">Order status</td>
          <td style="padding:4px 6px;text-align:right;font-weight:700;">${esc(order.orderStatus || 'New Order')} / Call Pending</td>
        </tr>
      </table>
      ${
        order.notes
          ? `<p style="margin:12px 0 0;padding:10px 12px;background:${COLORS.soft};border-radius:10px;font-size:13px;color:${COLORS.muted};"><strong style="color:${COLORS.ink};">Customer note:</strong> ${esc(order.notes)}</p>`
          : ''
      }
      <p style="margin:14px 0 0;font-size:12px;color:${COLORS.muted};">
        No OTP is used — please call the customer on
        <a href="${esc(order.callLink || '')}" style="color:${COLORS.accent};text-decoration:none;font-weight:700;">${esc(order.phoneDisplay || order.phone)}</a>
        to confirm this COD order.
      </p>
    </div>

    <p style="text-align:center;color:${COLORS.muted};font-size:11px;margin:14px 0 0;">
      Automated alert from the BUBBLO store · this message is sent only to the store owner.
    </p>
  </div>
</body>
</html>`;

  const text = [
    `BUBBLO — New Cash-on-Delivery order`,
    `Order ID: ${order.orderId}`,
    `Placed on: ${formatIST(order.createdAt)}`,
    `Customer: ${order.customerName}`,
    `Mobile: ${order.phoneDisplay || order.phone}`,
    order.email ? `Email: ${order.email}` : null,
    `Address: ${a.house}, ${a.street}${a.landmark ? `, ${a.landmark}` : ''}, ${a.city} ${a.pincode}, ${a.state}`,
    ``,
    `Item: ${order.productName}${order.variant ? ` (${order.variant})` : ''}`,
    `Quantity: ${qty}`,
    `MRP: ${formatINR(unitMrp)}`,
    `Discount: -${formatINR(lineDiscount)}`,
    `Selling price: ${formatINR(lineTotal)}`,
    `Shipping: ${formatINR(order.shippingCharge)}`,
    `Total: ${formatINR(order.total)}`,
    `Payment method: Cash on Delivery`,
    `Order status: ${order.orderStatus || 'New Order'} / Call Pending`,
    order.notes ? `Customer note: ${order.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');

  return { subject: subjectFor(order), html, text };
}

// ── small style helpers ──────────────────────────────────────────
function tdLabel() {
  return `padding:6px 6px;color:${COLORS.muted};font-size:13px;white-space:nowrap;vertical-align:top;`;
}
function tdValue() {
  return `padding:6px 6px;font-size:14px;text-align:right;vertical-align:top;`;
}
function row(label, value) {
  return `<tr><td style="${tdLabel()}">${label}</td><td style="${tdValue()}">${value}</td></tr>`;
}

module.exports = { renderCodOrderEmail, subjectFor, esc };
