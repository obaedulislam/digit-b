import { useState } from 'react';
import { NodeField } from './NodeField';
import { cx } from '@/lib/cx';

/**
 * Image with a graceful, on-brand fallback: if `src` is missing or fails to
 * load, a deterministic generated network graphic (seeded by `seed`) is shown,
 * so cards never render broken images.
 */
export function CoverImage({ src, alt = '', seed, ratio = '4 / 3', className, label }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={cx('cover', className)} style={{ aspectRatio: ratio }}>
      {showImage ? (
        <img className="cover__img" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <>
          <NodeField seed={seed || alt || 'cover'} nodes={18} packets={2} className="cover__art" />
          {label && <span className="cover__label">{label}</span>}
        </>
      )}
    </div>
  );
}
