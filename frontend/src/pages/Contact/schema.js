/** Contact form definition (mirrors docs/02-api-contract.md → POST /contact). */

export const INQUIRY_TYPES = [
  { value: 'hiring', label: 'I am hiring (place a job order)' },
  { value: 'candidate', label: 'I am a candidate' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'general', label: 'General question' },
];

export const DEFAULT_INQUIRY = 'general';

/** `?type=` → a valid inquiry type (unknown values fall back to "general"). */
export const resolveInquiryType = (value) => (INQUIRY_TYPES.some((t) => t.value === value) ? value : DEFAULT_INQUIRY);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 3000;

export const contactValidators = {
  name: (v) => (String(v).trim() ? null : 'Tell us your name'),
  email: (v) => (EMAIL.test(String(v).trim()) ? null : 'Enter a valid email address'),
  phone: (v) => (!String(v).trim() || /^[+()\d][\d\s().-]{5,19}$/.test(String(v).trim()) ? null : 'Enter a valid phone number'),
  inquiry_type: (v) => (INQUIRY_TYPES.some((t) => t.value === v) ? null : 'Choose what this is about'),
  message: (v) => {
    const length = String(v).trim().length;
    if (length < MESSAGE_MIN) return `Please write at least ${MESSAGE_MIN} characters`;
    if (length > MESSAGE_MAX) return `Please keep it under ${MESSAGE_MAX} characters`;
    return null;
  },
  consent: (v) => (v ? null : 'Please accept the privacy policy so we can reply to you'),
};

/** Values → API payload (empty optionals are omitted). */
export function buildContactPayload(values) {
  const text = (v) => String(v ?? '').trim();
  return {
    name: text(values.name),
    email: text(values.email),
    phone: text(values.phone) || undefined,
    company: text(values.company) || undefined,
    inquiry_type: values.inquiry_type,
    subject: text(values.subject) || undefined,
    message: text(values.message),
    consent: Boolean(values.consent),
    website: values.website || undefined,
  };
}
