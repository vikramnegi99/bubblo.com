'use strict';

/**
 * End-to-end smoke test — boots the API in-process and exercises the flow.
 * Proves: 3 products seed, campaign is inactive, an order is created WITHOUT
 * any OTP step, tracking works, admin auth works, and Delivered ⇒ Paid.
 *
 * Uses node:http (not fetch) so it runs in constrained sandboxes.
 * Run: node scripts/smoke-test.js
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const { createApp } = require('../src/app');
const { applySchema, getDb } = require('../src/db');
const { seed } = require('../src/db/seed');
const bcrypt = require('bcryptjs');

function request(base, method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try { json = raw ? JSON.parse(raw) : null; } catch { json = raw; }
          resolve({ status: res.statusCode, json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  applySchema();
  seed();
  const db = getDb();
  if (!db.prepare('SELECT 1 FROM admins WHERE email = ?').get('smoke@bubblo.test')) {
    db.prepare('INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
      .run('smoke@bubblo.test', bcrypt.hashSync('smoke-pass-123', 10), 'Smoke', 'owner');
  }

  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const results = [];
  const ok = (label, cond, extra = '') => {
    results.push(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  ' + extra : ''}`);
    if (!cond) process.exitCode = 1;
  };

  try {
    let r = await request(base, 'GET', '/api/health');
    ok('health', r.status === 200 && r.json.status === 'ok');

    r = await request(base, 'GET', '/api/products');
    ok('3 products seeded', r.json.products.length === 3, `(got ${r.json.products.length})`);
    const slugs = r.json.products.map((p) => p.slug).sort();
    ok('expected slugs', JSON.stringify(slugs) === JSON.stringify(['automatic-bubble-gun', 'fairy-butterfly-bubble-wand', 'lotus-bubble-wand']));
    const lotus = r.json.products.find((p) => p.slug === 'lotus-bubble-wand');
    ok('lotus price/discount', lotus.price === 999 && lotus.mrp === 1499 && lotus.discount === 33);
    ok('lotus hero is a delivery URL', /^https:\/\/res\.cloudinary\.com\/acqrwkcn\/image\/upload\//.test(lotus.hero.url));
    ok('lotus gallery has 3 imgs', lotus.gallery.length === 3);
    const gun = r.json.products.find((p) => p.slug === 'automatic-bubble-gun');
    ok('gun discount 42', gun.discount === 42 && gun.price === 349 && gun.mrp === 599);
    const fairy = r.json.products.find((p) => p.slug === 'fairy-butterfly-bubble-wand');
    ok('fairy discount 37', fairy.discount === 37 && fairy.price === 1250 && fairy.mrp === 1999);

    r = await request(base, 'GET', '/api/campaign');
    ok('campaign inactive by default', r.json.campaign.active === false && r.json.campaign.showCountdown === false);
    ok('campaign exposes isActive + start/end', r.json.campaign.isActive === false && 'campaignStart' in r.json.campaign && 'campaignEnd' in r.json.campaign);

    r = await request(base, 'POST', '/api/orders', { customerName: 'Test User', phone: '12345', house: '1', street: 'S', pincode: '560001', city: 'Bengaluru', state: 'Karnataka', addressType: 'Home', productSlug: 'lotus-bubble-wand', quantity: 1, paymentMethod: 'COD' });
    ok('short phone rejected', r.status === 422 && r.json.fields.phone === 'Please enter a valid 10-digit mobile number.', JSON.stringify(r.json.fields));

    r = await request(base, 'POST', '/api/orders', { customerName: 'Test User', phone: '5123456789', house: '1', street: 'S', pincode: '560001', city: 'Bengaluru', state: 'Karnataka', addressType: 'Home', productSlug: 'lotus-bubble-wand', quantity: 1, paymentMethod: 'COD' });
    ok('bad prefix rejected', r.status === 422);

    r = await request(base, 'POST', '/api/orders', { customerName: 'Test User', phone: '9876543210', email: 't@example.com', house: '12A', street: 'MG Road', landmark: 'Near Park', pincode: '560001', city: 'Bengaluru', state: 'Karnataka', addressType: 'Home', productSlug: 'lotus-bubble-wand', quantity: 2, paymentMethod: 'COD' });
    const j = r.json;
    ok('order created immediately (201)', r.status === 201, JSON.stringify(j).slice(0, 160));
    const orderId = j.order && j.order.orderId;
    ok('order id format BB-XXXXXX', /^BB-[A-Z0-9]{6}$/.test(orderId || ''), orderId);
    ok('phone normalized to +91', j.order.phone === '+919876543210');
    ok('phone display formatted', j.order.phoneDisplay === '+91 98765 43210', j.order.phoneDisplay);
    ok('status = New Order', j.order.orderStatus === 'New Order');
    ok('payment = COD / Pending', j.order.paymentMethod === 'COD' && j.order.paymentStatus === 'Pending');
    ok('total = 2*999 + 49 shipping', j.order.total === 2 * 999 + 49, String(j.order.total));
    ok('call link present', j.order.callLink === 'tel:+919876543210');
    ok('whatsapp link present', typeof j.order.whatsappLink === 'string' && j.order.whatsappLink.startsWith('https://wa.me/919876543210?text='));
    ok('confirmation message present', /confirm your COD order/i.test(j.message));

    r = await request(base, 'POST', '/api/orders/track', { orderId, phone: '9876543210' });
    ok('track works', r.status === 200 && r.json.order.orderId === orderId && Array.isArray(r.json.steps));

    r = await request(base, 'POST', '/api/orders/track', { orderId, phone: '9999999999' });
    ok('track rejects wrong phone', r.status === 404);

    r = await request(base, 'POST', '/api/admin/login', { email: 'smoke@bubblo.test', password: 'smoke-pass-123' });
    ok('admin login', r.status === 200 && !!r.json.token);
    const token = r.json.token;

    r = await request(base, 'PATCH', `/api/admin/orders/${orderId}/status`, { status: 'Delivered' }, token);
    ok('status -> Delivered', r.status === 200 && r.json.order.orderStatus === 'Delivered');
    ok('Delivered => payment Paid', r.json.order.paymentStatus === 'Paid');

    r = await request(base, 'GET', '/api/admin/orders');
    ok('admin orders requires auth', r.status === 401);

    for (const path of ['/api/otp/send', '/api/otp/verify', '/api/orders/otp', '/api/auth/otp', '/api/otp/resend']) {
      r = await request(base, 'POST', path, {});
      ok(`no OTP route ${path}`, r.status === 404);
    }

    r = await request(base, 'GET', '/api/admin/summary', null, token);
    ok('summary has totals', typeof r.json.totals.revenue === 'number' && r.json.totals.orders >= 1);

    // Admin can toggle product visibility + reorder gallery.
    r = await request(base, 'PATCH', '/api/admin/products/automatic-bubble-gun', { visible: false }, token);
    ok('admin hides product', r.status === 200 && r.json.product.visible === false);
    r = await request(base, 'GET', '/api/products');
    ok('hidden product not public', r.json.products.length === 2);
    r = await request(base, 'PATCH', '/api/admin/products/automatic-bubble-gun', { visible: true }, token);

    // Asset-mixing guard.
    r = await request(base, 'PATCH', '/api/admin/products/lotus-bubble-wand', { gallery: ['file_00000000e62882118326d5fff23e310c'] }, token);
    ok('asset mixing rejected', r.status === 422 && r.json.error === 'asset_mismatch');
  } finally {
    server.close();
  }

  // eslint-disable-next-line no-console
  console.log('\n' + results.join('\n'));
  // eslint-disable-next-line no-console
  console.log(`\n${results.filter((l) => l.startsWith('PASS')).length}/${results.length} checks passed.`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
