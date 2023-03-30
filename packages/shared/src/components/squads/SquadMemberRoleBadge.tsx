import classNames from 'classnames';
import React, { ReactElement, useMemo } from 'react';
import { Author } from '../../graphql/comments';
import { Source, SourceMemberRole } from '../../graphql/sources';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';

export type SquadMemberRoleBadgeProps = {
  className?: string;
  source?: Source;
  author?: Author;
};

const RoleToIconMap = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Owner]: StarIcon,
};

const SquadMemberRoleBadge = ({
  className,
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
    <span
      className={classNames(
        'flex items-center ml-2 text-cabbage-40 typo-footnote font-bold capitalize',
        className,
      )}
    >
      <RoleIcon secondary className="mx-0.5" />
      {role}
    </span>
  );
};

export default SquadMemberRoleBadge;
