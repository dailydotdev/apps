import React, { ReactElement } from 'react';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadHorizontalList } from '@dailydotdev/shared/src/components/cards/squad/SquadsHorizontalList';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';

function SquadDiscoveryPage(): ReactElement {
  const { data } = useSquadCategories();
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];

  return (
    <div className="relative flex w-full flex-col gap-6 p-5">
      <div className="absolute inset-0 h-[25rem] w-full bg-gradient-to-t from-accent-cabbage-default from-10% to-background-default" />
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
    </div>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = mainFeedLayoutProps;

export default SquadDiscoveryPage;
