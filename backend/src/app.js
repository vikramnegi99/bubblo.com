'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Security headers.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS allow-list — only configured origins may call the API.
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true); // same-origin / curl / server-to-server
        if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '200kb' }));
  if (!env.isProd) app.use(morgan('dev'));

  // Rate limit the whole API.
  app.use('/api', apiLimiter, routes);

  app.get('/', (req, res) => {
    res.json({ name: 'BUBBLO API', docs: '/api/health', note: 'No OTP — COD orders are confirmed manually by phone.' });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
