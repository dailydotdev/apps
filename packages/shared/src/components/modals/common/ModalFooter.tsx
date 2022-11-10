import React, { ReactElement, ReactNode } from 'react';

export type ModalFooterProps = {
  children?: ReactNode;
};

export function ModalFooter({ children }: ModalFooterProps): ReactElement {
  return (
    <footer className="flex gap-3 justify-end items-center py-4 px-2 w-full h-14 border-t border-theme-divider-tertiary">
      {children}
    </footer>
  );
}
