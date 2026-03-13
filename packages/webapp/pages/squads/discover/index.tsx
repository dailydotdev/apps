import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadsDirectoryFeed } from '@dailydotdev/shared/src/components/cards/squad/SquadsDirectoryFeed';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultOpenGraph } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Explore all Squads');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Browse and join Squads on daily.dev. Connect with fellow developers, share knowledge, and dive into specific topics of interest in your favorite Squads.',
};

const sourceIcon = <SourceIcon secondary size={IconSize.Large} />;

const getSquadsSchemas = (
  categories: Array<{ node: { id: string; title: string } }>,
): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://app.daily.dev/squads/discover#collection',
        url: 'https://app.daily.dev/squads/discover',
        name: 'Explore all Squads',
        description:
          'Browse and join Squads on daily.dev to connect with developers around shared interests.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://app.daily.dev/squads/discover#items',
        itemListElement: categories.map(({ node }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: node.title,
            url: `https://app.daily.dev/squads/discover/${encodeURIComponent(
              node.id,
            )}`,
          },
        })),
      },
    ],
  });

function SquadDiscoveryPage(): ReactElement {
  const { data, isFetched } = useSquadCategories();
  const isMobile = useViewSize(ViewSize.MobileL);
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];
  const limit = isMobile ? 5 : 20;

  return (
    <SquadDirectoryLayout className="gap-6">
      <Head>
        {categories.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: getSquadsSchemas(categories),
            }}
          />
        )}
      </Head>
      <SquadsDirectoryFeed
        key="featured"
        linkToSeeAll="/squads/discover/featured"
        title={{ copy: 'Featured', icon: sourceIcon }}
        query={{ isPublic: true, featured: true, first: limit }}
        firstItemShouldBeAd
      >
        {isMobile && isFetched && (
          <div className="absolute inset-0 -left-4 -z-1 flex w-[calc(100%+2rem)] bg-gradient-to-t from-overlay-float-cabbage from-10% to-background-default tablet:hidden" />
        )}
      </SquadsDirectoryFeed>
      {categories.map(({ node }) => (
        <SquadsDirectoryFeed
          key={node.id}
          title={{ copy: node.title }}
          linkToSeeAll={`/squads/discover/${node.id}`}
          query={{
            categoryId: node.id,
            isPublic: true,
            first: limit,
            sortByMembersCount: true,
          }}
        />
      ))}
    </SquadDirectoryLayout>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default SquadDiscoveryPage;
