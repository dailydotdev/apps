import React, { FunctionComponent, ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { Source, SourceMemberRole } from '../../graphql/sources';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';
import UserBadge from '../UserBadge';
import { IconProps } from '../Icon';

export type SquadMemberRoleBadgeProps = {
  className?: string;
  source?: Source;
  author?: Author;
  iconProps?: IconProps;
};

const RoleToIconMap: Partial<
  Record<SourceMemberRole, FunctionComponent<IconProps>>
> = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Owner]: StarIcon,
};

const SquadMemberRoleBadge = ({
  className,
  author,
  source,
  iconProps,
}: SquadMemberRoleBadgeProps): ReactElement => {
  const { role } = useMemberRoleForSource({ source, user: author });
  const RoleIcon = RoleToIconMap[role];

  if (!RoleIcon) {
    return null;
  }

  const Icon = (props: IconProps) => {
    return <RoleIcon secondary {...props} />;
  };

  return (
    <UserBadge
      className={classNames('text-cabbage-40', className)}
      content={role}
      Icon={Icon}
      iconProps={iconProps}
    />
  );
};

export default SquadMemberRoleBadge;
