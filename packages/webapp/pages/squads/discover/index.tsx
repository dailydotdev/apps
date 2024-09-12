import React, { ReactElement } from 'react';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadsDirectoryFeed } from '@dailydotdev/shared/src/components/cards/squad/SquadsDirectoryFeed';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { NextSeo } from 'next-seo';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

function SquadDiscoveryPage(): ReactElement {
  const { data } = useSquadCategories();
  const isMobile = useViewSize(ViewSize.MobileL);
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];
  const limit = isMobile ? 5 : 20;

  return (
    <SquadDirectoryLayout className="gap-6">
      <NextSeo
        {...defaultSeo}
        title="Squads Directory"
        description="Explore the daily.dev Squads Directory and connect with communities of developers passionate about various technologies and topics. Discover, join, and engage with like-minded professionals in your area of interest."
      />
      <SquadsDirectoryFeed
        key="featured"
        linkToSeeAll="/squads/discover/featured"
        title={
          <img
            className="h-12"
            src={cloudinary.squads.directory.featured}
            alt="A text containing the word 'Featured'"
          />
        }
        query={{ isPublic: true, featured: true, first: limit }}
      >
        <div className="absolute inset-0 -left-4 -z-1 flex w-[calc(100%+2rem)] bg-gradient-to-t from-overlay-float-cabbage from-10% to-background-default tablet:hidden" />
      </SquadsDirectoryFeed>
      {categories.map(({ node }) => (
        <SquadsDirectoryFeed
          key={node.id}
          title={node.title}
          linkToSeeAll={`/squads/discover/${node.id}`}
          query={{
            categoryId: node.id,
            isPublic: true,
            featured: false,
            first: limit,
          }}
        />
      ))}
    </SquadDirectoryLayout>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = mainFeedLayoutProps;

export default SquadDiscoveryPage;
