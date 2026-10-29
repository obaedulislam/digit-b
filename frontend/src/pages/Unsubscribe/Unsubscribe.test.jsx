import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Unsubscribe from './index';
import { isValidUnsubscribeToken } from './token';
import { publicApi } from '@/api/public';

const TOKEN = 'a'.repeat(64);

const renderAt = (url) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <MemoryRouter initialEntries={[url]}>
        <Unsubscribe />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('isValidUnsubscribeToken', () => {
  it('accepts only 64 alphanumeric characters', () => {
    expect(isValidUnsubscribeToken(TOKEN)).toBe(true);
    expect(isValidUnsubscribeToken('short')).toBe(false);
    expect(isValidUnsubscribeToken('a'.repeat(63) + '%')).toBe(false);
    expect(isValidUnsubscribeToken(null)).toBe(false);
  });
});

describe('Unsubscribe page', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('does NOT unsubscribe on load (mail scanners prefetch links)', () => {
    const spy = vi.spyOn(publicApi, 'unsubscribe').mockResolvedValue({ message: 'ok' });
    renderAt(`/unsubscribe?token=${TOKEN}`);
    expect(screen.getByRole('button', { name: /yes, unsubscribe me/i })).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('unsubscribes after the confirmation click and shows the result', async () => {
    const spy = vi.spyOn(publicApi, 'unsubscribe').mockResolvedValue({ message: 'You have been unsubscribed.' });
    renderAt(`/unsubscribe?token=${TOKEN}`);
    await userEvent.click(screen.getByRole('button', { name: /yes, unsubscribe me/i }));
    await waitFor(() => expect(screen.getByText('You have been unsubscribed.')).toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith(TOKEN);
  });

  it('shows the invalid-link state without calling the API when the token is missing or malformed', () => {
    const spy = vi.spyOn(publicApi, 'unsubscribe');
    renderAt('/unsubscribe?token=nope');
    expect(screen.getByText(/this link is not valid/i)).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('treats a 404 from the API as an invalid link', async () => {
    vi.spyOn(publicApi, 'unsubscribe').mockRejectedValue({ response: { status: 404, data: { message: 'Resource not found.' } } });
    renderAt(`/unsubscribe?token=${TOKEN}`);
    await userEvent.click(screen.getByRole('button', { name: /yes, unsubscribe me/i }));
    await waitFor(() => expect(screen.getByText(/this link is not valid/i)).toBeInTheDocument());
  });
});
