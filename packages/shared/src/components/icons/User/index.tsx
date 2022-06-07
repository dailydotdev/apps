import React from 'react';
import Icon, { Size } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
  size?: Size;
  className: string;
};

const UserIcon: React.VFC<Props> = ({ filled = false, size, className }) => (
  <Icon
    filled={filled}
    size={size}
    className={className}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default UserIcon;
