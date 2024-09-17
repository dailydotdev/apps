import React, { ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FollowersData, RequestQuery } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';

export interface FollowersModalProps extends ModalProps {
  requestQuery: RequestQuery<FollowersData>;
}

export function UserFollowersModal({
  requestQuery: { queryKey, query, params, options = {} },
  children,
  ...props
}: FollowersModalProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const queryResult = useInfiniteQuery<FollowersData>(
    queryKey,
    ({ pageParam }) =>
      requestMethod(
        query,
        { ...params, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    {
      ...options,
      getNextPageParam: (lastPage) =>
        lastPage?.userFollowers?.pageInfo?.hasNextPage &&
        lastPage?.userFollowers?.pageInfo?.endCursor,
    },
  );

  return (
    <UserListModal
      {...props}
      data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
      title="Followers"
      scrollingProps={{
        isFetchingNextPage: queryResult.isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage: queryResult.fetchNextPage,
      }}
      users={queryResult.data?.pages.reduce((acc, p) => {
        p?.userFollowers.edges.forEach(({ node }) => {
          acc.push(node.user);
        });

        return acc;
      }, [])}
    />
  );
}

export default UserFollowersModal;
