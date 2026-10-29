import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { cx } from '@/lib/cx';

/**
 * Breadcrumb trail for LIGHT surfaces (PageHero has its own for dark).
 * `items` = [{ label, to }]; the last item is the current page (no `to`).
 */
export function Breadcrumbs({ items = [], className }) {
  return (
    <nav className={cx('breadcrumbs', className)} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link to="/" className="breadcrumbs__link">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="breadcrumbs__item">
            <IconChevronRight size={14} aria-hidden="true" />
            {item.to ? (
              <Link to={item.to} className="breadcrumbs__link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumbs__current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
