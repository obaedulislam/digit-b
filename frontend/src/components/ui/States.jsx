import { Skeleton } from '@mantine/core';
import { IconAlertTriangle, IconSearchOff } from '@tabler/icons-react';
import { Button } from './Button';
import { cx } from '@/lib/cx';

/** Friendly empty result ("no jobs match your filters"). */
export function EmptyState({ title = 'Nothing here yet', description, action, icon, className }) {
  return (
    <div className={cx('state', className)} role="status">
      <span className="state__icon" aria-hidden="true">
        {icon ?? <IconSearchOff size={28} stroke={1.5} />}
      </span>
      <h3 className="state__title">{title}</h3>
      {description && <p className="state__text">{description}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

/** Failed request. Pass the query's `refetch` as `onRetry`. */
export function ErrorState({ title = 'We could not load this', description = 'Please check your connection and try again.', onRetry, className }) {
  return (
    <div className={cx('state', 'state--error', className)} role="alert">
      <span className="state__icon" aria-hidden="true">
        <IconAlertTriangle size={28} stroke={1.5} />
      </span>
      <h3 className="state__title">{title}</h3>
      <p className="state__text">{description}</p>
      {onRetry && (
        <div className="state__action">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/** Grid of card-shaped placeholders while a list loads. */
export function CardSkeletons({ count = 6, height = 280, className }) {
  return (
    <div className={cx('skeleton-grid', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={height} radius="lg" />
      ))}
    </div>
  );
}

/** Text-block placeholder for detail pages. */
export function TextSkeleton({ lines = 6 }) {
  return (
    <div className="skeleton-text" aria-hidden="true">
      <Skeleton height={44} width="70%" radius="md" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? '55%' : '100%'} radius="sm" />
      ))}
    </div>
  );
}
