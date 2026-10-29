import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Button } from '@/components/ui/Button';
import { FormAlert, Honeypot } from '@/components/ui/FormAlert';
import { publicApi } from '@/api/public';
import { useFormSubmit } from '@/hooks/useFormSubmit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Newsletter signup → POST /newsletter. Works on light and dark surfaces. */
export function NewsletterForm({ id = 'newsletter', tone = 'dark' }) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', website: '' },
    validate: { email: (v) => (EMAIL.test(v.trim()) ? null : 'Enter a valid email address') },
  });

  const { submit, isPending, isSuccess, error, reset } = useFormSubmit(form, {
    mutationFn: publicApi.subscribe,
    onSuccess: () => form.reset(),
  });

  if (isSuccess) {
    return (
      <FormAlert tone="success" title="You're subscribed">
        Thanks — look out for our next hiring insights.{' '}
        <button type="button" className="link-button" onClick={reset}>
          Subscribe another address
        </button>
      </FormAlert>
    );
  }

  return (
    <form className={`newsletter newsletter--${tone}`} onSubmit={form.onSubmit(submit)} noValidate>
      <div className="newsletter__row">
        <TextInput
          id={`${id}-email`}
          type="email"
          label="Email address"
          placeholder="you@company.com"
          autoComplete="email"
          classNames={{ label: 'sr-only' }}
          key={form.key('email')}
          {...form.getInputProps('email')}
        />
        <Button type="submit" variant={tone === 'dark' ? 'accent' : 'primary'} loading={isPending}>
          Subscribe
        </Button>
      </div>
      <Honeypot {...form.getInputProps('website')} />
      {error && <FormAlert>{error}</FormAlert>}
      <p className="newsletter__note">Hiring insights, no spam. Unsubscribe anytime.</p>
    </form>
  );
}
