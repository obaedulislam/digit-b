import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

// Links in user-authored content: open external ones safely.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Markdown → sanitised HTML. Content is admin-authored but is still sanitised
 * (defence in depth): scripts, inline handlers and unknown protocols are stripped.
 */
export function renderMarkdown(source = '') {
  const html = marked.parse(String(source ?? ''), { async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
}

/** Rough reading time for a markdown string. */
export const readingMinutes = (source = '') => Math.max(1, Math.round(String(source).split(/\s+/).length / 220));
