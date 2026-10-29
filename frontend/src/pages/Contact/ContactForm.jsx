import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox, Select, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { FormAlert, Honeypot } from '@/components/ui/FormAlert';
import { publicApi } from '@/api/public';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { INQUIRY_TYPES, MESSAGE_MAX, buildContactPayload, contactValidators } from './schema';

/** Inquiry form → POST /contact. `initialType` comes from `?type=`. */
export function ContactForm({ initialType }) {
  const form = useForm({
    initialValues: { name: '', email: '', phone: '', company: '', inquiry_type: initialType, subject: '', message: '', consent: false, website: '' },
    validate: contactValidators,
  });

  // The "Place a job order" shortcut changes ?type= while this form is mounted.
  const { setFieldValue } = form;
  useEffect(() => {
    setFieldValue('inquiry_type', initialType);
  }, [initialType, setFieldValue]);

  const { submit, isPending, isSuccess, error, reset } = useFormSubmit(form, {
    mutationFn: publicApi.submitContact,
    transform: buildContactPayload,
    onSuccess: () => form.reset(),
  });

  if (isSuccess) {
    return (
      <div className="contact-success" role="status">
        <span className="contact-success__badge" aria-hidden="true">
          <IconCheck size={28} stroke={2.5} />
        </span>
        <h2 className="contact-success__title" tabIndex={-1}>
          Message <em>sent.</em>
        </h2>
        <p className="contact-success__text">
          Thank you for reaching out. A member of the team will read your message and reply by email. Keep an eye on your inbox, and your spam folder just in case.
        </p>
        <div className="contact-success__actions">
          <Button to="/vacancies" arrow>
            Browse vacancies
          </Button>
          <Button variant="secondary" onClick={reset}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={form.onSubmit(submit)} noValidate aria-label="Contact form">
      <div className="form-grid">
        <TextInput label="Your name" withAsterisk autoComplete="name" {...form.getInputProps('name')} />
        <TextInput label="Email" type="email" withAsterisk autoComplete="email" placeholder="you@company.com" {...form.getInputProps('email')} />
        <TextInput label="Phone (optional)" type="tel" autoComplete="tel" {...form.getInputProps('phone')} />
        <TextInput label="Company (optional)" autoComplete="organization" {...form.getInputProps('company')} />
        <div className="form-grid__full">
          <Select
            label="What is this about?"
            withAsterisk
            data={INQUIRY_TYPES}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('inquiry_type')}
          />
        </div>
        <div className="form-grid__full">
          <TextInput label="Subject (optional)" {...form.getInputProps('subject')} />
        </div>
        <div className="form-grid__full">
          <Textarea
            label="Message"
            withAsterisk
            description={`${form.values.message.length}/${MESSAGE_MAX}`}
            autosize
            minRows={6}
            maxRows={14}
            {...form.getInputProps('message')}
          />
        </div>
        <div className="form-grid__full">
          <Checkbox
            label={
              <>
                I have read the{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                  privacy policy
                </Link>{' '}
                and agree that DIGIT-B may use these details to reply to me.
              </>
            }
            {...form.getInputProps('consent', { type: 'checkbox' })}
          />
        </div>
      </div>
      <Honeypot {...form.getInputProps('website')} />
      {error && <FormAlert title="We could not send your message">{error}</FormAlert>}
      <div className="form-grid__actions">
        <Button type="submit" size="lg" arrow loading={isPending}>
          Send message
        </Button>
      </div>
    </form>
  );
}
