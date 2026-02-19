import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';

export const BoldIcon = ({ className, ...props }: IconProps): ReactElement => (
  <Icon
    {...props}
    className={classNames('translate-x-0.5', className)}
    IconPrimary={OutlinedIcon}
    IconSecondary={OutlinedIcon}
  />
);
