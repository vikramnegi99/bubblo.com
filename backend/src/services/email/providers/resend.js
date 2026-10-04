'use strict';

/**
 * Resend email provider (HTTP API).
 *
 * Selected when EMAIL_PROVIDER=resend. The API key is read from
 * EMAIL_PROVIDER_API_KEY and is never logged or returned to a client.
 *
 * Uses the built-in global `fetch` (Node 18+) so no SDK dependency is needed.
 */

const env = require('../../../config/env');
const { parseFromAddress } = require('../utils');

const ENDPOINT = 'https://api.resend.com/emails';

module.exports = {
  name: 'resend',

  async send(msg) {
    if (!env.EMAIL_PROVIDER_API_KEY) {
      throw new Error('EMAIL_PROVIDER_API_KEY is not configured for Resend');
    }
    const from = parseFromAddress(msg.from);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from.name ? `${from.name} <${from.email}>` : from.email,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const detail = (data && (data.message || data.error)) || res.statusText;
      throw new Error(`Resend API error ${res.status}: ${detail}`);
    }
    return { ok: true, id: (data && data.id) || null, provider: 'resend' };
  },
};
