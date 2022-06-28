import React, { ReactElement } from 'react';
import { IconProps } from './Icon';

interface MenuIconProps extends IconProps {
  Icon: React.ElementType;
}
export const MenuIcon = ({
  Icon,
  showSecondary = false,
}: MenuIconProps): ReactElement => {
  return (
    <Icon
      size="medium"
      showSecondary={showSecondary}
      className="mr-2 text-2xl"
    />
  );
};
