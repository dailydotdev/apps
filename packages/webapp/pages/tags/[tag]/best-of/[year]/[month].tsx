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
import { getLayout as getFooterNavBarLayout } from '../../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../../next-seo';
import { getPageSeoTitles } from '../../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  tag: string;
  tagTitle: string;
  year: number;
  month: number;
  archive: Archive | null;
  prev: Archive | null;
  next: Archive | null;
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  tag: string;
  year: string;
  month: string;
}

function getJsonLd({
  tag,
  tagTitle,
  year,
  month,
  archive,
}: Pick<PageProps, 'tag' | 'tagTitle' | 'year' | 'month' | 'archive'>): string {
  const encodedTag = encodeURIComponent(tag);
  const monthName = getMonthName(month);
  const pageUrl = `${appOrigin}/tags/${encodedTag}/best-of/${year}/${padMonth(
    month,
  )}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best ${tagTitle} Posts — ${monthName} ${year}`,
        description: getArchiveDescription(
          tagTitle,
          ArchivePeriodType.Month,
          year,
          month,
        ),
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...buildArchiveItemListJsonLd(pageUrl, archive?.items),
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Tags', item: `${appOrigin}/tags` },
        { name: tagTitle, item: `${appOrigin}/tags/${encodedTag}` },
        { name: 'Best of', item: `${appOrigin}/tags/${encodedTag}/best-of` },
        { name: `${monthName} ${year}` },
      ]),
    ],
  });
}

const TagMonthlyArchivePage = ({
  tag,
  tagTitle,
  year,
  month,
  archive,
  prev,
  next,
}: PageProps): ReactElement => {
  const encodedTag = encodeURIComponent(tag);
  const monthName = getMonthName(month);
  const jsonLd = getJsonLd({ tag, tagTitle, year, month, archive });

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
              { scopeType: ArchiveScopeType.Tag, scopeId: tag },
              prev,
            )}`}
          />
        )}
        {next && (
          <link
            rel="next"
            href={`${appOrigin}${getArchiveUrlFromArchive(
              { scopeType: ArchiveScopeType.Tag, scopeId: tag },
              next,
            )}`}
          />
        )}
      </Head>
      <ArchiveBreadcrumbs
        items={[
          { label: 'Tags', href: '/tags' },
          { label: tagTitle, href: `/tags/${encodedTag}` },
          { label: 'Best of', href: `/tags/${encodedTag}/best-of` },
          { label: `${monthName} ${year}` },
        ]}
      />
      <ArchiveFeedPage
        archive={archive}
        scopeType={ArchiveScopeType.Tag}
        scopeId={tag}
        scopeName={tagTitle}
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

TagMonthlyArchivePage.getLayout = getPageLayout;
TagMonthlyArchivePage.layoutProps = {
  screenCentered: false,
};

export default TagMonthlyArchivePage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const tag = params?.tag;
  const yearStr = params?.year;
  const monthStr = params?.month;

  if (!tag || !yearStr || !monthStr) {
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
    const [archiveResult, indexResult] = await Promise.all([
      gqlClient.request<ArchiveData>(ARCHIVE_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Tag,
        scopeId: tag,
        periodType: ArchivePeriodType.Month,
        year,
        month,
      }),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Tag,
        scopeId: tag,
        periodType: ArchivePeriodType.Month,
      }),
    ]);

    const archive = archiveResult?.archive ?? null;

    if (!archive) {
      return { notFound: true, revalidate: 3600 };
    }

    const tagTitle = archive.keyword?.flags?.title || tag;
    const { prev, next } = findAdjacentArchives(
      indexResult?.archiveIndex ?? [],
      archive.periodStart,
      ArchivePeriodType.Month,
    );

    const monthName = getMonthName(month);
    const seoTitles = getPageSeoTitles(
      `Best ${tagTitle} posts — ${monthName} ${year}`,
    );
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: getArchiveDescription(
        tagTitle,
        ArchivePeriodType.Month,
        year,
        month,
      ),
    };

    return {
      props: {
        tag,
        tagTitle,
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
