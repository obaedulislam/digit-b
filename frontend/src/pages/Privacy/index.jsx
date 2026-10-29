import { useSettings } from '@/hooks/useSettings';
import { LegalPage } from './LegalPage';
import { PRIVACY_UPDATED, getPrivacySections } from './privacyContent';

export default function Privacy() {
  const { settings } = useSettings();
  const sections = getPrivacySections({ company: settings.company.name || 'DIGIT-B', email: settings.contact.email });

  return (
    <LegalPage
      eyebrow="Privacy policy"
      title={
        <>
          Your data, <em>plainly</em> explained
        </>
      }
      lead="What this site collects when you apply, get in touch or subscribe, why we need it, how long we keep it and the choices you have."
      path="/privacy"
      updated={PRIVACY_UPDATED}
      sections={sections}
      sibling={{ to: '/terms', label: 'terms of use' }}
    />
  );
}
