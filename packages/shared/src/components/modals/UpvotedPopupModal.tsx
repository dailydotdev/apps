import React, { ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { RequestQuery, UpvotesData } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';

export interface UpvotedPopupModalProps extends ModalProps {
  placeholderAmount: number;
  requestQuery: RequestQuery<UpvotesData>;
}

export function UpvotedPopupModal({
  requestQuery: { queryKey, query, params, options = {} },
  children,
  ...props
}: UpvotedPopupModalProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const queryResult = useInfiniteQuery<UpvotesData>(
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
        lastPage?.upvotes?.pageInfo?.hasNextPage &&
        lastPage?.upvotes?.pageInfo?.endCursor,
    },
  );

  return (
    <UserListModal
      {...props}
      data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
      title="Upvoted by"
      scrollingProps={{
        isFetchingNextPage: queryResult.isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage: queryResult.fetchNextPage,
      }}
      users={queryResult.data?.pages.reduce((acc, p) => {
        p?.upvotes.edges.forEach(({ node }) => {
          acc.push(node.user);
        });

        return acc;
      }, [])}
    />
  );
}

export default UpvotedPopupModal;
