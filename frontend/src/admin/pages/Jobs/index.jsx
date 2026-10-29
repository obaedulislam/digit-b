import { Link, useNavigate, useParams } from 'react-router-dom';
import { NumberInput, TextInput, Textarea } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { formatDate } from '@/lib/format';
import { adminKeys } from '../../api/keys';
import { useAdminMutation } from '../../api/hooks';
import { jobsApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormCheck, FormDateTime, FormMarkdown, FormSelect } from '../../components/fields/FormFields';
import { StringListField } from '../../components/fields/Lists';
import { useSlugField } from '../../components/useSlugField';
import { cleanList, isoToLocalInput, localInputToIso, toNullableNumber, toNullableString } from '../../lib/helpers';
import { EMPLOYMENT_TYPES, JOB_STATUSES, SALARY_PERIODS, WORK_MODES, labelOf } from '../../lib/options';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ─────────────────────────────── list ─────────────────────────────── */

export function JobsList() {
  const navigate = useNavigate();
  const duplicate = useAdminMutation({
    mutationFn: (row) => jobsApi.duplicate(row.id),
    invalidate: [adminKeys.resource('jobs')],
    successMessage: 'Job duplicated as a draft',
    onSuccess: (copy) => navigate(`/admin/jobs/${copy.id}`),
  });

  const columns = [
    {
      id: 'title',
      header: 'Job',
      primary: true,
      sortKey: 'title',
      cell: (row) => (
        <RowTitle to={`/admin/jobs/${row.id}`} sub={[row.reference_code, row.department].filter(Boolean).join(' · ')}>
          {row.title}
        </RowTitle>
      ),
    },
    { id: 'status', header: 'Status', sortKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'type',
      header: 'Type',
      hideBelow: 'md',
      sortKey: 'employment_type',
      cell: (row) => (
        <div className="admin-cell">
          <span>{row.employment_type_label}</span>
          <span className="admin-cell__sub">{row.work_mode_label}</span>
        </div>
      ),
    },
    { id: 'location', header: 'Location', hideBelow: 'lg', sortKey: 'location', cell: (row) => [row.location, row.country].filter(Boolean).join(', ') },
    {
      id: 'applications',
      header: 'Applicants',
      sortKey: 'applications_count',
      hideBelow: 'md',
      cell: (row) =>
        row.applications_count > 0 ? (
          <Link to={`/admin/applications?job=${row.id}`} className="admin-inline-link">
            {row.applications_count}
          </Link>
        ) : (
          0
        ),
    },
    {
      id: 'published_at',
      header: 'Published',
      hideBelow: 'lg',
      sortKey: 'published_at',
      cell: (row) => (row.published_at ? formatDate(row.published_at) : <span className="admin-muted">Not yet</span>),
    },
  ];

  return (
    <ResourceTable
      resource={jobsApi}
      title="Jobs"
      eyebrow="Recruitment"
      description="Create and publish vacancies. Only published jobs appear on the public site."
      columns={columns}
      filters={[{ name: 'status', label: 'Status', options: JOB_STATUSES, allLabel: 'All statuses' }]}
      searchPlaceholder="Search title, reference, location"
      defaultSort="-created_at"
      entity="job"
      createTo="/admin/jobs/new"
      createLabel="New job"
      editTo={(row) => `/admin/jobs/${row.id}`}
      rowActions={(row) => [
        {
          label: `Duplicate ${row.title}`,
          icon: <IconCopy size={16} stroke={1.75} />,
          onClick: () => !duplicate.isPending && duplicate.mutate(row),
          disabled: duplicate.isPending,
        },
      ]}
      deleteMessage={(row) =>
        row ? `“${row.title}” will be removed from the site. ${row.applications_count ? 'Its applications stay in the Applications list.' : ''}` : ''
      }
    />
  );
}

/* ─────────────────────────────── form ─────────────────────────────── */

const DEFAULTS = {
  title: '',
  slug: '',
  reference_code: '',
  department: '',
  employment_type: 'full_time',
  work_mode: 'onsite',
  location: '',
  country: '',
  salary_min: '',
  salary_max: '',
  salary_currency: 'USD',
  salary_period: 'year',
  show_salary: true,
  experience_min: '',
  experience_max: '',
  status: 'draft',
  published_at: '',
  closes_at: '',
  is_featured: false,
  summary: '',
  description_markdown: '',
  responsibilities: [],
  requirements: [],
  nice_to_have: [],
  benefits: [],
  seo_title: '',
  seo_description: '',
};

const fromRecord = (job) => ({
  ...DEFAULTS,
  title: job.title ?? '',
  slug: job.slug ?? '',
  reference_code: job.reference_code ?? '',
  department: job.department ?? '',
  employment_type: job.employment_type,
  work_mode: job.work_mode,
  location: job.location ?? '',
  country: job.country ?? '',
  salary_min: job.salary_min ?? '',
  salary_max: job.salary_max ?? '',
  salary_currency: job.salary_currency ?? 'USD',
  salary_period: job.salary_period ?? 'year',
  show_salary: Boolean(job.show_salary),
  experience_min: job.experience_min ?? '',
  experience_max: job.experience_max ?? '',
  status: job.status,
  published_at: isoToLocalInput(job.published_at),
  closes_at: isoToLocalInput(job.closes_at),
  is_featured: Boolean(job.is_featured),
  summary: job.summary ?? '',
  description_markdown: job.description_markdown ?? '',
  responsibilities: job.responsibilities ?? [],
  requirements: job.requirements ?? [],
  nice_to_have: job.nice_to_have ?? [],
  benefits: job.benefits ?? [],
  seo_title: job.seo_title ?? '',
  seo_description: job.seo_description ?? '',
});

const jobToPayload = (values) => ({
  title: values.title.trim(),
  slug: toNullableString(values.slug),
  reference_code: toNullableString(values.reference_code),
  department: toNullableString(values.department),
  employment_type: values.employment_type,
  work_mode: values.work_mode,
  location: values.location.trim(),
  country: toNullableString(values.country),
  salary_min: toNullableNumber(values.salary_min),
  salary_max: toNullableNumber(values.salary_max),
  salary_currency: (values.salary_currency || 'USD').trim().toUpperCase(),
  salary_period: values.salary_period,
  show_salary: values.show_salary,
  experience_min: toNullableNumber(values.experience_min),
  experience_max: toNullableNumber(values.experience_max),
  status: values.status,
  published_at: localInputToIso(values.published_at),
  closes_at: localInputToIso(values.closes_at),
  is_featured: values.is_featured,
  summary: values.summary.trim(),
  description_markdown: values.description_markdown,
  responsibilities: cleanList(values.responsibilities),
  requirements: cleanList(values.requirements),
  nice_to_have: cleanList(values.nice_to_have),
  benefits: cleanList(values.benefits),
  seo_title: toNullableString(values.seo_title),
  seo_description: toNullableString(values.seo_description),
});

const listLength = (label) => (items) => {
  const tooLong = items.findIndex((item) => String(item).length > 500);
  return tooLong >= 0 ? `${label} #${tooLong + 1} is longer than 500 characters.` : null;
};

const validate = {
  title: (value) => (!value.trim() ? 'Enter a job title.' : value.length > 255 ? 'Keep the title under 255 characters.' : null),
  slug: (value) => (value && !SLUG_PATTERN.test(value) ? 'Use lowercase letters, numbers and single hyphens.' : null),
  reference_code: (value) => (value.length > 40 ? 'Keep the reference under 40 characters.' : null),
  location: (value) => (!value.trim() ? 'Enter where the job is based.' : null),
  summary: (value) => (!value.trim() ? 'Write a short summary.' : value.length > 500 ? 'Keep the summary under 500 characters.' : null),
  description_markdown: (value) => (!value.trim() ? 'Describe the role.' : null),
  salary_currency: (value) => (value && !/^[A-Za-z]{3}$/.test(value) ? 'Use a 3-letter currency code, e.g. USD.' : null),
  salary_max: (value, values) =>
    value !== '' && values.salary_min !== '' && Number(value) < Number(values.salary_min) ? 'Maximum must be at least the minimum.' : null,
  experience_max: (value, values) =>
    value !== '' && values.experience_min !== '' && Number(value) < Number(values.experience_min) ? 'Maximum must be at least the minimum.' : null,
  responsibilities: listLength('Responsibility'),
  requirements: listLength('Requirement'),
  nice_to_have: listLength('Nice to have'),
  benefits: listLength('Benefit'),
  seo_description: (value) => (value.length > 320 ? 'Keep the description under 320 characters.' : null),
};

function JobFields({ form, isEdit }) {
  const slug = useSlugField(form, 'title', isEdit);
  return (
    <>
      <FormSection title="Basics">
        <div className="admin-fields">
          <TextInput label="Job title" withAsterisk maxLength={255} {...form.getInputProps('title')} onChange={slug.onSourceChange} />
          <TextInput
            label="URL slug"
            description="Used in the public address: /vacancies/your-slug"
            {...form.getInputProps('slug')}
            onChange={slug.onSlugChange}
          />
          <div className="admin-fields__row">
            <TextInput label="Reference code" placeholder="e.g. DB-1042" maxLength={40} {...form.getInputProps('reference_code')} />
            <TextInput label="Department" maxLength={80} {...form.getInputProps('department')} />
          </div>
          <Textarea
            label="Summary"
            withAsterisk
            autosize
            minRows={2}
            maxLength={500}
            description={<Counter value={form.values.summary} max={500} />}
            {...form.getInputProps('summary')}
          />
        </div>
      </FormSection>

      <FormSection title="Description">
        <FormMarkdown form={form} name="description_markdown" label="Role description" required description="Markdown supported. The preview matches the public page." />
      </FormSection>

      <FormSection title="Details" description="Shown as bullet lists on the job page. Empty rows are ignored.">
        <div className="admin-fields">
          <StringListField form={form} name="responsibilities" label="Responsibilities" itemName="responsibility" addLabel="Add responsibility" />
          <StringListField form={form} name="requirements" label="Requirements" itemName="requirement" addLabel="Add requirement" />
          <StringListField form={form} name="nice_to_have" label="Nice to have" itemName="item" addLabel="Add item" />
          <StringListField form={form} name="benefits" label="Benefits" itemName="benefit" addLabel="Add benefit" />
        </div>
      </FormSection>
    </>
  );
}

function JobAside({ form }) {
  return (
    <>
      <FormSection title="Publishing">
        <div className="admin-fields">
          <FormSelect form={form} name="status" label="Status" options={JOB_STATUSES} description={`Currently: ${labelOf(JOB_STATUSES, form.values.status)}`} />
          <FormDateTime form={form} name="published_at" label="Publish date" description="Leave empty to publish now when the status is Published." />
          <FormDateTime form={form} name="closes_at" label="Closing date" description="After this date the job disappears from the site." />
          <FormCheck form={form} name="is_featured" label="Featured on the home page" />
        </div>
      </FormSection>

      <FormSection title="Type & location">
        <div className="admin-fields">
          <FormSelect form={form} name="employment_type" label="Employment type" options={EMPLOYMENT_TYPES} required />
          <FormSelect form={form} name="work_mode" label="Work mode" options={WORK_MODES} required />
          <TextInput label="Location" withAsterisk maxLength={120} {...form.getInputProps('location')} />
          <TextInput label="Country" maxLength={80} {...form.getInputProps('country')} />
        </div>
      </FormSection>

      <FormSection title="Salary">
        <div className="admin-fields">
          <div className="admin-fields__row">
            <NumberInput label="Minimum" min={0} hideControls allowDecimal={false} thousandSeparator="," {...form.getInputProps('salary_min')} />
            <NumberInput label="Maximum" min={0} hideControls allowDecimal={false} thousandSeparator="," {...form.getInputProps('salary_max')} />
          </div>
          <div className="admin-fields__row">
            <TextInput label="Currency" maxLength={3} placeholder="USD" {...form.getInputProps('salary_currency')} />
            <FormSelect form={form} name="salary_period" label="Period" options={SALARY_PERIODS} />
          </div>
          <FormCheck form={form} name="show_salary" label="Show salary publicly" description="When off, the range is stored but hidden." />
        </div>
      </FormSection>

      <FormSection title="Experience">
        <div className="admin-fields admin-fields__row">
          <NumberInput label="Minimum years" min={0} max={60} hideControls allowDecimal={false} {...form.getInputProps('experience_min')} />
          <NumberInput label="Maximum years" min={0} max={60} hideControls allowDecimal={false} {...form.getInputProps('experience_max')} />
        </div>
      </FormSection>

      <FormSection title="Search appearance" description="Optional. Overrides the page title and description in search results.">
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

export function JobForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={jobsApi}
      entity="job"
      listLabel="Jobs"
      listPath="/admin/jobs"
      title="New job"
      recordTitle={(job) => job.title}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={jobToPayload}
      validate={validate}
      Fields={JobFields}
      Aside={JobAside}
      afterCreate={(job) => `/admin/jobs/${job.id}`}
    />
  );
}
