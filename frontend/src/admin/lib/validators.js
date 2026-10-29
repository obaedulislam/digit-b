/** Tiny validators for Mantine `useForm({ validate })`, mirroring the backend rules. Return an error string or null. */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const required = (label, max) => (value) => {
  const text = String(value ?? '').trim();
  if (!text) return `Enter ${label}.`;
  if (max && text.length > max) return `Keep ${label} under ${max} characters.`;
  return null;
};

export const maxLength = (label, max) => (value) => (String(value ?? '').length > max ? `Keep ${label} under ${max} characters.` : null);

export const slug = (value) => (value && !SLUG_PATTERN.test(value) ? 'Use lowercase letters, numbers and single hyphens.' : null);

export const intBetween = (label, min, max) => (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? null : `${label} must be a whole number from ${min} to ${max}.`;
};

/** Every item of a string list must be non-empty-or-blank (blank rows are dropped on save) and within `max`. */
export const listItems = (label, max) => (items) => {
  const index = (items ?? []).findIndex((item) => String(item).length > max);
  return index >= 0 ? `${label} #${index + 1} is longer than ${max} characters.` : null;
};

/** Rows `[{ a, b }]` where a row that has one field filled must have the others filled too. */
export const rowsComplete = (label, fields) => (rows) => {
  const index = (rows ?? []).findIndex((row) => {
    const filled = fields.filter((field) => String(row?.[field] ?? '').trim() !== '');
    return filled.length > 0 && filled.length < fields.length;
  });
  return index >= 0 ? `${label} #${index + 1}: fill in every field or remove the row.` : null;
};

/** Mirrors the backend: min 10 chars, letters, mixed case and numbers. Returns a message or null. */
export const passwordProblem = (value) => {
  if (value.length < 10) return 'Use at least 10 characters.';
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return 'Include both upper and lower case letters.';
  if (!/\d/.test(value)) return 'Include at least one number.';
  return null;
};
