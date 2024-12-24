import type { type ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useFeedSettingsEditContext } from '../FeedSettingsEditContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useFollowingQuery } from '../../../../hooks/contentPreference/useFollowingQuery';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import UserList from '../../../profile/UserList';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { Origin } from '../../../../lib/log';
import { CopyType } from '../../../sources/SourceActions/SourceActionsFollow';
import { anchorDefaultRel } from '../../../../lib/strings';

export const FollowingUserList = (): ReactElement => {
  const { user } = useAuthContext();
  const { feed } = useFeedSettingsEditContext();

  const queryResult = useFollowingQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const users = useMemo(() => {
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        acc.push(node.referenceUser);
      });

      return acc;
    }, []);
  }, [data]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <UserList
      users={users}
      emptyPlaceholder={<p>Can&#39;t find any users</p>}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      userInfoProps={{
        origin: Origin.FollowFilter,
        showFollow: true,
        showSubscribe: false,
        copyType: CopyType.Custom,
        feedId: feed.id,
        rel: anchorDefaultRel,
        target: '_blank',
      }}
    />
  );
};
