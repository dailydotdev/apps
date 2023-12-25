import React, { FunctionComponent, ReactElement } from 'react';
import classNames from 'classnames';
import { SourceMemberRole } from '../../graphql/sources';
import { StarIcon, UserIcon } from '../icons';
import UserBadge from '../UserBadge';
import { IconProps } from '../Icon';

interface SquadMemberBadgeProps {
  role: SourceMemberRole;
  className?: string;
  iconProps?: IconProps;
  removeMargins?: boolean;
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
  removeMargins,
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
      removeMargins={removeMargins}
    />
  );
};

export default SquadMemberBadge;
