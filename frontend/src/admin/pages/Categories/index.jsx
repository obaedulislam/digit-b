import { useParams } from 'react-router-dom';
import { TextInput } from '@mantine/core';
import { postCategoriesApi } from '../../api/resources';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { FormSection } from '../../components/fields/Inputs';
import { FormSelect } from '../../components/fields/FormFields';
import { useSlugField } from '../../components/useSlugField';
import { toNullableString } from '../../lib/helpers';
import { POST_TYPES, labelOf } from '../../lib/options';
import { required, slug as slugRule } from '../../lib/validators';

export function CategoriesList() {
  const columns = [
    {
      id: 'name',
      header: 'Category',
      primary: true,
      sortKey: 'name',
      cell: (row) => (
        <RowTitle to={`/admin/post-categories/${row.id}`} sub={row.slug}>
          {row.name}
        </RowTitle>
      ),
    },
    { id: 'type', header: 'Section', sortKey: 'type', hideBelow: 'md', cell: (row) => (row.type ? labelOf(POST_TYPES, row.type) : 'Articles and blog') },
    { id: 'posts', header: 'Posts', sortKey: 'posts_count', cell: (row) => row.posts_count ?? 0 },
  ];

  return (
    <ResourceTable
      resource={postCategoriesApi}
      title="Categories"
      eyebrow="Content"
      description="Group posts by topic."
      columns={columns}
      filters={[{ name: 'type', label: 'Section', options: POST_TYPES, allLabel: 'All sections' }]}
      searchPlaceholder="Search categories"
      defaultSort="name"
      entity="category"
      createTo="/admin/post-categories/new"
      createLabel="New category"
      editTo={(row) => `/admin/post-categories/${row.id}`}
      deleteMessage={(row) => (row ? `“${row.name}” will be deleted.${row.posts_count ? ` ${row.posts_count} post(s) will become uncategorised.` : ''}` : '')}
    />
  );
}

const DEFAULTS = { name: '', slug: '', type: '' };
const fromRecord = (category) => ({ name: category.name ?? '', slug: category.slug ?? '', type: category.type ?? '' });
const toPayload = (values) => ({ name: values.name.trim(), slug: toNullableString(values.slug), type: toNullableString(values.type) });
const validate = { name: required('a name', 255), slug: slugRule };

function CategoryFields({ form, isEdit }) {
  const slug = useSlugField(form, 'name', isEdit);
  return (
    <FormSection title="Category">
      <div className="admin-fields">
        <TextInput label="Name" withAsterisk maxLength={255} {...form.getInputProps('name')} onChange={slug.onSourceChange} />
        <TextInput label="URL slug" {...form.getInputProps('slug')} onChange={slug.onSlugChange} />
        <FormSelect
          form={form}
          name="type"
          label="Section"
          options={POST_TYPES}
          placeholder="Both articles and blog"
          description="Limit the category to one section, or leave it for both."
        />
      </div>
    </FormSection>
  );
}

export function CategoryForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={postCategoriesApi}
      entity="category"
      listLabel="Categories"
      listPath="/admin/post-categories"
      title="New category"
      recordTitle={(category) => category.name}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={CategoryFields}
    />
  );
}
