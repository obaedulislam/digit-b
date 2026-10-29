import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';
import { cx } from '@/lib/cx';

const isExternal = (href) => /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');

/**
 * One button for everything.
 *  - `to`    → router link        - `href` → plain anchor (external-safe)
 *  - neither → <button>
 * variant: primary | accent | secondary | ghost | light | danger   size: sm | lg
 */
export function Button({
  variant = 'primary',
  size,
  to,
  href,
  loading = false,
  block = false,
  arrow = false,
  leftIcon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const classes = cx('btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', loading && 'is-loading', className);
  const content = (
    <>
      {leftIcon && <span className="btn__icon">{leftIcon}</span>}
      <span className="btn__label">{children}</span>
      {arrow && (
        <span className="btn__icon" aria-hidden="true">
          <IconArrowRight size={16} stroke={2} />
        </span>
      )}
      {loading && <span className="btn__spinner" aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    const external = isExternal(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external && !href.startsWith('mailto:') && !href.startsWith('tel:')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
