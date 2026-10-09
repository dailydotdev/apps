import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useFollowingQuery } from '../../../../hooks/contentPreference/useFollowingQuery';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { SourceList } from '../../../profile/SourceList';
import type { Source } from '../../../../graphql/sources';
import { SourceType } from '../../../../graphql/sources';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../charm/CharmEmptyState';
import { cloudinaryCharmEmptySquads } from '../../../../lib/image';

type FollowingSourceListProps = {
  type?: SourceType;
};
export const FollowingSourceList = ({
  type = SourceType.Machine,
}: FollowingSourceListProps): ReactElement => {
  const { user } = useAuthContext();
  const { feed } = useContext(FeedSettingsEditContext);

  const queryResult = useFollowingQuery({
    id: user?.id ?? '',
    entity: ContentPreferenceType.Source,
    feedId: feed?.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const sources = useMemo(() => {
    return (
      data?.pages.reduce<Source[]>((acc, p) => {
        p?.edges.forEach(({ node }) => {
          if (node.source && type && node.source.type === type) {
            acc.push({ ...node.source, contentPreference: node });
          }
        });

        return acc;
      }, []) ?? []
    );
  }, [data, type]);

  return (
    <SourceList
      sources={sources}
      isLoading={queryResult.isPending}
      placeholderAmount={8}
      emptyPlaceholder={
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Page}
          image={cloudinaryCharmEmptySquads}
          imageAlt="daily.dev charm waiting for sources"
          title="No sources yet"
          description="Sources you follow are listed here."
        />
      }
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
    />
  );
};
