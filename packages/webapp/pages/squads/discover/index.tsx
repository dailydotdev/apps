import React, { ReactElement } from 'react';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadsDirectoryFeed } from '@dailydotdev/shared/src/components/cards/squad/SquadsDirectoryFeed';
import { NextSeo } from 'next-seo';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { NextSeoProps } from 'next-seo/lib/types';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultOpenGraph } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Explore all Squads'),
  openGraph: { ...defaultOpenGraph },
  description:
    'Browse and join Squads on daily.dev. Connect with fellow developers, share knowledge, and dive into specific topics of interest in your favorite Squads.',
};

const sourceIcon = <SourceIcon secondary size={IconSize.Large} />;

function SquadDiscoveryPage(): ReactElement {
  const { data, isFetched } = useSquadCategories();
  const isMobile = useViewSize(ViewSize.MobileL);
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];
  const limit = isMobile ? 5 : 20;

  return (
    <SquadDirectoryLayout className="gap-6">
      <NextSeo {...seo} />
      <SquadsDirectoryFeed
        key="featured"
        linkToSeeAll="/squads/discover/featured"
        title={{ copy: 'Featured', icon: sourceIcon }}
        query={{ isPublic: true, featured: true, first: limit }}
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
SquadDiscoveryPage.layoutProps = mainFeedLayoutProps;

export default SquadDiscoveryPage;
