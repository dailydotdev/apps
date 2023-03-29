import React, { ReactElement, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import { graphqlUrl } from '../../lib/config';
import { ModalProps } from './common/Modal';
import {
  Squad,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
} from '../../graphql/squads';
import { SourceMemberRole } from '../../graphql/sources';
import UserListModal from './UserListModal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import { Button, ButtonSize } from '../buttons/Button';
import MenuIcon from '../icons/Menu';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberMenu from '../squads/SquadMemberMenu';
import SquadIcon from '../icons/Squad';
import { getSquadMembersUserRole } from '../squads/utils';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { Origin } from '../../lib/analytics';
import { IconSize } from '../Icon';
import LinkIcon from '../icons/Link';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { FlexCentered } from '../utilities';

export interface UpvotedPopupModalProps extends ModalProps {
  placeholderAmount?: number;
  squad: Squad;
}

const InitialItem = ({ squad }: { squad: Squad }) => {
  const { copying, trackAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadMembersList,
  });

  return (
    <button
      type="button"
      disabled={copying}
      className="flex justify-start items-center py-3 px-6 hover:bg-theme-hover"
      onClick={() => {
        trackAndCopyLink();
      }}
    >
      <FlexCentered className="mr-4 w-12 h-12 bg-theme-float rounded-10">
        <LinkIcon size={IconSize.Large} className="text-salt-90" />
      </FlexCentered>
      <p className="text-salt-90 typo-callout">Copy invitation link</p>
    </button>
  );
};

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
        graphqlUrl,
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
        title="Squad members"
        scrollingProps={{
          isFetchingNextPage: queryResult.isFetchingNextPage,
          canFetchMore: checkFetchMore(queryResult),
          fetchNextPage: queryResult.fetchNextPage,
        }}
        users={queryResult.data?.pages
          .map((page) => page.sourceMembers.edges.map(({ node }) => node.user))
          .flat()}
        additionalContent={(user) => {
          const role = getSquadMembersUserRole(queryResult, user);
          if (role === SourceMemberRole.Owner) {
            return (
              <span
                className="flex gap-1 items-center font-bold typo-footnote text-theme-color-cabbage"
                data-testvalue={user.username}
              >
                <SquadIcon secondary /> Owner
              </span>
            );
          }

          return (
            <SimpleTooltip content="Member options">
              <Button
                buttonSize={ButtonSize.Small}
                className="m-auto mr-0 btn-tertiary"
                iconOnly
                onClick={(e) => onReportClick(e, user.id)}
                icon={<MenuIcon />}
              />
            </SimpleTooltip>
          );
        }}
        initialItem={<InitialItem squad={squad} />}
      />
      <SquadMemberMenu squadId={squad?.id} memberId={memberId} />
    </>
  );
}

export default SquadMemberModal;
