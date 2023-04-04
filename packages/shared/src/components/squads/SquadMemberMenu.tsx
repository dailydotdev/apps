import React, { ReactElement, useContext, useMemo } from 'react';
import AuthContext from '../../contexts/AuthContext';
import FlagIcon from '../icons/Flag';
import { reportSquadMember } from '../../lib/constants';
import { IconSize } from '../Icon';
import {
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '../../graphql/sources';
import BlockIcon from '../icons/Block';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';
import SquadIcon from '../icons/Squad';
import { usePrompt } from '../../hooks/usePrompt';
import { UserShortInfo } from '../profile/UserShortInfo';
import { ModalSize } from '../modals/common/types';
import { ContextMenu, ContextMenuItemProps } from '../fields/PortalMenu';
import { UseSquadActions } from '../../hooks/squads/useSquadActions';
import { verifyPermission } from '../../graphql/squads';

interface SquadMemberMenuProps extends Pick<UseSquadActions, 'onUpdateRole'> {
  squad: Squad;
  member: SourceMember;
}

enum MenuItemTitle {
  AddAsOwner = 'Add as co-owner',
  PromoteToModerator = 'Promote to moderator',
  DemoteToModerator = 'Demote to moderator',
  DemoteToMember = 'Demote to member',
  RemoveMember = 'Remove member',
}

const promptDescription: Record<
  MenuItemTitle,
  (memberName: string, squadName: string) => string
> = {
  [MenuItemTitle.AddAsOwner]: (memberName, squadName) =>
    `${memberName} will get the same permissions as you have. Adding as co-owner will not replace you as the owner of ${squadName}.`,
  [MenuItemTitle.PromoteToModerator]: (memberName) =>
    `${memberName} will now get moderator permissions and be able to remove posts and members form your Squad. You can reverse this decision later.`,
  [MenuItemTitle.DemoteToModerator]: (memberName) =>
    `${memberName} will no longer have owner permissions. You can always reverse this decision later.`,
  [MenuItemTitle.DemoteToMember]: (memberName) =>
    `${memberName} will lose the moderator permissions and become a regular member.`,
  [MenuItemTitle.RemoveMember]: (memberName, squadName) =>
    `${memberName} will be a Blocked members and will no longer have access to ${squadName}. They will not be able to rejoin unless you unblock them.`,
};

type UpdateRoleFn = (
  role: SourceMemberRole,
  title: MenuItemTitle,
) => Promise<void>;

const getUpdateRoleOptions = (
  member: SourceMember,
  getUpdateRoleFn: (
    role: SourceMemberRole,
    title: MenuItemTitle,
  ) => UpdateRoleFn,
): ContextMenuItemProps[] => {
  const promoteToOwner = {
    text: MenuItemTitle.AddAsOwner,
    icon: <StarIcon size={IconSize.Small} />,
    action: getUpdateRoleFn(SourceMemberRole.Owner, MenuItemTitle.AddAsOwner),
  };
  const promoteToModerator = {
    text: MenuItemTitle.PromoteToModerator,
    icon: <UserIcon size={IconSize.Small} />,
    action: getUpdateRoleFn(
      SourceMemberRole.Moderator,
      MenuItemTitle.PromoteToModerator,
    ),
  };
  const demoteToModerator = {
    text: MenuItemTitle.DemoteToModerator,
    icon: <BlockIcon size={IconSize.Small} />,
    action: getUpdateRoleFn(
      SourceMemberRole.Moderator,
      MenuItemTitle.DemoteToModerator,
    ),
  };
  const demoteToMember = {
    text: MenuItemTitle.DemoteToMember,
    icon: <SquadIcon size={IconSize.Small} />,
    action: getUpdateRoleFn(
      SourceMemberRole.Member,
      MenuItemTitle.DemoteToMember,
    ),
  };

  if (member.role === SourceMemberRole.Owner) {
    return [demoteToModerator, demoteToMember];
  }

  if (member.role === SourceMemberRole.Moderator) {
    return [promoteToOwner, demoteToMember];
  }

  return [promoteToOwner, promoteToModerator];
};

export default function SquadMemberMenu({
  squad,
  member,
  onUpdateRole,
}: SquadMemberMenuProps): ReactElement {
  const { user } = useContext(AuthContext);
  const { showPrompt } = usePrompt();
  const onUpdateMember = async (
    role: SourceMemberRole,
    title: MenuItemTitle,
  ) => {
    const hasConfirmed = await showPrompt({
      title: `${title}?`,
      description: promptDescription[title](member.user.name, squad.name),
      okButton: { title, className: 'btn-primary-cabbage' },
      content: <UserShortInfo user={member.user} />,
      promptSize: ModalSize.Small,
      className: { buttons: 'mt-6' },
    });

    if (hasConfirmed) {
      await onUpdateRole({
        sourceId: squad.id,
        memberId: member.user.id,
        role,
      });
    }
  };

  const options: ContextMenuItemProps[] = useMemo(() => {
    if (!member) return [];

    const getUpdateRoleFn =
      (role: SourceMemberRole, title: MenuItemTitle) => () =>
        onUpdateMember(role, title);
    const menu: ContextMenuItemProps[] = [];
    const canUpdateRole = verifyPermission(
      squad,
      SourcePermissions.MemberRoleUpdate,
    );

    if (canUpdateRole) {
      const memberOptions = getUpdateRoleOptions(member, getUpdateRoleFn);
      menu.push(...memberOptions);
    }

    menu.push({
      text: 'Report member',
      icon: <FlagIcon size={IconSize.Small} />,
      anchorProps: {
        href: `${reportSquadMember}#user_id=${user.id}&reportee_id=${member?.user.id}&squad_id=${squad.id}`,
        className: 'flex items-center w-full',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    });

    const canRemoveMember =
      canUpdateRole || verifyPermission(squad, SourcePermissions.MemberRemove);

    if (canRemoveMember) {
      menu.push({
        text: MenuItemTitle.RemoveMember,
        icon: <BlockIcon size={IconSize.Small} />,
        action: getUpdateRoleFn(
          SourceMemberRole.Blocked,
          MenuItemTitle.RemoveMember,
        ),
      });
    }

    return menu;
  }, [member]);

  return <ContextMenu options={options} id="squad-member-menu-context" />;
}
