import { useParams } from 'react-router-dom';
import { TextInput, Textarea } from '@mantine/core';
import { formatDate } from '@/lib/format';
import { postCategoriesApi, postsApi } from '../../api/resources';
import { useOptionsList } from '../../api/hooks';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Counter, FormSection } from '../../components/fields/Inputs';
import { FormDateTime, FormImage, FormMarkdown, FormSelect } from '../../components/fields/FormFields';
import { useSlugField } from '../../components/useSlugField';
import { isoToLocalInput, localInputToIso, toNullableNumber, toNullableString } from '../../lib/helpers';
import { CONTENT_STATUSES, POST_TYPES, labelOf } from '../../lib/options';
import { maxLength, required, slug as slugRule } from '../../lib/validators';

export function PostsList() {
  const columns = [
    {
      id: 'title',
      header: 'Post',
      primary: true,
      sortKey: 'title',
      cell: (row) => (
        <RowTitle to={`/admin/posts/${row.id}`} sub={row.category?.name}>
          {row.title}
        </RowTitle>
      ),
    },
    { id: 'type', header: 'Type', sortKey: 'type', hideBelow: 'md', cell: (row) => labelOf(POST_TYPES, row.type) },
    { id: 'status', header: 'Status', sortKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { id: 'author', header: 'Author', hideBelow: 'lg', cell: (row) => row.author_name },
    {
      id: 'published_at',
      header: 'Published',
      sortKey: 'published_at',
      hideBelow: 'md',
      cell: (row) => (row.published_at ? formatDate(row.published_at) : <span className="admin-muted">Not yet</span>),
    },
  ];

  return (
    <ResourceTable
      resource={postsApi}
      title="Posts"
      eyebrow="Content"
      description="Articles and blog posts shown on the public site."
      columns={columns}
      filters={[
        { name: 'type', label: 'Type', options: POST_TYPES, allLabel: 'All types' },
        { name: 'status', label: 'Status', options: CONTENT_STATUSES, allLabel: 'All statuses' },
      ]}
      searchPlaceholder="Search title or excerpt"
      defaultSort="-created_at"
      entity="post"
      createTo="/admin/posts/new"
      createLabel="New post"
      editTo={(row) => `/admin/posts/${row.id}`}
    />
  );
}

const DEFAULTS = {
  type: 'article',
  title: '',
  slug: '',
  excerpt: '',
  cover_image: '',
  cover_image_alt: '',
  body_markdown: '',
  post_category_id: '',
  author_name: '',
  status: 'draft',
  published_at: '',
  seo_title: '',
  seo_description: '',
};

const fromRecord = (post) => ({
  ...DEFAULTS,
  type: post.type,
  title: post.title ?? '',
  slug: post.slug ?? '',
  excerpt: post.excerpt ?? '',
  cover_image: post.cover_image ?? '',
  cover_image_alt: post.cover_image_alt ?? '',
  body_markdown: post.body_markdown ?? '',
  post_category_id: post.post_category_id ? String(post.post_category_id) : '',
  author_name: post.author_name ?? '',
  status: post.status,
  published_at: isoToLocalInput(post.published_at),
  seo_title: post.seo_title ?? '',
  seo_description: post.seo_description ?? '',
});

const toPayload = (values) => ({
  type: values.type,
  title: values.title.trim(),
  slug: toNullableString(values.slug),
  excerpt: values.excerpt.trim(),
  cover_image: toNullableString(values.cover_image),
  cover_image_alt: toNullableString(values.cover_image_alt),
  body_markdown: values.body_markdown,
  post_category_id: toNullableNumber(values.post_category_id),
  author_name: toNullableString(values.author_name),
  status: values.status,
  published_at: localInputToIso(values.published_at),
  seo_title: toNullableString(values.seo_title),
  seo_description: toNullableString(values.seo_description),
});

const validate = {
  title: required('a title', 255),
  slug: slugRule,
  excerpt: required('an excerpt', 600),
  body_markdown: required('the post body'),
  cover_image_alt: maxLength('the alt text', 255),
  author_name: maxLength('the author name', 255),
  seo_title: maxLength('the SEO title', 255),
  seo_description: maxLength('the SEO description', 320),
};

function PostFields({ form, isEdit }) {
  const slug = useSlugField(form, 'title', isEdit);
  return (
    <>
      <FormSection title="Basics">
        <div className="admin-fields">
          <TextInput label="Title" withAsterisk maxLength={255} {...form.getInputProps('title')} onChange={slug.onSourceChange} />
          <TextInput label="URL slug" description="Used in the public address of the post." {...form.getInputProps('slug')} onChange={slug.onSlugChange} />
          <Textarea
            label="Excerpt"
            withAsterisk
            autosize
            minRows={2}
            maxLength={600}
            description={<Counter value={form.values.excerpt} max={600} />}
            {...form.getInputProps('excerpt')}
          />
        </div>
      </FormSection>

      <FormSection title="Cover image" description="Shown on cards and at the top of the post. Without one, a generated graphic is used.">
        <FormImage form={form} name="cover_image" altName="cover_image_alt" label="Cover image" />
      </FormSection>

      <FormSection title="Body">
        <FormMarkdown form={form} name="body_markdown" label="Post body" required minRows={20} description="Markdown supported. The preview matches the public page." />
      </FormSection>
    </>
  );
}

function PostAside({ form }) {
  const categories = useOptionsList(postCategoriesApi, { per_page: 50, sort: 'name' });
  const options = (categories.data ?? [])
    .filter((category) => !category.type || category.type === form.values.type)
    .map((category) => ({ value: String(category.id), label: category.name }));

  return (
    <>
      <FormSection title="Publishing">
        <div className="admin-fields">
          <FormSelect form={form} name="status" label="Status" options={CONTENT_STATUSES} />
          <FormDateTime form={form} name="published_at" label="Publish date" description="Leave empty to use the moment you publish." />
          <FormSelect form={form} name="type" label="Section" options={POST_TYPES} required description="Articles and blog posts live in separate sections." />
          <FormSelect form={form} name="post_category_id" label="Category" options={options} placeholder="No category" />
          <TextInput label="Author name" description="Defaults to your name when empty." maxLength={255} {...form.getInputProps('author_name')} />
        </div>
      </FormSection>

      <FormSection title="Search appearance" description="Optional. Overrides the title and description in search results.">
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

export function PostForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={postsApi}
      entity="post"
      listLabel="Posts"
      listPath="/admin/posts"
      title="New post"
      recordTitle={(post) => post.title}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validate}
      Fields={PostFields}
      Aside={PostAside}
      afterCreate={(post) => `/admin/posts/${post.id}`}
    />
  );
}
