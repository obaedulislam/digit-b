/** URL ↔ state mapping and helpers for the articles / blog lists (pure, unit-tested). */

export const POSTS_PER_PAGE = 10;

/** Section path for a post `type`: article → /articles, blog → /blog. */
export const sectionPath = (type) => (type === 'blog' ? '/blog' : '/articles');
export const postPath = (post) => `${sectionPath(post.type)}/${post.slug}`;

export function parsePostParams(params) {
  const get = (key) => (params.get(key) ?? '').trim();
  return {
    search: get('search'),
    category: get('category'),
    page: Math.max(1, Number.parseInt(get('page'), 10) || 1),
  };
}

/** Applies `patch`; empty values are dropped and any change but `page` resets to page 1. */
export function patchPostParams(current, patch) {
  const state = { ...parsePostParams(current), ...patch };
  if (!('page' in patch)) state.page = 1;
  const next = new URLSearchParams();
  if (state.search) next.set('search', state.search);
  if (state.category) next.set('category', state.category);
  if (state.page > 1) next.set('page', String(state.page));
  return next;
}

export const toPostApiParams = (type, state) => ({
  type,
  category: state.category || undefined,
  search: state.search || undefined,
  page: state.page,
  per_page: POSTS_PER_PAGE,
});
