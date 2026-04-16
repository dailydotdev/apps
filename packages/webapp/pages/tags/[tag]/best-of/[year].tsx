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
import { getLayout as getFooterNavBarLayout } from '../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../next-seo';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  tag: string;
  tagTitle: string;
  year: number;
  archive: Archive | null;
  prev: Archive | null;
  next: Archive | null;
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  tag: string;
  year: string;
}

function getJsonLd({
  tag,
  tagTitle,
  year,
  archive,
}: Pick<PageProps, 'tag' | 'tagTitle' | 'year' | 'archive'>): string {
  const encodedTag = encodeURIComponent(tag);
  const pageUrl = `${appOrigin}/tags/${encodedTag}/best-of/${year}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best ${tagTitle} Posts of ${year}`,
        description: getArchiveDescription(
          tagTitle,
          ArchivePeriodType.Year,
          year,
        ),
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...buildArchiveItemListJsonLd(pageUrl, archive?.items),
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Tags', item: `${appOrigin}/tags` },
        { name: tagTitle, item: `${appOrigin}/tags/${encodedTag}` },
        { name: 'Best of', item: `${appOrigin}/tags/${encodedTag}/best-of` },
        { name: String(year) },
      ]),
    ],
  });
}

const TagYearlyArchivePage = ({
  tag,
  tagTitle,
  year,
  archive,
  prev,
  next,
}: PageProps): ReactElement => {
  const encodedTag = encodeURIComponent(tag);
  const jsonLd = getJsonLd({ tag, tagTitle, year, archive });

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
          { label: String(year) },
        ]}
      />
      <ArchiveFeedPage
        archive={archive}
        scopeType={ArchiveScopeType.Tag}
        scopeId={tag}
        scopeName={tagTitle}
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

TagYearlyArchivePage.getLayout = getPageLayout;
TagYearlyArchivePage.layoutProps = {
  screenCentered: false,
};

export default TagYearlyArchivePage;

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

  if (!tag || !yearStr) {
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
        scopeType: ArchiveScopeType.Tag,
        scopeId: tag,
        periodType: ArchivePeriodType.Year,
        year,
      }),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Tag,
        scopeId: tag,
        periodType: ArchivePeriodType.Year,
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
      ArchivePeriodType.Year,
    );

    const seoTitles = getPageSeoTitles(`Best ${tagTitle} posts of ${year}`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: getArchiveDescription(
        tagTitle,
        ArchivePeriodType.Year,
        year,
      ),
    };

    return {
      props: {
        tag,
        tagTitle,
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
