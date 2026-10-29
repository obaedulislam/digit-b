import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { cx } from '@/lib/cx';

/** Renders admin-authored markdown as sanitised, typographically styled HTML. */
export function Markdown({ source, className }) {
  const html = useMemo(() => renderMarkdown(source), [source]);
  // Safe: the HTML is sanitised by DOMPurify inside renderMarkdown.
  return <div className={cx('markdown', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
