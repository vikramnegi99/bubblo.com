'use strict';

const path = require('path');
require('dotenv').config();

const ROOT = path.resolve(__dirname, '..', '..');

function bool(v, fallback = false) {
  if (v === undefined || v === null || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

function int(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: int(process.env.PORT, 4000),

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  DATABASE_FILE: path.resolve(
    ROOT,
    process.env.DATABASE_FILE || './data/bubblo.sqlite'
  ),

  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@bubblo.example',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  RATE_LIMIT_WINDOW_MS: int(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  RATE_LIMIT_MAX: int(process.env.RATE_LIMIT_MAX, 120),
  ORDER_RATE_LIMIT_MAX: int(process.env.ORDER_RATE_LIMIT_MAX, 20),

  SITE_URL: process.env.SITE_URL || 'http://localhost:5173',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'acqrwkcn',

  // ── Owner email notifications (COD orders) ──────────────────────
  // Provider + credentials come ONLY from the environment. Nothing here is
  // ever sent to the browser — all email logic runs server-side.
  //
  //   EMAIL_PROVIDER: smtp | resend | sendgrid | console
  //   - `console` (the default) safely logs the notification and never
  //     requires any credentials, so local/dev runs always work.
  //   - If a real provider is selected but misconfigured, the send fails
  //     quietly and the order is STILL created (email never blocks an order).
  OWNER_EMAIL: process.env.OWNER_EMAIL || 'mrvickybusines@gmail.com',
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER || 'console').trim().toLowerCase(),
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'BUBBLO Orders <no-reply@bubblo.store>',

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: int(process.env.SMTP_PORT, 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: bool(process.env.SMTP_SECURE, false),
};

env.isProd = env.NODE_ENV === 'production';

// Loud warning if a production build is using the placeholder secret.
if (env.isProd && env.JWT_SECRET === 'dev-only-insecure-secret-change-me') {
  // eslint-disable-next-line no-console
  console.warn(
    '[bubblo] WARNING: JWT_SECRET is not set in production. Set it in .env.'
  );
}

module.exports = env;
