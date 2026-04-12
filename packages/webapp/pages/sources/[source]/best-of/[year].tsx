import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import type {
  Archive,
  ArchiveData,
  ArchiveIndexData,
} from '@dailydotdev/shared/src/graphql/archive';
import {
  ARCHIVE_INDEX_QUERY,
  ARCHIVE_QUERY,
  ArchivePeriodType,
  ArchiveRankingType,
  ArchiveScopeType,
  ArchiveSubjectType,
} from '@dailydotdev/shared/src/graphql/archive';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ArchiveFeedPage } from '@dailydotdev/shared/src/components/archive/ArchiveFeedPage';
import { ArchiveBreadcrumbs } from '@dailydotdev/shared/src/components/archive/ArchiveBreadcrumbs';
import {
  findAdjacentArchives,
  getArchiveDescription,
  getArchiveUrlFromArchive,
} from '@dailydotdev/shared/src/lib/archive';
import type { SourceData } from '@dailydotdev/shared/src/graphql/sources';
import {
  SOURCE_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { getLayout as getFooterNavBarLayout } from '../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../next-seo';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  sourceId: string;
  sourceName: string;
  year: number;
  archive: Archive | null;
  prev: Archive | null;
  next: Archive | null;
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  source: string;
  year: string;
}

const getJsonLd = ({
  sourceId,
  sourceName,
  year,
  archive,
}: PageProps): string => {
  const encodedSource = encodeURIComponent(sourceId);
  const pageUrl = `${appOrigin}/sources/${encodedSource}/best-of/${year}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best ${sourceName} Posts of ${year}`,
        description: getArchiveDescription(
          sourceName,
          ArchivePeriodType.Year,
          year,
        ),
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...(archive?.items?.length
        ? [
            {
              '@type': 'ItemList',
              '@id': `${pageUrl}#items`,
              numberOfItems: archive.items.length,
              itemListElement: archive.items.map((item) => ({
                '@type': 'ListItem',
                position: item.rank,
                url: `${appOrigin}/posts/${item.post.slug || item.post.id}`,
                name: item.post.title || '',
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: appOrigin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sources',
            item: `${appOrigin}/sources`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: sourceName,
            item: `${appOrigin}/sources/${encodedSource}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Best of',
            item: `${appOrigin}/sources/${encodedSource}/best-of`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: String(year),
          },
        ],
      },
    ],
  });
};

const SourceYearlyArchivePage = ({
  sourceId,
  sourceName,
  year,
  archive,
  prev,
  next,
}: PageProps): ReactElement => {
  const encodedSource = encodeURIComponent(sourceId);
  const jsonLd = getJsonLd({
    sourceId,
    sourceName,
    year,
    archive,
    prev,
    next,
    seo: {},
  });

  return (
    <PageWrapperLayout>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        {prev && (
          <link
            rel="prev"
            href={`${appOrigin}${getArchiveUrlFromArchive(
              { scopeType: ArchiveScopeType.Source, scopeId: sourceId },
              prev,
            )}`}
          />
        )}
        {next && (
          <link
            rel="next"
            href={`${appOrigin}${getArchiveUrlFromArchive(
              { scopeType: ArchiveScopeType.Source, scopeId: sourceId },
              next,
            )}`}
          />
        )}
      </Head>
      <ArchiveBreadcrumbs
        items={[
          { label: 'Sources', href: '/sources' },
          { label: sourceName, href: `/sources/${encodedSource}` },
          { label: 'Best of', href: `/sources/${encodedSource}/best-of` },
          { label: String(year) },
        ]}
      />
      <ArchiveFeedPage
        archive={archive}
        scopeType={ArchiveScopeType.Source}
        scopeId={sourceId}
        scopeName={sourceName}
        periodType={ArchivePeriodType.Year}
        year={year}
        prev={prev}
        next={next}
      />
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SourceYearlyArchivePage.getLayout = getPageLayout;
SourceYearlyArchivePage.layoutProps = {
  screenCentered: false,
};

export default SourceYearlyArchivePage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const sourceHandle = params?.source;
  const yearStr = params?.year;

  if (!sourceHandle || !yearStr) {
    return { notFound: true, revalidate: 3600 };
  }

  const year = parseInt(yearStr, 10);

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return { notFound: true, revalidate: 3600 };
  }

  try {
    const sourceResult = await gqlClient.request<SourceData>(SOURCE_QUERY, {
      id: sourceHandle,
    });

    const source = sourceResult?.source;

    if (!source || source.type === SourceType.Squad) {
      return { notFound: true, revalidate: 3600 };
    }

    const sourceId = source.id ?? sourceHandle;

    const [archiveResult, indexResult] = await Promise.all([
      gqlClient.request<ArchiveData>(ARCHIVE_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Source,
        scopeId: sourceId,
        periodType: ArchivePeriodType.Year,
        year,
      }),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Source,
        scopeId: sourceId,
        periodType: ArchivePeriodType.Year,
      }),
    ]);

    const archive = archiveResult?.archive ?? null;

    if (!archive) {
      return { notFound: true, revalidate: 3600 };
    }

    const { prev, next } = findAdjacentArchives(
      indexResult?.archiveIndex ?? [],
      archive.periodStart,
      ArchivePeriodType.Year,
    );

    const seoTitles = getPageSeoTitles(`Best ${source.name} posts of ${year}`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: getArchiveDescription(
        source.name,
        ArchivePeriodType.Year,
        year,
      ),
    };

    return {
      props: {
        sourceId,
        sourceName: source.name,
        year,
        archive,
        prev: prev ?? null,
        next: next ?? null,
        seo,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
