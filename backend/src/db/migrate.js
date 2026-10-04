'use strict';

/**
 * Apply the schema. Run with `npm run migrate`.
 * Pass `--fresh` to drop the database file first (destructive — dev only).
 */

const fs = require('fs');
const env = require('../config/env');
const { applySchema } = require('./index');

if (process.argv.includes('--fresh')) {
  for (const suffix of ['', '-wal', '-shm']) {
    const f = env.DATABASE_FILE + suffix;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  // eslint-disable-next-line no-console
  console.log(`[migrate] removed ${env.DATABASE_FILE}`);
}

applySchema();
// eslint-disable-next-line no-console
console.log(`[migrate] schema applied to ${env.DATABASE_FILE}`);
