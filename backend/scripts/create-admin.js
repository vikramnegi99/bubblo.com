'use strict';

/**
 * Create (or update) an admin account.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-pass' npm run create-admin
 * or:
 *   node scripts/create-admin.js you@example.com 'strong-pass' "Your Name"
 *
 * The password is bcrypt-hashed before storage — no plaintext secrets are kept.
 */

const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const { getDb, applySchema } = require('../src/db');

function main() {
  applySchema();
  const db = getDb();

  const email = (process.argv[2] || env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.argv[3] || env.ADMIN_PASSWORD;
  const name = process.argv[4] || 'Store Owner';

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error(
      'Provide credentials via env (ADMIN_EMAIL / ADMIN_PASSWORD) or as arguments:\n' +
        "  node scripts/create-admin.js you@example.com 'strong-pass' \"Your Name\""
    );
    process.exit(1);
  }

  if (password.length < 8) {
    // eslint-disable-next-line no-console
    console.error('Please choose a password of at least 8 characters.');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 12);
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);

  if (existing) {
    db.prepare("UPDATE admins SET password_hash = ?, name = ?, updated_at = datetime('now') WHERE email = ?")
      .run(hash, name, email);
    // eslint-disable-next-line no-console
    console.log(`[create-admin] updated password for ${email}`);
  } else {
    db.prepare('INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
      .run(email, hash, name, 'owner');
    // eslint-disable-next-line no-console
    console.log(`[create-admin] created admin ${email}`);
  }
}

main();
