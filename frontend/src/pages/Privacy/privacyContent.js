/*
 * PRIVACY POLICY COPY.
 *
 * NOTE FOR LAUNCH: this text was drafted from what the application actually
 * does (see docs/02-api-contract.md) but it is NOT legal advice. Qualified
 * counsel must review it, and the client must confirm the retention periods,
 * processor list and jurisdiction before the site goes live. Any change to the
 * data the site collects must be mirrored here and `PRIVACY_UPDATED` bumped.
 */

export const PRIVACY_UPDATED = '2026-10-29';

/**
 * @param {{ company: string, email: string }} ctx  values from GET /settings
 * @returns {{ id: string, title: string, body: string }[]} markdown sections
 */
export function getPrivacySections({ company, email }) {
  const contact = email ? `[${email}](mailto:${email})` : 'the details on our [contact page](/contact)';

  return [
    {
      id: 'who-we-are',
      title: 'Who we are',
      body: `${company} is a recruitment firm specialising in retail supply-chain technology. We run this website to publish vacancies, receive applications and enquiries, and share hiring insight. For the personal data described in this policy, ${company} is the data controller. You can reach us at ${contact}.`,
    },
    {
      id: 'what-we-collect',
      title: 'What we collect',
      body: `We only collect what you choose to send us, plus a small amount of technical data needed to run the site.

- **Contact enquiries.** Your name, email address, optional phone number and company, the type of enquiry, an optional subject and your message.
- **Job applications.** Your name, email address, phone number, location, optional LinkedIn link, current job title and employer, years of experience, highest education, skills, work preference (remote, hybrid or in person), optional expected salary and availability date, an optional cover letter, and your CV or résumé file. If you apply for a specific vacancy we also record which one.
- **Newsletter.** Your email address and the date you subscribed.
- **Mentorship requests.** Your name, email address, optional phone number and current role, the programme you chose and what you want to achieve.
- **Server logs.** Like most websites, our servers record your IP address, browser type, the pages requested and timestamps. We use these to keep the site secure and working.

We do not ask for sensitive categories of data such as health, religion or ethnic origin. Please do not include them in free-text fields or your CV.`,
    },
    {
      id: 'how-we-use-it',
      title: 'How and why we use it',
      body: `- **To reply to you.** We use enquiry and mentorship details to respond to your message (legitimate interests, and steps you ask us to take).
- **To consider you for roles.** We use application details to assess your suitability, contact you, and match you with current or future vacancies. We rely on your consent, which you give when you submit the form and can withdraw at any time.
- **To send the newsletter.** We email hiring insight to people who subscribe (consent). Every email can be opted out of.
- **To keep the site safe.** We use server logs and spam protection to prevent abuse, fix faults and secure our systems (legitimate interests).
- **To meet legal duties.** We may keep or disclose information where the law requires it.

We do not sell your personal data and we do not use it for automated decision-making that has legal or similarly significant effects. Every application is read by a person.`,
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      body: `- **Applications and CVs:** kept while we are actively considering you and for up to 24 months after your last activity, so we can match you to future roles. You can ask us to delete them sooner.
- **Contact and mentorship enquiries:** kept for up to 24 months after the conversation ends.
- **Newsletter addresses:** kept until you unsubscribe.
- **Server logs:** kept for a short rolling period, normally no more than 90 days.

After these periods data is deleted or irreversibly anonymised. Backups are overwritten on their normal cycle.`,
    },
    {
      id: 'sharing',
      title: 'Who we share it with',
      body: `Your information is only seen by ${company} staff who need it for their work, and by the service providers that help us operate the site. These act on our instructions and include:

- hosting and infrastructure providers that run the website and database;
- email delivery providers that send our replies, confirmations and newsletter.

When you apply for a specific vacancy, we may share your application with the employer that is hiring for that role. We will tell you before we put you forward to a named client. We may also disclose information to professional advisers, or to authorities where legally required.`,
    },
    {
      id: 'transfers',
      title: 'International transfers',
      body: `${company} works with clients and candidates in several countries, and our providers may process data outside your own. Where personal data leaves your country or the European Economic Area, we use appropriate safeguards such as standard contractual clauses or an adequacy decision.`,
    },
    {
      id: 'security',
      title: 'How we protect it',
      body: `The site is served over HTTPS. CVs are stored privately, are never publicly linked, and are only accessible to authorised recruiters after they sign in. Access to our systems is limited by role, and forms are protected against automated abuse. No system is perfectly secure, so please tell us at once if you suspect a problem.`,
    },
    {
      id: 'cookies',
      title: 'Cookies',
      body: `We do not use advertising, analytics or tracking cookies, and we do not load third-party trackers.

We set only strictly necessary cookies:

- a **security (CSRF) cookie** that protects forms such as applications and enquiries from being submitted by other sites on your behalf; and
- a **session cookie** used only when our staff sign in to the admin area.

Because these are essential to the service, they do not require consent. You can block cookies in your browser, but the forms may then stop working.`,
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body: `Depending on where you live, you have the right to:

- access the personal data we hold about you and receive a copy;
- have inaccurate data corrected;
- have your data deleted;
- restrict or object to our processing;
- receive your data in a portable format;
- withdraw consent at any time, without affecting earlier processing; and
- complain to your local data-protection authority.

To use any of these rights, email ${contact}. We may need to verify your identity first and will reply within one month.`,
    },
    {
      id: 'children',
      title: 'Children',
      body: `This site is intended for adults looking for work or hiring staff. We do not knowingly collect data from anyone under 16. If you believe a child has sent us information, contact us and we will delete it.`,
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: `We will update this policy when our practices change. The date at the top of this page shows when it was last revised. Significant changes will be highlighted on the site.`,
    },
    {
      id: 'contact',
      title: 'Contact us',
      body: `Questions about this policy or your data? Email ${contact} or use the [contact form](/contact).`,
    },
  ];
}
