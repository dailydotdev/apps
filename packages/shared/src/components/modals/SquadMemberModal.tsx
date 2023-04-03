import React, { ReactElement, useState } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { SourceMember, SourceMemberRole, Squad } from '../../graphql/sources';
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
import { useAuthContext } from '../../contexts/AuthContext';
import { useSquadActions } from '../../hooks/squads/useSquadActions';

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
  const { user: loggedUser } = useAuthContext();
  const [member, setMember] = useState<SourceMember>(null);
  const { onMenuClick } = useContextMenu({ id: 'squad-member-menu-context' });
  const {
    members,
    membersQueryResult: queryResult,
    onUpdateRole,
    verifyPermission,
  } = useSquadActions({
    squad,
    membersQueryParams: { role: roleFilter },
    membersQueryEnabled: true,
  });

  const onReportClick = (e: React.MouseEvent, clickedMember: SourceMember) => {
    setMember(clickedMember);
    onMenuClick(e);
  };

  return (
    <>
      <UserListModal
        {...props}
        title="Squad members"
        tabs={Object.values(SquadMemberTab)}
        header={
          <Modal.Header.Tabs
            onTabClick={(tab) =>
              setRoleFilter(
                tab === SquadMemberTab.BlockedMembers
                  ? SourceMemberRole.Blocked
                  : null,
              )
            }
          />
        }
        scrollingProps={{
          isFetchingNextPage: queryResult.isFetchingNextPage,
          canFetchMore: checkFetchMore(queryResult),
          fetchNextPage: queryResult.fetchNextPage,
        }}
        users={members?.map(({ user }) => user)}
        additionalContent={(user, index) => {
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

          if (loggedUser.id === user.id) return null;

          return (
            <SimpleTooltip content="Member options">
              <Button
                buttonSize={ButtonSize.Small}
                className="m-auto mr-0 btn-tertiary"
                iconOnly
                onClick={(e) => onReportClick(e, members[index])}
                icon={<MenuIcon />}
              />
            </SimpleTooltip>
          );
        }}
        initialItem={<InitialItem squad={squad} />}
      />
      <SquadMemberMenu
        squad={squad}
        member={member}
        onUpdateRole={onUpdateRole}
        verifyPermission={verifyPermission}
      />
    </>
  );
}

export default SquadMemberModal;
