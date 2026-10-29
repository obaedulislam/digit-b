/** Permission model shared by the nav, route guards and pages. Pure functions: easy to test. */

export const SUPER_ADMIN = 'super-admin';

export const PERMISSIONS = {
  dashboard: 'view-dashboard',
  jobs: 'manage-jobs',
  content: 'manage-content',
  applications: 'manage-applications',
  inquiries: 'manage-inquiries',
  users: 'manage-users',
  settings: 'manage-settings',
};

const ROLE_LABELS = {
  'super-admin': 'Super admin',
  editor: 'Editor',
  recruiter: 'Recruiter',
};

export const roleLabel = (role) => ROLE_LABELS[role] ?? String(role ?? '').replace(/[-_]/g, ' ');

export const isSuperAdmin = (user) => Boolean(user?.roles?.includes(SUPER_ADMIN));

/** `can(user, 'manage-jobs')`. No permission requirement means "any signed-in admin". */
export function can(user, permission) {
  if (!user) return false;
  if (!permission) return true;
  return isSuperAdmin(user) || Boolean(user.permissions?.includes(permission));
}

/** True when the user holds at least one of the listed permissions. */
export const canAny = (user, permissions = []) => permissions.some((permission) => can(user, permission));

/** Keeps only the items (nav entries, routes…) the user is allowed to see. */
export const filterByPermission = (user, items) => items.filter((item) => can(user, item.permission));

/** Where a signed-in admin should land first: the first nav item they may open. */
export function firstAllowedPath(user, items) {
  return filterByPermission(user, items)[0]?.to ?? null;
}

/** Only same-app `/admin` paths may be used as post-login redirect targets (blocks open redirects). */
export function safeNextPath(value, fallback = '/admin') {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/admin') || value.startsWith('//') || value.includes('\\')) return fallback;
  if (value.startsWith('/admin/login')) return fallback;
  return value;
}
