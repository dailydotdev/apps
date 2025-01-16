import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useFeedSettingsEditContext } from '../FeedSettingsEditContext';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../../graphql/contentPreference';
import UserList from '../../../profile/UserList';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { Origin } from '../../../../lib/log';
import { CopyType } from '../../../sources/SourceActions/SourceActionsFollow';
import { useBlockedQuery } from '../../../../hooks/contentPreference/useBlockedQuery';
import { anchorDefaultRel } from '../../../../lib/strings';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { useContentPreference } from '../../../../hooks/contentPreference/useContentPreference';

type BlockedUserListProps = {
  searchQuery?: string;
};

export const BlockedUserList = ({
  searchQuery,
}: BlockedUserListProps): ReactElement => {
  const { block, unblock } = useContentPreference();
  const { feed } = useFeedSettingsEditContext();

  const queryResult = useBlockedQuery({
    entity: ContentPreferenceType.User,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const users = useMemo(() => {
    // If search query provided, filter sources by search query
    const regex = new RegExp(searchQuery, 'i');
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        if (searchQuery?.length > 0 && !regex.test(node.referenceUser.name)) {
          return;
        }
        acc.push(node.referenceUser);
      });

      return acc;
    }, []);
  }, [data, searchQuery]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <UserList
      users={users}
      emptyPlaceholder={<p>You haven&#39;t blocked any users yet.</p>}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      additionalContent={(user) => (
        <Button
          onClick={(e) => {
            e.preventDefault();
            if (
              user.contentPreference.status === ContentPreferenceStatus.Blocked
            ) {
              unblock({
                id: user.id,
                entity: ContentPreferenceType.User,
                entityName: user.name,
                feedId: feed.id,
              });
            } else {
              block({
                id: user.id,
                entity: ContentPreferenceType.User,
                entityName: user.name,
                feedId: feed.id,
              });
            }
          }}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          {user.contentPreference.status === ContentPreferenceStatus.Blocked
            ? 'Unblock'
            : 'Block'}
        </Button>
      )}
      userInfoProps={{
        origin: Origin.BlockedFilter,
        showFollow: false,
        showSubscribe: false,
        copyType: CopyType.Custom,
        feedId: feed.id,
        rel: anchorDefaultRel,
        target: '_blank',
      }}
    />
  );
};
