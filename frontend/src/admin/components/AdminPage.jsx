import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { Seo } from '@/components/ui/Seo';

/** Breadcrumb trail: "Admin / Jobs / Edit". The last item is the current page. */
export function Breadcrumbs({ items = [] }) {
  const trail = [{ label: 'Admin', to: '/admin' }, ...items];
  return (
    <nav className="admin-crumbs" aria-label="Breadcrumb">
      <ol className="admin-crumbs__list">
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="admin-crumbs__item">
              {item.to && !last ? (
                <Link to={item.to} className="admin-crumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="admin-crumbs__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!last && <IconChevronRight size={12} stroke={2} aria-hidden="true" className="admin-crumbs__sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Standard page frame: noindex SEO, breadcrumbs, one <h1>, optional actions.
 * `title` may be a node; pass `seoTitle` when it is not a string.
 */
export function AdminPage({ title, seoTitle, eyebrow, description, crumbs, actions, children, className }) {
  return (
    <div className={['admin-page', className].filter(Boolean).join(' ')}>
      <Seo title={seoTitle ?? (typeof title === 'string' ? title : 'Admin')} noindex />
      <header className="admin-page__header">
        <div className="admin-page__heading">
          {crumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="admin-page__eyebrow">{eyebrow}</p>}
          <h1 className="admin-page__title">{title}</h1>
          {description && <p className="admin-page__lead">{description}</p>}
        </div>
        {actions && <div className="admin-page__actions">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
