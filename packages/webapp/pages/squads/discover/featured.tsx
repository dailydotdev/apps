import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import { InfiniteData } from '@tanstack/react-query';
import { FeedContainer, SquadGrid } from '@dailydotdev/shared/src/components';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import {
  SourcesQueryData,
  useSources,
} from '@dailydotdev/shared/src/hooks/source/useSources';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import { PlaceholderSquadGridList } from '@dailydotdev/shared/src/components/cards/squad/PlaceholderSquadGrid';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';

export type Props = {
  initialData?: InfiniteData<SourcesQueryData<Squad>>;
};

const seo: NextSeoProps = {
  title: getTemplatedTitle('Featured Squads'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  description: `Dive into daily.dev's Featured Squads, showcasing editor's choice and hand-picked communities that highlight the most innovative and engaging groups on the platform. Join the conversation with top developers today.`,
};

const SquadsPage = (): ReactElement => {
  const { result } = useSources<Squad>({
    query: { featured: true, isPublic: true, sortByMembersCount: true },
  });
  const { isInitialLoading } = result;
  const flatSquads =
    result.data?.pages.flatMap((page) => page.sources.edges) ?? [];
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    <SquadDirectoryLayout>
      <NextSeo {...seo} />
      <InfiniteScrolling
        isFetchingNextPage={result.isFetchingNextPage}
        canFetchMore={checkFetchMore(result)}
        fetchNextPage={result.fetchNextPage}
        className="w-full"
      >
        {isTablet ? (
          <FeedContainer>
            {flatSquads?.map(({ node }) => (
              <SquadGrid key={node.id} source={node} />
            ))}
          </FeedContainer>
        ) : (
          <div className="flex flex-col gap-3" role="list">
            {flatSquads.map(({ node }) => (
              <SquadList role="listitem" key={node.id} squad={node} />
            ))}
          </div>
        )}
      </InfiniteScrolling>
      {isInitialLoading && (
        <div className="flex w-full flex-row flex-wrap gap-6">
          <FeedContainer>
            <PlaceholderSquadGridList isFeatured />
          </FeedContainer>
        </div>
      )}
    </SquadDirectoryLayout>
  );
};

SquadsPage.getLayout = getLayout;
SquadsPage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <CustomAuthBanner />,
};

export default SquadsPage;
