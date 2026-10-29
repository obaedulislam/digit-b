import { useParams } from 'react-router-dom';
import { NumberInput, TextInput, Textarea } from '@mantine/core';
import { servicesApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormImage, FormMarkdown, FormSelect } from '../../components/fields/FormFields';
import { ObjectListField, StringListField } from '../../components/fields/Lists';
import { useSlugField } from '../../components/useSlugField';
import { cleanList, cleanRows, toNullableNumber, toNullableString } from '../../lib/helpers';
import { CONTENT_STATUSES, SERVICE_GROUPS, labelOf } from '../../lib/options';
import { intBetween, listItems, maxLength, required, rowsComplete, slug as slugRule } from '../../lib/validators';

export function ServicesList() {
  const columns = [
    {
      id: 'title',
      header: 'Service',
      primary: true,
      sortKey: 'title',
      cell: (row) => (
        <RowTitle to={`/admin/services/${row.id}`} sub={row.slug}>
          {row.title}
        </RowTitle>
      ),
    },
    { id: 'group', header: 'Group', sortKey: 'group', hideBelow: 'md', cell: (row) => labelOf(SERVICE_GROUPS, row.group) },
    { id: 'status', header: 'Status', sortKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { id: 'sort', header: 'Order', sortKey: 'sort_order', hideBelow: 'md', cell: (row) => row.sort_order },
  ];

  return (
    <ResourceTable
      resource={servicesApi}
      title="Services"
      eyebrow="Content"
      description="The solutions and hiring models presented on the Services pages."
      columns={columns}
      filters={[
        { name: 'group', label: 'Group', options: SERVICE_GROUPS, allLabel: 'All groups' },
        { name: 'status', label: 'Status', options: CONTENT_STATUSES, allLabel: 'All statuses' },
      ]}
      searchPlaceholder="Search title or summary"
      defaultSort="sort_order"
      entity="service"
      createTo="/admin/services/new"
      createLabel="New service"
      editTo={(row) => `/admin/services/${row.id}`}
    />
  );
}

const DEFAULTS = {
  title: '',
  slug: '',
  summary: '',
  icon: '',
  image: '',
  group: 'solution',
  features: [],
  process_steps: [],
  advantages: [],
  body_markdown: '',
  status: 'draft',
  sort_order: 0,
  seo_title: '',
  seo_description: '',
};

const STEP_FIELDS = ['title', 'description'];

const fromRecord = (service) => ({
  ...DEFAULTS,
  title: service.title ?? '',
  slug: service.slug ?? '',
  summary: service.summary ?? '',
  icon: service.icon ?? '',
  image: service.image ?? '',
  group: service.group,
  features: service.features ?? [],
  process_steps: (service.process_steps ?? []).map((step) => ({ title: step.title ?? '', description: step.description ?? '' })),
  advantages: (service.advantages ?? []).map((item) => ({ title: item.title ?? '', description: item.description ?? '' })),
  body_markdown: service.body_markdown ?? '',
  status: service.status,
  sort_order: service.sort_order ?? 0,
  seo_title: service.seo_title ?? '',
  seo_description: service.seo_description ?? '',
});

const toPayload = (values) => ({
  title: values.title.trim(),
  slug: toNullableString(values.slug),
  summary: values.summary.trim(),
  icon: toNullableString(values.icon),
  image: toNullableString(values.image),
  group: values.group,
  features: cleanList(values.features),
  process_steps: cleanRows(values.process_steps, STEP_FIELDS),
  advantages: cleanRows(values.advantages, STEP_FIELDS),
  body_markdown: toNullableString(values.body_markdown),
  status: values.status,
  sort_order: toNullableNumber(values.sort_order) ?? 0,
  seo_title: toNullableString(values.seo_title),
  seo_description: toNullableString(values.seo_description),
});

const validate = {
  title: required('a title', 255),
  slug: slugRule,
  summary: required('a summary', 600),
  icon: maxLength('the icon name', 60),
  features: listItems('Feature', 255),
  process_steps: rowsComplete('Step', STEP_FIELDS),
  advantages: rowsComplete('Advantage', STEP_FIELDS),
  sort_order: intBetween('Sort order', 0, 65535),
  seo_title: maxLength('the SEO title', 255),
  seo_description: maxLength('the SEO description', 320),
};

function ServiceFields({ form, isEdit }) {
  const slug = useSlugField(form, 'title', isEdit);
  const rowColumns = [
    { name: 'title', label: 'Title' },
    { name: 'description', label: 'Description', multiline: true },
  ];
  return (
    <>
      <FormSection title="Basics">
        <div className="admin-fields">
          <TextInput label="Title" withAsterisk maxLength={255} {...form.getInputProps('title')} onChange={slug.onSourceChange} />
          <TextInput label="URL slug" description="Used in the public address: /services/your-slug" {...form.getInputProps('slug')} onChange={slug.onSlugChange} />
          <Textarea
            label="Summary"
            withAsterisk
            autosize
            minRows={2}
            maxLength={600}
            description={<Counter value={form.values.summary} max={600} />}
            {...form.getInputProps('summary')}
          />
          <FormImage form={form} name="image" label="Image" hint="Optional. A generated graphic is used when empty." />
        </div>
      </FormSection>

      <FormSection title="Page content">
        <div className="admin-fields">
          <FormMarkdown form={form} name="body_markdown" label="Body" description="Markdown supported." minRows={12} />
          <StringListField form={form} name="features" label="Feature bullets" itemName="feature" addLabel="Add feature" max={20} />
          <ObjectListField form={form} name="process_steps" label="Process steps" itemName="step" addLabel="Add step" columns={rowColumns} max={12} />
          <ObjectListField form={form} name="advantages" label="Advantages" itemName="advantage" addLabel="Add advantage" columns={rowColumns} max={12} />
        </div>
      </FormSection>
    </>
  );
}

function ServiceAside({ form }) {
  return (
    <>
      <FormSection title="Publishing">
        <div className="admin-fields">
          <FormSelect form={form} name="status" label="Status" options={CONTENT_STATUSES} />
          <FormSelect form={form} name="group" label="Group" options={SERVICE_GROUPS} required />
          <NumberInput label="Sort order" description="Lower numbers appear first." min={0} max={65535} hideControls allowDecimal={false} {...form.getInputProps('sort_order')} />
          <TextInput label="Icon name" description="Name of the icon used on the card, e.g. truck." maxLength={60} {...form.getInputProps('icon')} />
        </div>
      </FormSection>
      <FormSection title="Search appearance">
        <div className="admin-fields">
          <TextInput label="SEO title" maxLength={255} {...form.getInputProps('seo_title')} />
          <Textarea
            label="SEO description"
            autosize
            minRows={2}
            maxLength={320}
            description={<Counter value={form.values.seo_description} max={320} />}
            {...form.getInputProps('seo_description')}
          />
        </div>
      </FormSection>
    </>
  );
}

export function ServiceForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={servicesApi}
      entity="service"
      listLabel="Services"
      listPath="/admin/services"
      title="New service"
      recordTitle={(service) => service.title}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={ServiceFields}
      Aside={ServiceAside}
      afterCreate={(service) => `/admin/services/${service.id}`}
    />
  );
}
