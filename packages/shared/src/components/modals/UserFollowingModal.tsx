import React, { ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FollowingData, RequestQuery } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';

export interface UserFollowingModalProps extends ModalProps {
  requestQuery: RequestQuery<FollowingData>;
}

export function UserFollowingModal({
  requestQuery: { queryKey, query, params, options = {} },
  children,
  ...props
}: UserFollowingModalProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const queryResult = useInfiniteQuery<FollowingData>(
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
        lastPage?.userFollowing?.pageInfo?.hasNextPage &&
        lastPage?.userFollowing?.pageInfo?.endCursor,
    },
  );

  return (
    <UserListModal
      {...props}
      data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
      title="Following"
      scrollingProps={{
        isFetchingNextPage: queryResult.isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage: queryResult.fetchNextPage,
      }}
      users={queryResult.data?.pages.reduce((acc, p) => {
        p?.userFollowing.edges.forEach(({ node }) => {
          acc.push(node.user);
        });

        return acc;
      }, [])}
    />
  );
}

export default UserFollowingModal;
