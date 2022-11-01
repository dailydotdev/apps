import React, { ReactElement, ReactNode } from 'react';

export type ModalBodyProps = {
  children?: ReactNode;
};

export function ModalBody({ children }: ModalBodyProps): ReactElement {
  return <div>{children}</div>;
}
