import React from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const HotIcon: React.VFC<IconProps> = ({ filled = false }) => (
  <Icon filled={filled} IconOutlined={OutlinedIcon} IconFilled={FilledIcon} />
);

export default HotIcon;
