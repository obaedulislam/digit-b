import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { mantineTheme } from '@/theme/mantine';
import { publicApi } from '@/api/public';
import { compose, rules } from '@/lib/formRules';
import { splitPrice } from '@/lib/price';
import { mentorshipRules } from '@/pages/Mentorship/mentorshipRules';
import { contactRules } from './contactRules';
import { QuickContactForm } from './QuickContactForm';

// jsdom lacks these browser APIs, which Mantine needs.
beforeAll(() => {
  window.matchMedia ??= (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  if (!document.fonts) Object.defineProperty(document, 'fonts', { value: { addEventListener() {}, removeEventListener() {} } });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderForm = (ui) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <MantineProvider theme={mantineTheme} forceColorScheme="light">
        <MemoryRouter>{ui}</MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );

describe('form rules (mirror the API contract)', () => {
  it('validates email, phone and lengths', () => {
    expect(rules.email('nope')).toBe('Enter a valid email address');
    expect(rules.email('a@b.co')).toBeNull();
    expect(rules.optionalPhone('')).toBeNull();
    expect(rules.optionalPhone('12')).toMatch(/7 to 20/);
    expect(rules.optionalPhone('+1 (352) 256-9875')).toBeNull();
    expect(compose(rules.required('Name'), rules.maxLength('Name', 5))('abcdefg')).toMatch(/5 characters/);
  });

  it('contact: message 10-3000, consent required', () => {
    expect(contactRules.message('too short')).toMatch(/at least 10/);
    expect(contactRules.message('x'.repeat(3001))).toMatch(/3000/);
    expect(contactRules.message('long enough message')).toBeNull();
    expect(contactRules.consent(false)).toBeTruthy();
  });

  it('mentorship: goal 10-2000, programme required', () => {
    expect(mentorshipRules.goal('short')).toMatch(/at least 10/);
    expect(mentorshipRules.program('')).toBe('Programme is required');
  });

  it('splitPrice separates the figure from the unit and handles missing prices', () => {
    expect(splitPrice({ display: '$9.82 per person / month', unit_label: 'per person / month' })).toEqual({
      figure: '$9.82',
      unit: 'per person / month',
    });
    expect(splitPrice({ display: '$500' })).toEqual({ figure: '$500', unit: '' });
    expect(splitPrice(null)).toBeNull();
  });
});

describe('QuickContactForm', () => {
  it('shows field errors and does not submit an empty form', async () => {
    const spy = vi.spyOn(publicApi, 'submitContact').mockResolvedValue({ id: 1, message: 'ok' });
    renderForm(<QuickContactForm />);
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Please accept the privacy policy to continue')).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('submits valid data and shows the success state', async () => {
    const spy = vi.spyOn(publicApi, 'submitContact').mockResolvedValue({ id: 7, message: 'We got it.' });
    renderForm(<QuickContactForm />);
    await userEvent.type(screen.getByLabelText(/your name/i), 'Ada Lovelace');
    await userEvent.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/how can we help/i), 'Looking for two WMS engineers.');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(spy.mock.calls[0][0]).toMatchObject({ name: 'Ada Lovelace', inquiry_type: 'hiring', consent: true, website: '' });
    expect(await screen.findByText('We got it.')).toBeInTheDocument();
  });
});
