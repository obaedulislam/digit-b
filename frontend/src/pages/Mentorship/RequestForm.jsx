import { Checkbox, Select, TextInput, Textarea } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, FormAlert, Honeypot } from '@/components/ui';
import { publicApi } from '@/api/public';
import { useFormSubmit } from '@/hooks/useFormSubmit';

/**
 * Mentorship request → POST /mentorship/requests. The form instance is owned by
 * the page so programme cards can pre-select a programme (`form.setFieldValue`).
 */
export function RequestForm({ form, programsQuery }) {
  const { submit, isPending, isSuccess, data, error, reset } = useFormSubmit(form, {
    mutationFn: publicApi.requestMentorship,
    onSuccess: () => form.reset(),
  });

  if (programsQuery.isPending) return <p className="request-form__status">Loading programmes…</p>;
  if (programsQuery.isError) {
    return <ErrorState title="We could not load the programmes" onRetry={() => programsQuery.refetch()} />;
  }
  const programs = programsQuery.data;
  if (!programs.length) {
    return (
      <EmptyState
        title="No programmes open right now"
        description="Send us a note about your goals and we will tell you when the next intake opens."
        action={<Button to="/contact?type=mentorship">Contact us</Button>}
      />
    );
  }

  const options = programs.map((p) => ({ value: p.slug, label: `${p.name} (${p.tier === 'premium' ? 'Premium' : 'Standard'})` }));
  const hasFieldErrors = Object.keys(form.errors).length > 0;

  return (
    <div aria-live="polite" aria-atomic="true">
      {isSuccess ? (
        <div className="request-form__done">
          <FormAlert tone="success" title="Request received">
            {data?.message || 'Thank you. A member of the team will contact you within two business days to talk about your goals.'}
          </FormAlert>
          <Button variant="secondary" onClick={reset}>
            Send another request
          </Button>
        </div>
      ) : (
        <form onSubmit={form.onSubmit(submit)} noValidate aria-label="Mentorship request form">
          <div className="form-grid">
            <Select
              id="mentor-program"
              label="Programme"
              placeholder="Choose a programme"
              data={options}
              allowDeselect={false}
              required
              className="form-grid__full"
              {...form.getInputProps('program')}
            />
            <TextInput label="Your name" autoComplete="name" required {...form.getInputProps('name')} />
            <TextInput label="Email" type="email" autoComplete="email" required {...form.getInputProps('email')} />
            <TextInput label="Phone" type="tel" autoComplete="tel" description="Optional" {...form.getInputProps('phone')} />
            <TextInput label="Current role" autoComplete="organization-title" description="Optional" {...form.getInputProps('current_role')} />
            <Textarea
              label="What would you like to achieve?"
              placeholder="Your background, the role or industry you are aiming for, and what support would help most."
              autosize
              minRows={4}
              maxRows={10}
              required
              className="form-grid__full"
              {...form.getInputProps('goal')}
            />
            <Checkbox
              className="form-grid__full"
              label={
                <>
                  I agree to the <Link to="/privacy">privacy policy</Link> and to being contacted about this request.
                </>
              }
              {...form.getInputProps('consent', { type: 'checkbox' })}
            />
            <Honeypot {...form.getInputProps('website')} />
            <div className="form-grid__full">
              {error && <FormAlert>{error}</FormAlert>}
              {!error && hasFieldErrors && <FormAlert>Please correct the highlighted fields and try again.</FormAlert>}
            </div>
            <div className="form-grid__full form-grid__actions">
              <Button type="submit" size="lg" arrow loading={isPending}>
                Request mentorship
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
