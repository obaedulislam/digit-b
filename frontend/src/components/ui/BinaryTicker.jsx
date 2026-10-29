import { cx } from '@/lib/cx';

const WORDS = ['0', '1', 'B', 'DIGITAL', '0', '1', '1', '0', 'B-COMING'];

/**
 * Slow marquee of the brand's "0 → 1 → B" motif. Decorative, hidden from AT,
 * and motion is disabled by CSS under prefers-reduced-motion.
 */
export function BinaryTicker({ className, items = WORDS }) {
  const row = items.map((word, i) => (
    <span key={`${word}-${i}`} className={cx('ticker__item', word === 'B' && 'ticker__item--accent')}>
      {word}
    </span>
  ));
  return (
    <div className={cx('ticker', className)} aria-hidden="true">
      <div className="ticker__track">
        <div className="ticker__row">{row}</div>
        <div className="ticker__row">{row}</div>
      </div>
    </div>
  );
}
