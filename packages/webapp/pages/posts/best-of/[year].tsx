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
} from '@dailydotdev/shared/src/lib/archive';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { getAppOrigin } from '../../../lib/seo';

const appOrigin = getAppOrigin();
const scopeName = 'daily.dev';
const scope = { scopeType: ArchiveScopeType.Global as const };

interface PageProps {
  year: number;
  archive: Archive | null;
  prev: Archive | null;
  next: Archive | null;
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  year: string;
}

function getJsonLd({
  year,
  archive,
}: Pick<PageProps, 'year' | 'archive'>): string {
  const pageUrl = `${appOrigin}/posts/best-of/${year}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best Developer Posts of ${year}`,
        description: getArchiveDescription(
          scopeName,
          ArchivePeriodType.Year,
          year,
        ),
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...buildArchiveItemListJsonLd(pageUrl, archive?.items),
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Explore', item: `${appOrigin}/posts` },
        { name: 'Best of', item: `${appOrigin}/posts/best-of` },
        { name: String(year) },
      ]),
    ],
  });
}

const GlobalYearlyArchivePage = ({
  year,
  archive,
  prev,
  next,
}: PageProps): ReactElement => {
  const jsonLd = getJsonLd({ year, archive });

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
            href={`${appOrigin}${getArchiveUrlFromArchive(scope, prev)}`}
          />
        )}
        {next && (
          <link
            rel="next"
            href={`${appOrigin}${getArchiveUrlFromArchive(scope, next)}`}
          />
        )}
      </Head>
      <ArchiveBreadcrumbs
        items={[
          { label: 'Explore', href: '/posts' },
          { label: 'Best of', href: '/posts/best-of' },
          { label: String(year) },
        ]}
      />
      <ArchiveFeedPage
        archive={archive}
        scopeType={ArchiveScopeType.Global}
        scopeName={scopeName}
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

GlobalYearlyArchivePage.getLayout = getPageLayout;
GlobalYearlyArchivePage.layoutProps = {
  screenCentered: false,
};

export default GlobalYearlyArchivePage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const yearStr = params?.year;

  if (!yearStr) {
    return { notFound: true, revalidate: 3600 };
  }

  const year = parseInt(yearStr, 10);

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return { notFound: true, revalidate: 3600 };
  }

  try {
    const [archiveResult, indexResult] = await Promise.all([
      gqlClient.request<ArchiveData>(ARCHIVE_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Global,
        periodType: ArchivePeriodType.Year,
        year,
      }),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Global,
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

    const seoTitles = getPageSeoTitles(`Best developer posts of ${year}`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: getArchiveDescription(
        scopeName,
        ArchivePeriodType.Year,
        year,
      ),
    };

    return {
      props: {
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
