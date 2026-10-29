import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';

/** Centered max-width wrapper. `narrow` = reading width. */
export function Container({ narrow = false, as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('container', narrow && 'container--narrow', className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Mono micro-label, e.g. "01 — About". Pass `index` for the numbered form. */
export function Eyebrow({ index, children, className }) {
  return (
    <p className={cx('eyebrow', className)}>
      {index !== undefined && <span className="eyebrow__index">{pad2(index)}</span>}
      <span className="eyebrow__text">{children}</span>
    </p>
  );
}

/**
 * Section title block. `title` may contain <em> for the italic-serif accent word.
 * align: start | center
 */
export function SectionHeader({ eyebrow, index, title, lead, align = 'start', actions, as: Heading = 'h2', className }) {
  return (
    <header className={cx('section-header', `section-header--${align}`, className)}>
      <div className="section-header__main">
        {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <Heading className="section-header__title">{title}</Heading>
        {lead && <p className="section-header__lead">{lead}</p>}
      </div>
      {actions && <div className="section-header__actions">{actions}</div>}
    </header>
  );
}

/**
 * Page section with consistent vertical rhythm.
 * tone: paper | paper-2 | white | ink   (ink flips text colours via `.is-dark`)
 */
export function Section({ tone = 'paper', id, className, children, bleed = false, ...rest }) {
  return (
    <section
      id={id}
      className={cx('section', `section--${tone}`, tone === 'ink' && 'is-dark', bleed && 'section--bleed', className)}
      data-surface={tone === 'ink' ? 'dark' : 'light'}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Badge({ tone = 'neutral', children, className }) {
  return <span className={cx('badge', `badge--${tone}`, className)}>{children}</span>;
}
