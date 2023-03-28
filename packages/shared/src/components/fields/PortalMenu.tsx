import React, { ReactElement } from 'react';
import { Menu, MenuProps } from '@dailydotdev/react-contexify';
import Portal, { PortalProps } from '../tooltips/Portal';

export default function PortalMenu({
  appendTo,
  ...props
}: MenuProps & PortalProps): ReactElement {
  return (
    <Portal appendTo={appendTo}>
      <Menu {...props} />
    </Portal>
  );
}
