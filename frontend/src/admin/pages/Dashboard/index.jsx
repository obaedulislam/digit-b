import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Button, EmptyState, ErrorState } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { dashboardApi } from '../../api/resources';
import { adminKeys } from '../../api/keys';
import { useAuth } from '../../auth/AuthContext';
import { AdminPage } from '../../components/AdminPage';
import { BarChart } from '../../components/BarChart';
import { StatusBadge } from '../../components/StatusBadge';
import { humanize } from '../../lib/helpers';

const TILES = [
  { key: 'new_applications', label: 'New applications', to: '/admin/applications?status=new', hint: 'Waiting for a first review' },
  { key: 'open_jobs', label: 'Open jobs', to: '/admin/jobs?status=published', hint: 'Published and accepting applicants' },
  { key: 'unread_inquiries', label: 'Unread inquiries', to: '/admin/inquiries?status=new', hint: 'Contact form messages' },
  { key: 'mentorship_requests', label: 'Mentorship requests', to: '/admin/mentorship-requests?status=new', hint: 'New requests to answer' },
  { key: 'subscribers', label: 'Subscribers', to: '/admin/subscribers', hint: 'Active newsletter list' },
];

export default function Dashboard() {
  const { user, can } = useAuth();
  const query = useQuery({ queryKey: adminKeys.dashboard, queryFn: dashboardApi.get, refetchOnMount: 'always' });
  const data = query.data;

  const tiles = TILES.filter((tile) => data?.counts?.[tile.key] !== null && data?.counts?.[tile.key] !== undefined);
  const showSeries = Boolean(data?.applications_series?.length);
  const showApplications = can('manage-applications');
  const showInquiries = can('manage-inquiries');

  return (
    <AdminPage
      title="Dashboard"
      eyebrow="Overview"
      description={user?.name ? `Welcome back, ${user.name}. Here is what needs your attention.` : 'What needs your attention today.'}
      crumbs={[{ label: 'Dashboard' }]}
    >
      {query.isError && <ErrorState title="We could not load the dashboard" onRetry={() => query.refetch()} />}

      {!query.isError && (
        <>
          <section aria-label="Key numbers" className="admin-stats">
            {query.isPending
              ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height={132} radius="lg" aria-hidden="true" />)
              : tiles.map((tile) => {
                  const value = data.counts[tile.key];
                  return (
                    <Link key={tile.key} to={tile.to} className={`admin-stat${value > 0 && tile.key !== 'subscribers' && tile.key !== 'open_jobs' ? ' is-hot' : ''}`}>
                      <span className="admin-stat__label">{tile.label}</span>
                      <span className="admin-stat__value">{value.toLocaleString()}</span>
                      <span className="admin-stat__hint">{tile.hint}</span>
                      <IconArrowUpRight size={18} stroke={1.75} aria-hidden="true" className="admin-stat__arrow" />
                    </Link>
                  );
                })}
          </section>

          {(query.isPending || showSeries) && (
            <section className="admin-card" aria-labelledby="chart-heading">
              <header className="admin-card__header">
                <h2 className="admin-card__title" id="chart-heading">
                  Applications, last 14 days
                </h2>
              </header>
              <div className="admin-card__body">
                {query.isPending ? <Skeleton height={240} radius="md" aria-hidden="true" /> : <BarChart data={data.applications_series} title="New applications per day" />}
              </div>
            </section>
          )}

          <div className="admin-split">
            {showApplications && (
              <section className="admin-card" aria-labelledby="recent-apps">
                <header className="admin-card__header admin-card__header--row">
                  <h2 className="admin-card__title" id="recent-apps">
                    Recent applications
                  </h2>
                  <Button to="/admin/applications" variant="ghost" size="sm" arrow>
                    View all
                  </Button>
                </header>
                <div className="admin-card__body admin-card__body--flush">
                  {query.isPending ? (
                    <RowSkeletons />
                  ) : data.recent_applications.length === 0 ? (
                    <EmptyState title="No applications yet" description="New applications will appear here as soon as someone applies." />
                  ) : (
                    <ul className="admin-feed">
                      {data.recent_applications.map((application) => (
                        <li key={application.id}>
                          <Link to={`/admin/applications/${application.id}`} className="admin-feed__item">
                            <span className="admin-feed__main">
                              <span className="admin-feed__title">{application.applicant?.full_name}</span>
                              <span className="admin-feed__sub">{application.job?.title ?? 'General talent pool'}</span>
                            </span>
                            <span className="admin-feed__meta">
                              <StatusBadge status={application.status} />
                              <time dateTime={application.created_at} className="admin-feed__time">
                                {timeAgo(application.created_at)}
                              </time>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {showInquiries && (
              <section className="admin-card" aria-labelledby="recent-inq">
                <header className="admin-card__header admin-card__header--row">
                  <h2 className="admin-card__title" id="recent-inq">
                    Recent inquiries
                  </h2>
                  <Button to="/admin/inquiries" variant="ghost" size="sm" arrow>
                    View all
                  </Button>
                </header>
                <div className="admin-card__body admin-card__body--flush">
                  {query.isPending ? (
                    <RowSkeletons />
                  ) : data.recent_inquiries.length === 0 ? (
                    <EmptyState title="No inquiries yet" description="Messages from the contact form will show up here." />
                  ) : (
                    <ul className="admin-feed">
                      {data.recent_inquiries.map((inquiry) => (
                        <li key={inquiry.id}>
                          <Link to={`/admin/inquiries?open=${inquiry.id}`} className="admin-feed__item">
                            <span className="admin-feed__main">
                              <span className="admin-feed__title">{inquiry.name}</span>
                              <span className="admin-feed__sub">{inquiry.subject || `${humanize(inquiry.inquiry_type)} inquiry`}</span>
                            </span>
                            <span className="admin-feed__meta">
                              <StatusBadge status={inquiry.status} />
                              <time dateTime={inquiry.created_at} className="admin-feed__time">
                                {timeAgo(inquiry.created_at)}
                              </time>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </AdminPage>
  );
}

function RowSkeletons() {
  return (
    <div className="admin-feed__skeleton" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height={44} radius="md" />
      ))}
    </div>
  );
}
