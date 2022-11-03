import React, { ReactElement, ReactNode } from 'react';

export type ModalSidebarProps = {
  children?: ReactNode;
};
export function ModalSidebar({ children }: ModalSidebarProps): ReactElement {
  return <div>{children}</div>;
}
