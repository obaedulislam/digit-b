import { useSettings } from '@/hooks/useSettings';
import { siteUrl } from '@/lib/format';

/**
 * Per-page SEO. React 19 hoists <title>/<meta>/<link> into <head>.
 * Pass `jsonLd` (object or array) for structured data, `noindex` for admin/utility pages.
 */
export function Seo({ title, description, path, image, type = 'website', jsonLd, noindex = false }) {
  const { settings } = useSettings();
  const siteName = settings.company.name || 'DIGIT-B';
  const defaultTitle = settings.seo.site_title || `${siteName} — Retail supply chain tech recruitment`;
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const desc = description || settings.seo.default_description || settings.company.description || '';
  const canonical = path !== undefined ? siteUrl(path) : undefined;
  const ogImage = image || settings.seo.og_image;
  const ogImageUrl = ogImage ? (ogImage.startsWith('http') ? ogImage : siteUrl(ogImage)) : undefined;
  const structured = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta name="twitter:card" content={ogImageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      {structured.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </>
  );
}
