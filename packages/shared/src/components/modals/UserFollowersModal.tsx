import React, { ReactElement } from 'react';
import { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';

import {
  useFollowersQuery,
  UseFollowersQueryProps,
} from '../../hooks/contentPreference/useFollowersQuery';

export interface FollowersModalProps extends ModalProps {
  queryProps: UseFollowersQueryProps;
}

export function UserFollowersModal({
  queryProps,
  children,
  ...props
}: FollowersModalProps): ReactElement {
  const queryResult = useFollowersQuery(queryProps);
  const { data, isFetchingNextPage, fetchNextPage } = queryResult;

  return (
    <UserListModal
      {...props}
      title="Followers"
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      users={data?.pages.reduce((acc, p) => {
        p?.edges.forEach(({ node }) => {
          acc.push(node.user);
        });

        return acc;
      }, [])}
    />
  );
}

export default UserFollowersModal;
