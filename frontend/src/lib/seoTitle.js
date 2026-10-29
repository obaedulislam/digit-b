/**
 * API-supplied SEO titles often already end with the site name ("Role | DIGIT-B");
 * <Seo> appends it again, so strip a trailing "| Name", "- Name" or "– Name".
 */
export function stripSiteName(title = '', siteName = 'DIGIT-B') {
  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (title ?? '').replace(new RegExp(`\\s*[|\\u2013\\u2014-]\\s*${escaped}\\s*$`, 'i'), '').trim();
}
