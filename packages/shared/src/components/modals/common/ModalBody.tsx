import React, { ReactElement, ReactNode } from 'react';

export type ModalBodyProps = {
  children?: ReactNode;
};

export function ModalBody({ children }: ModalBodyProps): ReactElement {
  return (
    <section className="overflow-auto relative w-full h-full shrink max-h-full">
      {children}
    </section>
  );
}
