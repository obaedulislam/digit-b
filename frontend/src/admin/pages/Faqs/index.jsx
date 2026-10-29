import { useParams } from 'react-router-dom';
import { NumberInput, TextInput, Textarea } from '@mantine/core';
import { faqsApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { BoolBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormCheck, FormSelect } from '../../components/fields/FormFields';
import { toNullableNumber } from '../../lib/helpers';
import { FAQ_GROUPS, labelOf } from '../../lib/options';
import { intBetween, required } from '../../lib/validators';

export function FaqsList() {
  const columns = [
    {
      id: 'question',
      header: 'Question',
      primary: true,
      sortKey: 'question',
      cell: (row) => <RowTitle to={`/admin/faqs/${row.id}`}>{row.question}</RowTitle>,
    },
    { id: 'group', header: 'Group', sortKey: 'group', hideBelow: 'md', cell: (row) => labelOf(FAQ_GROUPS, row.group) },
    { id: 'published', header: 'Visible', sortKey: 'is_published', cell: (row) => <BoolBadge value={row.is_published} yes="Published" no="Hidden" /> },
    { id: 'sort', header: 'Order', sortKey: 'sort_order', hideBelow: 'md', cell: (row) => row.sort_order },
  ];

  return (
    <ResourceTable
      resource={faqsApi}
      title="FAQs"
      eyebrow="Content"
      description="Questions and answers shown on the public pages."
      columns={columns}
      filters={[
        { name: 'group', label: 'Group', options: FAQ_GROUPS, allLabel: 'All groups' },
        {
          name: 'is_published',
          label: 'Visibility',
          allLabel: 'All',
          options: [
            { value: '1', label: 'Published' },
            { value: '0', label: 'Hidden' },
          ],
        },
      ]}
      searchPlaceholder="Search question or answer"
      defaultSort="sort_order"
      entity="FAQ"
      itemName={(row) => row.question}
      createTo="/admin/faqs/new"
      createLabel="New FAQ"
      editTo={(row) => `/admin/faqs/${row.id}`}
    />
  );
}

const DEFAULTS = { group: 'about', question: '', answer: '', is_published: true, sort_order: 0 };

const fromRecord = (faq) => ({
  group: faq.group,
  question: faq.question ?? '',
  answer: faq.answer ?? '',
  is_published: Boolean(faq.is_published),
  sort_order: faq.sort_order ?? 0,
});

const toPayload = (values) => ({
  group: values.group,
  question: values.question.trim(),
  answer: values.answer.trim(),
  is_published: values.is_published,
  sort_order: toNullableNumber(values.sort_order) ?? 0,
});

const validate = {
  question: required('the question', 255),
  answer: required('the answer', 4000),
  sort_order: intBetween('Sort order', 0, 65535),
};

function FaqFields({ form }) {
  return (
    <FormSection title="Question and answer">
      <div className="admin-fields">
        <TextInput label="Question" withAsterisk maxLength={255} {...form.getInputProps('question')} />
        <Textarea
          label="Answer"
          withAsterisk
          autosize
          minRows={5}
          maxLength={4000}
          description={<Counter value={form.values.answer} max={4000} />}
          {...form.getInputProps('answer')}
        />
      </div>
    </FormSection>
  );
}

function FaqAside({ form }) {
  return (
    <FormSection title="Placement">
      <div className="admin-fields">
        <FormSelect form={form} name="group" label="Group" options={FAQ_GROUPS} required description="Which page shows this question." />
        <NumberInput label="Sort order" description="Lower numbers appear first." min={0} max={65535} hideControls allowDecimal={false} {...form.getInputProps('sort_order')} />
        <FormCheck form={form} name="is_published" label="Published on the site" />
      </div>
    </FormSection>
  );
}

export function FaqForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={faqsApi}
      entity="FAQ"
      listLabel="FAQs"
      listPath="/admin/faqs"
      title="New FAQ"
      recordTitle={(faq) => faq.question}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={FaqFields}
      Aside={FaqAside}
    />
  );
}
