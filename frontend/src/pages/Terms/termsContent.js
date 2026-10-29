/*
 * TERMS OF USE COPY.
 *
 * NOTE FOR LAUNCH: this is a plain-language draft, NOT legal advice. Counsel
 * must review it (especially liability, governing law and recruitment-specific
 * wording) and the client must confirm the governing jurisdiction before the
 * site goes live. Bump `TERMS_UPDATED` whenever the text changes.
 */

export const TERMS_UPDATED = '2026-10-29';

/**
 * @param {{ company: string, email: string }} ctx  values from GET /settings
 * @returns {{ id: string, title: string, body: string }[]} markdown sections
 */
export function getTermsSections({ company, email }) {
  const contact = email ? `[${email}](mailto:${email})` : 'the details on our [contact page](/contact)';

  return [
    {
      id: 'acceptance',
      title: 'Agreeing to these terms',
      body: `By using this website you agree to these terms and to our [privacy policy](/privacy). If you do not agree, please do not use the site. In these terms, "we", "us" and "${company}" mean the recruitment business that operates this site.`,
    },
    {
      id: 'service',
      title: 'What this site is',
      body: `This website lets you read about our recruitment services, browse vacancies, apply for roles, contact us, and read articles and blog posts. We act as a recruitment agency: vacancies are usually advertised on behalf of our clients, and some details, such as the client's name, may be withheld until a later stage.

Publishing a vacancy is an invitation to apply, not a promise of employment or of an interview. We may change, pause or withdraw any vacancy or part of the site at any time.`,
    },
    {
      id: 'applications',
      title: 'Applications and the information you give us',
      body: `When you apply or contact us you confirm that:

- the information you provide is accurate and complete to the best of your knowledge, and the CV you upload is yours;
- you have the right to work in the country of the role, or will tell us if you do not; and
- you are happy for us to use your details as described in the privacy policy, including sharing your application with the employer you applied to.

Submitting an application does not create an employment contract or a recruitment agreement with ${company}.`,
    },
    {
      id: 'acceptable-use',
      title: 'Using the site responsibly',
      body: `You agree not to:

- submit false, misleading or someone else's information;
- upload files that contain malware or anything unlawful;
- attempt to gain unauthorised access to the site, its servers or admin area;
- scrape, overload or otherwise interfere with the site, or bypass its spam and rate-limit protections; or
- use the site to send unsolicited marketing.

We may block access or remove submissions that break these rules.`,
    },
    {
      id: 'intellectual-property',
      title: 'Our content',
      body: `The site's design, text, articles, graphics and code belong to ${company} or its licensors and are protected by intellectual-property laws. You may read, share links to, and quote short extracts of our articles with credit. You may not copy or republish substantial parts of the site without our written permission.`,
    },
    {
      id: 'third-parties',
      title: 'Links and third parties',
      body: `The site may link to other websites, such as social networks or map services. We do not control them and are not responsible for their content or privacy practices.`,
    },
    {
      id: 'disclaimer',
      title: 'No advice and no guarantees',
      body: `Articles and blog posts are general information, not legal, financial, tax or career advice. We work hard to keep the site accurate and available, but we provide it "as is" and do not guarantee that it will be uninterrupted, error-free or that every vacancy is still open.`,
    },
    {
      id: 'liability',
      title: 'Limits on our liability',
      body: `Nothing in these terms limits liability that cannot lawfully be limited, including for death or personal injury caused by negligence, or for fraud. Subject to that, ${company} is not liable for indirect or consequential loss, or for loss of opportunity, income or data, arising from your use of the site. Our total liability for any claim relating to the site is limited to the extent permitted by law.`,
    },
    {
      id: 'changes',
      title: 'Changes and ending access',
      body: `We may update these terms from time to time; the date at the top shows the latest version, and continuing to use the site means you accept the update. We may suspend or end access to the site at any time, for example if these terms are broken.`,
    },
    {
      id: 'law',
      title: 'Governing law',
      body: `These terms are governed by the laws of the jurisdiction in which ${company} is established, and the courts of that jurisdiction have non-exclusive authority over any dispute, without affecting any mandatory consumer rights you have in your country of residence.`,
    },
    {
      id: 'contact',
      title: 'Contact',
      body: `Questions about these terms? Email ${contact} or use the [contact form](/contact).`,
    },
  ];
}
