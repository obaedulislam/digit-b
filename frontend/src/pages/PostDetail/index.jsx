import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container, ErrorState, Markdown, Reveal, Section, Seo, TextSkeleton } from '@/components/ui';
import { CoverImage } from '@/components/ui/CoverImage';
import { ShareLinks } from '@/components/ui/ShareLinks';
import NotFound from '@/pages/NotFound';
import { PostCard } from '@/pages/Articles/PostCard';
import { NewsletterBand } from '@/pages/Articles/PostsPage';
import { postPath, sectionPath } from '@/pages/Articles/postParams';
import { isNotFound } from '@/pages/Vacancies/jobMeta';
import { queries } from '@/api/public';
import { useSettings } from '@/hooks/useSettings';
import { stripSiteName } from '@/lib/seoTitle';
import { formatDate, siteUrl } from '@/lib/format';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/jsonld';

/** One component for /articles/:slug and /blog/:slug; the post's `type` decides the canonical section. */
export default function PostDetail() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const section = pathname.startsWith('/blog') ? 'blog' : 'article';
  const query = useQuery({
    ...queries.post(slug),
    retry: (count, error) => !isNotFound(error) && count < 2,
  });

  if (query.isPending) {
    return (
      <>
        <Seo title="Loading…" noindex />
        <Section tone="paper">
          <Container narrow>
            <TextSkeleton lines={10} />
          </Container>
        </Section>
      </>
    );
  }

  if (query.isError) {
    if (isNotFound(query.error)) return <NotFound />;
    return (
      <>
        <Seo title="Post" noindex />
        <Section tone="paper">
          <Container>
            <ErrorState title="We could not load this post" onRetry={() => query.refetch()} />
          </Container>
        </Section>
      </>
    );
  }

  const post = query.data;
  // Wrong section in the URL (e.g. a blog post opened under /articles): go to the canonical address.
  if (post.type !== section) return <Navigate to={postPath(post)} replace />;

  const base = sectionPath(post.type);
  const path = postPath(post);
  const sectionLabel = post.type === 'blog' ? 'Blog' : 'Articles';
  const related = (post.related ?? []).filter((item) => item.slug !== post.slug);
  const imageUrl = post.cover_image ? siteUrl(post.cover_image) : undefined;

  const jsonLd = [
    buildArticleJsonLd(post, { company: settings.company, url: siteUrl(path), imageUrl }),
    buildBreadcrumbJsonLd([
      { name: 'Home', url: siteUrl('/') },
      { name: sectionLabel, url: siteUrl(base) },
      { name: post.title, url: siteUrl(path) },
    ]),
  ];

  return (
    <>
      <Seo
        title={stripSiteName(post.seo?.title, settings.company.name) || post.title}
        description={post.seo?.description || post.excerpt}
        image={post.seo?.og_image || post.cover_image || undefined}
        path={path}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="post">
        <header className="post-head">
          <Container className="post-head__inner">
            <Breadcrumbs items={[{ label: sectionLabel, to: base }, { label: post.title }]} />
            {post.category && (
              <Link to={`${base}?category=${encodeURIComponent(post.category.slug)}`} className="post-head__category">
                {post.category.name}
              </Link>
            )}
            <h1 className="post-head__title">{post.title}</h1>
            {post.excerpt && <p className="post-head__lead">{post.excerpt}</p>}
            <p className="post-head__meta">
              {post.author?.name && <span>By {post.author.name}</span>}
              {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at, { long: true })}</time>}
              {post.reading_minutes ? <span>{post.reading_minutes} min read</span> : null}
            </p>
          </Container>
        </header>

        <Container className="post__cover">
          <CoverImage src={post.cover_image} alt={post.cover_image_alt || ''} seed={post.slug} ratio="21 / 9" label={post.category?.name} />
        </Container>

        <Container>
          <div className="post__layout">
            <aside className="post__share" aria-label="Share this post">
              <ShareLinks path={path} title={post.title} orientation="column" />
            </aside>
            <Markdown source={post.body_markdown} className="post__body" />
          </div>
          <p className="post__back">
            <Link to={base} className="post__back-link">
              ← All {sectionLabel.toLowerCase()}
            </Link>
          </p>
        </Container>
      </article>

      {related.length > 0 && (
        <Section tone="paper-2" className="post-related">
          <Container>
            <Reveal>
              <h2 className="post-related__title">
                Keep <em>reading</em>
              </h2>
            </Reveal>
            <ul className="posts__grid">
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <NewsletterBand />
    </>
  );
}
