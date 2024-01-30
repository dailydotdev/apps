import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';
import OutlinedIcon from './outlined.svg';

export const ChecklistAIcon = ({ size, ...rest }: IconProps): ReactElement => (
  <Icon
    {...rest}
    size={size}
    IconPrimary={FilledIcon}
    IconSecondary={OutlinedIcon}
  />
);
