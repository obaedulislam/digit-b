import { useId } from 'react';
import { IconBuildingSkyscraper, IconHome, IconArrowsShuffle } from '@tabler/icons-react';
import { cx } from '@/lib/cx';
import { WORK_STATUS_OPTIONS } from './schema';

const ICONS = { remote: IconHome, hybrid: IconArrowsShuffle, onsite: IconBuildingSkyscraper };

/** Large selectable radio cards for `work_status` (remote | hybrid | onsite). */
export function WorkStatusCards({ value, onChange, error }) {
  const name = useId();
  return (
    <fieldset className="work-cards" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field__label">
        How would you like to work? <span className="field__required">*</span>
      </legend>
      <div className="work-cards__grid">
        {WORK_STATUS_OPTIONS.map((option) => {
          const Icon = ICONS[option.value];
          const selected = value === option.value;
          return (
            <label key={option.value} className={cx('work-card', selected && 'is-selected', error && 'is-invalid')}>
              <input className="work-card__input" type="radio" name={name} value={option.value} checked={selected} onChange={() => onChange(option.value)} />
              <span className="work-card__icon" aria-hidden="true">
                <Icon size={26} stroke={1.5} />
              </span>
              <span className="work-card__title">{option.label}</span>
              <span className="work-card__text">{option.description}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="field__error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
