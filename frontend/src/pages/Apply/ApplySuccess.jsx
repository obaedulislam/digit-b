import { IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';

const NEXT_STEPS = [
  { title: 'We review your profile', text: 'A recruiter reads every application personally. Nothing is filtered out by software alone.' },
  { title: 'We reach out if there is a fit', text: 'If your experience matches a role, we will contact you by email or phone to arrange a conversation.' },
  { title: 'You stay in our talent pool', text: 'Even when there is no match today, we keep your details so we can come back when the right opening appears.' },
];

/** Shown after a successful POST /applications. */
export function ApplySuccess({ job, firstName }) {
  const { settings } = useSettings();
  const email = settings.contact.email;

  return (
    <section className="apply-success" aria-labelledby="apply-success-title" role="status">
      <span className="apply-success__badge" aria-hidden="true">
        <IconCheck size={32} stroke={2.5} />
      </span>
      <h2 className="apply-success__title" id="apply-success-title" tabIndex={-1}>
        Thank you{firstName ? `, ${firstName.trim()}` : ''}. <em>Application received.</em>
      </h2>
      <p className="apply-success__lead">
        We have your application{job ? ` for ${job.title}` : ' and added you to our talent pool'}. A confirmation email should arrive shortly.
      </p>

      <h3 className="apply-success__heading">What happens next</h3>
      <ol className="apply-success__steps">
        {NEXT_STEPS.map((item, index) => (
          <li key={item.title} className="apply-success__step">
            <span className="apply-success__num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="apply-success__step-title">{item.title}</p>
              <p className="apply-success__step-text">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="apply-success__actions">
        <Button to="/vacancies" arrow>
          Browse more vacancies
        </Button>
        <Button to="/articles" variant="secondary">
          Read our articles
        </Button>
      </div>
      {email && (
        <p className="apply-success__note">
          Need to update something? Email <a href={`mailto:${email}`}>{email}</a>.
        </p>
      )}
    </section>
  );
}
