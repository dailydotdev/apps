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
  ArchiveIndexData,
} from '@dailydotdev/shared/src/graphql/archive';
import {
  ARCHIVE_INDEX_QUERY,
  ArchiveRankingType,
  ArchiveScopeType,
  ArchiveSubjectType,
} from '@dailydotdev/shared/src/graphql/archive';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ArchiveIndexPage } from '@dailydotdev/shared/src/components/archive/ArchiveIndexPage';
import { ArchiveBreadcrumbs } from '@dailydotdev/shared/src/components/archive/ArchiveBreadcrumbs';
import { getLayout as getFooterNavBarLayout } from '../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../next-seo';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  tag: string;
  tagTitle: string;
  archives: Archive[];
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  tag: string;
}

const getJsonLd = ({ tag, tagTitle }: PageProps): string => {
  const encodedTag = encodeURIComponent(tag);
  const pageUrl = `${appOrigin}/tags/${encodedTag}/best-of`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best of ${tagTitle} — Archive`,
        description: `Browse the best ${tagTitle} posts by month and year, curated by the daily.dev community.`,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
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
            name: 'Tags',
            item: `${appOrigin}/tags`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tagTitle,
            item: `${appOrigin}/tags/${encodedTag}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Best of',
          },
        ],
      },
    ],
  });
};

const TagArchiveIndexPage = ({
  tag,
  tagTitle,
  archives,
}: PageProps): ReactElement => {
  const encodedTag = encodeURIComponent(tag);
  const jsonLd = getJsonLd({ tag, tagTitle, archives, seo: {} });

  return (
    <PageWrapperLayout>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </Head>
      <ArchiveBreadcrumbs
        items={[
          { label: 'Tags', href: '/tags' },
          { label: tagTitle, href: `/tags/${encodedTag}` },
          { label: 'Best of' },
        ]}
      />
      <ArchiveIndexPage
        archives={archives}
        scopeType={ArchiveScopeType.Tag}
        scopeId={tag}
        scopeName={tagTitle}
      />
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TagArchiveIndexPage.getLayout = getPageLayout;
TagArchiveIndexPage.layoutProps = {
  screenCentered: false,
};

export default TagArchiveIndexPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const tag = params?.tag;

  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }

  try {
    const [keywordResult, indexResult] = await Promise.all([
      gqlClient
        .request<{ keyword: Keyword }>(KEYWORD_QUERY, { value: tag })
        .catch(() => null),
      gqlClient.request<ArchiveIndexData>(ARCHIVE_INDEX_QUERY, {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Tag,
        scopeId: tag,
      }),
    ]);

    const archives = indexResult?.archiveIndex ?? [];
    const tagTitle = keywordResult?.keyword?.flags?.title || tag;

    const seoTitles = getPageSeoTitles(`Best of ${tagTitle} — Archive`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: `Browse the best ${tagTitle} posts by month and year, curated by the daily.dev community.`,
    };

    return {
      props: {
        tag,
        tagTitle,
        archives,
        seo,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
