import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { can, canAny, filterByPermission, firstAllowedPath, isSuperAdmin, safeNextPath } from './lib/permissions';
import { ariaSort, nextSort, readListParams, toApiParams, toExportParams, writeListParams } from './lib/listParams';
import { groupsWithErrors, loginErrorMessage, mapFormError } from './lib/formErrors';
import { filenameFromDisposition, sanitizeFilename } from './lib/download';
import { buildMailto, cleanList, cleanRows, formatBytes, getIn, isoToLocalInput, localInputToIso, slugify, toNullableNumber, toNullableString } from './lib/helpers';
import { niceScale, summarizeSeries } from './lib/chart';
import { applyMarkdownFormat } from './lib/markdownFormat';
import { passwordProblem, rowsComplete, required } from './lib/validators';
import { DataTable } from './components/DataTable';
import { StatusBadge } from './components/StatusBadge';
import { NAV_ITEMS } from './layout/nav';

const editor = { roles: ['editor'], permissions: ['manage-content'] };
const recruiter = { roles: ['recruiter'], permissions: ['manage-jobs', 'manage-applications', 'manage-inquiries', 'view-dashboard'] };
const superAdmin = { roles: ['super-admin'], permissions: [] };

describe('permissions', () => {
  it('checks single permissions and treats super-admin as unrestricted', () => {
    expect(can(editor, 'manage-content')).toBe(true);
    expect(can(editor, 'manage-users')).toBe(false);
    expect(can(superAdmin, 'manage-users')).toBe(true);
    expect(isSuperAdmin(editor)).toBe(false);
  });

  it('denies guests but allows "no requirement" for signed-in users', () => {
    expect(can(null, 'view-dashboard')).toBe(false);
    expect(can(null, undefined)).toBe(false);
    expect(can(editor, undefined)).toBe(true);
    expect(canAny(editor, ['manage-users', 'manage-content'])).toBe(true);
    expect(canAny(editor, ['manage-users'])).toBe(false);
  });

  it('filters the nav per role and finds a landing page', () => {
    const editorNav = filterByPermission(editor, NAV_ITEMS).map((item) => item.to);
    expect(editorNav).toContain('/admin/posts');
    expect(editorNav).not.toContain('/admin/users');
    expect(editorNav).not.toContain('/admin/applications');
    expect(firstAllowedPath(editor, NAV_ITEMS)).toBe('/admin/posts');
    expect(firstAllowedPath(recruiter, NAV_ITEMS)).toBe('/admin/dashboard');
    expect(firstAllowedPath({ roles: [], permissions: [] }, NAV_ITEMS)).toBeNull();
  });

  it('only accepts same-app admin paths as redirect targets', () => {
    expect(safeNextPath('/admin/jobs?status=draft')).toBe('/admin/jobs?status=draft');
    expect(safeNextPath('https://evil.test/admin')).toBe('/admin');
    expect(safeNextPath('//evil.test')).toBe('/admin');
    expect(safeNextPath('/admin\\..\\x')).toBe('/admin');
    expect(safeNextPath('/admin/login')).toBe('/admin');
    expect(safeNextPath(null)).toBe('/admin');
  });
});

describe('list params <-> URL', () => {
  const config = { filters: ['status', 'job'], defaultSort: '-created_at' };

  it('reads defaults from an empty query string', () => {
    expect(readListParams(new URLSearchParams(''), config)).toEqual({ page: 1, search: '', sort: '-created_at', status: '', job: '' });
  });

  it('reads and sanitises values', () => {
    const state = readListParams(new URLSearchParams('page=3&search=ada&status=new&sort=status'), config);
    expect(state).toMatchObject({ page: 3, search: 'ada', status: 'new', sort: 'status' });
    expect(readListParams(new URLSearchParams('page=-2'), config).page).toBe(1);
    expect(readListParams(new URLSearchParams('page=abc'), config).page).toBe(1);
  });

  it('resets to page 1 when a filter changes, keeps unknown params, drops empties', () => {
    const next = writeListParams(new URLSearchParams('page=4&open=9&status=new'), { status: 'hired' }, config);
    expect(next.get('status')).toBe('hired');
    expect(next.has('page')).toBe(false);
    expect(next.get('open')).toBe('9');
    expect(writeListParams(next, { status: '' }, config).has('status')).toBe(false);
    expect(writeListParams(new URLSearchParams(), { page: 3 }, config).get('page')).toBe('3');
    expect(writeListParams(new URLSearchParams('sort=title'), { sort: '-created_at' }, config).has('sort')).toBe(false);
  });

  it('builds API and export params without empty values', () => {
    const state = { page: 2, search: '', sort: '-created_at', status: 'new', job: '' };
    expect(toApiParams(state, { perPage: 15 })).toEqual({ page: 2, per_page: 15, sort: '-created_at', status: 'new' });
    expect(toExportParams(state)).toEqual({ status: 'new' });
  });

  it('cycles sorting asc -> desc -> default and reports aria-sort', () => {
    expect(nextSort('-created_at', 'title', '-created_at')).toBe('title');
    expect(nextSort('title', 'title', '-created_at')).toBe('-title');
    expect(nextSort('-title', 'title', '-created_at')).toBe('-created_at');
    expect(ariaSort('title', 'title')).toBe('ascending');
    expect(ariaSort('-title', 'title')).toBe('descending');
    expect(ariaSort('x', 'title')).toBe('none');
  });
});

describe('form error mapping', () => {
  const axiosError = (status, data, headers = {}) => ({ response: { status, data, headers } });

  it('maps Laravel 422 field errors and uses a friendly message', () => {
    const mapped = mapFormError(axiosError(422, { message: 'The given data was invalid.', errors: { title: ['Required.'], 'requirements.0': ['Too long.'] } }));
    expect(mapped.isValidation).toBe(true);
    expect(mapped.fieldErrors).toEqual({ title: 'Required.', 'requirements.0': 'Too long.' });
    expect(mapped.message).toBe('Please fix the highlighted fields.');
  });

  it('keeps the backend message for protections (403) and falls back for network errors', () => {
    expect(mapFormError(axiosError(403, { message: 'You cannot delete your own account.' })).message).toBe('You cannot delete your own account.');
    expect(mapFormError({}).message).toMatch(/could not reach/i);
  });

  it('groups errors by their first path segment (settings tabs)', () => {
    expect(groupsWithErrors({ 'contact.email': 'x', 'contact.hours.0.days': 'y', 'seo.site_title': 'z' })).toEqual({ contact: true, seo: true });
  });

  it('turns login failures into clear messages, including throttling', () => {
    expect(loginErrorMessage(axiosError(401, {}))).toMatch(/incorrect/i);
    expect(loginErrorMessage(axiosError(429, {}, { 'retry-after': '30' }))).toMatch(/30 seconds/);
    expect(loginErrorMessage(axiosError(429, {}, { 'retry-after': '120' }))).toMatch(/2 minutes/);
    expect(loginErrorMessage(axiosError(429, {}))).toMatch(/wait a minute/i);
  });
});

describe('download helpers', () => {
  it('reads plain and RFC 5987 file names from Content-Disposition', () => {
    expect(filenameFromDisposition('attachment; filename="ada-lovelace-resume.pdf"')).toBe('ada-lovelace-resume.pdf');
    expect(filenameFromDisposition("attachment; filename*=UTF-8''J%C3%BCrgen%20CV.pdf")).toBe('Jürgen CV.pdf');
    expect(filenameFromDisposition('attachment; filename=applications.csv')).toBe('applications.csv');
    expect(filenameFromDisposition(undefined, 'fallback.csv')).toBe('fallback.csv');
  });

  it('never lets a server file name carry a path', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('-..-etc-passwd');
    expect(sanitizeFilename('a/b\\c.pdf')).toBe('a-b-c.pdf');
    expect(sanitizeFilename('', 'x.pdf')).toBe('x.pdf');
  });
});

describe('helpers', () => {
  it('slugifies titles', () => {
    expect(slugify('Senior Supply-Chain Analyst (Remote)')).toBe('senior-supply-chain-analyst-remote');
    expect(slugify('  Café & Bar  ')).toBe('cafe-and-bar');
  });

  it('round-trips datetime-local values', () => {
    const iso = '2026-10-29T14:30:00.000Z';
    expect(localInputToIso(isoToLocalInput(iso))).toBe(iso);
    expect(isoToLocalInput(null)).toBe('');
    expect(localInputToIso('')).toBeNull();
  });

  it('normalises nullable inputs and lists', () => {
    expect(toNullableNumber('')).toBeNull();
    expect(toNullableNumber('12')).toBe(12);
    expect(toNullableNumber('abc')).toBeNull();
    expect(toNullableString('  ')).toBeNull();
    expect(toNullableString(' x ')).toBe('x');
    expect(cleanList([' a ', '', '  ', 'b'])).toEqual(['a', 'b']);
    expect(cleanRows([{ title: ' A ', description: '' }, { title: '', description: '' }], ['title', 'description'])).toEqual([{ title: 'A', description: '' }]);
    expect(getIn({ a: { b: [1, 2] } }, 'a.b.1')).toBe(2);
    expect(getIn({}, 'a.b')).toBeUndefined();
  });

  it('builds a safe mailto link and formats sizes', () => {
    expect(buildMailto('a@b.co', { subject: 'Hello & welcome', name: 'Ada' })).toBe(
      'mailto:a@b.co?subject=Re%3A%20Hello%20%26%20welcome&body=Hi%20Ada%2C%0A%0A',
    );
    expect(buildMailto('a@b.co', { subject: 'Re: x' })).toContain('subject=Re%3A%20x');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});

describe('chart scale', () => {
  it('gives round integer ticks', () => {
    expect(niceScale(0)).toEqual({ max: 4, step: 1, ticks: [0, 1, 2, 3, 4] });
    expect(niceScale(7).max).toBe(8);
    expect(niceScale(41).ticks).toEqual([0, 20, 40, 60, 80]);
  });

  it('summarises a series for screen readers', () => {
    expect(summarizeSeries([{ date: '2026-10-28', count: 0 }, { date: '2026-10-29', count: 0 }]).text).toMatch(/No applications/);
    const summary = summarizeSeries([{ date: '2026-10-28', count: 2 }, { date: '2026-10-29', count: 5 }], (d) => d);
    expect(summary.total).toBe(7);
    expect(summary.text).toContain('2026-10-29 with 5');
  });
});

describe('markdown toolbar', () => {
  it('wraps the selection and keeps it selected', () => {
    expect(applyMarkdownFormat('hello world', 0, 5, 'bold')).toEqual({ text: '**hello** world', start: 2, end: 7 });
    expect(applyMarkdownFormat('x', 1, 1, 'italic').text).toBe('x_text_');
  });

  it('prefixes every selected line for lists and toggles them off', () => {
    expect(applyMarkdownFormat('a\nb', 0, 3, 'ul').text).toBe('- a\n- b');
    expect(applyMarkdownFormat('- a\n- b', 0, 7, 'ul').text).toBe('a\nb');
    expect(applyMarkdownFormat('a\nb', 0, 3, 'ol').text).toBe('1. a\n2. b');
    expect(applyMarkdownFormat('Title', 0, 0, 'h2').text).toBe('## Title');
    expect(applyMarkdownFormat('## Title', 0, 0, 'h3').text).toBe('### Title');
  });

  it('inserts a link with the URL selected', () => {
    const result = applyMarkdownFormat('see docs', 4, 8, 'link');
    expect(result.text).toBe('see [docs](https://)');
    expect(result.text.slice(result.start, result.end)).toBe('https://');
  });
});

describe('validators', () => {
  it('mirrors the backend password policy', () => {
    expect(passwordProblem('short1A')).toMatch(/10 characters/);
    expect(passwordProblem('alllowercase1')).toMatch(/upper and lower/);
    expect(passwordProblem('NoNumbersHere')).toMatch(/number/);
    expect(passwordProblem('GoodPassw0rd!')).toBeNull();
  });

  it('requires complete repeater rows', () => {
    const check = rowsComplete('Step', ['title', 'description']);
    expect(check([{ title: 'a', description: 'b' }, { title: '', description: '' }])).toBeNull();
    expect(check([{ title: 'a', description: '' }])).toMatch(/Step #1/);
    expect(required('a title', 5)('  ')).toMatch(/Enter a title/);
    expect(required('a title', 5)('too long')).toMatch(/under 5/);
  });
});

describe('components', () => {
  beforeAll(() => {
    // jsdom has no matchMedia; Mantine's provider reads it.
    window.matchMedia ??= (query) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} });
  });

  const wrap = (ui) =>
    render(
      <MantineProvider forceColorScheme="light">
        <MemoryRouter>{ui}</MemoryRouter>
      </MantineProvider>,
    );

  it('shows the status as text, not just colour', () => {
    render(<StatusBadge status="shortlisted" />);
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();
  });

  it('renders rows, a sortable header with aria-sort, and an empty state', () => {
    const columns = [
      { id: 'name', header: 'Name', primary: true, sortKey: 'name', cell: (row) => row.name },
      { id: 'n', header: 'Count', cell: (row) => row.n },
    ];
    const { rerender } = wrap(<DataTable caption="People" columns={columns} rows={[{ id: 1, name: 'Ada', n: 3 }]} sort="name" onSort={() => {}} />);
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('rowheader', { name: 'Ada' })).toBeInTheDocument();

    rerender(
      <MantineProvider>
        <MemoryRouter>
          <DataTable caption="People" columns={columns} rows={[]} emptyTitle="No people" />
        </MemoryRouter>
      </MantineProvider>,
    );
    expect(screen.getByText('No people')).toBeInTheDocument();
  });
});
