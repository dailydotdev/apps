import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { DirectoryTool } from '@dailydotdev/shared/src/graphql/tools';
import {
  getToolCategories,
  getToolCategoryAnchor,
  getTopTools,
} from '@dailydotdev/shared/src/graphql/tools';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { CharmEmptyState } from '@dailydotdev/shared/src/components/charm/CharmEmptyState';
import { cloudinaryCharmSearchNoResults } from '@dailydotdev/shared/src/lib/image';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';
import { ToolCard } from '../../components/tools/ToolCard';
import { ToolPageNavbar } from '../../components/tools/ToolPageNavbar';
import { ToolSection } from '../../components/tools/ToolSection';
import { ToolDirectorySearch } from '../../components/tools/ToolDirectorySearch';
import { useAddToolToStack } from '../../components/tools/useAddToolToStack';

const TOOLS_PER_SECTION = 6;
const TRENDING_COUNT = 6;
// Matches the API's topTools cap, so a category at the limit means tools
// were actually dropped.
const CATEGORY_FETCH_LIMIT = 100;
const SEARCH_RESULTS_LIMIT = 100;
const RECOMMENDED_COUNT = 5;
const SEARCH_LOG_DELAY = 1000;
// Catch-all section for stacked tools without a curated category, rendered
// below the curated ones. Only sees tools inside the overall top-N fetch.
const OTHER_CATEGORY = 'Other';

const appOrigin = getAppOrigin();

interface CategorySection {
  category: string;
  tools: DirectoryTool[];
}

const getToolsDirectoryJsonLd = (sections: CategorySection[]): string => {
  const directoryUrl = `${appOrigin}/tools`;
  const tools = sections.flatMap(({ tools: sectionTools }) => sectionTools);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${directoryUrl}#page`,
        url: directoryUrl,
        name: 'Developer tools directory',
        description:
          'The tools developers actually run, ranked by real stacks on daily.dev.',
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...(tools.length
        ? [
            {
              '@type': 'ItemList',
              '@id': `${directoryUrl}#tools`,
              numberOfItems: tools.length,
              itemListElement: tools.map((tool, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appOrigin}/tools/${tool.slug}`,
                name: tool.title,
              })),
            },
          ]
        : []),
    ],
  });
};

interface ToolsDirectoryProps {
  tools: DirectoryTool[];
  trendingIds: string[];
  sections: { category: string; toolIds: string[] }[];
  fallbackTopIds: string[];
}

const ToolsDirectoryPage = ({
  tools,
  trendingIds,
  sections,
  fallbackTopIds,
}: ToolsDirectoryProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { stackedToolIds, openAddModal, modal } = useAddToolToStack(
    Origin.ToolsDirectory,
  );
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(),
  );

  const toolsById = useMemo(
    () => new Map(tools.map((tool) => [tool.id, tool])),
    [tools],
  );
  const pickTools = useCallback(
    (ids: string[]): DirectoryTool[] =>
      ids.flatMap((id) => toolsById.get(id) ?? []),
    [toolsById],
  );

  const trending = useMemo(
    () => pickTools(trendingIds),
    [pickTools, trendingIds],
  );
  const categorySections = useMemo<CategorySection[]>(
    () =>
      sections.map(({ category, toolIds }) => ({
        category,
        tools: pickTools(toolIds),
      })),
    [sections, pickTools],
  );
  const fallbackTop = useMemo(
    () => pickTools(fallbackTopIds),
    [pickTools, fallbackTopIds],
  );

  const normalizedSearch = search.trim();
  const isSearching = normalizedSearch.length > 0;
  const {
    data: apiResults,
    isPending: isSearchPending,
    isError: isSearchError,
  } = useQuery({
    queryKey: ['toolsDirectorySearch', normalizedSearch.toLowerCase()],
    queryFn: () =>
      getTopTools({ query: normalizedSearch, first: SEARCH_RESULTS_LIMIT }),
    enabled: isSearching,
    staleTime: StaleTime.Default,
    placeholderData: keepPreviousData,
  });

  // Tolerate the API not supporting the query argument yet during deploy
  // windows by falling back to a title match over the tools already loaded.
  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }
    if (isSearchError) {
      const query = normalizedSearch.toLowerCase();
      return tools.filter(({ title }) => title.toLowerCase().includes(query));
    }
    return apiResults ?? [];
  }, [isSearching, isSearchError, apiResults, normalizedSearch, tools]);
  const isSearchLoading = isSearching && isSearchPending && !isSearchError;

  const [logSearch, cancelLogSearch] = useDebounceFn((extra?: string) => {
    logEvent({ event_name: LogEvent.SearchTools, extra });
  }, SEARCH_LOG_DELAY);

  useEffect(() => {
    if (isSearching && !isSearchLoading) {
      logSearch(
        JSON.stringify({
          query: normalizedSearch.toLowerCase(),
          resultCount: searchResults.length,
        }),
      );
    }
  }, [
    isSearching,
    isSearchLoading,
    normalizedSearch,
    searchResults.length,
    logSearch,
  ]);

  const clearSearch = useCallback(() => {
    cancelLogSearch();
    setInputValue('');
    setSearch('');
  }, [cancelLogSearch]);

  const renderGrid = useCallback(
    (gridTools: DirectoryTool[], extraProps?: Record<string, unknown>) => (
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
        {gridTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isInStack={stackedToolIds.has(tool.id)}
            onAddToStack={openAddModal}
            onClick={() =>
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.Tool,
                target_id: tool.slug,
                extra: JSON.stringify({
                  origin: Origin.ToolsDirectory,
                  ...extraProps,
                }),
              })
            }
          />
        ))}
      </div>
    ),
    [stackedToolIds, openAddModal, logEvent],
  );

  const recommendedTools = useMemo(
    () => trending.slice(0, RECOMMENDED_COUNT),
    [trending],
  );

  return (
    <>
      <ToolPageNavbar relatedTools={trending} />
      <main className="mx-auto flex w-full max-w-screen-laptop flex-col px-4 py-6 tablet:px-6">
        <Head>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: getToolsDirectoryJsonLd(categorySections),
            }}
          />
        </Head>
        <header className="mx-auto flex w-full max-w-[48rem] flex-col items-center gap-4 py-8 text-center">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
          >
            Tools
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="max-w-[34rem]"
          >
            The tools developers actually run — ranked by real stacks on
            daily.dev, not vendor pitches.
          </Typography>
          <ToolDirectorySearch
            value={inputValue}
            onValueChange={setInputValue}
            onQueryChange={setSearch}
            recommendedTools={recommendedTools}
            className="max-w-screen-tablet"
          />
          {!isSearching && categorySections.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categorySections.map(({ category }) => (
                <a
                  key={category}
                  href={`#${getToolCategoryAnchor(category)}`}
                  className="rounded-10 border border-border-subtlest-tertiary px-3 py-1 font-bold text-text-tertiary typo-footnote hover:border-border-subtlest-secondary hover:text-text-primary"
                >
                  {category}
                </a>
              ))}
            </div>
          )}
        </header>

        {isSearching && !isSearchLoading && searchResults.length === 0 && (
          <CharmEmptyState
            className="my-10"
            image={cloudinaryCharmSearchNoResults}
            imageAlt="daily.dev charm looking through a magnifying glass"
            title={`No tools match “${search.trim()}”`}
            description="Try the tool's full name or a different spelling."
            action={{ label: 'Clear search', onClick: clearSearch }}
          />
        )}

        {isSearching && searchResults.length > 0 && (
          <ToolSection title={`Results for “${search.trim()}”`}>
            {renderGrid(searchResults, { searched: true })}
          </ToolSection>
        )}

        {!isSearching && (
          <div className="flex flex-col">
            {trending.length > 0 && (
              <ToolSection title="Rising this quarter">
                {renderGrid(trending)}
              </ToolSection>
            )}

            {categorySections.map(({ category, tools: categoryTools }) => {
              const isExpanded = expandedCategories.has(category);
              const visibleTools = isExpanded
                ? categoryTools
                : categoryTools.slice(0, TOOLS_PER_SECTION);

              return (
                <ToolSection
                  key={category}
                  id={getToolCategoryAnchor(category)}
                  title={category}
                >
                  {renderGrid(visibleTools)}
                  {!isExpanded &&
                    categoryTools.length > visibleTools.length && (
                      <Button
                        variant={ButtonVariant.Subtle}
                        size={ButtonSize.Small}
                        className="self-center"
                        onClick={() =>
                          setExpandedCategories((previous) =>
                            new Set(previous).add(category),
                          )
                        }
                      >
                        Show all {categoryTools.length} {category} tools
                      </Button>
                    )}
                </ToolSection>
              );
            })}

            {categorySections.length === 0 && fallbackTop.length > 0 && (
              <ToolSection title="Most stacked">
                {renderGrid(fallbackTop)}
              </ToolSection>
            )}
          </div>
        )}

        {modal}
      </main>
    </>
  );
};

const getToolsDirectoryLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ToolsDirectoryPage.getLayout = getToolsDirectoryLayout;
ToolsDirectoryPage.layoutProps = { screenCentered: false };

export default ToolsDirectoryPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<ToolsDirectoryProps & { seo: NextSeoProps }>
> {
  // These directory queries are live in production (unlike the tool-page
  // social queries), so a failure here should fail the revalidation and let
  // Next keep serving the last good ISR output, rather than caching an
  // empty page.
  const [categories, trending, allTop] = await Promise.all([
    getToolCategories(),
    getTopTools({ first: TRENDING_COUNT, trending: true }),
    getTopTools({ first: CATEGORY_FETCH_LIMIT }),
  ]);
  const fallbackTop = allTop.slice(0, 12);

  const fullCategories = (
    await Promise.all(
      categories.map(async ({ category }) => ({
        category,
        tools: await getTopTools({ first: CATEGORY_FETCH_LIMIT, category }),
      })),
    )
  ).filter(({ tools }) => tools.length > 0);

  const uncategorized = allTop.filter((tool) => !tool.category);
  if (uncategorized.length > 0) {
    fullCategories.push({ category: OTHER_CATEGORY, tools: uncategorized });
  }
  if (allTop.length >= CATEGORY_FETCH_LIMIT) {
    // eslint-disable-next-line no-console
    console.warn(
      `tools directory: the overall top-tools fetch hit the limit; the "${OTHER_CATEGORY}" section may be missing uncategorized tools`,
    );
  }

  fullCategories.forEach(({ category, tools }) => {
    if (category !== OTHER_CATEGORY && tools.length >= CATEGORY_FETCH_LIMIT) {
      // eslint-disable-next-line no-console
      console.warn(
        `tools directory: category "${category}" hit the fetch limit; some tools are not listed`,
      );
    }
  });

  const tools = Array.from(
    new Map(
      [
        ...fullCategories.flatMap(({ tools: categoryTools }) => categoryTools),
        ...trending,
        ...allTop,
      ].map((tool) => [tool.id, tool]),
    ).values(),
  ).sort((a, b) => a.title.localeCompare(b.title));

  const sections = fullCategories.map(({ category, tools: categoryTools }) => ({
    category,
    toolIds: categoryTools.map(({ id }) => id),
  }));

  const seoTitles = getPageSeoTitles(
    'Developer tools directory — ranked by real stacks',
  );
  const isEmpty = sections.length === 0 && fallbackTop.length === 0;

  return {
    props: {
      tools,
      trendingIds: trending.map(({ id }) => id),
      sections,
      fallbackTopIds: fallbackTop.map(({ id }) => id),
      seo: {
        title: seoTitles.title,
        openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
        description:
          'Explore the tools developers actually use: top tools per category, rising tools this quarter, and per-tool pages with adoption, squads and community takes on daily.dev.',
        ...(isEmpty ? noindexSeoProps : {}),
      },
    },
    revalidate: 300,
  };
}
