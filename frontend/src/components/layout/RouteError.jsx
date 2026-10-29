import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Container } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/ui/Seo';

/** Router-level error boundary (render errors, failed chunk loads, 404s). */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Container className="route-error">
      <Seo title={notFound ? 'Page not found' : 'Something went wrong'} noindex />
      <p className="route-error__code" aria-hidden="true">
        {notFound ? '404' : '0 1'}
      </p>
      <h1 className="route-error__title">{notFound ? 'This page took a different route.' : 'Something went wrong.'}</h1>
      <p className="route-error__text">
        {notFound ? 'The page you are looking for does not exist or has moved.' : 'An unexpected error occurred. Reloading usually fixes it.'}
      </p>
      <div className="route-error__actions">
        <Button to="/" arrow>
          Back to home
        </Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </Container>
  );
}
