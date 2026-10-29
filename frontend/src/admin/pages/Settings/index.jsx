import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Button, ErrorState, TextSkeleton } from '@/components/ui';
import { adminKeys } from '../../api/keys';
import { useAdminMutation } from '../../api/hooks';
import { settingsApi } from '../../api/resources';
import { AdminPage } from '../../components/AdminPage';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormImage } from '../../components/fields/FormFields';
import { ObjectListField, StringListField } from '../../components/fields/Lists';
import { UnsavedChangesModal } from '../../components/UnsavedChangesModal';
import { useUnsavedGuard } from '../../components/useUnsavedGuard';
import { cleanList, cleanRows, toNullableString } from '../../lib/helpers';
import { focusFirstInvalid, groupsWithErrors } from '../../lib/formErrors';
import { notifyError } from '../../lib/notify';
import { listItems, maxLength, required, rowsComplete } from '../../lib/validators';

const TABS = [
  { value: 'company', label: 'Company' },
  { value: 'contact', label: 'Contact' },
  { value: 'social', label: 'Social' },
  { value: 'stats', label: 'Stats' },
  { value: 'seo', label: 'SEO' },
];

const URL_PATTERN = /^https?:\/\/\S+$/i;
const optionalUrl = (label) => (value) => (value && !URL_PATTERN.test(value.trim()) ? `${label} must start with http:// or https://` : null);

const toForm = (settings) => ({
  company: {
    name: settings.company?.name ?? '',
    tagline: settings.company?.tagline ?? '',
    description: settings.company?.description ?? '',
  },
  contact: {
    email: settings.contact?.email ?? '',
    phone: settings.contact?.phone ?? '',
    address_lines: settings.contact?.address_lines ?? [],
    hours: (settings.contact?.hours ?? []).map((row) => ({ days: row.days ?? '', time: row.time ?? '' })),
    map_url: settings.contact?.map_url ?? '',
  },
  social: {
    linkedin: settings.social?.linkedin ?? '',
    facebook: settings.social?.facebook ?? '',
    x: settings.social?.x ?? '',
    instagram: settings.social?.instagram ?? '',
  },
  stats: (settings.stats ?? []).map((row) => ({ value: row.value ?? '', label: row.label ?? '' })),
  seo: {
    site_title: settings.seo?.site_title ?? '',
    default_description: settings.seo?.default_description ?? '',
    og_image: settings.seo?.og_image ?? '',
  },
});

// The API accepts only these keys per group (anything else is rejected), so build the payload explicitly.
const toPayload = (values) => ({
  company: {
    name: values.company.name.trim(),
    tagline: toNullableString(values.company.tagline),
    description: toNullableString(values.company.description),
  },
  contact: {
    email: values.contact.email.trim(),
    phone: toNullableString(values.contact.phone),
    address_lines: cleanList(values.contact.address_lines),
    hours: cleanRows(values.contact.hours, ['days', 'time']),
    map_url: toNullableString(values.contact.map_url),
  },
  social: {
    linkedin: toNullableString(values.social.linkedin),
    facebook: toNullableString(values.social.facebook),
    x: toNullableString(values.social.x),
    instagram: toNullableString(values.social.instagram),
  },
  stats: cleanRows(values.stats, ['value', 'label']),
  seo: {
    site_title: toNullableString(values.seo.site_title),
    default_description: toNullableString(values.seo.default_description),
    og_image: toNullableString(values.seo.og_image),
  },
});

const validate = {
  company: {
    name: required('the company name', 120),
    tagline: maxLength('the tagline', 255),
    description: maxLength('the description', 1000),
  },
  contact: {
    email: (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : 'Enter a valid contact email.'),
    phone: maxLength('the phone number', 40),
    address_lines: listItems('Address line', 255),
    hours: rowsComplete('Opening hours row', ['days', 'time']),
    map_url: optionalUrl('The map link'),
  },
  social: {
    linkedin: optionalUrl('The LinkedIn link'),
    facebook: optionalUrl('The Facebook link'),
    x: optionalUrl('The X link'),
    instagram: optionalUrl('The Instagram link'),
  },
  stats: rowsComplete('Stat', ['value', 'label']),
  seo: {
    site_title: maxLength('the site title', 120),
    default_description: maxLength('the description', 320),
  },
};

export default function Settings() {
  const query = useQuery({ queryKey: adminKeys.settings, queryFn: settingsApi.get, gcTime: 0, staleTime: 0 });

  return (
    <AdminPage
      title="Settings"
      eyebrow="System"
      description="Company details, contact information and defaults. These are shown across the public site."
      crumbs={[{ label: 'Settings' }]}
    >
      {query.isPending && <TextSkeleton lines={8} />}
      {query.isError && <ErrorState onRetry={() => query.refetch()} />}
      {query.data && <SettingsForm settings={query.data} />}
    </AdminPage>
  );
}

function SettingsForm({ settings }) {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const initial = toForm(settings);
  const form = useForm({ initialValues: initial, validate });
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(form.values) !== baseline;
  const guard = useUnsavedGuard(dirty);

  const tab = TABS.some((item) => item.value === params.get('tab')) ? params.get('tab') : 'company';
  const setTab = (value) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  const errorGroups = groupsWithErrors(form.errors);

  const save = useAdminMutation({
    mutationFn: (values) => settingsApi.update(toPayload(values)),
    invalidate: [adminKeys.settings],
    successMessage: 'Settings saved. The public site now uses them.',
    form,
    onSuccess: (_, values) => {
      setBaseline(JSON.stringify(values));
      // The public site caches settings for 30 minutes: refresh them right away.
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (mapped) => {
      const first = Object.keys(mapped.fieldErrors ?? {})[0]?.split('.')[0];
      if (first && TABS.some((item) => item.value === first)) setTab(first);
    },
  });

  const onInvalid = (errors) => {
    const first = Object.keys(errors)[0]?.split('.')[0];
    if (first && TABS.some((item) => item.value === first)) setTab(first);
    notifyError('Please fix the highlighted fields.', 'Check the form');
    focusFirstInvalid();
  };

  return (
    <form className="admin-form" onSubmit={form.onSubmit((values) => !save.isPending && save.mutate(values), onInvalid)} noValidate>
      <Tabs value={tab} onChange={setTab} keepMounted>
        <Tabs.List aria-label="Settings groups">
          {TABS.map((item) => (
            <Tabs.Tab key={item.value} value={item.value}>
              {item.label}
              {errorGroups[item.value] && (
                <>
                  <span className="admin-tab-flag" aria-hidden="true" />
                  <span className="sr-only"> (has errors)</span>
                </>
              )}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="company">
          <FormSection title="Company" description="Used in the header, footer and page titles.">
            <div className="admin-fields">
              <TextInput label="Company name" withAsterisk maxLength={120} {...form.getInputProps('company.name')} />
              <TextInput label="Tagline" maxLength={255} {...form.getInputProps('company.tagline')} />
              <Textarea
                label="Short description"
                autosize
                minRows={3}
                maxLength={1000}
                description={<Counter value={form.values.company.description} max={1000} />}
                {...form.getInputProps('company.description')}
              />
            </div>
          </FormSection>
        </Tabs.Panel>

        <Tabs.Panel value="contact">
          <FormSection title="Contact details" description="The single source for every phone, email and address on the site.">
            <div className="admin-fields">
              <div className="admin-fields__row">
                <TextInput label="Email" type="email" withAsterisk maxLength={255} {...form.getInputProps('contact.email')} />
                <TextInput label="Phone" type="tel" maxLength={40} {...form.getInputProps('contact.phone')} />
              </div>
              <StringListField form={form} name="contact.address_lines" label="Address lines" itemName="line" addLabel="Add address line" max={6} />
              <ObjectListField
                form={form}
                name="contact.hours"
                label="Opening hours"
                itemName="row"
                addLabel="Add hours"
                max={10}
                columns={[
                  { name: 'days', label: 'Days', placeholder: 'Mon–Fri' },
                  { name: 'time', label: 'Hours', placeholder: '09:00 – 17:00 or Closed' },
                ]}
              />
              <TextInput label="Map link" placeholder="https://maps.google.com/…" maxLength={500} {...form.getInputProps('contact.map_url')} />
            </div>
          </FormSection>
        </Tabs.Panel>

        <Tabs.Panel value="social">
          <FormSection title="Social profiles" description="Full links. Empty ones are not shown.">
            <div className="admin-fields">
              <TextInput label="LinkedIn" placeholder="https://www.linkedin.com/company/…" maxLength={255} {...form.getInputProps('social.linkedin')} />
              <TextInput label="Facebook" placeholder="https://www.facebook.com/…" maxLength={255} {...form.getInputProps('social.facebook')} />
              <TextInput label="X (Twitter)" placeholder="https://x.com/…" maxLength={255} {...form.getInputProps('social.x')} />
              <TextInput label="Instagram" placeholder="https://www.instagram.com/…" maxLength={255} {...form.getInputProps('social.instagram')} />
            </div>
          </FormSection>
        </Tabs.Panel>

        <Tabs.Panel value="stats">
          <FormSection title="Headline numbers" description="Shown on the home and about pages, e.g. “10+” and “Years in retail supply chain tech”. Up to 8.">
            <ObjectListField
              form={form}
              name="stats"
              label="Stats"
              itemName="stat"
              addLabel="Add stat"
              max={8}
              columns={[
                { name: 'value', label: 'Value', placeholder: '10+' },
                { name: 'label', label: 'Label', placeholder: 'Years in retail supply chain tech' },
              ]}
            />
          </FormSection>
        </Tabs.Panel>

        <Tabs.Panel value="seo">
          <FormSection title="Search defaults" description="Used when a page has no title or description of its own.">
            <div className="admin-fields">
              <TextInput label="Default site title" maxLength={120} {...form.getInputProps('seo.site_title')} />
              <Textarea
                label="Default description"
                autosize
                minRows={2}
                maxLength={320}
                description={<Counter value={form.values.seo.default_description} max={320} />}
                {...form.getInputProps('seo.default_description')}
              />
              <FormImage form={form} name="seo.og_image" label="Social sharing image" hint="Shown when a page is shared on social networks. 1200 × 630 works best." />
            </div>
          </FormSection>
        </Tabs.Panel>
      </Tabs>

      <div className="admin-form__bar" role="group" aria-label="Form actions">
        <p className={`admin-form__dirty${dirty ? ' is-dirty' : ''}`} role="status" aria-live="polite">
          <span className="admin-form__dot" aria-hidden="true" />
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </p>
        <div className="admin-form__bar-actions">
          <Button variant="ghost" size="sm" onClick={() => {
              form.setValues(initial);
              form.clearErrors();
            }} disabled={!dirty || save.isPending}>
            Discard
          </Button>
          <Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>
            Save settings
          </Button>
        </div>
      </div>
      <UnsavedChangesModal guard={guard} />
    </form>
  );
}
