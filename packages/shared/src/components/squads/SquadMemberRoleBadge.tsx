import React, { ReactElement, useMemo } from 'react';
import { Author } from '../../graphql/comments';
import { Source, SourceMemberRole } from '../../graphql/sources';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';
import UserBadge from '../UserBadge';

export type SquadMemberRoleBadgeProps = {
  source?: Source;
  author?: Author;
};

const RoleToIconMap = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Owner]: StarIcon,
};

const SquadMemberRoleBadge = ({
  author,
  source,
}: SquadMemberRoleBadgeProps): ReactElement => {
  const role = useMemo(() => {
    return source?.privilegedMembers?.find(
      (member) => member.user.id === author?.id,
    )?.role;
  }, [author, source]);
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
