import { useSettings } from '@/hooks/useSettings';
import { LegalPage } from '@/pages/Privacy/LegalPage';
import { TERMS_UPDATED, getTermsSections } from './termsContent';

export default function Terms() {
  const { settings } = useSettings();
  const sections = getTermsSections({ company: settings.company.name || 'DIGIT-B', email: settings.contact.email });

  return (
    <LegalPage
      eyebrow="Terms of use"
      title={
        <>
          The <em>ground rules</em> for using this site
        </>
      }
      lead="A short, readable set of terms for browsing vacancies, applying for roles and contacting our team."
      path="/terms"
      updated={TERMS_UPDATED}
      sections={sections}
      sibling={{ to: '/privacy', label: 'privacy policy' }}
    />
  );
}
