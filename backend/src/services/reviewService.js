'use strict';

const { getDb } = require('../db');

/** Approved reviews for a product (public). No fake/seeded reviews exist. */
function listApproved(productSlug) {
  return getDb()
    .prepare('SELECT id, customer_name AS customerName, rating, title, body, created_at AS createdAt FROM reviews WHERE product_slug = ? AND approved = 1 ORDER BY created_at DESC')
    .all(productSlug);
}

function listAll({ approved } = {}) {
  const db = getDb();
  if (approved === true || approved === false) {
    return db
      .prepare('SELECT * FROM reviews WHERE approved = ? ORDER BY created_at DESC')
      .all(approved ? 1 : 0);
  }
  return db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
}

/** A public customer can submit a review; it stays pending until moderated. */
function submit({ productSlug, customerName, rating, title, body }) {
  const db = getDb();
  const product = db.prepare('SELECT slug FROM products WHERE slug = ?').get(productSlug);
  if (!product) return { error: 'product_not_found' };
  const info = db
    .prepare(`INSERT INTO reviews (product_slug, customer_name, rating, title, body, approved)
              VALUES (?, ?, ?, ?, ?, 0)`)
    .run(productSlug, customerName, Math.min(5, Math.max(1, Number(rating) || 5)), title || null, body);
  return { id: info.lastInsertRowid };
}

function setApproved(id, approved) {
  const db = getDb();
  const row = db.prepare('SELECT id FROM reviews WHERE id = ?').get(id);
  if (!row) return { error: 'not_found' };
  db.prepare('UPDATE reviews SET approved = ? WHERE id = ?').run(approved ? 1 : 0, id);
  return { ok: true };
}

function remove(id) {
  const info = getDb().prepare('DELETE FROM reviews WHERE id = ?').run(id);
  return { ok: info.changes > 0 };
}

module.exports = { listApproved, listAll, submit, setApproved, remove };
