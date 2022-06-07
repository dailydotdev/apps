import React from 'react';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
  className?: string;
};

const DevCardIcon: React.VFC<Props> = ({ filled = false, className }) => (
  <Icon
    filled={filled}
    className={className}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default DevCardIcon;
