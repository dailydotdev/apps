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
import type { SourceData } from '@dailydotdev/shared/src/graphql/sources';
import {
  SOURCE_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ArchiveIndexPage } from '@dailydotdev/shared/src/components/archive/ArchiveIndexPage';
import { ArchiveBreadcrumbs } from '@dailydotdev/shared/src/components/archive/ArchiveBreadcrumbs';
import { buildBreadcrumbListJsonLd } from '@dailydotdev/shared/src/lib/archive';
import { getLayout as getFooterNavBarLayout } from '../../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../../next-seo';
import { getPageSeoTitles } from '../../../../components/layouts/utils';
import { getAppOrigin } from '../../../../lib/seo';

const appOrigin = getAppOrigin();

interface PageProps {
  sourceId: string;
  sourceName: string;
  archives: Archive[];
  seo: NextSeoProps;
}

interface PageParams extends ParsedUrlQuery {
  source: string;
}

function getJsonLd({
  sourceId,
  sourceName,
}: Pick<PageProps, 'sourceId' | 'sourceName'>): string {
  const encodedSource = encodeURIComponent(sourceId);
  const pageUrl = `${appOrigin}/sources/${encodedSource}/best-of`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best of ${sourceName} — Archive`,
        description: `Browse the best ${sourceName} posts by month and year, curated by the daily.dev community.`,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Sources', item: `${appOrigin}/sources` },
        { name: sourceName, item: `${appOrigin}/sources/${encodedSource}` },
        { name: 'Best of' },
      ]),
    ],
  });
}

const SourceArchiveIndexPage = ({
  sourceId,
  sourceName,
  archives,
}: PageProps): ReactElement => {
  const encodedSource = encodeURIComponent(sourceId);
  const jsonLd = getJsonLd({ sourceId, sourceName });

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
          { label: 'Sources', href: '/sources' },
          { label: sourceName, href: `/sources/${encodedSource}` },
          { label: 'Best of' },
        ]}
      />
      <ArchiveIndexPage
        archives={archives}
        scopeType={ArchiveScopeType.Source}
        scopeId={sourceId}
        scopeName={sourceName}
      />
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SourceArchiveIndexPage.getLayout = getPageLayout;
SourceArchiveIndexPage.layoutProps = {
  screenCentered: false,
};

export default SourceArchiveIndexPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PageParams>): Promise<
  GetStaticPropsResult<PageProps>
> {
  const sourceHandle = params?.source;

  if (!sourceHandle) {
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

    const indexResult = await gqlClient.request<ArchiveIndexData>(
      ARCHIVE_INDEX_QUERY,
      {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Source,
        scopeId: sourceId,
      },
    );

    const archives = indexResult?.archiveIndex ?? [];

    const seoTitles = getPageSeoTitles(`Best of ${source.name} — Archive`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: `Browse the best ${source.name} posts by month and year, curated by the daily.dev community.`,
    };

    return {
      props: {
        sourceId,
        sourceName: source.name,
        archives,
        seo,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
