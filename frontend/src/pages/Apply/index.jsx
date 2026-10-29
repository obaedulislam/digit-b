import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Container, FormAlert, PageHero, Section, Seo, TextSkeleton } from '@/components/ui';
import { queries } from '@/api/public';
import { jobPlace, isNotFound } from '@/pages/Vacancies/jobMeta';
import { ApplyForm } from './ApplyForm';

export default function Apply() {
  const [params] = useSearchParams();
  const slug = (params.get('job') ?? '').trim();
  const jobQuery = useQuery({ ...queries.job(slug), enabled: Boolean(slug), retry: false });

  const job = slug && jobQuery.isSuccess ? jobQuery.data : null;
  const loadingJob = Boolean(slug) && jobQuery.isPending;
  const jobMissing = Boolean(slug) && jobQuery.isError && isNotFound(jobQuery.error);
  const jobFailed = Boolean(slug) && jobQuery.isError && !jobMissing;

  return (
    <>
      <Seo
        title={job ? `Apply — ${job.title}` : 'Apply now'}
        description="Apply in four short steps. Tell us about yourself, your experience and how you want to work, and attach your CV."
        path="/apply"
        noindex={Boolean(slug)}
      />
      <PageHero
        eyebrow="Apply now"
        title={
          job ? (
            <>
              Apply for <em>{job.title}</em>
            </>
          ) : (
            <>
              Let’s find your next <em>move</em>
            </>
          )
        }
        lead={
          job
            ? 'Four short steps. A recruiter will read your application personally.'
            : 'No matching vacancy? No problem. Apply once and we will match you to roles as they open.'
        }
        crumbs={
          job
            ? [{ label: 'Vacancies', to: '/vacancies' }, { label: job.title, to: `/vacancies/${job.slug}` }, { label: 'Apply' }]
            : [{ label: 'Apply now' }]
        }
        seed="apply"
      />

      <Section tone="paper" className="apply-section">
        <Container>
          {job && (
            <div className="apply-role">
              <div>
                <p className="apply-role__label">Applying for</p>
                <p className="apply-role__title">
                  <Link to={`/vacancies/${job.slug}`}>{job.title}</Link>
                </p>
                <p className="apply-role__meta">{[job.reference_code && `Ref ${job.reference_code}`, jobPlace(job), job.employment_type_label].filter(Boolean).join(' · ')}</p>
              </div>
              <Button to="/apply" variant="secondary" size="sm">
                Apply generally instead
              </Button>
            </div>
          )}

          {jobMissing && (
            <FormAlert tone="error" title="We could not find that role" className="apply__notice">
              It may have closed or the link may be out of date. You can still send a general application below and we will match you to open roles.
            </FormAlert>
          )}

          {jobFailed && (
            <div className="apply__notice apply__notice--row">
              <FormAlert tone="error" title="We could not load the role details">
                Check your connection and retry, or continue with a general application.
              </FormAlert>
              <Button variant="secondary" size="sm" onClick={() => jobQuery.refetch()}>
                Retry
              </Button>
            </div>
          )}

          {loadingJob ? <TextSkeleton lines={6} /> : <ApplyForm key={job?.slug ?? 'general'} job={job} />}
        </Container>
      </Section>
    </>
  );
}
