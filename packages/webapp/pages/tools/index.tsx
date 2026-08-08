import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
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
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { getLayout } from '../../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';

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

const ToolCard = ({ tool }: { tool: DirectoryTool }): ReactElement => (
  <Link href={`/tools/${tool.slug}`} passHref>
    <a className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 hover:border-border-subtlest-secondary">
      {tool.faviconUrl ? (
        <img
          src={tool.faviconUrl}
          alt={`${tool.title} logo`}
          className="size-10 flex-none rounded-12 object-contain"
        />
      ) : (
        <span className="grid size-10 flex-none place-items-center rounded-12 bg-surface-float font-bold text-text-tertiary">
          {tool.title.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {tool.title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {largeNumberFormat(tool.stackCount) ?? tool.stackCount} in stacks
        </Typography>
      </span>
    </a>
  </Link>
);

const ToolGrid = ({ tools }: { tools: DirectoryTool[] }): ReactElement => (
  <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
    {tools.map((tool) => (
      <ToolCard key={tool.id} tool={tool} />
    ))}
  </div>
);

const ToolsDirectoryPage = ({
  trending,
  sections,
  fallbackTop,
}: ToolsDirectoryProps): ReactElement => {
  return (
    <main className="mx-auto flex w-full max-w-screen-laptop flex-col gap-8 px-4 py-6 laptop:px-8">
      <Head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: getToolsDirectoryJsonLd(sections),
          }}
        />
      </Head>
      <div className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
        >
          Tools
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="max-w-2xl"
        >
          The tools developers actually run — ranked by real stacks on
          daily.dev, not vendor pitches.
        </Typography>
        {sections.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {sections.map(({ category }) => (
              <a
                key={category}
                href={`#${getToolCategoryAnchor(category)}`}
                className="rounded-8 border border-border-subtlest-tertiary px-2.5 py-0.5 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
              >
                {category}
              </a>
            ))}
          </div>
        )}
      </div>

      {trending.length > 0 && (
        <section className="flex flex-col gap-3">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            bold
            className="uppercase tracking-wide"
          >
            Rising this quarter
          </Typography>
          <ToolGrid tools={trending} />
        </section>
      )}

      {sections.map(({ category, tools }) => (
        <section
          key={category}
          id={getToolCategoryAnchor(category)}
          className="flex scroll-mt-16 flex-col gap-3"
        >
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            bold
            className="uppercase tracking-wide"
          >
            {category}
          </Typography>
          <ToolGrid tools={tools} />
        </section>
      ))}

      {sections.length === 0 && fallbackTop.length > 0 && (
        <section className="flex flex-col gap-3">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            bold
            className="uppercase tracking-wide"
          >
            Most stacked
          </Typography>
          <ToolGrid tools={fallbackTop} />
        </section>
      )}
    </main>
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
  // Tolerate the API not exposing directory queries yet during deploy windows.
  const [categories, trending, fallbackTop] = await Promise.all([
    getToolCategories().catch(() => []),
    getTopTools({ first: TRENDING_COUNT, trending: true }).catch(() => []),
    getTopTools({ first: 12 }).catch(() => []),
  ]);

  const sections = (
    await Promise.all(
      categories.map(async ({ category }) => ({
        category,
        tools: await getTopTools({
          first: TOOLS_PER_SECTION,
          category,
        }).catch(() => []),
      })),
    )
  ).filter(({ tools }) => tools.length > 0);

  const seoTitles = getPageSeoTitles(
    'Developer tools directory — ranked by real stacks',
  );

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
      },
    },
    revalidate: 300,
  };
}
