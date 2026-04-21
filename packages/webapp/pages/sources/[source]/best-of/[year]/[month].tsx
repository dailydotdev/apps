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
  buildArchiveItemListJsonLd,
  buildBreadcrumbListJsonLd,
  findAdjacentArchives,
  getArchiveDescription,
  getArchiveUrlFromArchive,
  getMonthName,
  padMonth,
} from '@dailydotdev/shared/src/lib/archive';
import type { SourceData } from '@dailydotdev/shared/src/graphql/sources';
import {
  SOURCE_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { getLayout as getFooterNavBarLayout } from '../../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../../next-seo';
import { getPageSeoTitles } from '../../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  sourceId: string;
  sourceName: string;
  year: number;
  month: number;
  archive: Archive | null;
  prev: Archive | null;
  next: Archive | null;
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  source: string;
  year: string;
  month: string;
}

function getJsonLd({
  sourceId,
  sourceName,
  year,
  month,
  archive,
}: Pick<
  PageProps,
  'sourceId' | 'sourceName' | 'year' | 'month' | 'archive'
>): string {
  const encodedSource = encodeURIComponent(sourceId);
  const monthName = getMonthName(month);
  const pageUrl = `${appOrigin}/sources/${encodedSource}/best-of/${year}/${padMonth(
    month,
  )}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best ${sourceName} Posts — ${monthName} ${year}`,
        description: getArchiveDescription(
          sourceName,
          ArchivePeriodType.Month,
          year,
          month,
        ),
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...buildArchiveItemListJsonLd(pageUrl, archive?.items),
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Sources', item: `${appOrigin}/sources` },
        {
          name: sourceName,
          item: `${appOrigin}/sources/${encodedSource}`,
        },
        {
          name: 'Best of',
          item: `${appOrigin}/sources/${encodedSource}/best-of`,
        },
        { name: `${monthName} ${year}` },
      ]),
    ],
  });
}

const SourceMonthlyArchivePage = ({
  sourceId,
  sourceName,
  year,
  month,
  archive,
  prev,
  next,
}: PageProps): ReactElement => {
  const encodedSource = encodeURIComponent(sourceId);
  const monthName = getMonthName(month);
  const jsonLd = getJsonLd({ sourceId, sourceName, year, month, archive });

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
          { label: `${monthName} ${year}` },
        ]}
      />
      <ArchiveFeedPage
        archive={archive}
        scopeType={ArchiveScopeType.Source}
        scopeId={sourceId}
        scopeName={sourceName}
        periodType={ArchivePeriodType.Month}
        year={year}
        month={month}
        prev={prev}
        next={next}
      />
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SourceMonthlyArchivePage.getLayout = getPageLayout;
SourceMonthlyArchivePage.layoutProps = {
  screenCentered: false,
};

export default SourceMonthlyArchivePage;

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
  const monthStr = params?.month;

  if (!sourceHandle || !yearStr || !monthStr) {
    return { notFound: true, revalidate: 3600 };
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    month < 1 ||
    month > 12 ||
    year < 2000 ||
    year > 2100
  ) {
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
        periodType: ArchivePeriodType.Month,
        year,
        month,
      }),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Source,
        scopeId: sourceId,
        periodType: ArchivePeriodType.Month,
      }),
    ]);

    const archive = archiveResult?.archive ?? null;

    if (!archive) {
      return { notFound: true, revalidate: 3600 };
    }

    const { prev, next } = findAdjacentArchives(
      indexResult?.archiveIndex ?? [],
      archive.periodStart,
      ArchivePeriodType.Month,
    );

    const monthName = getMonthName(month);
    const seoTitles = getPageSeoTitles(
      `Best ${source.name} posts — ${monthName} ${year}`,
    );
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: getArchiveDescription(
        source.name,
        ArchivePeriodType.Month,
        year,
        month,
      ),
    };

    return {
      props: {
        sourceId,
        sourceName: source.name,
        year,
        month,
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
