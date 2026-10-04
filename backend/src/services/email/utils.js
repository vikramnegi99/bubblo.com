'use strict';

/**
 * Shared helpers for the email layer.
 * Nothing here touches secrets — formatting only.
 */

/**
 * Parse a `"Name <address@host>"` (or plain `"address@host"`) "from" string
 * into `{ name, email }`. Used by the HTTP providers, which want the two
 * parts separately.
 * @param {string} from
 * @returns {{name: string|undefined, email: string}}
 */
function parseFromAddress(from) {
  const value = String(from || '').trim();
  const match = value.match(/^(.*?)<\s*([^>\s]+)\s*>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '');
    return { name: name || undefined, email: match[2] };
  }
  return { name: undefined, email: value };
}

/** Format an integer amount of rupees as `₹1,998`. */
function formatINR(value) {
  const n = Math.round(Number(value) || 0);
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * Format a stored timestamp (SQLite `YYYY-MM-DD HH:MM:SS` in UTC, or an ISO
 * string) as a readable date/time in IST — the store owner is in India.
 * @param {string} value
 * @returns {string}
 */
function formatIST(value) {
  if (!value) return '';
  const iso = String(value).includes('T') ? String(value) : `${String(value).replace(' ', 'T')}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(value);
  try {
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return d.toISOString();
  }
}

module.exports = { parseFromAddress, formatINR, formatIST };
