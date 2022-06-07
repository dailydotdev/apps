import React from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const UserIcon: React.VFC<IconProps> = ({
  filled = false,
  size,
  className,
}) => (
  <Icon
    filled={filled}
    size={size}
    className={className}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default UserIcon;
