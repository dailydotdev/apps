import React from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const DevCardIcon: React.VFC<IconProps> = ({ filled = false, className }) => (
  <Icon
    filled={filled}
    className={className}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default DevCardIcon;
