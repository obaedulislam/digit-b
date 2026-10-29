import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { cx } from '@/lib/cx';

/** Form-level feedback: tone = error | success. Announced to screen readers. */
export function FormAlert({ tone = 'error', title, children, className }) {
  if (!children && !title) return null;
  const Icon = tone === 'success' ? IconCircleCheck : IconAlertCircle;
  return (
    <div className={cx('form-alert', `form-alert--${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={20} stroke={1.75} aria-hidden="true" className="form-alert__icon" />
      <div className="form-alert__body">
        {title && <p className="form-alert__title">{title}</p>}
        {children && <p className="form-alert__text">{children}</p>}
      </div>
    </div>
  );
}

/**
 * Hidden anti-spam field. Real users never see or fill it; the API silently
 * discards submissions where it has a value. Spread `form.getInputProps('website')`.
 */
export function Honeypot(props) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
