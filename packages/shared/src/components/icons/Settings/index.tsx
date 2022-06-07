import React from 'react';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
  className?: string;
};

const SettingsIcon: React.VFC<Props> = ({ filled = false, className }) => (
  <Icon
    filled={filled}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
    className={className}
  />
);

export default SettingsIcon;
