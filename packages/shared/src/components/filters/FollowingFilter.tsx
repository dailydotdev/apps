import React, { type ReactElement } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import UserList from '../profile/UserList';
import { useFollowingQuery } from '../../hooks/contentPreference/useFollowingQuery';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { FlexCentered } from '../utilities';
import { checkFetchMore } from '../containers/InfiniteScrolling';

export const FollowingFilter = (): ReactElement => {
  const { user } = useAuthContext();
  const queryResult = useFollowingQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
  });
  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const users = data?.pages.reduce((acc, p) => {
    p?.edges.forEach(({ node }) => {
      acc.push(node.referenceUser);
    });

    return acc;
  }, []);

  return (
    <UserList
      users={users}
      emptyPlaceholder={
        <FlexCentered className="p-10 text-text-tertiary typo-callout">
          No following found
        </FlexCentered>
      }
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
    />
  );
};
