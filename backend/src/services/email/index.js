'use strict';

/**
 * BUBBLO email service.
 *
 * A single, configurable layer that the rest of the backend talks to. The
 * provider is chosen purely from the environment (EMAIL_PROVIDER):
 *
 *   smtp     → nodemailer (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS)
 *   resend   → Resend HTTP API (EMAIL_PROVIDER_API_KEY)
 *   sendgrid → SendGrid v3 API (EMAIL_PROVIDER_API_KEY)
 *   console  → safe fallback: logs the email, needs no credentials
 *
 * Design rules (enforced here):
 *   - Credentials live ONLY in the environment. They are never logged and
 *     never returned to a client.
 *   - `sendNewCodOrderEmail` NEVER throws and never rejects — a failed email
 *     must never fail an order. Failures are logged server-side for the
 *     admin to troubleshoot.
 */

const env = require('../../config/env');
const logger = require('../../utils/logger');
const { renderCodOrderEmail } = require('./templates/codOrder');

const consoleProvider = require('./providers/console');
const smtpProvider = require('./providers/smtp');
const resendProvider = require('./providers/resend');
const sendgridProvider = require('./providers/sendgrid');

const PROVIDERS = {
  console: consoleProvider,
  smtp: smtpProvider,
  resend: resendProvider,
  sendgrid: sendgridProvider,
};

/** The configured provider name, always one of PROVIDERS' keys. */
function providerName() {
  const wanted = String(env.EMAIL_PROVIDER || 'console').toLowerCase();
  return Object.prototype.hasOwnProperty.call(PROVIDERS, wanted) ? wanted : 'console';
}

/** The resolved provider object. */
function provider() {
  return PROVIDERS[providerName()];
}

/** The owner address that receives new-order alerts. */
function ownerEmail() {
  return env.OWNER_EMAIL;
}

/**
 * Send the "new COD order" alert to the store owner.
 *
 * Resolves to a plain result object; it is guaranteed not to throw or reject.
 * Callers should invoke it WITHOUT awaiting so it never blocks the response.
 *
 * @param {object} order normalised order (see orderService.toApi)
 * @returns {Promise<{ok:boolean, provider:string, id?:string|null, error?:string}>}
 */
async function sendNewCodOrderEmail(order) {
  const name = providerName();
  try {
    if (!order || !order.orderId) {
      logger.warn('email: skipped COD notification — no order id supplied');
      return { ok: false, provider: name, error: 'missing_order' };
    }

    const { subject, html, text } = renderCodOrderEmail(order);
    const result = await provider().send({
      to: ownerEmail(),
      from: env.EMAIL_FROM,
      subject,
      html,
      text,
      replyTo: order.email || undefined,
    });

    logger.info('email: COD order notification dispatched', {
      orderId: order.orderId,
      provider: name,
      id: (result && result.id) || null,
    });
    return { ok: true, provider: name, id: (result && result.id) || null };
  } catch (err) {
    // Log safely for admin troubleshooting; the order itself is unaffected.
    logger.error(
      `email: failed to send COD order notification (provider=${name}) — order is unaffected`,
      err,
      { orderId: order && order.orderId }
    );
    return { ok: false, provider: name, error: logger.errorMessage(err) };
  }
}

/**
 * Fire-and-forget wrapper: kicks off the notification and swallows everything,
 * so callers can use it inline without awaiting or try/catch.
 * @param {object} order
 */
function notifyOwnerOfNewOrder(order) {
  // Kick the async work off the current tick so it can never delay the HTTP
  // response, and attach a final catch as a belt-and-braces guard.
  setImmediate(() => {
    sendNewCodOrderEmail(order).catch((err) => {
      logger.error('email: unexpected notification failure', err, {
        orderId: order && order.orderId,
      });
    });
  });
}

module.exports = {
  providerName,
  provider,
  ownerEmail,
  sendNewCodOrderEmail,
  notifyOwnerOfNewOrder,
};
