import { useParams } from 'react-router-dom';
import { NumberInput, TextInput, Textarea } from '@mantine/core';
import { mentorshipProgramsApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { BoolBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormCheck, FormSelect } from '../../components/fields/FormFields';
import { StringListField } from '../../components/fields/Lists';
import { useSlugField } from '../../components/useSlugField';
import { cleanList, toNullableNumber, toNullableString } from '../../lib/helpers';
import { AUDIENCES, TIERS, labelOf } from '../../lib/options';
import { intBetween, listItems, maxLength, required, slug as slugRule } from '../../lib/validators';

export function ProgramsList() {
  const columns = [
    {
      id: 'name',
      header: 'Program',
      primary: true,
      sortKey: 'name',
      cell: (row) => (
        <RowTitle to={`/admin/mentorship-programs/${row.id}`} sub={row.audience ? labelOf(AUDIENCES, row.audience) : ''}>
          {row.name}
        </RowTitle>
      ),
    },
    { id: 'tier', header: 'Tier', sortKey: 'tier', hideBelow: 'md', cell: (row) => labelOf(TIERS, row.tier) },
    { id: 'price', header: 'Price', hideBelow: 'md', cell: (row) => row.price_display || <span className="admin-muted">Not shown</span> },
    { id: 'published', header: 'Visible', sortKey: 'is_published', cell: (row) => <BoolBadge value={row.is_published} yes="Published" no="Hidden" /> },
    { id: 'sort', header: 'Order', sortKey: 'sort_order', hideBelow: 'lg', cell: (row) => row.sort_order },
  ];

  return (
    <ResourceTable
      resource={mentorshipProgramsApi}
      title="Mentorship programs"
      eyebrow="Content"
      description="Programs shown on the Mentorship page."
      columns={columns}
      filters={[{ name: 'tier', label: 'Tier', options: TIERS, allLabel: 'All tiers' }]}
      searchPlaceholder="Search name or summary"
      defaultSort="sort_order"
      entity="program"
      itemName={(row) => row.name}
      createTo="/admin/mentorship-programs/new"
      createLabel="New program"
      editTo={(row) => `/admin/mentorship-programs/${row.id}`}
    />
  );
}

const DEFAULTS = {
  name: '',
  slug: '',
  tier: 'standard',
  audience: 'individuals',
  summary: '',
  price_amount: '',
  price_currency: 'USD',
  price_unit_label: '',
  features: [],
  is_featured: false,
  cta_label: 'Get started',
  is_published: true,
  sort_order: 0,
};

const fromRecord = (program) => ({
  name: program.name ?? '',
  slug: program.slug ?? '',
  tier: program.tier,
  audience: program.audience ?? 'individuals',
  summary: program.summary ?? '',
  price_amount: program.price_amount ?? '',
  price_currency: program.price_currency ?? 'USD',
  price_unit_label: program.price_unit_label ?? '',
  features: program.features ?? [],
  is_featured: Boolean(program.is_featured),
  cta_label: program.cta_label ?? 'Get started',
  is_published: Boolean(program.is_published),
  sort_order: program.sort_order ?? 0,
});

const toPayload = (values) => ({
  name: values.name.trim(),
  slug: toNullableString(values.slug),
  tier: values.tier,
  audience: values.audience,
  summary: values.summary.trim(),
  price_amount: toNullableNumber(values.price_amount),
  price_currency: (values.price_currency || 'USD').trim().toUpperCase(),
  price_unit_label: toNullableString(values.price_unit_label),
  features: cleanList(values.features),
  is_featured: values.is_featured,
  cta_label: (values.cta_label || 'Get started').trim(),
  is_published: values.is_published,
  sort_order: toNullableNumber(values.sort_order) ?? 0,
});

const validate = {
  name: required('a name', 255),
  slug: slugRule,
  summary: required('a summary', 600),
  price_amount: (value) => (value !== '' && Number(value) < 0 ? 'The price cannot be negative.' : null),
  price_currency: (value) => (value && !/^[A-Za-z]{3}$/.test(value) ? 'Use a 3-letter currency code, e.g. USD.' : null),
  price_unit_label: maxLength('the unit label', 60),
  features: listItems('Feature', 255),
  cta_label: required('the button label', 60),
  sort_order: intBetween('Sort order', 0, 65535),
};

function ProgramFields({ form, isEdit }) {
  const slug = useSlugField(form, 'name', isEdit);
  return (
    <>
      <FormSection title="Program">
        <div className="admin-fields">
          <TextInput label="Name" withAsterisk maxLength={255} {...form.getInputProps('name')} onChange={slug.onSourceChange} />
          <TextInput label="URL slug" {...form.getInputProps('slug')} onChange={slug.onSlugChange} />
          <Textarea
            label="Summary"
            withAsterisk
            autosize
            minRows={3}
            maxLength={600}
            description={<Counter value={form.values.summary} max={600} />}
            {...form.getInputProps('summary')}
          />
          <StringListField form={form} name="features" label="What is included" itemName="feature" addLabel="Add feature" max={20} />
        </div>
      </FormSection>

      <FormSection title="Price" description="Leave the amount empty to hide the price on the site.">
        <div className="admin-fields">
          <div className="admin-fields__row">
            <NumberInput label="Amount" min={0} hideControls decimalScale={2} thousandSeparator="," {...form.getInputProps('price_amount')} />
            <TextInput label="Currency" maxLength={3} placeholder="USD" {...form.getInputProps('price_currency')} />
          </div>
          <TextInput label="Unit label" placeholder="per person / month" maxLength={60} {...form.getInputProps('price_unit_label')} />
        </div>
      </FormSection>
    </>
  );
}

function ProgramAside({ form }) {
  return (
    <FormSection title="Placement">
      <div className="admin-fields">
        <FormSelect form={form} name="tier" label="Tier" options={TIERS} required />
        <FormSelect form={form} name="audience" label="Audience" options={AUDIENCES} />
        <TextInput label="Button label" withAsterisk maxLength={60} {...form.getInputProps('cta_label')} />
        <NumberInput label="Sort order" description="Lower numbers appear first." min={0} max={65535} hideControls allowDecimal={false} {...form.getInputProps('sort_order')} />
        <FormCheck form={form} name="is_featured" label="Featured" description="Highlighted on the Mentorship page." />
        <FormCheck form={form} name="is_published" label="Published on the site" />
      </div>
    </FormSection>
  );
}

export function ProgramForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={mentorshipProgramsApi}
      entity="program"
      listLabel="Mentorship programs"
      listPath="/admin/mentorship-programs"
      title="New program"
      recordTitle={(program) => program.name}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={ProgramFields}
      Aside={ProgramAside}
    />
  );
}
