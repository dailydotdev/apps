import React, { ReactElement, ReactNode } from 'react';
import { ModalClose } from './ModalClose';
import { ModalPropsContext } from './types';

export type ModalHeaderProps = {
  title?: ReactNode;
};

export function ModalHeader({ title }: ModalHeaderProps): ReactElement {
  return (
    <header className="flex justify-between items-center py-4 px-6 w-full h-14 border-b border-theme-divider-tertiary">
      {!!title && <h3 className="font-bold typo-title3">{title}</h3>}
      <ModalPropsContext.Consumer>
        {({ onRequestClose }) => <ModalClose onClick={onRequestClose} />}
      </ModalPropsContext.Consumer>
    </header>
  );
}
