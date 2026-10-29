/** Small pure helpers used by several admin forms and tables. */

export const slugify = (value = '') =>
  String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

const pad = (n) => String(n).padStart(2, '0');

/** ISO string (UTC) -> value for `<input type="datetime-local">` in the viewer's timezone. */
export function isoToLocalInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `datetime-local` value -> ISO string (UTC) for the API, or null. */
export function localInputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** '' / undefined -> null, numeric strings -> numbers (for nullable integer columns). */
export function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** '' / whitespace -> null, otherwise the trimmed string. */
export const toNullableString = (value) => {
  const text = typeof value === 'string' ? value.trim() : value;
  return text === '' || text === undefined || text === null ? null : text;
};

/** Drops blank entries and trims a list of strings. */
export const cleanList = (list = []) => list.map((item) => String(item ?? '').trim()).filter(Boolean);

/** Drops rows where every field is blank; trims the rest. */
export const cleanRows = (rows = [], fields = []) =>
  rows
    .map((row) => Object.fromEntries(fields.map((field) => [field, String(row?.[field] ?? '').trim()])))
    .filter((row) => fields.some((field) => row[field] !== ''));

/** mailto: link for replying to an inquiry (subject + greeting are URL-encoded). */
export function buildMailto(email, { subject, name } = {}) {
  const query = [];
  if (subject) query.push(`subject=${encodeURIComponent(subject.startsWith('Re:') ? subject : `Re: ${subject}`)}`);
  if (name) query.push(`body=${encodeURIComponent(`Hi ${name},\n\n`)}`);
  return `mailto:${email}${query.length ? `?${query.join('&')}` : ''}`;
}

/** Human file size: 1536 -> "1.5 KB". */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** "new_applications" -> "New applications"; "full_time" -> "Full time". */
export const humanize = (value = '') => {
  const text = String(value).replace(/[_-]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const fullDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

/** Short weekday + day label for chart axes: "2026-10-29" -> "Oct 29". */
export const shortDay = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

/** Safe deep read: getIn({ a: { b: [1] } }, 'a.b.0') -> 1 */
export const getIn = (object, path) =>
  String(path)
    .split('.')
    .reduce((value, key) => (value === undefined || value === null ? undefined : value[key]), object);

/** 3 -> "3 yrs exp." (empty for null/undefined). */
export const pluralizeYears = (years) =>
  years === null || years === undefined ? '' : `${years} ${years === 1 ? 'yr' : 'yrs'} exp.`;
