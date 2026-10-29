import { describe, expect, it } from 'vitest';
import { parsePostParams, patchPostParams, postPath, sectionPath, toPostApiParams } from './postParams';

describe('post list params', () => {
  it('maps type to section and canonical path', () => {
    expect(sectionPath('blog')).toBe('/blog');
    expect(sectionPath('article')).toBe('/articles');
    expect(postPath({ type: 'blog', slug: 'hello' })).toBe('/blog/hello');
    expect(postPath({ type: 'article', slug: 'hi' })).toBe('/articles/hi');
  });

  it('round-trips search, category and page through the URL', () => {
    const state = parsePostParams(new URLSearchParams('search=remote&category=latest-news&page=2'));
    expect(state).toEqual({ search: 'remote', category: 'latest-news', page: 2 });
    expect(toPostApiParams('article', state)).toMatchObject({ type: 'article', category: 'latest-news', search: 'remote', page: 2 });
  });

  it('resets to page 1 when filters change', () => {
    expect(patchPostParams(new URLSearchParams('page=3'), { category: 'x' }).toString()).toBe('category=x');
  });
});
