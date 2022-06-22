import React, { ReactElement } from 'react';

export const MenuIcon = ({
  Icon,
  filled = false,
}: {
  Icon: React.ElementType;
  filled?: boolean;
}): ReactElement => {
  return <Icon size="medium" filled={filled} className="mr-2 text-2xl" />;
};
