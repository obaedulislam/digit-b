/** Application form definition: steps, options, validation and payload mapping (pure, unit-tested). */

export const STEPS = [
  { id: 'basic', label: 'Basic information', hint: 'Who you are and how to reach you', fields: ['first_name', 'last_name', 'email', 'phone', 'location', 'linkedin_url'] },
  {
    id: 'qualification',
    label: 'Qualification',
    hint: 'Your experience and skills',
    fields: ['current_title', 'current_company', 'years_experience', 'highest_education', 'skills', 'expected_salary', 'cover_letter'],
  },
  { id: 'work', label: 'Work status', hint: 'How you want to work, and your CV', fields: ['work_status', 'available_from', 'resume'] },
  { id: 'review', label: 'Review & submit', hint: 'Check everything, then send', fields: ['consent'] },
];

export const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High school' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: "Bachelor's degree" },
  { value: 'master', label: "Master's degree" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'other', label: 'Other' },
];

export const WORK_STATUS_OPTIONS = [
  { value: 'remote', label: 'Remote', description: 'Work from wherever you are most productive.' },
  { value: 'hybrid', label: 'Hybrid', description: 'A balance of home and office days.' },
  { value: 'onsite', label: 'In person', description: 'On site with the team, every day.' },
];

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];
const RESUME_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const initialValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  location: '',
  linkedin_url: '',
  current_title: '',
  current_company: '',
  years_experience: '',
  highest_education: null,
  skills: [],
  expected_salary: '',
  cover_letter: '',
  work_status: '',
  available_from: '',
  resume: null,
  consent: false,
  website: '',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const formatBytes = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Friendly error for a chosen résumé, or `null` when it is acceptable. */
export function validateResume(file) {
  if (!file) return 'Please attach your CV or résumé.';
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  if (!RESUME_EXTENSIONS.includes(extension) || (file.type && !RESUME_MIMES.includes(file.type))) {
    return 'That file type is not supported. Please upload a PDF, DOC or DOCX.';
  }
  if (file.size === 0) return 'That file looks empty. Please choose another.';
  if (file.size > RESUME_MAX_BYTES) return `That file is ${formatBytes(file.size)}. The maximum is 5 MB.`;
  return null;
}

/** Adds https:// when someone types "linkedin.com/in/me". Returns '' for empty input. */
export function normalizeUrl(value = '') {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}

export const todayISO = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const required = (message) => (value) => (String(value ?? '').trim() ? null : message);
const maxLen = (limit, label) => (value) => (String(value ?? '').trim().length > limit ? `${label} must be ${limit} characters or fewer` : null);
const first = (...checks) => (value, values) => {
  for (const check of checks) {
    const result = check(value, values);
    if (result) return result;
  }
  return null;
};

const parseWholeNumber = (value) => {
  const cleaned = String(value ?? '').replace(/[\s,]/g, '');
  return /^\d+$/.test(cleaned) ? Number.parseInt(cleaned, 10) : null;
};

/** Field → validator(value, values) → message | null. Mirrors docs/02-api-contract.md. */
export const validators = {
  first_name: first(required('Enter your first name'), maxLen(80, 'First name')),
  last_name: first(required('Enter your last name'), maxLen(80, 'Last name')),
  email: first(required('Enter your email address'), (v) => (EMAIL.test(String(v).trim()) ? null : 'Enter a valid email address')),
  phone: first(required('Enter a phone number'), (v) => {
    const trimmed = String(v).trim();
    const digits = trimmed.replace(/\D/g, '');
    if (!/^[+()\d][\d\s().-]*$/.test(trimmed) || digits.length < 7 || trimmed.length > 20) return 'Enter a valid phone number (7–20 characters)';
    return null;
  }),
  location: first(required('Tell us where you are based'), maxLen(120, 'Location')),
  linkedin_url: (v) => (!String(v ?? '').trim() || isValidUrl(normalizeUrl(v)) ? null : 'Enter a valid link, e.g. linkedin.com/in/yourname'),
  current_title: first(required('Enter your current job title'), maxLen(120, 'Job title')),
  current_company: maxLen(120, 'Company'),
  years_experience: (v) => {
    if (!String(v ?? '').trim()) return 'Enter your years of experience';
    const n = parseWholeNumber(v);
    return n === null || n > 60 ? 'Enter a whole number between 0 and 60' : null;
  },
  highest_education: (v) => (v ? null : 'Select your highest level of education'),
  skills: (v) => (Array.isArray(v) && v.length > 15 ? 'Add up to 15 skills' : null),
  expected_salary: (v) => (!String(v ?? '').trim() || parseWholeNumber(v) !== null ? null : 'Enter a whole number, without symbols'),
  cover_letter: maxLen(4000, 'Cover letter'),
  work_status: (v) => (['remote', 'hybrid', 'onsite'].includes(v) ? null : 'Choose how you would like to work'),
  available_from: (v) => (!v || v >= todayISO() ? null : 'Choose today or a future date'),
  resume: (v) => validateResume(v),
  consent: (v) => (v ? null : 'You need to accept the privacy policy to apply'),
};

/** Errors for the given fields only (`{}` when valid). */
export function validateFields(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    const message = validators[field]?.(values[field], values);
    if (message) errors[field] = message;
  });
  return errors;
}

export const validateStep = (stepIndex, values) => validateFields(STEPS[stepIndex].fields, values);
export const validateAll = (values) => validateFields(STEPS.flatMap((s) => s.fields), values);

/** Index of the step that owns `field` (used to jump to a server-side error). */
export const stepForField = (field) => STEPS.findIndex((step) => step.fields.includes(field));

/** Index of the earliest step containing any of `fieldNames`, or -1. */
export function firstStepWithErrors(errors) {
  const indexes = Object.keys(errors).map(stepForField).filter((i) => i >= 0);
  return indexes.length ? Math.min(...indexes) : -1;
}

/** Form values → fields for `publicApi.submitApplication` (contract names exactly). */
export function buildPayload(values, jobSlug) {
  const text = (v) => String(v ?? '').trim();
  return {
    job: jobSlug || undefined,
    first_name: text(values.first_name),
    last_name: text(values.last_name),
    email: text(values.email),
    phone: text(values.phone),
    location: text(values.location),
    linkedin_url: normalizeUrl(values.linkedin_url) || undefined,
    current_title: text(values.current_title),
    current_company: text(values.current_company) || undefined,
    years_experience: parseWholeNumber(values.years_experience),
    highest_education: values.highest_education,
    skills: values.skills?.length ? values.skills : undefined,
    work_status: values.work_status,
    expected_salary: parseWholeNumber(values.expected_salary) ?? undefined,
    available_from: values.available_from || undefined,
    cover_letter: text(values.cover_letter) || undefined,
    resume: values.resume,
    consent: Boolean(values.consent),
    website: values.website || undefined,
  };
}
