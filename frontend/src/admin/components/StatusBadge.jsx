import { humanize } from '../lib/helpers';

/**
 * One status vocabulary for every resource (applications, inquiries, jobs, posts…).
 * Colour is never the only signal: the label is always printed next to the dot.
 */
const TONES = {
  // applications
  new: 'lime',
  reviewing: 'muted',
  shortlisted: 'deep',
  interview: 'ink',
  offered: 'warning',
  hired: 'success',
  rejected: 'danger',
  // inquiries
  read: 'muted',
  replied: 'success',
  archived: 'ink',
  // content
  draft: 'muted',
  published: 'success',
  closed: 'ink',
  active: 'success',
  unsubscribed: 'muted',
};

export function StatusBadge({ status, label }) {
  const tone = TONES[status] ?? 'muted';
  return (
    <span className={`admin-status admin-status--${tone}`}>
      <span className="admin-status__dot" aria-hidden="true" />
      {label ?? humanize(status)}
    </span>
  );
}

export function BoolBadge({ value, yes = 'Yes', no = 'No' }) {
  return <StatusBadge status={value ? 'published' : 'draft'} label={value ? yes : no} />;
}
