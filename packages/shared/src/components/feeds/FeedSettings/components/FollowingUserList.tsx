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
import type { UserShortProfile } from '../../../../lib/user';
import { ButtonVariant } from '../../../buttons/Button';

export const FollowingUserList = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { feed } = useFeedSettingsEditContext();
  const userId = user?.id;
  const feedId = feed?.id;

  const queryResult = useFollowingQuery({
    id: userId ?? '',
    entity: ContentPreferenceType.User,
    feedId,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const users = useMemo<UserShortProfile[]>(() => {
    return (
      data?.pages.reduce<UserShortProfile[]>((acc, p) => {
        p?.edges.forEach(({ node }) => {
          if (node.referenceUser) {
            acc.push(node.referenceUser);
          }
        });

        return acc;
      }, []) ?? []
    );
  }, [data]);

  if (!userId || !feedId || queryResult.isPending) {
    return null;
  }

  return (
    <UserList
      users={users}
      emptyPlaceholder={<p>Can&#39;t find any users</p>}
      additionalContent={(listedUser) => (
        <FollowButton
          alwaysShow
          feedId={feedId}
          entityId={listedUser.id}
          type={ContentPreferenceType.User}
          status={listedUser.contentPreference?.status}
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
