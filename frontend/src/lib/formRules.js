/**
 * Client-side validation rules that mirror docs/02-api-contract.md.
 * Each rule returns `null` when valid or an error string (Mantine `useForm` format).
 * The API remains the authority — its 422 errors are mapped back onto the same fields.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]+$/;

const text = (value) => String(value ?? '').trim();

export const rules = {
  required: (label) => (value) => (text(value) ? null : `${label} is required`),

  email: (value) => {
    if (!text(value)) return 'Email is required';
    return EMAIL_RE.test(text(value)) ? null : 'Enter a valid email address';
  },

  /** Optional phone: 7–20 characters, digits and common separators only. */
  optionalPhone: (value) => {
    const v = text(value);
    if (!v) return null;
    if (v.length < 7 || v.length > 20) return 'Phone must be 7 to 20 characters';
    return PHONE_RE.test(v) ? null : 'Use digits, spaces, + ( ) - only';
  },

  maxLength: (label, max) => (value) => (text(value).length > max ? `${label} must be ${max} characters or fewer` : null),

  /** Required text with a length window, e.g. message 10–3000. */
  lengthBetween: (label, min, max) => (value) => {
    const length = text(value).length;
    if (!length) return `${label} is required`;
    if (length < min) return `${label} must be at least ${min} characters`;
    if (length > max) return `${label} must be ${max} characters or fewer`;
    return null;
  },

  oneOf: (label, allowed) => (value) => (allowed.includes(value) ? null : `Choose ${label}`),

  consent: (value) => (value ? null : 'Please accept the privacy policy to continue'),
};

/** First failing rule wins: compose(rules.required('Name'), rules.maxLength('Name', 120)). */
export const compose =
  (...checks) =>
  (value, values) => {
    for (const check of checks) {
      const result = check(value, values);
      if (result) return result;
    }
    return null;
  };
