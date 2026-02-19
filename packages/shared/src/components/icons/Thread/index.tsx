import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import DefaultOutlinedIcon from './default.svg';
import DefaultFilledIcon from './defaultFilled.svg';
import OpenOutlinedIcon from './open.svg';
import OpenFilledIcon from './openFilled.svg';

interface ThreadIconProps extends IconProps {
  open?: boolean;
}

export const ThreadIcon = ({
  open = false,
  ...props
}: ThreadIconProps): ReactElement => (
  <Icon
    {...props}
    IconPrimary={open ? OpenOutlinedIcon : DefaultOutlinedIcon}
    IconSecondary={open ? OpenFilledIcon : DefaultFilledIcon}
  />
);
