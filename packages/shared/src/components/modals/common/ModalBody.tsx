import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = {
  children?: ReactNode;
};

export function ModalBody({ children }: ModalBodyProps): ReactElement {
  const { kind, size } = useContext(ModalPropsContext);
  const className = classNames(
    kind === ModalKind.FlexibleTop && size === ModalSize.Large && 'mobileL:p-8',
  );
  return (
    <section
      className={classNames(
        'overflow-auto relative w-full h-full shrink max-h-full p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
