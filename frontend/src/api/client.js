import axios from 'axios';

/**
 * Single axios instance for the whole app.
 * - Same-origin in dev (Vite proxy) and prod (reverse proxy) → Sanctum cookie auth just works.
 * - No secrets live here; the base URL is relative.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfReady = null;

/** Primes the XSRF cookie once per page load (Sanctum SPA flow). */
export function ensureCsrf(force = false) {
  if (!csrfReady || force) {
    csrfReady = axios
      .get('/sanctum/csrf-cookie', { withCredentials: true })
      .catch((error) => {
        csrfReady = null;
        throw error;
      });
  }
  return csrfReady;
}

// Mutating requests need the CSRF cookie first.
http.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get' && method !== 'head') await ensureCsrf();
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token expired: refresh once so the next attempt succeeds.
      csrfReady = null;
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthenticated'));
    }
    return Promise.reject(error);
  },
);

/**
 * Normalises any thrown error into `{ status, message, fieldErrors }`.
 * `fieldErrors` is `{ field: 'first message' }` ready for Mantine's `form.setErrors`.
 */
export function parseApiError(error) {
  const status = error?.response?.status ?? 0;
  const body = error?.response?.data;
  const fieldErrors = {};

  if (body?.errors && typeof body.errors === 'object') {
    Object.entries(body.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
    });
  }

  let message = body?.message;
  if (!message) {
    if (error?.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
    else if (!error?.response) message = 'We could not reach the server. Check your connection and try again.';
    else if (status === 429) message = 'Too many attempts. Please wait a minute and try again.';
    else if (status >= 500) message = 'Something went wrong on our side. Please try again shortly.';
    else message = 'Something went wrong. Please try again.';
  }

  return { status, message, fieldErrors };
}
