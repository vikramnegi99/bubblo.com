'use strict';

const crypto = require('crypto');
const { getDb } = require('../db');

/**
 * Generate a unique BUBBLO order id of the form `BB-XXXXXX`
 * (6 uppercase alphanumeric characters). Retries on the rare collision.
 * @returns {string}
 */
function generateOrderId() {
  const db = getDb();
  const exists = db.prepare('SELECT 1 FROM orders WHERE order_id = ?');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  for (let attempt = 0; attempt < 12; attempt++) {
    const bytes = crypto.randomBytes(6);
    let id = '';
    for (let i = 0; i < 6; i++) id += alphabet[bytes[i] % alphabet.length];
    const candidate = `BB-${id}`;
    if (!exists.get(candidate)) return candidate;
  }
  // Extremely unlikely fallback.
  return `BB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

module.exports = { generateOrderId };
