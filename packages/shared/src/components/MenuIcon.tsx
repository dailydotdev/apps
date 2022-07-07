import React, { ReactElement } from 'react';
import { IconProps } from './Icon';

interface MenuIconProps extends IconProps {
  Icon: React.ElementType;
}
export const MenuIcon = ({
  Icon,
  secondary = false,
}: MenuIconProps): ReactElement => {
  return <Icon size="medium" secondary={secondary} className="mr-2 text-2xl" />;
};
