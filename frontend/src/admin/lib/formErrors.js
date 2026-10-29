import { parseApiError } from '@/api/client';

/**
 * Maps any thrown API error to what a form needs:
 *  - `fieldErrors`: `{ 'responsibilities.0': 'msg' }` ready for Mantine `form.setErrors`
 *  - `message`: a human sentence for toasts / form-level alerts
 *  - `isValidation`: true for a 422 that carried field errors
 */
export function mapFormError(error) {
  const parsed = parseApiError(error);
  const hasFields = parsed.status === 422 && Object.keys(parsed.fieldErrors).length > 0;
  return {
    ...parsed,
    isValidation: hasFields,
    message: hasFields ? 'Please fix the highlighted fields.' : parsed.message,
  };
}

/** Which top-level groups (e.g. settings tabs) contain errors: `{ contact: true }`. */
export function groupsWithErrors(errors = {}) {
  return Object.keys(errors).reduce((acc, key) => {
    acc[key.split('.')[0]] = true;
    return acc;
  }, {});
}

/** Moves keyboard focus to the first invalid control of a form (after a failed submit). */
export function focusFirstInvalid(root = document) {
  window.requestAnimationFrame(() => {
    const target = root.querySelector('[aria-invalid="true"], [data-error="true"]');
    if (target && typeof target.focus === 'function') target.focus();
  });
}

/** Friendly messages for throttling / bad credentials / network. Pure so it is easy to test. */
export function loginErrorMessage(error) {
  const mapped = mapFormError(error);
  if (mapped.status === 429) {
    const retry = Number(error?.response?.headers?.['retry-after']);
    const wait = Number.isFinite(retry) && retry > 0 ? ` Try again in ${retry > 60 ? `${Math.ceil(retry / 60)} minutes` : `${retry} seconds`}.` : ' Please wait a minute and try again.';
    return `Too many sign-in attempts.${wait}`;
  }
  if (mapped.status === 401) return 'The email or password is incorrect.';
  return mapped.message;
}
