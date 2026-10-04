'use strict';

/**
 * SendGrid email provider (v3 Mail Send API).
 *
 * Selected when EMAIL_PROVIDER=sendgrid. The API key is read from
 * EMAIL_PROVIDER_API_KEY and is never logged or returned to a client.
 *
 * Uses the built-in global `fetch` (Node 18+) so no SDK dependency is needed.
 */

const env = require('../../../config/env');
const { parseFromAddress } = require('../utils');

const ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

module.exports = {
  name: 'sendgrid',

  async send(msg) {
    if (!env.EMAIL_PROVIDER_API_KEY) {
      throw new Error('EMAIL_PROVIDER_API_KEY is not configured for SendGrid');
    }
    const from = parseFromAddress(msg.from);

    const payload = {
      personalizations: [{ to: [{ email: msg.to }] }],
      from: from.name ? { email: from.email, name: from.name } : { email: from.email },
      subject: msg.subject,
      content: [
        { type: 'text/plain', value: msg.text },
        { type: 'text/html', value: msg.html },
      ],
      ...(msg.replyTo ? { reply_to: { email: msg.replyTo } } : {}),
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = (body && body.errors && JSON.stringify(body.errors)) || detail;
      } catch {
        /* keep statusText */
      }
      throw new Error(`SendGrid API error ${res.status}: ${detail}`);
    }
    return { ok: true, id: res.headers.get('x-message-id') || null, provider: 'sendgrid' };
  },
};
