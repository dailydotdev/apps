import React, { ReactElement } from 'react';
import { ModalProps } from './common/Modal';
import UserListModal from './UserListModal';
import {
  useFollowingQuery,
  UseFollowingQueryProps,
} from '../../hooks/contentPreference/useFollowingQuery';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import { FlexCentered } from '../utilities';

export interface UserFollowingModalProps extends ModalProps {
  queryProps: UseFollowingQueryProps;
}

export function UserFollowingModal({
  queryProps,
  children,
  ...props
}: UserFollowingModalProps): ReactElement {
  const queryResult = useFollowingQuery(queryProps);
  const { data, isFetchingNextPage, fetchNextPage } = queryResult;

  return (
    <UserListModal
      {...props}
      title="Following"
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
            No following found
          </FlexCentered>
        ),
      }}
    />
  );
}

export default UserFollowingModal;
