import type { ReactElement } from 'react';
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
import { FollowButton } from '../../../contentPreference/FollowButton';
import type { LoggedUser } from '../../../../lib/user';
import { ButtonVariant } from '../../../buttons/Button';

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
      additionalContent={(listedUser) => (
        <FollowButton
          alwaysShow
          feedId={feed.id}
          entityId={listedUser.id}
          type={ContentPreferenceType.User}
          status={(listedUser as LoggedUser).contentPreference?.status}
          entityName={`@${listedUser.username}`}
          origin={Origin.FollowFilter}
          showSubscribe={false}
          copyType={CopyType.Custom}
          variant={ButtonVariant.Primary}
        />
      )}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      userInfoProps={{
        rel: anchorDefaultRel,
        target: '_blank',
      }}
    />
  );
};
