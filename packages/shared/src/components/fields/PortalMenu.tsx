import React, { ReactElement, ReactNode } from 'react';
import { Menu, MenuProps } from 'react-contexify';
import { createPortal } from 'react-dom';

function Portal({ children }: { children: ReactNode }): ReactElement {
  return createPortal(children, document.body);
}

export function PortalMenu(props: MenuProps): ReactElement {
  return (
    <Portal>
      <Menu {...props} />
    </Portal>
  );
}
