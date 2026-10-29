import { useRef } from 'react';
import { slugify } from '../lib/helpers';

/**
 * Keeps `slug` in sync with a source field (title/name) until the editor edits
 * the slug by hand. Existing records start "touched" so their URL never changes silently.
 *
 *   const slug = useSlugField(form, 'title', isEdit);
 *   <TextInput {...form.getInputProps('title')} onChange={slug.onSourceChange} />
 *   <TextInput {...form.getInputProps('slug')} onChange={slug.onSlugChange} />
 */
export function useSlugField(form, source, initiallyTouched = false, target = 'slug') {
  const touched = useRef(initiallyTouched || Boolean(form.values[target]));

  return {
    onSourceChange: (event) => {
      const value = typeof event === 'string' ? event : event.currentTarget.value;
      form.setFieldValue(source, value);
      if (!touched.current) form.setFieldValue(target, slugify(value));
    },
    onSlugChange: (event) => {
      const value = typeof event === 'string' ? event : event.currentTarget.value;
      touched.current = value !== '';
      form.setFieldValue(target, value.toLowerCase().replace(/\s+/g, '-'));
    },
  };
}
