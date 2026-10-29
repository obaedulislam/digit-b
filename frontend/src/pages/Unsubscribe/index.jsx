import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Container, FormAlert, Section, Seo } from '@/components/ui';
import { publicApi } from '@/api/public';
import { parseApiError } from '@/api/client';
import { isValidUnsubscribeToken } from './token';

/**
 * One-click unsubscribe from the link in our e-mails.
 *
 * The page asks for a confirmation click instead of unsubscribing on load: e-mail
 * security scanners prefetch links in messages and would otherwise unsubscribe
 * people who never asked to leave.
 */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const tokenLooksValid = isValidUnsubscribeToken(token);

  const mutation = useMutation({ mutationFn: () => publicApi.unsubscribe(token) });
  const error = mutation.error ? parseApiError(mutation.error) : null;
  const invalidLink = !tokenLooksValid || error?.status === 404 || error?.status === 422;

  return (
    <Section tone="paper" className="unsubscribe">
      <Seo title="Unsubscribe" noindex />
      <Container narrow className="unsubscribe__inner">
        <h1 className="unsubscribe__title">{mutation.isSuccess ? 'You are unsubscribed' : 'Unsubscribe from hiring insights'}</h1>

        {mutation.isSuccess ? (
          <>
            <FormAlert tone="success">{mutation.data.message}</FormAlert>
            <p className="unsubscribe__text">Changed your mind? You can subscribe again at any time from the footer of any page.</p>
            <Button to="/" arrow>
              Back to the site
            </Button>
          </>
        ) : invalidLink ? (
          <>
            <FormAlert title="This link is not valid">
              It may be incomplete or already replaced. If you keep receiving our e-mails, reply to one of them and we will remove you manually.
            </FormAlert>
            <Button to="/contact" variant="secondary">
              Contact us
            </Button>
          </>
        ) : (
          <>
            <p className="unsubscribe__text">Confirm below and we will stop sending you our monthly e-mail. This takes effect immediately.</p>
            {error && <FormAlert>{error.message}</FormAlert>}
            <div className="unsubscribe__actions">
              <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
                Yes, unsubscribe me
              </Button>
              <Link to="/" className="unsubscribe__cancel">
                No, keep me subscribed
              </Link>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
