/** Tiny class-name joiner: cx('btn', isActive && 'is-active', undefined) → "btn is-active". */
export const cx = (...parts) => parts.filter(Boolean).join(' ');
