import { useParams } from 'react-router-dom';
import { NumberInput, TextInput, Textarea } from '@mantine/core';
import { testimonialsApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { BoolBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormCheck, FormImage, FormSelect } from '../../components/fields/FormFields';
import { toNullableNumber, toNullableString } from '../../lib/helpers';
import { intBetween, maxLength, required } from '../../lib/validators';

const RATINGS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? '' : 's'}` }));

export function TestimonialsList() {
  const columns = [
    {
      id: 'name',
      header: 'Person',
      primary: true,
      sortKey: 'name',
      cell: (row) => (
        <RowTitle to={`/admin/testimonials/${row.id}`} sub={[row.role, row.company].filter(Boolean).join(', ')}>
          {row.name}
        </RowTitle>
      ),
    },
    { id: 'quote', header: 'Quote', hideBelow: 'md', cell: (row) => <span className="admin-cell__clamp">{row.quote}</span> },
    { id: 'rating', header: 'Rating', sortKey: 'rating', hideBelow: 'lg', cell: (row) => `${row.rating} / 5` },
    { id: 'published', header: 'Visible', sortKey: 'is_published', cell: (row) => <BoolBadge value={row.is_published} yes="Published" no="Hidden" /> },
    { id: 'sort', header: 'Order', sortKey: 'sort_order', hideBelow: 'lg', cell: (row) => row.sort_order },
  ];

  return (
    <ResourceTable
      resource={testimonialsApi}
      title="Testimonials"
      eyebrow="Content"
      description="Quotes from clients and candidates."
      columns={columns}
      filters={[
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
      searchPlaceholder="Search name, company or quote"
      defaultSort="sort_order"
      entity="testimonial"
      createTo="/admin/testimonials/new"
      createLabel="New testimonial"
      editTo={(row) => `/admin/testimonials/${row.id}`}
    />
  );
}

const DEFAULTS = { name: '', role: '', company: '', quote: '', rating: '5', avatar: '', is_published: true, sort_order: 0 };

const fromRecord = (item) => ({
  name: item.name ?? '',
  role: item.role ?? '',
  company: item.company ?? '',
  quote: item.quote ?? '',
  rating: String(item.rating ?? 5),
  avatar: item.avatar ?? '',
  is_published: Boolean(item.is_published),
  sort_order: item.sort_order ?? 0,
});

const toPayload = (values) => ({
  name: values.name.trim(),
  role: toNullableString(values.role),
  company: toNullableString(values.company),
  quote: values.quote.trim(),
  rating: Number(values.rating),
  avatar: toNullableString(values.avatar),
  is_published: values.is_published,
  sort_order: toNullableNumber(values.sort_order) ?? 0,
});

const validate = {
  name: required('a name', 255),
  role: maxLength('the role', 255),
  company: maxLength('the company', 255),
  quote: required('the quote', 1500),
  sort_order: intBetween('Sort order', 0, 65535),
};

function TestimonialFields({ form }) {
  return (
    <>
      <FormSection title="Quote">
        <div className="admin-fields">
          <Textarea
            label="Quote"
            withAsterisk
            autosize
            minRows={4}
            maxLength={1500}
            description={<Counter value={form.values.quote} max={1500} />}
            {...form.getInputProps('quote')}
          />
          <FormSelect form={form} name="rating" label="Rating" options={RATINGS} required />
        </div>
      </FormSection>
      <FormSection title="Person">
        <div className="admin-fields">
          <TextInput label="Name" withAsterisk maxLength={255} {...form.getInputProps('name')} />
          <div className="admin-fields__row">
            <TextInput label="Role" maxLength={255} {...form.getInputProps('role')} />
            <TextInput label="Company" maxLength={255} {...form.getInputProps('company')} />
          </div>
          <FormImage form={form} name="avatar" label="Photo" hint="Optional." />
        </div>
      </FormSection>
    </>
  );
}

function TestimonialAside({ form }) {
  return (
    <FormSection title="Publishing">
      <div className="admin-fields">
        <FormCheck form={form} name="is_published" label="Published on the site" />
        <NumberInput label="Sort order" description="Lower numbers appear first." min={0} max={65535} hideControls allowDecimal={false} {...form.getInputProps('sort_order')} />
      </div>
    </FormSection>
  );
}

export function TestimonialForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={testimonialsApi}
      entity="testimonial"
      listLabel="Testimonials"
      listPath="/admin/testimonials"
      title="New testimonial"
      recordTitle={(item) => item.name}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={TestimonialFields}
      Aside={TestimonialAside}
    />
  );
}
