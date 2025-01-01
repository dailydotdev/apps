import type { ReactElement } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import type { RequestQuery, UpvotesData } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import type { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';
import { Origin } from '../../lib/log';
import { useUsersContentPreferenceMutationSubscription } from '../../hooks/contentPreference/useUsersContentPreferenceMutationSubscription';
import { getNextPageParam } from '../../lib/query';

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
  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      requestMethod(
        query,
        { ...params, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    initialPageParam: '',
    ...options,
    getNextPageParam: ({ upvotes }) => getNextPageParam(upvotes?.pageInfo),
  });

  useUsersContentPreferenceMutationSubscription({
    queryKey,
    queryProp: 'upvotes',
  });

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
      origin={Origin.UserUpvotesList}
    />
  );
}

export default UpvotedPopupModal;
