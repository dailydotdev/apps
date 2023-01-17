import React, { ReactElement, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { ModalProps } from './common/Modal';
import {
  Squad,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
  SquadMemberRole,
} from '../../graphql/squads';
import UserListModal from './UserListModal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import { ModalSize } from './common/types';
import { Button } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberMenu from '../squads/SquadMemberMenu';
import SquadIcon from '../icons/Squad';

export interface UpvotedPopupModalProps extends ModalProps {
  placeholderAmount?: number;
  squad: Squad;
}

export function SquadMemberModal({
  squad,
  ...props
}: UpvotedPopupModalProps): ReactElement {
  const [memberId, setMemberId] = useState('');
  const { onMenuClick } = useContextMenu({ id: 'squad-member-menu-context' });
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

  const onReportClick = (e, userId) => {
    setMemberId(userId);
    onMenuClick(e);
  };

  return (
    <>
      <UserListModal
        {...props}
        size={ModalSize.Medium}
        title="Squad members"
        scrollingProps={{
          isFetchingNextPage: queryResult.isFetchingNextPage,
          canFetchMore: checkFetchMore(queryResult),
          fetchNextPage: queryResult.fetchNextPage,
        }}
        users={queryResult.data?.pages
          .map((p) => p.sourceMembers.edges.map(({ node }) => node.user))
          .flat()}
        additionalContent={(user) => {
          const role = queryResult.data?.pages
            .map((p) =>
              p.sourceMembers.edges.filter(
                ({ node }) => node.user.id === user.id,
              ),
            )
            .flat()?.[0].node.role;
          if (role === SquadMemberRole.Owner) {
            return (
              <span className="flex gap-1 items-center font-bold typo-footnote text-theme-color-cabbage">
                <SquadIcon secondary /> Owner
              </span>
            );
          }

          return (
            <Button
              buttonSize="small"
              className="m-auto mr-0 btn-tertiary"
              iconOnly
              onClick={(e) => onReportClick(e, user.id)}
              icon={<MenuIcon />}
            />
          );
        }}
      />
      <SquadMemberMenu squadId={squad?.id} memberId={memberId} />
    </>
  );
}

export default SquadMemberModal;
