'use strict';

/**
 * Indian mobile number helpers.
 *
 * The customer enters ONLY the 10 digits (the +91 prefix is fixed in the UI).
 * The server normalizes to `+91XXXXXXXXXX` before storing.
 *
 * Validation rules:
 *  - exactly 10 digits
 *  - first digit between 6 and 9
 *  - anything else (spaces, letters, symbols) is rejected
 */

const TEN_DIGIT = /^[6-9]\d{9}$/;

/**
 * Strip everything except digits and reduce common prefixes to a bare
 * 10-digit local number. Does NOT validate the leading digit.
 * @param {string|number} input
 * @returns {string} digits only (best effort)
 */
function extractDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/\D/g, '');
}

/**
 * Normalize a customer-entered mobile number to `+91XXXXXXXXXX`.
 * @param {string} input
 * @returns {string|null} normalized number, or null if invalid
 */
function normalizePhone(input) {
  let digits = extractDigits(input);
  // Tolerate a pasted country code or trunk prefix.
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (!TEN_DIGIT.test(digits)) return null;
  return `+91${digits}`;
}

/** True if the input is a valid 10-digit Indian mobile number. */
function isValidPhone(input) {
  return normalizePhone(input) !== null;
}

/**
 * Format a stored number for display: `+91 98765 43210`.
 * Falls back to the raw value if it cannot be parsed.
 * @param {string} stored e.g. "+919876543210"
 */
function formatPhone(stored) {
  const digits = extractDigits(stored);
  const local =
    digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (local.length !== 10) return stored || '';
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

/** Build a tel: link for the admin "Call Customer" action. */
function telLink(stored) {
  const digits = extractDigits(stored);
  return `tel:+${digits}`;
}

/** The 10 local digits (no country code), useful for search. */
function localDigits(stored) {
  const digits = extractDigits(stored);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

module.exports = {
  TEN_DIGIT,
  extractDigits,
  normalizePhone,
  isValidPhone,
  formatPhone,
  telLink,
  localDigits,
};
