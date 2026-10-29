import { Link } from 'react-router-dom';
import { Container, Markdown, PageHero, Section, Seo } from '@/components/ui';
import { formatDate, pad2 } from '@/lib/format';

/**
 * Shared layout for the legal pages: hero, sticky table of contents, numbered
 * markdown sections. `sections` = [{ id, title, body (markdown) }].
 */
export function LegalPage({ eyebrow, title, lead, path, updated, sections, sibling }) {
  return (
    <>
      <Seo title={eyebrow} description={lead} path={path} />
      <PageHero eyebrow={eyebrow} title={title} lead={lead} crumbs={[{ label: eyebrow }]} seed={path} />

      <Section tone="paper" className="legal">
        <Container>
          <div className="legal__layout">
            <nav className="legal__toc" aria-label="On this page">
              <p className="legal__toc-title">On this page</p>
              <ol className="legal__toc-list">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a className="legal__toc-link" href={`#${section.id}`}>
                      <span>{pad2(index + 1)}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="legal__content">
              <p className="legal__updated">
                Last updated <time dateTime={updated}>{formatDate(updated, { long: true })}</time>
              </p>
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="legal__section" aria-labelledby={`${section.id}-title`}>
                  <h2 className="legal__title" id={`${section.id}-title`}>
                    <span className="legal__num" aria-hidden="true">
                      {pad2(index + 1)}
                    </span>
                    {section.title}
                  </h2>
                  <Markdown source={section.body} className="legal__body" />
                </section>
              ))}
              {sibling && (
                <p className="legal__sibling">
                  Also read our <Link to={sibling.to}>{sibling.label}</Link>.
                </p>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
