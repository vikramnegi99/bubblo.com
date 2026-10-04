'use strict';

const env = require('../config/env');

/** Central error handler — never leaks stack traces in production. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[bubblo] error:', err);
  }
  res.status(status).json({
    error: err.code || 'server_error',
    message: err.expose ? err.message : status >= 500 ? 'Something went wrong. Please try again.' : err.message,
    ...(env.isProd ? {} : { detail: err.message }),
  });
}

function notFound(req, res) {
  res.status(404).json({ error: 'not_found', message: 'Not found.' });
}

module.exports = { errorHandler, notFound };
