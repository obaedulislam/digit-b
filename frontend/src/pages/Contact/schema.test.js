import { describe, expect, it } from 'vitest';
import { buildContactPayload, contactValidators, resolveInquiryType } from './schema';

describe('contact schema', () => {
  it('pre-selects a valid ?type= and falls back to general', () => {
    expect(resolveInquiryType('hiring')).toBe('hiring');
    expect(resolveInquiryType('nope')).toBe('general');
    expect(resolveInquiryType(null)).toBe('general');
  });

  it('validates required fields and message length', () => {
    expect(contactValidators.message('short')).toBeTruthy();
    expect(contactValidators.message('long enough message')).toBeNull();
    expect(contactValidators.email('bad')).toBeTruthy();
    expect(contactValidators.phone('')).toBeNull();
    expect(contactValidators.consent(false)).toBeTruthy();
  });

  it('omits empty optionals from the payload', () => {
    const payload = buildContactPayload({ name: ' A ', email: 'a@b.co', phone: '', company: '', inquiry_type: 'hiring', subject: '', message: ' hello there ', consent: true, website: '' });
    expect(payload).toEqual({ name: 'A', email: 'a@b.co', phone: undefined, company: undefined, inquiry_type: 'hiring', subject: undefined, message: 'hello there', consent: true, website: undefined });
  });
});
