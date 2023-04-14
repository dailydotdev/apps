import React, { ReactElement, useState } from 'react';
import { Modal, ModalProps } from './common/Modal';
import {
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '../../graphql/sources';
import UserListModal from './UserListModal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberMenu from '../squads/SquadMemberMenu';
import { Origin } from '../../lib/analytics';
import { IconSize } from '../Icon';
import LinkIcon from '../icons/Link';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { FlexCentered } from '../utilities';
import { useSquadActions } from '../../hooks/squads/useSquadActions';
import SquadMemberItemAdditionalContent from '../squads/SquadMemberItemAdditionalContent';
import BlockIcon from '../icons/Block';
import { verifyPermission } from '../../graphql/squads';

enum SquadMemberTab {
  AllMembers = 'Squad members',
  BlockedMembers = 'Blocked members',
}

export interface SquadMemberModalProps extends ModalProps {
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
}: SquadMemberModalProps): ReactElement {
  const [roleFilter, setRoleFilter] = useState<SourceMemberRole>(null);
  const [member, setMember] = useState<SourceMember>(null);
  const { onMenuClick } = useContextMenu({ id: 'squad-member-menu-context' });
  const {
    members,
    membersQueryResult: queryResult,
    onUnblock,
    onUpdateRole,
  } = useSquadActions({
    squad,
    membersQueryParams: { role: roleFilter },
    membersQueryEnabled: true,
  });

  const onOptionsClick = (e: React.MouseEvent, clickedMember: SourceMember) => {
    setMember(clickedMember);
    onMenuClick(e);
  };

  return (
    <>
      <UserListModal
        {...props}
        kind={Modal.Kind.FixedCenter}
        title="Squad members"
        tabs={Object.values(SquadMemberTab)}
        header={
          verifyPermission(squad, SourcePermissions.ViewBlockedMembers) ? (
            <Modal.Header.Tabs
              onTabClick={(tab) =>
                setRoleFilter(
                  tab === SquadMemberTab.BlockedMembers
                    ? SourceMemberRole.Blocked
                    : null,
                )
              }
            />
          ) : null
        }
        scrollingProps={{
          isFetchingNextPage: queryResult.isFetchingNextPage,
          canFetchMore: checkFetchMore(queryResult),
          fetchNextPage: queryResult.fetchNextPage,
        }}
        userListProps={{
          additionalContent: (user, index) => (
            <SquadMemberItemAdditionalContent
              member={members[index]}
              onUnblock={() =>
                onUnblock({ sourceId: squad.id, memberId: user.id })
              }
              onOptionsClick={(e) => onOptionsClick(e, members[index])}
            />
          ),
          emptyPlaceholder: (
            <FlexCentered className="flex-col h-full">
              <BlockIcon secondary size={IconSize.XXXLarge} />
              <p className="text-theme-label-secondary typo-body">
                No blocked members found
              </p>
            </FlexCentered>
          ),
          isLoading: queryResult.isLoading,
          initialItem:
            roleFilter === SourceMemberRole.Blocked ? undefined : (
              <InitialItem squad={squad} />
            ),
        }}
        users={members?.map(({ user }) => user)}
      />
      <SquadMemberMenu
        squad={squad}
        member={member}
        onUpdateRole={onUpdateRole}
      />
    </>
  );
}

export default SquadMemberModal;
