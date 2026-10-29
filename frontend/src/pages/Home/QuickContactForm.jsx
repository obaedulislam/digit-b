import { Checkbox, Select, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { Button, FormAlert, Honeypot } from '@/components/ui';
import { publicApi } from '@/api/public';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { INQUIRY_TYPES } from './content';
import { contactRules } from './contactRules';

const initialValues = { name: '', email: '', inquiry_type: 'hiring', message: '', consent: false, website: '' };

/** "What are you looking for?" quick contact form → POST /contact. */
export function QuickContactForm() {
  const form = useForm({ mode: 'uncontrolled', initialValues, validate: contactRules });

  const { submit, isPending, isSuccess, data, error, reset } = useFormSubmit(form, {
    mutationFn: publicApi.submitContact,
    onSuccess: () => form.reset(),
  });

  const hasFieldErrors = Object.keys(form.errors).length > 0;

  return (
    <div className="quick-form" aria-live="polite">
      {isSuccess ? (
        <div className="quick-form__done">
          <FormAlert tone="success" title="Message sent">
            {data?.message || 'Thank you. A recruiter will reply within one business day.'}
          </FormAlert>
          <Button variant="light" onClick={reset}>
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={form.onSubmit(submit)} noValidate aria-label="Quick contact form">
          <div className="form-grid">
            <TextInput label="Your name" autoComplete="name" required key={form.key('name')} {...form.getInputProps('name')} />
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              required
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <Select
              label="What are you looking for?"
              data={INQUIRY_TYPES}
              allowDeselect={false}
              required
              className="form-grid__full"
              key={form.key('inquiry_type')}
              {...form.getInputProps('inquiry_type')}
            />
            <Textarea
              label="How can we help?"
              placeholder="Tell us about the role, the team or the next step you are considering."
              autosize
              minRows={4}
              maxRows={10}
              required
              className="form-grid__full"
              key={form.key('message')}
              {...form.getInputProps('message')}
            />
            <Checkbox
              className="form-grid__full"
              label={
                <>
                  I agree to the <Link to="/privacy">privacy policy</Link> and to being contacted about my enquiry.
                </>
              }
              key={form.key('consent')}
              {...form.getInputProps('consent', { type: 'checkbox' })}
            />
            <Honeypot {...form.getInputProps('website')} />
            <div className="form-grid__full">
              {error && <FormAlert>{error}</FormAlert>}
              {!error && hasFieldErrors && <FormAlert>Please correct the highlighted fields and try again.</FormAlert>}
            </div>
            <div className="form-grid__full form-grid__actions">
              <Button type="submit" variant="accent" size="lg" arrow loading={isPending}>
                Send message
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
