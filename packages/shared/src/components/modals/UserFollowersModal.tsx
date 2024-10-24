import React, { ReactElement } from 'react';
import { ModalProps } from './common/Modal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import UserListModal from './UserListModal';

import {
  useFollowersQuery,
  UseFollowersQueryProps,
} from '../../hooks/contentPreference/useFollowersQuery';
import { FlexCentered } from '../utilities';
import { Origin } from '../../lib/log';

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
      userListProps={{
        emptyPlaceholder: (
          <FlexCentered className="p-10 text-text-tertiary typo-callout">
            No followers found
          </FlexCentered>
        ),
      }}
      origin={Origin.UserFollowersList}
    />
  );
}

export default UserFollowersModal;
