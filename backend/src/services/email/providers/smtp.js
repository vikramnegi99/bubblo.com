'use strict';

/**
 * SMTP email provider (nodemailer).
 *
 * Selected when EMAIL_PROVIDER=smtp. All connection details come from the
 * environment (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_SECURE).
 *
 * `nodemailer` is required lazily so the rest of the app boots fine even if
 * the dependency is missing — a misconfiguration simply makes the send fail,
 * which the caller logs without ever failing the order.
 */

const env = require('../../../config/env');

let nodemailer = null;
try {
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

function buildTransport() {
  if (!nodemailer) {
    throw new Error('nodemailer is not installed — run `npm install` in backend/');
  }
  if (!env.SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured');
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: !!env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

module.exports = {
  name: 'smtp',

  async send(msg) {
    const transport = buildTransport();
    const info = await transport.sendMail({
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo || undefined,
    });
    return { ok: true, id: info.messageId || null, provider: 'smtp' };
  },
};
