'use strict';

/**
 * Console email provider — the safe default.
 *
 * Used when EMAIL_PROVIDER is unset or set to `console`, and as the fallback
 * whenever no real provider is configured. It needs NO credentials and never
 * throws, so an order can always be created even with zero email setup.
 *
 * The rendered email is logged server-side only (never returned to a client).
 */

module.exports = {
  name: 'console',

  /**
   * @param {{to:string, from:string, subject:string, html:string, text:string}} msg
   * @returns {Promise<{ok:boolean, id:string, provider:string}>}
   */
  async send(msg) {
    /* eslint-disable no-console */
    console.log(
      `[email:console] no email provider configured — logging notification only. ` +
        `to=${msg.to} from=${msg.from} subject="${msg.subject}"`
    );
    console.log('[email:console] ----- plain-text body -----');
    console.log(msg.text);
    console.log('[email:console] ---------------------------');
    /* eslint-enable no-console */
    return { ok: true, id: `console-${Date.now()}`, provider: 'console' };
  },
};
