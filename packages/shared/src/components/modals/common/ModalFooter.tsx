import React, { ReactElement, ReactNode } from 'react';

export type ModalFooterProps = {
  children?: ReactNode;
};

export function ModalFooter({ children }: ModalFooterProps): ReactElement {
  return <footer>{children}</footer>;
}
