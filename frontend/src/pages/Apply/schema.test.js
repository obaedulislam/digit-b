import { describe, expect, it } from 'vitest';
import { buildPayload, firstStepWithErrors, initialValues, normalizeUrl, stepForField, todayISO, validateAll, validateResume, validateStep } from './schema';

const file = (name, size = 1000, type = '') => ({ name, size, type });
const valid = {
  ...initialValues,
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  phone: '+44 20 7946 0958',
  location: 'London, UK',
  current_title: 'Engineer',
  years_experience: '7',
  highest_education: 'bachelor',
  work_status: 'hybrid',
  resume: file('cv.pdf', 2000, 'application/pdf'),
  consent: true,
};

describe('validateResume', () => {
  it('requires a file', () => expect(validateResume(null)).toMatch(/attach/i));
  it('accepts pdf, doc and docx', () => {
    expect(validateResume(file('a.pdf', 10, 'application/pdf'))).toBeNull();
    expect(validateResume(file('a.DOC', 10, 'application/msword'))).toBeNull();
    expect(validateResume(file('a.docx', 10, ''))).toBeNull();
  });
  it('rejects other types, empty and oversized files with friendly messages', () => {
    expect(validateResume(file('a.png', 10, 'image/png'))).toMatch(/PDF, DOC or DOCX/);
    expect(validateResume(file('a.pdf', 0, 'application/pdf'))).toMatch(/empty/);
    expect(validateResume(file('a.pdf', 6 * 1024 * 1024, 'application/pdf'))).toMatch(/maximum is 5 MB/);
  });
});

describe('step validation', () => {
  it('flags required fields on step 1 and accepts valid data', () => {
    expect(Object.keys(validateStep(0, initialValues)).sort()).toEqual(['email', 'first_name', 'last_name', 'location', 'phone']);
    expect(validateStep(0, valid)).toEqual({});
  });

  it('validates the qualification rules', () => {
    const errors = validateStep(1, { ...valid, years_experience: '61', highest_education: null, expected_salary: '12k', cover_letter: 'x'.repeat(4001) });
    expect(Object.keys(errors).sort()).toEqual(['cover_letter', 'expected_salary', 'highest_education', 'years_experience']);
    expect(validateStep(1, { ...valid, years_experience: '0', expected_salary: '60,000' })).toEqual({});
  });

  it('validates URL, phone and availability', () => {
    expect(validateStep(0, { ...valid, linkedin_url: 'not a url' }).linkedin_url).toBeTruthy();
    expect(validateStep(0, { ...valid, linkedin_url: 'linkedin.com/in/ada' })).toEqual({});
    expect(validateStep(0, { ...valid, phone: '123' }).phone).toBeTruthy();
    expect(validateStep(2, { ...valid, available_from: '2000-01-01' }).available_from).toBeTruthy();
    expect(validateStep(2, { ...valid, available_from: todayISO() })).toEqual({});
    expect(validateStep(2, { ...valid, work_status: '' }).work_status).toBeTruthy();
  });

  it('validateAll requires consent and a résumé', () => {
    expect(validateAll(valid)).toEqual({});
    expect(Object.keys(validateAll({ ...valid, consent: false, resume: null })).sort()).toEqual(['consent', 'resume']);
  });
});

describe('server error mapping', () => {
  it('finds the step owning a field and the earliest step with errors', () => {
    expect(stepForField('email')).toBe(0);
    expect(stepForField('resume')).toBe(2);
    expect(stepForField('consent')).toBe(3);
    expect(firstStepWithErrors({ resume: 'x', email: 'y' })).toBe(0);
    expect(firstStepWithErrors({ job: 'x' })).toBe(-1);
  });
});

describe('payload', () => {
  it('uses the contract field names, trims, and omits empty optionals', () => {
    const payload = buildPayload({ ...valid, first_name: ' Ada ', skills: ['SQL'], expected_salary: '60,000', linkedin_url: 'linkedin.com/in/ada' }, 'software-engineer');
    expect(payload).toMatchObject({
      job: 'software-engineer',
      first_name: 'Ada',
      years_experience: 7,
      expected_salary: 60000,
      linkedin_url: 'https://linkedin.com/in/ada',
      skills: ['SQL'],
      work_status: 'hybrid',
      consent: true,
    });
    expect(payload.current_company).toBeUndefined();
    expect(buildPayload(valid).job).toBeUndefined();
    expect(buildPayload({ ...valid, years_experience: '0' }).years_experience).toBe(0);
  });

  it('normalises URLs', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl('https://x.io')).toBe('https://x.io');
  });
});
