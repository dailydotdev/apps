import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const SearchIcon = ({ size = 'medium', ...rest }: IconProps): ReactElement => (
  <Icon
    {...rest}
    size={size}
    IconOutlined={OutlinedIcon}
    IconFilled={FilledIcon}
  />
);

export default SearchIcon;
