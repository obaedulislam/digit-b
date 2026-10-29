import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

/**
 * Search text that is typed locally, debounced, then committed to the URL
 * (`onCommit(trimmed)`), and follows the URL back when it changes from outside
 * (back/forward, "clear filters"). Returns `[text, setText]` for a controlled input.
 */
export function useUrlSearch(urlValue, onCommit, delay = 350) {
  const [text, setText] = useState(urlValue);
  const [seenUrlValue, setSeenUrlValue] = useState(urlValue);
  const [debounced] = useDebouncedValue(text, delay);

  // The URL changed: adopt it unless it is just the echo of what we committed.
  if (urlValue !== seenUrlValue) {
    setSeenUrlValue(urlValue);
    if (urlValue !== debounced.trim()) setText(urlValue);
  }

  useEffect(() => {
    const next = text.trim();
    // Commit only once the debounce has caught up with what is typed.
    if (debounced === text && next !== urlValue) onCommit(next);
  }, [debounced, text, urlValue, onCommit]);

  return [text, setText];
}
