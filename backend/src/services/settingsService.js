'use strict';

const { getDb } = require('../db');
const { DEFAULT_SETTINGS } = require('../db/seed');

/** Read every setting as a decoded object, falling back to defaults. */
function getAll() {
  const rows = getDb().prepare('SELECT key, value FROM settings').all();
  const out = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      out[row.key] = JSON.parse(row.value);
    } catch {
      out[row.key] = row.value;
    }
  }
  return out;
}

function get(key) {
  return getAll()[key];
}

/** Persist a partial settings patch (values are JSON-encoded). */
function update(patch) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')
  `);
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(patch)) {
      stmt.run(key, JSON.stringify(value));
    }
  });
  tx();
  return getAll();
}

module.exports = { getAll, get, update };
