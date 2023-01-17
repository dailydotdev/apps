import React, { ReactElement } from 'react';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { ModalProps } from './common/Modal';
import {
  Squad,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
} from '../../graphql/squads';
import UserListModal from './UserListModal';
import { checkFetchMore } from '../containers/InfiniteScrolling';

export interface UpvotedPopupModalProps extends ModalProps {
  placeholderAmount?: number;
  squad: Squad;
}

export function SquadMemberModal({
  squad,
  ...props
}: UpvotedPopupModalProps): ReactElement {
  const queryKey = ['squadMembers', squad?.id];
  const queryResult = useInfiniteQuery<SquadEdgesData>(
    queryKey,
    ({ pageParam }) =>
      request(
        `${apiUrl}/graphql`,
        SQUAD_MEMBERS_QUERY,
        { id: squad?.id, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    {
      enabled: !!squad?.id,
      getNextPageParam: (lastPage) =>
        lastPage?.sourceMembers?.pageInfo?.hasNextPage &&
        lastPage?.sourceMembers?.pageInfo?.endCursor,
    },
  );

  return (
    <UserListModal
      {...props}
      title="Squad members"
      scrollingProps={{
        isFetchingNextPage: queryResult.isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage: queryResult.fetchNextPage,
      }}
      users={queryResult.data.pages
        .map((p) => p.sourceMembers.edges.map(({ node }) => node.user))
        .flat()}
    />
  );
}

export default SquadMemberModal;
