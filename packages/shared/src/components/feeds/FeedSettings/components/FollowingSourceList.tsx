import React, { type ReactElement, useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useFollowingQuery } from '../../../../hooks/contentPreference/useFollowingQuery';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { SourceList } from '../../../profile/SourceList';
import { SourceType } from '../../../../graphql/sources';

type FollowingSourceListProps = {
  type?: SourceType;
};
export const FollowingSourceList = ({
  type = SourceType.Machine,
}: FollowingSourceListProps): ReactElement => {
  const { user } = useAuthContext();
  const { feed } = useContext(FeedSettingsEditContext);

  const queryResult = useFollowingQuery({
    id: user.id,
    entity: ContentPreferenceType.Source,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const sources = useMemo(() => {
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        if (type && node.source.type === type) {
          acc.push(node.source);
        }
      });

      return acc;
    }, []);
  }, [data, type]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <SourceList
      sources={sources}
      emptyPlaceholder={<p>Can&#39;t find any sources</p>}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
    />
  );
};
