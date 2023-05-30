import React, { FunctionComponent, ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { Source, SourceMemberRole } from '../../graphql/sources';
import StarIcon from '../icons/Star';
import UserIcon from '../icons/User';
import UserBadge from '../UserBadge';
import { IconProps } from '../Icon';

interface SquadMemberBadgeProps {
  role: SourceMemberRole;
  className?: string;
  iconProps?: IconProps;
}

export interface SquadMemberAuthorBadgeProps
  extends Pick<SquadMemberBadgeProps, 'className' | 'iconProps'> {
  source?: Source;
  author?: Author;
}

const RoleToIconMap: Partial<
  Record<SourceMemberRole, FunctionComponent<IconProps>>
> = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Admin]: StarIcon,
};

const SquadMemberBadge = ({
  role,
  className,
  iconProps,
}: SquadMemberBadgeProps): ReactElement => {
  const RoleIcon = RoleToIconMap[role];

  if (!RoleIcon) {
    return null;
  }

  const Icon = (props: IconProps) => {
    return <RoleIcon secondary {...props} />;
  };

  return (
    <UserBadge
      className={classNames('text-theme-color-cabbage', className)}
      content={role}
      Icon={Icon}
      iconProps={iconProps}
    />
  );
};

export default SquadMemberBadge;
