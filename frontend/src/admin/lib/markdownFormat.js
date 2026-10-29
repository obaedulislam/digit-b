/**
 * Pure text transforms behind the Markdown editor toolbar.
 * `applyMarkdownFormat(text, start, end, kind)` -> `{ text, start, end }` (new text + selection).
 */

const wrap = (text, start, end, before, after = before, placeholder = 'text') => {
  const selected = text.slice(start, end) || placeholder;
  const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
  return { text: next, start: start + before.length, end: start + before.length + selected.length };
};

/** Applies `prefixer(line, index)` to every line touched by the selection. */
const prefixLines = (text, start, end, prefixer) => {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = text.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const block = text.slice(lineStart, lineEnd);
  const changed = block.split('\n').map(prefixer).join('\n');
  return {
    text: `${text.slice(0, lineStart)}${changed}${text.slice(lineEnd)}`,
    start: lineStart,
    end: lineStart + changed.length,
  };
};

const stripHeading = (line) => line.replace(/^#{1,6}\s+/, '');

export function applyMarkdownFormat(text, start, end, kind) {
  switch (kind) {
    case 'bold':
      return wrap(text, start, end, '**');
    case 'italic':
      return wrap(text, start, end, '_');
    case 'code':
      return wrap(text, start, end, '`', '`', 'code');
    case 'link': {
      const selected = text.slice(start, end) || 'link text';
      const next = `${text.slice(0, start)}[${selected}](https://)${text.slice(end)}`;
      const urlStart = start + selected.length + 3;
      return { text: next, start: urlStart, end: urlStart + 8 };
    }
    case 'h2':
      return prefixLines(text, start, end, (line) => `## ${stripHeading(line)}`);
    case 'h3':
      return prefixLines(text, start, end, (line) => `### ${stripHeading(line)}`);
    case 'ul':
      return prefixLines(text, start, end, (line) => (line.startsWith('- ') ? line.slice(2) : `- ${line}`));
    case 'ol':
      return prefixLines(text, start, end, (line, index) => (/^\d+\.\s/.test(line) ? line.replace(/^\d+\.\s/, '') : `${index + 1}. ${line}`));
    case 'quote':
      return prefixLines(text, start, end, (line) => (line.startsWith('> ') ? line.slice(2) : `> ${line}`));
    default:
      return { text, start, end };
  }
}
