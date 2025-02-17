import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import FilledIcon from './filled.svg';

export const MarkOkIcon = ({ size, ...rest }: IconProps): ReactElement => (
  <Icon
    {...rest}
    size={size}
    IconPrimary={FilledIcon}
    IconSecondary={FilledIcon}
  />
);
