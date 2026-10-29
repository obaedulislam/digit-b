import { Container } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/ui/Seo';

export default function NotFound() {
  return (
    <Container className="route-error">
      <Seo title="Page not found" noindex />
      <p className="route-error__code" aria-hidden="true">
        404
      </p>
      <h1 className="route-error__title">This page took a different route.</h1>
      <p className="route-error__text">The page you are looking for does not exist or has moved.</p>
      <div className="route-error__actions">
        <Button to="/" arrow>
          Back to home
        </Button>
        <Button to="/vacancies" variant="secondary">
          Browse vacancies
        </Button>
      </div>
    </Container>
  );
}
