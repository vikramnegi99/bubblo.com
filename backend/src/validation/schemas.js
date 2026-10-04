'use strict';

const { z } = require('zod');

/**
 * Validation schemas (zod). The mobile-number messages here are the EXACT
 * strings the storefront shows, so the client and server agree.
 */

const MOBILE_MESSAGES = {
  required: 'Please enter a valid 10-digit mobile number.',
  tooShort: 'Please enter a valid 10-digit mobile number.',
  tooLong: 'Mobile number must be exactly 10 digits.',
  nonNumeric: 'Please enter numbers only.',
  badPrefix: 'Please enter a valid 10-digit mobile number.',
};

/**
 * Validate a mobile input that may arrive with an optional country/trunk
 * prefix. Returns { ok, digits, message }.
 */
function validateMobileInput(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, message: MOBILE_MESSAGES.required };
  }
  let s = String(raw).trim();

  // Reject letters/symbols early — but tolerate the common +91 / 91 / 0 prefix.
  const withoutPrefix = s.replace(/^(\+91|91|0)/, '');
  if (/[^0-9\s-]/.test(withoutPrefix)) {
    return { ok: false, message: MOBILE_MESSAGES.nonNumeric };
  }

  const digits = withoutPrefix.replace(/\D/g, '');
  if (digits.length < 10) return { ok: false, message: MOBILE_MESSAGES.tooShort };
  if (digits.length > 10) return { ok: false, message: MOBILE_MESSAGES.tooLong };
  if (!/^[6-9]/.test(digits)) return { ok: false, message: MOBILE_MESSAGES.badPrefix };
  return { ok: true, digits, message: null };
}

const mobileSchema = z
  .string({ required_error: MOBILE_MESSAGES.required })
  .superRefine((val, ctx) => {
    const res = validateMobileInput(val);
    if (!res.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: res.message });
  });

const pincodeSchema = z
  .string({ required_error: 'Please enter a valid 6-digit pincode.' })
  .transform((v) => String(v).trim())
  .refine((v) => /^[1-9]\d{5}$/.test(v), { message: 'Please enter a valid 6-digit pincode.' });

const addressTypeSchema = z.enum(['Home', 'Work', 'Other']).default('Home');

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your full name.').max(80),
  phone: mobileSchema,
  email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
  house: z.string().trim().min(1, 'Please enter your house / flat number.').max(120),
  street: z.string().trim().min(1, 'Please enter your street / area.').max(160),
  landmark: z.string().trim().max(160).optional().or(z.literal('')),
  pincode: pincodeSchema,
  city: z.string().trim().min(1, 'Please enter your city.').max(80),
  state: z.string().trim().min(1, 'Please enter your state.').max(80),
  addressType: addressTypeSchema,
  productSlug: z.string().trim().min(1, 'Please choose a product.'),
  variant: z.string().trim().max(80).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  paymentMethod: z.enum(['COD']).default('COD'),
  notes: z.string().trim().max(400).optional().or(z.literal('')),
});

const trackSchema = z.object({
  orderId: z.string().trim().min(4, 'Please enter your Order ID.'),
  phone: mobileSchema,
});

const reviewSchema = z.object({
  productSlug: z.string().trim().min(1),
  customerName: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  body: z.string().trim().min(3, 'Please write a short review.').max(1000),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email.'),
  password: z.string().min(1, 'Please enter your password.'),
});

const productPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tag: z.string().trim().max(60).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().max(4000).optional(),
  price: z.coerce.number().int().min(0).optional(),
  mrp: z.coerce.number().int().min(0).optional(),
  discount: z.coerce.number().int().min(0).max(100).optional(),
  visible: z.boolean().optional(),
  heroImage: z.string().trim().optional(),
  lifestyleImage: z.string().trim().optional(),
  gallery: z.array(z.string().trim()).max(10).optional(),
  benefits: z.array(z.object({ title: z.string().trim().max(120), text: z.string().trim().max(400) })).optional(),
  whatsIncluded: z.array(z.string().trim().max(200)).optional(),
  howItWorks: z.array(z.object({ step: z.coerce.number(), text: z.string().trim().max(400) })).optional(),
  faqs: z.array(z.object({ q: z.string().trim().max(200), a: z.string().trim().max(600) })).optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const orderStatusSchema = z.object({
  status: z.enum([
    'New Order',
    'Call Pending',
    'Call Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ]),
  note: z.string().trim().max(300).optional(),
});

const campaignSchema = z.object({
  name: z.string().trim().max(120).nullable().optional(),
  headline: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(400).nullable().optional(),
  accent: z.string().trim().max(40).nullable().optional(),
  startDate: z.string().trim().nullable().optional(),
  endDate: z.string().trim().nullable().optional(),
  // Campaign-window aliases (datetime). Either naming is accepted.
  campaignStart: z.string().trim().nullable().optional(),
  campaignEnd: z.string().trim().nullable().optional(),
  active: z.boolean().optional(),
  products: z.array(z.string().trim()).optional(),
});

const settingsSchema = z
  .object({
    brand_name: z.string().trim().max(60).optional(),
    tagline: z.string().trim().max(120).optional(),
    hero_headline: z.string().trim().max(160).optional(),
    hero_subheadline: z.string().trim().max(300).optional(),
    contact_phone: z.string().trim().max(40).optional(),
    contact_email: z.string().trim().max(120).optional(),
    contact_address: z.string().trim().max(200).optional(),
    shipping_charge: z.coerce.number().int().min(0).max(10000).optional(),
    free_shipping_threshold: z.coerce.number().int().min(0).max(1000000).optional(),
    cod_enabled: z.boolean().optional(),
    currency: z.string().trim().max(8).optional(),
    policies: z
      .object({
        shipping: z.string().max(2000).optional(),
        returns: z.string().max(2000).optional(),
        privacy: z.string().max(2000).optional(),
        terms: z.string().max(2000).optional(),
      })
      .partial()
      .optional(),
    social: z
      .object({
        instagram: z.string().max(200).optional(),
        facebook: z.string().max(200).optional(),
        youtube: z.string().max(200).optional(),
        whatsapp: z.string().max(200).optional(),
      })
      .partial()
      .optional(),
  })
  .strict();

module.exports = {
  MOBILE_MESSAGES,
  validateMobileInput,
  mobileSchema,
  pincodeSchema,
  createOrderSchema,
  trackSchema,
  reviewSchema,
  loginSchema,
  productPatchSchema,
  orderStatusSchema,
  campaignSchema,
  settingsSchema,
};
