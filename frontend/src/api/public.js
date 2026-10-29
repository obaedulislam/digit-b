import { queryOptions, keepPreviousData } from '@tanstack/react-query';
import { http } from './client';

/**
 * Public API (see docs/02-api-contract.md). Every function resolves to the
 * unwrapped payload; paginated lists resolve to `{ data, meta }`.
 */
const unwrap = (response) => response.data.data;
const unwrapList = (response) => ({ data: response.data.data, meta: response.data.meta ?? null });

/** Drops empty values so URLs and cache keys stay clean. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export const publicApi = {
  settings: () => http.get('/settings').then(unwrap),
  home: () => http.get('/home').then(unwrap),

  services: (params) => http.get('/services', { params: cleanParams(params) }).then(unwrap),
  service: (slug) => http.get(`/services/${slug}`).then(unwrap),

  jobs: (params) => http.get('/jobs', { params: cleanParams(params) }).then(unwrapList),
  jobFilters: () => http.get('/jobs/filters').then(unwrap),
  job: (slug) => http.get(`/jobs/${slug}`).then(unwrap),

  posts: (params) => http.get('/posts', { params: cleanParams(params) }).then(unwrapList),
  post: (slug) => http.get(`/posts/${slug}`).then(unwrap),
  postCategories: (type) => http.get('/post-categories', { params: cleanParams({ type }) }).then(unwrap),

  mentorshipPrograms: () => http.get('/mentorship/programs').then(unwrap),
  testimonials: () => http.get('/testimonials').then(unwrap),
  faqs: (group) => http.get('/faqs', { params: cleanParams({ group }) }).then(unwrap),

  // ── form submissions ────────────────────────────────────────────
  submitContact: (payload) => http.post('/contact', payload).then(unwrap),
  subscribe: (payload) => http.post('/newsletter', payload).then(unwrap),
  /** `token` comes from the link in the welcome e-mail / campaign footer. 404 = invalid link. */
  unsubscribe: (token) => http.post('/newsletter/unsubscribe', { token }).then(unwrap),
  requestMentorship: (payload) => http.post('/mentorship/requests', payload).then(unwrap),

  /** `payload` is a plain object; the résumé is a File. Sent as multipart. */
  submitApplication: (payload) => {
    const body = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      if (Array.isArray(value)) value.forEach((item) => body.append(`${key}[]`, item));
      else if (typeof value === 'boolean') body.append(key, value ? '1' : '0');
      else body.append(key, value);
    });
    return http.post('/applications', body, { headers: { 'Content-Type': 'multipart/form-data' } }).then(unwrap);
  },
};

const MINUTE = 60_000;

/** Query option builders — import these instead of writing keys inline. */
export const queries = {
  settings: () => queryOptions({ queryKey: ['settings'], queryFn: publicApi.settings, staleTime: 30 * MINUTE }),
  home: () => queryOptions({ queryKey: ['home'], queryFn: publicApi.home, staleTime: 5 * MINUTE }),
  services: (params) =>
    queryOptions({ queryKey: ['services', cleanParams(params)], queryFn: () => publicApi.services(params), staleTime: 10 * MINUTE }),
  service: (slug) =>
    queryOptions({ queryKey: ['service', slug], queryFn: () => publicApi.service(slug), staleTime: 10 * MINUTE }),
  jobs: (params) =>
    queryOptions({
      queryKey: ['jobs', cleanParams(params)],
      queryFn: () => publicApi.jobs(params),
      placeholderData: keepPreviousData,
      staleTime: MINUTE,
    }),
  jobFilters: () => queryOptions({ queryKey: ['job-filters'], queryFn: publicApi.jobFilters, staleTime: 5 * MINUTE }),
  job: (slug) => queryOptions({ queryKey: ['job', slug], queryFn: () => publicApi.job(slug), staleTime: MINUTE }),
  posts: (params) =>
    queryOptions({
      queryKey: ['posts', cleanParams(params)],
      queryFn: () => publicApi.posts(params),
      placeholderData: keepPreviousData,
      staleTime: 5 * MINUTE,
    }),
  post: (slug) => queryOptions({ queryKey: ['post', slug], queryFn: () => publicApi.post(slug), staleTime: 5 * MINUTE }),
  postCategories: (type) =>
    queryOptions({ queryKey: ['post-categories', type ?? 'all'], queryFn: () => publicApi.postCategories(type), staleTime: 10 * MINUTE }),
  mentorshipPrograms: () =>
    queryOptions({ queryKey: ['mentorship-programs'], queryFn: publicApi.mentorshipPrograms, staleTime: 10 * MINUTE }),
  testimonials: () =>
    queryOptions({ queryKey: ['testimonials'], queryFn: publicApi.testimonials, staleTime: 10 * MINUTE }),
  faqs: (group) => queryOptions({ queryKey: ['faqs', group ?? 'all'], queryFn: () => publicApi.faqs(group), staleTime: 10 * MINUTE }),
};
