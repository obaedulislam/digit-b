/**
 * Every admin query key lives here so invalidation after a write is predictable:
 * `invalidateQueries({ queryKey: adminKeys.resource('jobs') })` refreshes the
 * list AND every detail of that resource.
 */
export const adminKeys = {
  me: ['admin', 'me'],
  dashboard: ['admin', 'dashboard'],
  settings: ['admin', 'settings'],
  roles: ['admin', 'roles'],
  resource: (name) => ['admin', name],
  list: (name, params) => ['admin', name, 'list', params],
  detail: (name, id) => ['admin', name, 'detail', String(id)],
  options: (name, params) => ['admin', name, 'options', params],
};
