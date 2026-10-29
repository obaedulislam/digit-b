import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, CardSkeletons, Container, EmptyState, ErrorState, PageHero, Pager, Reveal, Section, Seo } from '@/components/ui';
import { SearchBox } from '@/components/ui/SearchBox';
import { NewsletterForm } from '@/components/layout/NewsletterForm';
import { queries } from '@/api/public';
import { useUrlSearch } from '@/hooks/useUrlSearch';
import { pluralize } from '@/lib/format';
import { cx } from '@/lib/cx';
import { PostCard } from './PostCard';
import { parsePostParams, patchPostParams, sectionPath, toPostApiParams } from './postParams';

/** Copy that differs between /articles and /blog. */
const COPY = {
  article: {
    eyebrow: 'Articles',
    title: (
      <>
        News and <em>insight</em> from the market
      </>
    ),
    lead: 'What is changing in retail supply-chain technology hiring, and what it means for employers and candidates.',
    noun: 'article',
    description: 'News and insight on retail supply-chain technology hiring from the DIGIT-B team.',
    cross: { to: '/blog', label: 'Read the blog', text: 'Looking for practical, hands-on advice?' },
  },
  blog: {
    eyebrow: 'Blog',
    title: (
      <>
        Notes on hiring, <em>careers</em> and craft
      </>
    ),
    lead: 'Practical playbooks and honest opinions from the recruiters who place retail technology talent every week.',
    noun: 'post',
    description: 'Practical hiring and career advice from the DIGIT-B recruiters.',
    cross: { to: '/articles', label: 'Read the articles', text: 'Want the bigger picture on the market?' },
  },
};

/** Shared implementation behind /articles and /blog. `type` is "article" | "blog". */
export function PostsPage({ type }) {
  const copy = COPY[type];
  const base = sectionPath(type);
  const [params, setParams] = useSearchParams();
  const state = parsePostParams(params);

  const update = (patch) => setParams((prev) => patchPostParams(prev, patch));
  const commitSearch = useCallback((search) => setParams((prev) => patchPostParams(prev, { search }), { replace: true }), [setParams]);
  const [text, setText] = useUrlSearch(state.search, commitSearch);

  const posts = useQuery(queries.posts(toPostApiParams(type, state)));
  const categories = useQuery(queries.postCategories(type));

  const list = posts.data?.data ?? [];
  const meta = posts.data?.meta;
  const filtered = Boolean(state.search || state.category);
  const showFeatured = state.page === 1 && !state.search && list.length >= 4;
  const lead = showFeatured ? list[0] : null;
  const gridItems = showFeatured ? list.slice(1) : list;
  const categoryList = categories.data ?? [];
  const activeCategory = categoryList.find((c) => c.slug === state.category);

  const goToPage = (page) => {
    update({ page });
    document.getElementById('posts-results')?.scrollIntoView({ block: 'start' });
  };

  return (
    <>
      <Seo title={copy.eyebrow} description={copy.description} path={base} />
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        crumbs={[{ label: copy.eyebrow }]}
        actions={
          <Button to={copy.cross.to} variant="light" arrow>
            {copy.cross.label}
          </Button>
        }
        seed={`posts-${type}`}
      />

      <Section tone="paper" className="posts">
        <Container>
          <Reveal className="posts__toolbar">
            <SearchBox value={text} onChange={setText} label={`Search ${copy.noun}s`} placeholder={`Search ${copy.noun}s`} className="posts__search" />
            {categoryList.length > 0 && (
              <ul className="chips" aria-label="Filter by category">
                <li>
                  <button type="button" className={cx('chip', !state.category && 'is-active')} aria-pressed={!state.category} onClick={() => update({ category: '' })}>
                    All
                  </button>
                </li>
                {categoryList.map((category) => (
                  <li key={category.slug}>
                    <button
                      type="button"
                      className={cx('chip', state.category === category.slug && 'is-active')}
                      aria-pressed={state.category === category.slug}
                      onClick={() => update({ category: category.slug })}
                    >
                      {category.name}
                      {category.posts_count !== undefined && <span className="chip__count">{category.posts_count}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <div className="posts__results" id="posts-results">
            {/* Keeps the heading outline h1 → h2 → h3 (post titles) without a visual change. */}
            <h2 className="sr-only">Latest {copy.noun}s</h2>
            <p className="posts__count" role="status" aria-live="polite" aria-atomic="true">
              {posts.isPending
                ? `Loading ${copy.noun}s…`
                : posts.isError
                  ? ''
                  : `${pluralize(meta?.total ?? list.length, copy.noun)}${activeCategory ? ` in ${activeCategory.name}` : ''}${state.search ? ` matching “${state.search}”` : ''}`}
            </p>

            {posts.isPending ? (
              <CardSkeletons count={6} height={380} />
            ) : posts.isError ? (
              <ErrorState title={`We could not load the ${copy.noun}s`} onRetry={() => posts.refetch()} />
            ) : list.length === 0 ? (
              <EmptyState
                title={filtered ? `No ${copy.noun}s match` : `No ${copy.noun}s published yet`}
                description={filtered ? 'Try a different category or fewer words.' : 'Fresh writing is on its way. Subscribe below to be the first to read it.'}
                action={
                  filtered && (
                    <Button variant="secondary" size="sm" onClick={() => update({ search: '', category: '' })}>
                      Clear filters
                    </Button>
                  )
                }
              />
            ) : (
              <div className={cx('posts__body', posts.isPlaceholderData && 'is-stale')} aria-busy={posts.isFetching}>
                {lead && <PostCard post={lead} featured />}
                {gridItems.length > 0 && (
                  <ul className="posts__grid">
                    {gridItems.map((post) => (
                      <li key={post.id}>
                        <PostCard post={post} />
                      </li>
                    ))}
                  </ul>
                )}
                <Pager meta={meta} onChange={goToPage} label={`${copy.noun}s`} />
              </div>
            )}
          </div>

          <p className="posts__cross">
            {copy.cross.text}{' '}
            <Link to={copy.cross.to} className="posts__cross-link">
              {copy.cross.label}
            </Link>
          </p>
        </Container>
      </Section>

      <NewsletterBand />
    </>
  );
}

export function NewsletterBand() {
  return (
    <Section tone="ink" className="posts-newsletter">
      <Container className="posts-newsletter__inner">
        <div className="posts-newsletter__copy">
          <h2 className="posts-newsletter__title">
            Hiring insight, <em>monthly</em>
          </h2>
          <p className="posts-newsletter__text">One concise email with market data, practical advice and new roles. No spam, unsubscribe any time.</p>
        </div>
        <div className="posts-newsletter__form">
          <NewsletterForm id="posts-newsletter" />
        </div>
      </Container>
    </Section>
  );
}
