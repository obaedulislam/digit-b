import { Link } from 'react-router-dom';
import { Checkbox, FileInput, Select, Textarea, TextInput } from '@mantine/core';
import { Badge } from '@/components/ui/Layout';
import { FormAlert, Honeypot } from '@/components/ui/FormAlert';
import { TagInput } from '@/components/ui/TagInput';
import { formatDate } from '@/lib/format';
import { WorkStatusCards } from './WorkStatusCards';
import { EDUCATION_OPTIONS, RESUME_ACCEPT, WORK_STATUS_OPTIONS, formatBytes, normalizeUrl, todayISO, validateResume } from './schema';

export function BasicStep({ form }) {
  return (
    <div className="form-grid">
      <TextInput label="First name" withAsterisk autoComplete="given-name" {...form.getInputProps('first_name')} />
      <TextInput label="Last name" withAsterisk autoComplete="family-name" {...form.getInputProps('last_name')} />
      <TextInput label="Email" type="email" withAsterisk autoComplete="email" placeholder="you@example.com" {...form.getInputProps('email')} />
      <TextInput label="Phone" type="tel" withAsterisk autoComplete="tel" placeholder="+1 555 010 2030" {...form.getInputProps('phone')} />
      <TextInput label="Where are you based?" withAsterisk autoComplete="address-level2" placeholder="City, country" {...form.getInputProps('location')} />
      <TextInput
        label="LinkedIn profile (optional)"
        inputMode="url"
        autoComplete="url"
        placeholder="linkedin.com/in/yourname"
        {...form.getInputProps('linkedin_url')}
      />
    </div>
  );
}

export function QualificationStep({ form }) {
  return (
    <div className="form-grid">
      <TextInput label="Current job title" withAsterisk autoComplete="organization-title" {...form.getInputProps('current_title')} />
      <TextInput label="Current company (optional)" autoComplete="organization" {...form.getInputProps('current_company')} />
      <TextInput label="Years of experience" withAsterisk inputMode="numeric" placeholder="e.g. 5" {...form.getInputProps('years_experience')} />
      <Select
        label="Highest education"
        withAsterisk
        placeholder="Select one"
        data={EDUCATION_OPTIONS}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
        {...form.getInputProps('highest_education')}
      />
      <div className="form-grid__full">
        <TagInput
          label="Key skills"
          description="Type a skill and press Enter or comma. Up to 15."
          placeholder="e.g. WMS, SQL, Java"
          value={form.values.skills}
          onChange={(skills) => form.setFieldValue('skills', skills)}
          error={form.errors.skills}
        />
      </div>
      <TextInput
        label="Expected annual salary (optional)"
        inputMode="numeric"
        placeholder="Whole number, local currency"
        {...form.getInputProps('expected_salary')}
      />
      <div className="form-grid__full">
        <Textarea
          label="Cover letter"
          description={`Optional. Tell us what you are looking for. ${form.values.cover_letter.length}/4000`}
          autosize
          minRows={5}
          maxRows={12}
          {...form.getInputProps('cover_letter')}
        />
      </div>
    </div>
  );
}

export function WorkStep({ form }) {
  const setResume = (file) => {
    form.setFieldValue('resume', file);
    form.setFieldError('resume', file ? validateResume(file) : null);
  };
  return (
    <div className="apply-fields">
      <WorkStatusCards value={form.values.work_status} onChange={(value) => form.setFieldValue('work_status', value)} error={form.errors.work_status} />
      <div className="form-grid">
        <TextInput
          label="Available from (optional)"
          type="date"
          min={todayISO()}
          autoComplete="off"
          {...form.getInputProps('available_from')}
        />
      </div>
      <FileInput
        label="CV / résumé"
        withAsterisk
        description="PDF, DOC or DOCX, up to 5 MB. Stored privately; only our recruiters can open it."
        placeholder="Choose a file"
        accept={RESUME_ACCEPT}
        clearable
        value={form.values.resume}
        onChange={setResume}
        error={form.errors.resume}
      />
    </div>
  );
}

const WORK_LABEL = Object.fromEntries(WORK_STATUS_OPTIONS.map((o) => [o.value, o.label]));
const EDUCATION_LABEL = Object.fromEntries(EDUCATION_OPTIONS.map((o) => [o.value, o.label]));

function Summary({ title, onEdit, rows }) {
  return (
    <section className="review__group">
      <header className="review__head">
        <h3 className="review__title">{title}</h3>
        <button type="button" className="link-button review__edit" onClick={onEdit}>
          Edit<span className="sr-only"> {title}</span>
        </button>
      </header>
      <dl className="review__list">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="review__row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

export function ReviewStep({ form, job, goTo, error }) {
  const v = form.values;
  return (
    <div className="apply-fields">
      {job && (
        <p className="review__role">
          Applying for <strong>{job.title}</strong>
          {job.reference_code ? <Badge tone="soft">Ref {job.reference_code}</Badge> : null}
        </p>
      )}
      <Summary
        title="Basic information"
        onEdit={() => goTo(0)}
        rows={[
          ['Name', `${v.first_name} ${v.last_name}`.trim()],
          ['Email', v.email],
          ['Phone', v.phone],
          ['Location', v.location],
          ['LinkedIn', normalizeUrl(v.linkedin_url)],
        ]}
      />
      <Summary
        title="Qualification"
        onEdit={() => goTo(1)}
        rows={[
          ['Current role', [v.current_title, v.current_company].filter(Boolean).join(' at ')],
          ['Experience', v.years_experience !== '' ? `${v.years_experience} years` : ''],
          ['Education', EDUCATION_LABEL[v.highest_education]],
          ['Skills', v.skills.join(', ')],
          ['Expected salary', v.expected_salary],
          ['Cover letter', v.cover_letter ? `${v.cover_letter.slice(0, 140)}${v.cover_letter.length > 140 ? '…' : ''}` : ''],
        ]}
      />
      <Summary
        title="Work status"
        onEdit={() => goTo(2)}
        rows={[
          ['Preference', WORK_LABEL[v.work_status]],
          ['Available from', v.available_from ? formatDate(v.available_from) : 'Immediately'],
          ['CV / résumé', v.resume ? `${v.resume.name} (${formatBytes(v.resume.size)})` : ''],
        ]}
      />

      <Checkbox
        label={
          <>
            I have read the{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              privacy policy
            </Link>{' '}
            and agree that DIGIT-B may store my details and CV to consider me for roles.
          </>
        }
        checked={v.consent}
        {...form.getInputProps('consent', { type: 'checkbox' })}
      />
      <Honeypot {...form.getInputProps('website')} />
      {error && <FormAlert>{error}</FormAlert>}
    </div>
  );
}
