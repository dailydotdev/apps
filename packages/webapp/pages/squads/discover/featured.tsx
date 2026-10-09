import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { checkFetchMore } from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import type { InfiniteData } from '@tanstack/react-query';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import type { SourcesQueryData } from '@dailydotdev/shared/src/hooks/source/useSources';
import {
  useSources,
  getFlatteredSources,
} from '@dailydotdev/shared/src/hooks/source/useSources';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import { SquadDiscoverListPage } from '@dailydotdev/shared/src/features/squads/components/discover/SquadDiscoverListPage';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import { defaultOpenGraph } from '../../../next-seo';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';

export type Props = {
  initialData?: InfiniteData<SourcesQueryData<Squad>>;
};

const seoTitles = getPageSeoTitles('Explore the featured Squads');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description: `Explore daily.dev’s featured Squads, handpicked by our editors. Join the best developer communities and engage in top discussions today.`,
};

const SquadsPage = (): ReactElement => {
  const { result } = useSources<Squad>({
    query: { featured: true, isPublic: true, sortByMembersCount: true },
  });

  return (
    <SquadDirectoryLayout>
      <SquadDiscoverListPage
        slot="featured_tab"
        squads={getFlatteredSources(result)}
        isLoading={result.isPending}
        fetchNextPage={result.fetchNextPage}
        canFetchMore={checkFetchMore(result)}
        isFetchingNextPage={result.isFetchingNextPage}
      />
    </SquadDirectoryLayout>
  );
};

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <CustomAuthBanner />,
  seo,
};

export default SquadsPage;
