import { describe, expect, it } from 'vitest';
import { stripSiteName } from './seoTitle';

describe('stripSiteName', () => {
  it('removes a trailing site name in its usual separators', () => {
    expect(stripSiteName('Software Engineer – Dhaka | DIGIT-B', 'DIGIT-B')).toBe('Software Engineer – Dhaka');
    expect(stripSiteName('Hiring guide - DIGIT-B', 'DIGIT-B')).toBe('Hiring guide');
    expect(stripSiteName('Hiring guide — digit-b', 'DIGIT-B')).toBe('Hiring guide');
  });

  it('leaves other titles and empty values alone', () => {
    expect(stripSiteName('Why DIGIT-B works', 'DIGIT-B')).toBe('Why DIGIT-B works');
    expect(stripSiteName(undefined)).toBe('');
    expect(stripSiteName(null)).toBe('');
  });
});
