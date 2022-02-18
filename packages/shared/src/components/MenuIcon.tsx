import React, { ReactElement } from 'react';

export const MenuIcon = ({
  Icon,
}: {
  Icon: React.ElementType;
}): ReactElement => {
  return <Icon className="mr-2 text-2xl" />;
};
