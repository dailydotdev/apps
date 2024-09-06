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
    <div className="flex w-full flex-col gap-6 p-5">
      <SquadHorizontalList
        key="featured"
        linkToSeeAll="/squads/discover/featured"
        title={
          <img
            src={cloudinary.squads.directory.featured}
            alt="A text containing the word 'Featured'"
          />
        }
        query={{ isPublic: true, isFeatured: true }}
      />
      {categories.map(({ node }) => (
        <SquadHorizontalList
          key={node.id}
          title={node.title}
          linkToSeeAll={`/squads/discover/${node.id}`}
          query={{
            categoryId: node.id,
            isPublic: true,
            isFeatured: false,
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
