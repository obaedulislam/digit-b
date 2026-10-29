import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { IconLock, IconClockHour4, IconShieldCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { publicApi } from '@/api/public';
import { parseApiError } from '@/api/client';
import { StepProgress } from './StepProgress';
import { BasicStep, QualificationStep, ReviewStep, WorkStep } from './steps';
import { ApplySuccess } from './ApplySuccess';
import { STEPS, buildPayload, firstStepWithErrors, initialValues, validateAll, validateStep } from './schema';

const LAST = STEPS.length - 1;

/** Normalises Laravel keys like "skills.0" to the owning field. */
function normaliseErrors(fieldErrors) {
  const result = {};
  Object.entries(fieldErrors).forEach(([key, message]) => {
    const field = key.split('.')[0];
    if (!(field in result)) result[field] = message;
  });
  return result;
}

/** Four-stage application: basics → qualification → work status → review & submit. */
export function ApplyForm({ job }) {
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState('');
  const form = useForm({ initialValues, clearInputErrorOnChange: true });
  const rootRef = useRef(null);
  const headingRef = useRef(null);

  const focusAfterRender = (selector) =>
    requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ block: 'start' });
      if (selector) rootRef.current?.querySelector(selector)?.focus();
    });

  const goTo = (index) => {
    setStep(index);
    setFormError('');
    requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    });
  };

  const mutation = useMutation({
    mutationFn: (values) => publicApi.submitApplication(buildPayload(values, job?.slug)),
    onSuccess: () => focusAfterRender(),
    onError: (error) => {
      const { status, message, fieldErrors } = parseApiError(error);
      const errors = normaliseErrors(fieldErrors);
      if (status === 422 && Object.keys(errors).length) {
        form.setErrors(errors);
        const target = firstStepWithErrors(errors);
        if (target >= 0) {
          setStep(target);
          setFormError('');
          focusAfterRender('[aria-invalid="true"], .is-invalid input');
        } else {
          setFormError(errors.job || message);
        }
      } else {
        setFormError(message);
      }
    },
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const values = form.getValues();

    if (step < LAST) {
      const errors = validateStep(step, values);
      if (Object.keys(errors).length) {
        form.setErrors(errors);
        focusAfterRender('[aria-invalid="true"], .is-invalid input');
        return;
      }
      form.clearErrors();
      goTo(step + 1);
      return;
    }

    const errors = validateAll(values);
    if (Object.keys(errors).length) {
      form.setErrors(errors);
      const target = firstStepWithErrors(errors);
      if (target !== LAST) goTo(target);
      else focusAfterRender('[aria-invalid="true"]');
      return;
    }
    setFormError('');
    mutation.mutate(values);
  };

  if (mutation.isSuccess) {
    return (
      <div ref={rootRef} className="apply apply--done">
        <ApplySuccess job={job} firstName={form.values.first_name} />
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div ref={rootRef} className="apply">
      <aside className="apply__rail">
        <StepProgress steps={STEPS} current={step} onGo={goTo} />
        <ul className="apply__assurances">
          <li>
            <IconClockHour4 size={18} stroke={1.5} aria-hidden="true" />
            About four minutes
          </li>
          <li>
            <IconLock size={18} stroke={1.5} aria-hidden="true" />
            Your CV is stored privately
          </li>
          <li>
            <IconShieldCheck size={18} stroke={1.5} aria-hidden="true" />
            Nothing is shared without your say-so
          </li>
        </ul>
      </aside>

      <form className="apply__panel" onSubmit={onSubmit} noValidate aria-label="Application form">
        <header className="apply__header">
          <p className="apply__count" role="status" aria-live="polite">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="apply__title" tabIndex={-1} ref={headingRef}>
            {current.label}
          </h2>
          <p className="apply__hint">{current.hint}</p>
        </header>

        {step === 0 && <BasicStep form={form} />}
        {step === 1 && <QualificationStep form={form} />}
        {step === 2 && <WorkStep form={form} />}
        {step === 3 && <ReviewStep form={form} job={job} goTo={goTo} error={null} />}

        {formError && <FormAlert title="We could not send your application">{formError}</FormAlert>}

        <div className="apply__actions">
          {step > 0 && (
            <Button variant="ghost" onClick={() => goTo(step - 1)} disabled={mutation.isPending}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" arrow={step < LAST} loading={mutation.isPending} className="apply__next">
            {step < LAST ? 'Continue' : 'Submit application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
