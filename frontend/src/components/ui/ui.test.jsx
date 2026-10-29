import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import { BitText } from './BitText';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate, pad2, pluralize } from '@/lib/format';
import { parseApiError } from '@/api/client';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Button', () => {
  it('renders a router link when `to` is given', () => {
    wrap(<Button to="/apply">Apply</Button>);
    expect(screen.getByRole('link', { name: 'Apply' })).toHaveAttribute('href', '/apply');
  });

  it('opens external links safely', () => {
    wrap(<Button href="https://example.com">Out</Button>);
    const link = screen.getByRole('link', { name: 'Out' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('is disabled and busy while loading', () => {
    wrap(<Button loading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});

describe('BitText', () => {
  it('wraps only standalone 0/1 digits', () => {
    const { container } = render(<BitText>Moving beyond 0 and 1 to B-coming 2026</BitText>);
    expect([...container.querySelectorAll('.bit')].map((n) => n.textContent)).toEqual(['0', '1']);
  });
});

describe('markdown sanitising', () => {
  it('strips scripts and inline handlers but keeps formatting', () => {
    const html = renderMarkdown('**bold** <script>alert(1)</script> <img src=x onerror=alert(1)>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
  });
});

describe('format helpers', () => {
  it('formats dates, padding and plurals', () => {
    expect(formatDate('2026-12-26T10:00:00Z')).toMatch(/Dec 2[56], 2026/);
    expect(pad2(3)).toBe('03');
    expect(pluralize(1, 'job')).toBe('1 job');
    expect(pluralize(4, 'job')).toBe('4 jobs');
  });
});

describe('parseApiError', () => {
  it('maps Laravel 422 field errors to first messages', () => {
    const error = { response: { status: 422, data: { message: 'Invalid', errors: { email: ['Bad email', 'x'] } } } };
    expect(parseApiError(error)).toEqual({ status: 422, message: 'Invalid', fieldErrors: { email: 'Bad email' } });
  });

  it('gives a friendly message when the network is down', () => {
    expect(parseApiError({ response: undefined }).message).toMatch(/could not reach/i);
  });
});
