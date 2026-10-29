/**
 * Pure helpers for the tag-style input (skills).
 * `addTags(current, raw)` accepts one tag or a comma/newline separated paste and
 * returns the new list: trimmed, de-duplicated (case-insensitive), clipped to
 * `maxLength` characters per tag and `max` tags overall.
 */
export function addTags(current = [], raw = '', { max = 15, maxLength = 40 } = {}) {
  const next = [...current];
  const seen = new Set(next.map((tag) => tag.toLowerCase()));

  String(raw)
    .split(/[,\n;]/)
    .map((part) => part.trim().replace(/\s+/g, ' ').slice(0, maxLength).trim())
    .filter(Boolean)
    .forEach((tag) => {
      if (next.length >= max || seen.has(tag.toLowerCase())) return;
      seen.add(tag.toLowerCase());
      next.push(tag);
    });

  return next;
}

export const removeTag = (current = [], index) => current.filter((_, i) => i !== index);
