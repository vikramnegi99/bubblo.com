'use strict';

const env = require('./config/env');
const { createApp } = require('./app');
const { applySchema } = require('./db');

// Ensure the schema exists on boot (idempotent).
applySchema();

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[bubblo] API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  // eslint-disable-next-line no-console
  console.log('[bubblo] No OTP / SMS provider is configured — COD orders are confirmed manually by phone.');
});

function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[bubblo] ${signal} received — shutting down.`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
