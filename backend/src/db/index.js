'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const env = require('../config/env');

let db;

/**
 * Open (and memoize) the SQLite connection, ensuring the data directory
 * exists. Schema application lives in migrate.js so it can be run standalone.
 */
function getDb() {
  if (db) return db;

  const dir = path.dirname(env.DATABASE_FILE);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(env.DATABASE_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

/** Read and execute schema.sql (idempotent — uses IF NOT EXISTS). */
function applySchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  getDb().exec(sql);
}

module.exports = { getDb, applySchema };
