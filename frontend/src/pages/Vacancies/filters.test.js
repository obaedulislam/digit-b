import { describe, expect, it } from 'vitest';
import { activeFilterCount, parseJobParams, patchJobParams, toApiParams } from './filters';

const params = (query) => new URLSearchParams(query);

describe('job filters ↔ URL', () => {
  it('parses a URL into normalised state with defaults', () => {
    expect(parseJobParams(params(''))).toMatchObject({ search: '', sort: 'newest', page: 1, work_mode: '' });
    const state = parseJobParams(params('search=%20wms%20&work_mode=remote&sort=title&page=3'));
    expect(state).toMatchObject({ search: 'wms', work_mode: 'remote', sort: 'title', page: 3 });
  });

  it('ignores invalid sort and page values', () => {
    expect(parseJobParams(params('sort=bogus&page=-4'))).toMatchObject({ sort: 'newest', page: 1 });
    expect(parseJobParams(params('page=abc')).page).toBe(1);
  });

  it('writes only non-default values and resets the page on filter change', () => {
    const next = patchJobParams(params('page=4&work_mode=remote'), { employment_type: 'contract' });
    expect(next.toString()).toBe('employment_type=contract&work_mode=remote');
  });

  it('keeps an explicit page and drops empty values', () => {
    expect(patchJobParams(params('work_mode=remote'), { page: 2 }).toString()).toBe('work_mode=remote&page=2');
    expect(patchJobParams(params('work_mode=remote'), { work_mode: '' }).toString()).toBe('');
  });

  it('omits the default sort but keeps others', () => {
    expect(patchJobParams(params(''), { sort: 'newest' }).toString()).toBe('');
    expect(patchJobParams(params(''), { sort: 'salary_desc' }).toString()).toBe('sort=salary_desc');
  });

  it('builds API params and counts filters', () => {
    const state = parseJobParams(params('search=dev&location=Dhaka&page=2'));
    expect(toApiParams(state)).toMatchObject({ search: 'dev', location: 'Dhaka', sort: 'newest', page: 2, per_page: 10, work_mode: undefined });
    expect(activeFilterCount(state)).toBe(2);
  });
});
