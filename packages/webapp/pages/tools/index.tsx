import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo';
import type { DirectoryTool } from '@dailydotdev/shared/src/graphql/tools';
import {
  getToolCategories,
  getToolCategoryAnchor,
  getTopTools,
} from '@dailydotdev/shared/src/graphql/tools';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';
import { ToolCard } from '../../components/tools/ToolCard';
import { ToolPageNavbar } from '../../components/tools/ToolPageNavbar';
import { ToolSection } from '../../components/tools/ToolSection';

const TOOLS_PER_SECTION = 6;
const TRENDING_COUNT = 6;

const appOrigin = getAppOrigin();

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

interface CategorySection {
  category: string;
  tools: DirectoryTool[];
}

interface ToolsDirectoryProps {
  trending: DirectoryTool[];
  sections: CategorySection[];
  fallbackTop: DirectoryTool[];
}

const ToolGrid = ({ tools }: { tools: DirectoryTool[] }): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 laptop:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onClick={() =>
            logEvent({
              event_name: LogEvent.Click,
              target_type: TargetType.Tool,
              target_id: tool.slug,
              extra: JSON.stringify({ origin: Origin.ToolsDirectory }),
            })
          }
        />
      ))}
    </div>
  );
};

const ToolsDirectoryPage = ({
  trending,
  sections,
  fallbackTop,
}: ToolsDirectoryProps): ReactElement => {
  return (
    <>
      <ToolPageNavbar relatedTools={trending} />
      <main className="mx-auto flex w-full max-w-screen-laptop flex-col px-4 py-6 tablet:px-6">
        <Head>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: getToolsDirectoryJsonLd(sections),
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
          {sections.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sections.map(({ category }) => (
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

        <div className="h-px w-full bg-border-subtlest-tertiary" />

        <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
          {trending.length > 0 && (
            <ToolSection title="Rising this quarter">
              <ToolGrid tools={trending} />
            </ToolSection>
          )}

          {sections.map(({ category, tools }) => (
            <ToolSection
              key={category}
              id={getToolCategoryAnchor(category)}
              title={category}
            >
              <ToolGrid tools={tools} />
            </ToolSection>
          ))}

          {sections.length === 0 && fallbackTop.length > 0 && (
            <ToolSection title="Most stacked">
              <ToolGrid tools={fallbackTop} />
            </ToolSection>
          )}
        </div>
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
  const [categories, trending, fallbackTop] = await Promise.all([
    getToolCategories(),
    getTopTools({ first: TRENDING_COUNT, trending: true }),
    getTopTools({ first: 12 }),
  ]);

  const sections = (
    await Promise.all(
      categories.map(async ({ category }) => ({
        category,
        tools: await getTopTools({ first: TOOLS_PER_SECTION, category }),
      })),
    )
  ).filter(({ tools }) => tools.length > 0);

  const seoTitles = getPageSeoTitles(
    'Developer tools directory — ranked by real stacks',
  );
  const isEmpty = sections.length === 0 && fallbackTop.length === 0;

  return {
    props: {
      trending,
      sections,
      fallbackTop,
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
