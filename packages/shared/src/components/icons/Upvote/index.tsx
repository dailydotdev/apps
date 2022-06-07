import React from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const UpvoteIcon: React.VFC<IconProps> = ({ filled = false, size }) => (
  <Icon
    filled={filled}
    size={size}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default UpvoteIcon;
