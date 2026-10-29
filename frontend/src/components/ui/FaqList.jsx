import { Accordion } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/api/public';
import { QueryBoundary } from './QueryBoundary';
import { EmptyState, TextSkeleton } from './States';

/** FAQ accordion for one group (`about | employers | candidates`) with all query states. */
export function FaqList({ group }) {
  const query = useQuery(queries.faqs(group));

  return (
    <div className="faq">
      <QueryBoundary
        query={query}
        loading={<TextSkeleton lines={5} />}
        errorTitle="We could not load the questions"
        empty={<EmptyState title="No questions yet" description="Check back soon, or send us a message and we will answer directly." />}
      >
        {(faqs) => (
          <Accordion variant="default" chevron={<IconPlus size={18} aria-hidden="true" />} disableChevronRotation>
            {faqs.map((faq) => (
              <Accordion.Item key={faq.id} value={String(faq.id)}>
                <Accordion.Control>{faq.question}</Accordion.Control>
                <Accordion.Panel>
                  {String(faq.answer)
                    .split(/\n{2,}/)
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </QueryBoundary>
    </div>
  );
}
