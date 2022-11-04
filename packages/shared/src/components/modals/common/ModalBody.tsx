import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = {
  children?: ReactNode;
};

export function ModalBody({ children }: ModalBodyProps): ReactElement {
  return (
    <ModalPropsContext.Consumer>
      {({ kind, size }) => (
        <section
          className={classNames(
            'overflow-auto relative w-full h-full shrink max-h-full',
            kind === ModalKind.FlexibleTop && size === ModalSize.Large
              ? 'p-8'
              : 'p-6',
          )}
        >
          {children}
        </section>
      )}
    </ModalPropsContext.Consumer>
  );
}
