import {
  IconAward,
  IconBriefcase,
  IconCategory,
  IconFileCv,
  IconHelpCircle,
  IconLayoutDashboard,
  IconMailbox,
  IconMessageCircle,
  IconNews,
  IconQuote,
  IconSchool,
  IconSettings,
  IconStack2,
  IconUsers,
} from '@tabler/icons-react';
import { PERMISSIONS } from '../lib/permissions';

/** Single source for the sidebar, the mobile drawer and the post-login landing page. */
export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: IconLayoutDashboard, permission: PERMISSIONS.dashboard }],
  },
  {
    label: 'Recruitment',
    items: [
      { to: '/admin/applications', label: 'Applications', icon: IconFileCv, permission: PERMISSIONS.applications },
      { to: '/admin/jobs', label: 'Jobs', icon: IconBriefcase, permission: PERMISSIONS.jobs },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { to: '/admin/inquiries', label: 'Inquiries', icon: IconMessageCircle, permission: PERMISSIONS.inquiries },
      { to: '/admin/mentorship-requests', label: 'Mentorship requests', icon: IconSchool, permission: PERMISSIONS.inquiries },
      { to: '/admin/subscribers', label: 'Subscribers', icon: IconMailbox, permission: PERMISSIONS.inquiries },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/posts', label: 'Posts', icon: IconNews, permission: PERMISSIONS.content },
      { to: '/admin/post-categories', label: 'Categories', icon: IconCategory, permission: PERMISSIONS.content },
      { to: '/admin/services', label: 'Services', icon: IconStack2, permission: PERMISSIONS.content },
      { to: '/admin/testimonials', label: 'Testimonials', icon: IconQuote, permission: PERMISSIONS.content },
      { to: '/admin/faqs', label: 'FAQs', icon: IconHelpCircle, permission: PERMISSIONS.content },
      { to: '/admin/mentorship-programs', label: 'Mentorship programs', icon: IconAward, permission: PERMISSIONS.content },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: IconSettings, permission: PERMISSIONS.settings },
      { to: '/admin/users', label: 'Users & roles', icon: IconUsers, permission: PERMISSIONS.users },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

