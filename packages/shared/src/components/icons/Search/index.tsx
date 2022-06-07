import React from 'react';
import Icon, { Size } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
  size?: Size;
};

const SearchIcon: React.VFC<Props> = ({ filled = false, size = 'medium' }) => (
  <Icon
    filled={filled}
    size={size}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default SearchIcon;
