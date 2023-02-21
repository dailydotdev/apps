import React, { ReactElement } from 'react';
import { Menu, MenuProps } from '@dailydotdev/react-contexify';
import Portal from '../tooltips/Portal';

export default function PortalMenu(props: MenuProps): ReactElement {
  return (
    <Portal>
      <Menu {...props} />
    </Portal>
  );
}
