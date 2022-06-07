import React from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const SettingsIcon: React.VFC<IconProps> = ({ filled = false, className }) => (
  <Icon
    filled={filled}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
    className={className}
  />
);

export default SettingsIcon;
