import React, { ReactElement, ReactNode } from 'react';

export type ModalHeaderProps = {
  title?: ReactNode;
};

export function ModalHeader({ title }: ModalHeaderProps): ReactElement {
  return <span>{title}</span>;
}
