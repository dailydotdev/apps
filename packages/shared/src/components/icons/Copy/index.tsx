import React from 'react';
import Icon, { Size } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
  size?: Size;
};

const CopyIcon: React.VFC<Props> = ({ filled = false, size }) => (
  <Icon
    filled={filled}
    size={size}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default CopyIcon;
