import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
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
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { ArchiveIndexPage } from '@dailydotdev/shared/src/components/archive/ArchiveIndexPage';
import { ArchiveBreadcrumbs } from '@dailydotdev/shared/src/components/archive/ArchiveBreadcrumbs';
import { buildBreadcrumbListJsonLd } from '@dailydotdev/shared/src/lib/archive';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { getAppOrigin } from '../../../lib/seo';

const appOrigin = getAppOrigin();
const scopeName = 'daily.dev';

interface PageProps {
  archives: Archive[];
  seo: NextSeoProps;
}

function getJsonLd(): string {
  const pageUrl = `${appOrigin}/posts/best-of`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: `Best of ${scopeName} — Archive`,
        description: `Browse the best developer posts by month and year, curated by the ${scopeName} community.`,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      buildBreadcrumbListJsonLd([
        { name: 'Home', item: appOrigin },
        { name: 'Explore', item: `${appOrigin}/posts` },
        { name: 'Best of' },
      ]),
    ],
  });
}

const GlobalArchiveIndexPage = ({ archives }: PageProps): ReactElement => {
  const jsonLd = getJsonLd();

  return (
    <PageWrapperLayout>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </Head>
      <ArchiveBreadcrumbs
        items={[{ label: 'Explore', href: '/posts' }, { label: 'Best of' }]}
      />
      <ArchiveIndexPage
        archives={archives}
        scopeType={ArchiveScopeType.Global}
        scopeName={scopeName}
      />
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GlobalArchiveIndexPage.getLayout = getPageLayout;
GlobalArchiveIndexPage.layoutProps = {
  screenCentered: false,
};

export default GlobalArchiveIndexPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<PageProps>
> {
  try {
    const indexResult = await gqlClient.request<ArchiveIndexData>(
      ARCHIVE_INDEX_QUERY,
      {
        subjectType: ArchiveSubjectType.Post,
        rankingType: ArchiveRankingType.Best,
        scopeType: ArchiveScopeType.Global,
      },
    );

    const archives = indexResult?.archiveIndex ?? [];

    const seoTitles = getPageSeoTitles(`Best of ${scopeName} — Archive`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
      description: `Browse the best developer posts by month and year, curated by the ${scopeName} community.`,
    };

    return {
      props: {
        archives,
        seo,
      },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true, revalidate: 3600 };
  }
}
