import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { IconProps, IconSize } from './Icon';

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
