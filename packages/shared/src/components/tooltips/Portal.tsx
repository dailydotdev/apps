import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  appendTo?: Document | HTMLElement | (() => HTMLElement);
}

function Portal({
  children,
  appendTo = document.body,
}: PortalProps): ReturnType<typeof createPortal> {
  return createPortal(
    children,
    typeof appendTo === 'function' ? appendTo() : appendTo,
  );
}

export default Portal;
