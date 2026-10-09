import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { FeaturedSquads } from '@dailydotdev/shared/src/features/squads/components/discover/FeaturedSquads';
import {
  PopularSquads,
  SquadTopicTiles,
} from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverSections';
import { usePromotedSquad } from '@dailydotdev/shared/src/features/squads/components/discover/usePromotedSquad';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { defaultOpenGraph } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Explore all Squads');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Browse and join Squads on daily.dev. Connect with fellow developers, share knowledge, and dive into specific topics of interest in your favorite Squads.',
};

const getSquadsSchemas = (
  categories: Array<{ node: { id: string; title: string } }>,
): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://daily.dev/squads/discover#collection',
        url: 'https://daily.dev/squads/discover',
        name: 'Explore all Squads',
        description:
          'Browse and join Squads on daily.dev to connect with developers around shared interests.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://daily.dev/squads/discover#items',
        itemListElement: categories.map(({ node }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: node.title,
            url: `https://daily.dev/squads/discover/${encodeURIComponent(
              node.id,
            )}`,
          },
        })),
      },
    ],
  });

function SquadDiscoveryPage(): ReactElement {
  const { data } = useSquadCategories();
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];
  const featuredPromoted = usePromotedSquad({ slot: 'featured' });
  const popularPromoted = usePromotedSquad({
    slot: 'popular',
    excludeId: featuredPromoted.squad?.id,
  });

  return (
    <SquadDirectoryLayout className="gap-8 px-4 pb-10 pt-5 laptop:px-6 laptop:pt-6">
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
      <FeaturedSquads promoted={featuredPromoted} />
      <PopularSquads
        promoted={{
          ...popularPromoted,
          // Both campaigns are known before either list commits to them.
          isLoading: popularPromoted.isLoading || featuredPromoted.isLoading,
        }}
        excludeIds={[featuredPromoted.squad?.id]}
      />
      {categories.length > 0 && (
        <SquadTopicTiles categories={categories.map(({ node }) => node)} />
      )}
    </SquadDirectoryLayout>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default SquadDiscoveryPage;
