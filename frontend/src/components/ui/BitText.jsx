import { Fragment } from 'react';

/**
 * Sets standalone "0" and "1" digits in the mono face so they never read as the
 * letters O / l in the display serif ("Moving beyond 0 and 1 to B-coming digital").
 * Use for any brand copy that mentions the binary digits.
 */
export function BitText({ children }) {
  if (typeof children !== 'string') return children;
  return children.split(/(\b[01]\b)/).map((part, i) =>
    part === '0' || part === '1' ? (
      <span key={i} className="bit">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
