import { http } from '@/api/client';

/**
 * Thin REST wrapper for one admin resource (`/api/v1/admin/<path>`).
 * Content resources accept partial updates (`sometimes` rules), so PUT is used.
 */
export function createResource(path, name = path) {
  const base = `/admin/${path}`;
  return {
    name,
    path: base,
    list: (params) => http.get(base, { params }).then((response) => response.data),
    get: (id) => http.get(`${base}/${id}`).then((response) => response.data.data),
    create: (payload) => http.post(base, payload).then((response) => response.data.data),
    update: (id, payload) => http.put(`${base}/${id}`, payload).then((response) => response.data.data),
    remove: (id) => http.delete(`${base}/${id}`).then(() => true),
  };
}

export const jobsApi = {
  ...createResource('jobs'),
  duplicate: (id) => http.post(`/admin/jobs/${id}/duplicate`).then((response) => response.data.data),
};

export const applicationsApi = {
  ...createResource('applications'),
  // PATCH {status?, notes?}: writes an event to the timeline.
  patch: (id, payload) => http.patch(`/admin/applications/${id}`, payload).then((response) => response.data.data),
};

export const inquiriesApi = {
  ...createResource('inquiries'),
  patch: (id, payload) => http.patch(`/admin/inquiries/${id}`, payload).then((response) => response.data.data),
};

export const mentorshipRequestsApi = {
  ...createResource('mentorship-requests', 'mentorship-requests'),
  patch: (id, payload) => http.patch(`/admin/mentorship-requests/${id}`, payload).then((response) => response.data.data),
};

export const subscribersApi = createResource('subscribers');
export const postsApi = createResource('posts');
export const postCategoriesApi = createResource('post-categories');
export const servicesApi = createResource('services');
export const testimonialsApi = createResource('testimonials');
export const faqsApi = createResource('faqs');
export const mentorshipProgramsApi = createResource('mentorship-programs');
export const usersApi = createResource('users');

export const rolesApi = { list: () => http.get('/admin/roles').then((response) => response.data.data) };
export const dashboardApi = { get: () => http.get('/admin/dashboard').then((response) => response.data.data) };

export const settingsApi = {
  get: () => http.get('/admin/settings').then((response) => response.data.data),
  update: (payload) => http.put('/admin/settings', payload).then((response) => response.data.data),
};

/** Image upload (multipart). Resolves `{ url, path }`; `url` is relative (`/storage/…`). */
export const mediaApi = {
  upload: (file, onProgress) => {
    const body = new FormData();
    body.append('file', file);
    return http
      .post('/admin/media', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60_000,
        onUploadProgress: (event) => event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
      })
      .then((response) => response.data.data);
  },
};

export const authApi = {
  me: async () => {
    try {
      const response = await http.get('/auth/me');
      return response.data.data;
    } catch (error) {
      if (error?.response?.status === 401) return null;
      throw error;
    }
  },
  login: (credentials) => http.post('/auth/login', credentials).then((response) => response.data.data),
  logout: () => http.post('/auth/logout').then(() => true),
};
