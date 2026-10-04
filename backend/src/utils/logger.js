'use strict';

/**
 * Tiny structured logger for the backend.
 *
 * Its main job is to make sure we never leak secrets (SMTP passwords, API
 * keys, tokens) into logs while still capturing enough for an admin to
 * troubleshoot a failed background task — for example an owner-email send
 * that failed while the order itself was created successfully.
 */

const SENSITIVE_KEY = /(pass|password|secret|token|apikey|api_key|key|auth)/i;

/** Recursively redact obviously-sensitive fields from a metadata object. */
function redact(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth > 4) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEY.test(k) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** Safely turn an unknown error into a short, log-safe message. */
function errorMessage(err) {
  if (!err) return 'unknown error';
  if (typeof err === 'string') return err;
  return err.message || String(err);
}

function line(level, message, meta) {
  const stamp = new Date().toISOString();
  const suffix = meta === undefined ? '' : ` ${JSON.stringify(redact(meta))}`;
  return `[bubblo] ${stamp} ${level} ${message}${suffix}`;
}

function info(message, meta) {
  // eslint-disable-next-line no-console
  console.log(line('INFO', message, meta));
}

function warn(message, meta) {
  // eslint-disable-next-line no-console
  console.warn(line('WARN', message, meta));
}

function error(message, err, meta) {
  const details = { ...(meta || {}) };
  if (err !== undefined) details.error = errorMessage(err);
  // eslint-disable-next-line no-console
  console.error(line('ERROR', message, details));
}

module.exports = { info, warn, error, redact, errorMessage };
