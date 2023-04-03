import React, { FunctionComponent, ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { Source, SourceMemberRole } from '../../graphql/sources';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';
import UserBadge from '../UserBadge';
import { IconProps } from '../Icon';

export type SquadMemberRoleBadgeProps = {
  source?: Source;
  author?: Author;
};

const RoleToIconMap: Partial<
  Record<SourceMemberRole, FunctionComponent<IconProps>>
> = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Owner]: StarIcon,
};

const SquadMemberRoleBadge = ({
  author,
  source,
}: SquadMemberRoleBadgeProps): ReactElement => {
  const { role } = useMemberRoleForSource({ source, user: author });
  const RoleIcon = RoleToIconMap[role];

  if (!RoleIcon) {
    return null;
  }

  return (
    <UserBadge
      className="text-cabbage-40"
      content={role}
      icon={<RoleIcon secondary className="mx-0.5" />}
    />
  );
};

export default SquadMemberRoleBadge;
