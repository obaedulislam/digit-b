import { Checkbox } from '@mantine/core';
import { getIn } from '../../lib/helpers';
import { DateTimeField, SelectField } from './Inputs';
import { ImageUploadField } from './ImageUploadField';
import { MarkdownEditor } from './MarkdownEditor';

/** Thin adapters that bind the custom controls to a Mantine form by field name. */

export const FormMarkdown = ({ form, name, ...rest }) => (
  <MarkdownEditor
    value={getIn(form.values, name) ?? ''}
    onChange={(value) => form.setFieldValue(name, value)}
    error={form.errors[name]}
    {...rest}
  />
);

export const FormImage = ({ form, name, altName, ...rest }) => (
  <ImageUploadField
    value={getIn(form.values, name) ?? ''}
    onChange={(value) => form.setFieldValue(name, value)}
    error={form.errors[name]}
    alt={altName ? getIn(form.values, altName) : undefined}
    onAltChange={altName ? (value) => form.setFieldValue(altName, value) : undefined}
    altError={altName ? form.errors[altName] : undefined}
    {...rest}
  />
);

export const FormDateTime = ({ form, name, ...rest }) => (
  <DateTimeField
    value={getIn(form.values, name) ?? ''}
    onChange={(event) => form.setFieldValue(name, event.target.value)}
    error={form.errors[name]}
    {...rest}
  />
);

export const FormSelect = ({ form, name, ...rest }) => <SelectField {...form.getInputProps(name)} {...rest} />;

export const FormCheck = ({ form, name, label, description }) => (
  <Checkbox label={label} description={description} {...form.getInputProps(name, { type: 'checkbox' })} />
);
