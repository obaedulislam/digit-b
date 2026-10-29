import { useEffect, useRef, useState } from 'react';
import { IconBrandLinkedin, IconBrandX, IconCheck, IconLink, IconMail } from '@tabler/icons-react';
import { siteUrl } from '@/lib/format';
import { cx } from '@/lib/cx';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (insecure context / permissions): legacy fallback.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/**
 * Share row: copy link, LinkedIn, X and email. `path` is the canonical
 * site path ("/vacancies/some-job"); the absolute URL is derived from it.
 */
export function ShareLinks({ path, title, label = 'Share', orientation = 'row', className }) {
  const [status, setStatus] = useState('');
  const timer = useRef(null);
  const url = siteUrl(path);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (message) => {
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), 2400);
  };

  const onCopy = async () => flash((await copyText(url)) ? 'Link copied' : 'Copy failed — select the address bar instead');

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const items = [
    { key: 'linkedin', label: 'Share on LinkedIn', Icon: IconBrandLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { key: 'x', label: 'Share on X', Icon: IconBrandX, href: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}` },
    { key: 'email', label: 'Share by email', Icon: IconMail, href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}` },
  ];

  return (
    <div className={cx('share', `share--${orientation}`, className)}>
      <p className="share__label">{label}</p>
      <ul className="share__list">
        <li>
          <button type="button" className={cx('share__btn', status === 'Link copied' && 'is-done')} onClick={onCopy} aria-label="Copy link">
            {status === 'Link copied' ? <IconCheck size={18} stroke={2} aria-hidden="true" /> : <IconLink size={18} stroke={1.75} aria-hidden="true" />}
          </button>
        </li>
        {items.map(({ key, label: itemLabel, Icon, href }) => (
          <li key={key}>
            <a
              className="share__btn"
              href={href}
              aria-label={itemLabel}
              {...(key === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <Icon size={18} stroke={1.75} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <span className="share__status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
