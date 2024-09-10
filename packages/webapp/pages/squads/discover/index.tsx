import React, { ReactElement } from 'react';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadHorizontalList } from '@dailydotdev/shared/src/components/cards/squad/SquadsHorizontalList';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { NextSeo } from 'next-seo';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

function SquadDiscoveryPage(): ReactElement {
  const { data } = useSquadCategories();
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];

  return (
    <SquadDirectoryLayout className="gap-6 ">
      <NextSeo
        {...defaultSeo}
        title="Squads Directory"
        description="Explore the daily.dev Squads Directory and connect with communities of developers passionate about various technologies and topics. Discover, join, and engage with like-minded professionals in your area of interest."
      />
      <SquadHorizontalList
        key="featured"
        className="relative"
        linkToSeeAll="/squads/discover/featured"
        title={
          <img
            className="h-12"
            src={cloudinary.squads.directory.featured}
            alt="A text containing the word 'Featured'"
          />
        }
        query={{ isPublic: true, featured: true }}
      />
      {categories.map(({ node }) => (
        <SquadHorizontalList
          key={node.id}
          title={node.title}
          linkToSeeAll={`/squads/discover/${node.id}`}
          query={{
            categoryId: node.id,
            isPublic: true,
            featured: false,
            first: 20,
          }}
        />
      ))}
    </SquadDirectoryLayout>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = mainFeedLayoutProps;

export default SquadDiscoveryPage;
