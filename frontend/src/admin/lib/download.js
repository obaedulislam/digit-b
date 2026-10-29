import { http } from '@/api/client';

/** Strips path separators / control chars so a server-provided name can never escape the downloads folder. */
export function sanitizeFilename(name, fallback = 'download') {
  const cleaned = String(name ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-')
    .replace(/^\.+/, '')
    .trim();
  return cleaned || fallback;
}

/** Reads the file name from a Content-Disposition header (supports `filename*=UTF-8''…`). */
export function filenameFromDisposition(header, fallback = 'download') {
  if (!header) return fallback;
  const star = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i.exec(header);
  if (star) {
    try {
      return sanitizeFilename(decodeURIComponent(star[1].trim()), fallback);
    } catch {
      /* fall through to the plain form */
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? sanitizeFilename(plain[1].trim(), fallback) : fallback;
}

/** Triggers a browser download for a Blob without exposing any URL. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Error bodies of blob requests arrive as Blobs; turn them back into JSON so parseApiError works. */
async function unwrapBlobError(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      error.response.data = JSON.parse(await data.text());
    } catch {
      error.response.data = undefined;
    }
  }
  return error;
}

/**
 * Authenticated download (session cookie + CSRF handled by `http`):
 * fetched as a blob and saved with the server-provided file name.
 */
export async function downloadFile(url, { params, fallbackName = 'download' } = {}) {
  try {
    const response = await http.get(url, { params, responseType: 'blob', timeout: 60_000 });
    const filename = filenameFromDisposition(response.headers?.['content-disposition'], fallbackName);
    saveBlob(response.data, filename);
    return filename;
  } catch (error) {
    throw await unwrapBlobError(error);
  }
}
