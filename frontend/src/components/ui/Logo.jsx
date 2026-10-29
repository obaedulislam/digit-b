import { Link } from 'react-router-dom';
import { cx } from '@/lib/cx';

/**
 * The "0 1 B" mark + wordmark. `tone="light"` is for dark surfaces.
 * No aria-label on purpose: the link is named by its visible "DIGIT-B" text,
 * which keeps the accessible name identical to what sighted users see (WCAG 2.5.3).
 */
export function Logo({ tone = 'dark', to = '/', className }) {
  return (
    <Link to={to} className={cx('logo', `logo--${tone}`, className)}>
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <rect className="logo__tile" width="40" height="40" rx="11" />
        <text className="logo__glyph" x="20" y="27.5" textAnchor="middle">
          B
        </text>
        <circle className="logo__bit" cx="31.5" cy="8.5" r="2.2" />
      </svg>
      <span className="logo__word">
        DIGIT<span className="logo__dash">-</span>B
      </span>
    </Link>
  );
}
