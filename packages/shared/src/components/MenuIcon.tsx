import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from './Icon';
import { IconSize } from './Icon';

interface MenuIconProps extends IconProps {
  Icon: React.ElementType;
}
export const MenuIcon = ({
  className,
  Icon,
  secondary = false,
}: MenuIconProps): ReactElement => {
  return (
    <Icon
      size={IconSize.Small}
      secondary={secondary}
      className={classNames('mr-2 text-2xl', className)}
    />
  );
};
