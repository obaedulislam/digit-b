import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { Container, Eyebrow } from './Layout';
import { NodeField } from './NodeField';
import { cx } from '@/lib/cx';

/**
 * Dark inner-page header: breadcrumb, eyebrow, display title, lead, actions.
 * `crumbs` = [{ label, to }] (last item is the current page, no `to`).
 */
export function PageHero({ eyebrow, title, lead, crumbs = [], actions, seed, children, className }) {
  return (
    <section className={cx('page-hero', 'is-dark', className)} data-surface="dark">
      <NodeField seed={seed || title} nodes={26} packets={3} className="page-hero__art" />
      <Container className="page-hero__inner">
        {crumbs.length > 0 && (
          <nav className="page-hero__crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label}>
                  <IconChevronRight size={14} aria-hidden="true" />
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="page-hero__title">{title}</h1>
        {lead && <p className="page-hero__lead">{lead}</p>}
        {actions && <div className="page-hero__actions">{actions}</div>}
        {children}
      </Container>
    </section>
  );
}
