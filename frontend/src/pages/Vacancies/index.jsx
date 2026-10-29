import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Drawer, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';
import { Button, CardSkeletons, Container, EmptyState, ErrorState, PageHero, Pager, Reveal, Section, Seo } from '@/components/ui';
import { SearchBox } from '@/components/ui/SearchBox';
import { queries } from '@/api/public';
import { useUrlSearch } from '@/hooks/useUrlSearch';
import { pluralize } from '@/lib/format';
import { JobCard } from './JobCard';
import { JobsCta } from './JobsCta';
import { FilterPanel } from './FilterPanel';
import { FACETS, JOB_SORTS, activeFilterCount, facetLabel, parseJobParams, patchJobParams, toApiParams } from './filters';

const CLEARED = { search: '', employment_type: '', work_mode: '', location: '', department: '' };

export default function Vacancies() {
  const [params, setParams] = useSearchParams();
  const state = parseJobParams(params);
  const [drawerOpen, drawer] = useDisclosure(false);

  const update = (patch) => setParams((prev) => patchJobParams(prev, patch));
  const commitSearch = useCallback((search) => setParams((prev) => patchJobParams(prev, { search }), { replace: true }), [setParams]);
  const [text, setText] = useUrlSearch(state.search, commitSearch);

  // ── data ──
  const jobs = useQuery(queries.jobs(toApiParams(state)));
  const filters = useQuery(queries.jobFilters());
  const facets = filters.data;

  const list = jobs.data?.data ?? [];
  const meta = jobs.data?.meta;
  const total = meta?.total ?? list.length;
  const active = activeFilterCount(state);
  const clearAll = () => update(CLEARED);

  const goToPage = (page) => {
    update({ page });
    document.getElementById('results')?.scrollIntoView({ block: 'start' });
  };

  const chips = [
    ...(state.search ? [{ key: 'search', label: `“${state.search}”`, clear: { search: '' } }] : []),
    ...FACETS.filter(({ key }) => state[key]).map(({ key, facet }) => ({
      key,
      label: facetLabel(facets, facet, state[key]),
      clear: { [key]: '' },
    })),
  ];

  return (
    <>
      <Seo
        title="Vacancies"
        description="Browse open roles in retail supply-chain technology. Filter by type, work mode, location and department, then apply in minutes."
        path="/vacancies"
      />
      <PageHero
        eyebrow="Vacancies"
        title={
          <>
            Roles that move <em>retail</em> forward
          </>
        }
        lead="Permanent, contract and remote positions with teams building the technology behind modern retail supply chains."
        crumbs={[{ label: 'Vacancies' }]}
        actions={
          <Button to="/apply" variant="accent" arrow>
            Send your CV
          </Button>
        }
      />

      <Section tone="paper" className="jobs">
        <Container>
          <div className="jobs__layout">
            <aside className="jobs__sidebar" aria-label="Filter vacancies">
              <div className="jobs__sidebar-head">
                <h2 className="jobs__sidebar-title">Filters</h2>
                {active > 0 && (
                  <button type="button" className="link-button jobs__clear" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel
                facets={facets}
                state={state}
                onChange={(key, value) => update({ [key]: value })}
                loading={filters.isPending}
                error={filters.isError}
                onRetry={() => filters.refetch()}
              />
            </aside>

            <div className="jobs__main" id="results">
              <Reveal className="jobs__toolbar">
                <SearchBox value={text} onChange={setText} label="Search vacancies" placeholder="Search by title, skill or keyword" className="jobs__search" />
                <div className="jobs__toolbar-row">
                  <Button variant="secondary" size="sm" className="jobs__filter-btn" leftIcon={<IconAdjustmentsHorizontal size={16} aria-hidden="true" />} onClick={drawer.open}>
                    Filters{active > 0 ? ` (${active})` : ''}
                  </Button>
                  <Select
                    className="jobs__sort"
                    label="Sort by"
                    value={state.sort}
                    onChange={(value) => value && update({ sort: value })}
                    data={JOB_SORTS}
                    allowDeselect={false}
                    comboboxProps={{ withinPortal: true }}
                  />
                </div>
              </Reveal>

              <div className="jobs__status">
                <p className="jobs__count" role="status" aria-live="polite" aria-atomic="true">
                  {jobs.isPending
                    ? 'Loading roles…'
                    : jobs.isError
                      ? ''
                      : `${pluralize(total, 'open role')}${active > 0 ? ' match your filters' : ''}`}
                </p>
                {chips.length > 0 && (
                  <ul className="jobs__chips" aria-label="Active filters">
                    {chips.map((chip) => (
                      <li key={chip.key}>
                        <button type="button" className="filter-chip" onClick={() => update(chip.clear)} aria-label={`Remove filter: ${chip.label}`}>
                          {chip.label}
                          <span className="filter-chip__x" aria-hidden="true">
                            <IconX size={12} stroke={2.5} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {jobs.isPending ? (
                <CardSkeletons count={4} height={200} className="jobs__skeleton" />
              ) : jobs.isError ? (
                <ErrorState title="We could not load the vacancies" onRetry={() => jobs.refetch()} />
              ) : list.length === 0 ? (
                <EmptyState
                  title={active > 0 ? 'No roles match those filters' : 'No open roles right now'}
                  description={
                    active > 0
                      ? 'Try removing a filter or searching with fewer words. You can also send your CV and we will match you to roles as they open.'
                      : 'New positions are added regularly. Send us your CV and we will contact you when something fits.'
                  }
                  action={
                    <div className="jobs__empty-actions">
                      {active > 0 && (
                        <Button variant="secondary" size="sm" onClick={clearAll}>
                          Clear filters
                        </Button>
                      )}
                      <Button to="/apply" size="sm" arrow>
                        Apply speculatively
                      </Button>
                    </div>
                  }
                />
              ) : (
                <>
                  <ul className={`jobs__list${jobs.isPlaceholderData ? ' is-stale' : ''}`} aria-busy={jobs.isFetching}>
                    {list.map((job) => (
                      <li key={job.id}>
                        <JobCard job={job} />
                      </li>
                    ))}
                  </ul>
                  <Pager meta={meta} onChange={goToPage} label="roles" />
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <JobsCta />

      <Drawer
        opened={drawerOpen}
        onClose={drawer.close}
        position="bottom"
        size="85%"
        title="Filter vacancies"
        classNames={{ content: 'filter-drawer', header: 'filter-drawer__header', body: 'filter-drawer__body' }}
      >
        <FilterPanel
          facets={facets}
          state={state}
          onChange={(key, value) => update({ [key]: value })}
          loading={filters.isPending}
          error={filters.isError}
          onRetry={() => filters.refetch()}
        />
        <div className="filter-drawer__footer">
          {active > 0 && (
            <Button variant="ghost" onClick={clearAll}>
              Clear all
            </Button>
          )}
          <Button onClick={drawer.close} block>
            {jobs.isPending ? 'Show results' : `Show ${pluralize(total, 'role')}`}
          </Button>
        </div>
      </Drawer>
    </>
  );
}
