import { Link } from 'react-router-dom';
import { IconArrowUpRight, IconBriefcase, IconCoin, IconMapPin, IconStarFilled } from '@tabler/icons-react';
import { Badge } from '@/components/ui/Layout';
import { timeAgo } from '@/lib/format';
import { cx } from '@/lib/cx';
import { jobPlace } from './jobMeta';

/** One vacancy row. The whole card is clickable through the title link's overlay. */
export function JobCard({ job, compact = false }) {
  const place = jobPlace(job);
  const posted = job.published_at ? timeAgo(job.published_at) : '';

  return (
    <article className={cx('job-card', job.is_featured && 'is-featured', compact && 'job-card--compact')}>
      <div className="job-card__top">
        <p className="job-card__ref">
          {job.is_featured && (
            <span className="job-card__featured">
              <IconStarFilled size={11} aria-hidden="true" /> Featured
            </span>
          )}
          {job.reference_code && <span>Ref {job.reference_code}</span>}
          {job.department && <span>{job.department}</span>}
        </p>
        {posted && <p className="job-card__posted">Posted {posted}</p>}
      </div>

      <h3 className="job-card__title">
        <Link to={`/vacancies/${job.slug}`} className="job-card__link">
          {job.title}
        </Link>
      </h3>

      {!compact && job.summary && <p className="job-card__summary">{job.summary}</p>}

      <ul className="job-card__badges" aria-label="Role type">
        {job.employment_type_label && (
          <li>
            <Badge tone="soft">{job.employment_type_label}</Badge>
          </li>
        )}
        {job.work_mode_label && (
          <li>
            <Badge>{job.work_mode_label}</Badge>
          </li>
        )}
      </ul>

      <ul className="job-card__meta">
        {place && (
          <li>
            <IconMapPin size={16} stroke={1.75} aria-hidden="true" />
            <span className="sr-only">Location: </span>
            {place}
          </li>
        )}
        {job.salary?.display && (
          <li>
            <IconCoin size={16} stroke={1.75} aria-hidden="true" />
            <span className="sr-only">Salary: </span>
            {job.salary.display}
          </li>
        )}
        {job.experience?.display && (
          <li>
            <IconBriefcase size={16} stroke={1.75} aria-hidden="true" />
            <span className="sr-only">Experience: </span>
            {job.experience.display}
          </li>
        )}
      </ul>

      <span className="job-card__go" aria-hidden="true">
        <IconArrowUpRight size={20} stroke={1.75} />
      </span>
    </article>
  );
}
