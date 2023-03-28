import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { SquadMember, SquadMemberRole } from '../../graphql/squads';
import StarIcon from '../icons/Start';
import UserIcon from '../icons/User';

export type SquadMemberRoleBadgeProps = {
  className?: string;
  member: SquadMember;
};

const RoleToIconMap = {
  [SquadMemberRole.Moderator]: UserIcon,
  [SquadMemberRole.Owner]: StarIcon,
};

const SquadMemberRoleBadge = ({
  className,
  member,
}: SquadMemberRoleBadgeProps): ReactElement => {
  const RoleIcon = RoleToIconMap[member.role];

  if (!RoleIcon) {
    return null;
  }

  return (
    <span
      className={classNames(
        'flex items-center ml-2 text-cabbage-40 typo-footnote font-bold capitalize',
        className,
      )}
    >
      <RoleIcon secondary className="mx-0.5" />
      {member.role}
    </span>
  );
};

export default SquadMemberRoleBadge;
