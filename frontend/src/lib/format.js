// Formatting + client-side validation helpers shared by the storefront.

export function inr(value) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
}

export const MOBILE_MESSAGES = {
  required: 'Please enter a valid 10-digit mobile number.',
  tooShort: 'Please enter a valid 10-digit mobile number.',
  tooLong: 'Mobile number must be exactly 10 digits.',
  nonNumeric: 'Please enter numbers only.',
  badPrefix: 'Please enter a valid 10-digit mobile number.',
};

/**
 * Validate the 10-digit mobile field. The customer types ONLY the 10 digits —
 * the +91 prefix is fixed in the UI.
 * @returns {{ok:boolean, message:string|null}}
 */
export function validateMobile(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, message: MOBILE_MESSAGES.required };
  }
  const s = String(raw);
  if (/[^0-9]/.test(s)) return { ok: false, message: MOBILE_MESSAGES.nonNumeric };
  if (s.length < 10) return { ok: false, message: MOBILE_MESSAGES.tooShort };
  if (s.length > 10) return { ok: false, message: MOBILE_MESSAGES.tooLong };
  if (!/^[6-9]/.test(s)) return { ok: false, message: MOBILE_MESSAGES.badPrefix };
  return { ok: true, message: null };
}

export function validatePincode(raw) {
  const s = String(raw || '').trim();
  if (!/^[1-9]\d{5}$/.test(s)) return { ok: false, message: 'Please enter a valid 6-digit pincode.' };
  return { ok: true, message: null };
}

/** Keep only digits and cap at 10 — used on the mobile input's onChange. */
export function digitsOnly(raw, max = 10) {
  return String(raw).replace(/\D/g, '').slice(0, max);
}

export function formatPhoneDisplay(stored) {
  const d = String(stored || '').replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2) : d;
  if (local.length !== 10) return stored || '';
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
