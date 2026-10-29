import { IconCheck } from '@tabler/icons-react';
import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';

/**
 * Step indicator: a vertical rail on desktop, a segmented bar on mobile.
 * Completed steps are buttons so people can go back and edit; future steps are inert.
 */
export function StepProgress({ steps, current, onGo }) {
  return (
    <nav className="apply-steps" aria-label="Application progress">
      <p className="apply-steps__mobile">
        <span>
          Step {current + 1} of {steps.length}
        </span>
        <strong>{steps[current].label}</strong>
      </p>
      <ol className="apply-steps__list">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const body = (
            <>
              <span className="apply-steps__marker" aria-hidden="true">
                {done ? <IconCheck size={14} stroke={3} /> : pad2(index + 1)}
              </span>
              <span className="apply-steps__text">
                <span className="apply-steps__label">{step.label}</span>
                <span className="apply-steps__hint">{step.hint}</span>
              </span>
            </>
          );
          return (
            <li key={step.id} className={cx('apply-steps__item', done && 'is-done', active && 'is-active')} aria-current={active ? 'step' : undefined}>
              {done ? (
                <button type="button" className="apply-steps__btn" onClick={() => onGo(index)}>
                  {body}
                  <span className="sr-only"> (completed, go back to edit)</span>
                </button>
              ) : (
                <div className="apply-steps__btn">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
