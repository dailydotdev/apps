import React, { ReactElement, ReactNode, useContext } from 'react';
import classed from '../../../lib/classed';
import { ModalTabs } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalPropsContext } from './types';

export type ModalHeaderProps = {
  children?: ReactNode;
  title?: string;
};

const ModalHeaderTitle = classed('h3', 'font-bold typo-title3');

export function ModalHeader({
  children,
  title,
}: ModalHeaderProps): ReactElement {
  const { onRequestClose, tabs } = useContext(ModalPropsContext);
  return (
    <header className="flex justify-between items-center py-4 px-6 w-full h-14 border-b border-theme-divider-tertiary">
      {!!title && <ModalHeaderTitle>{title}</ModalHeaderTitle>}
      {tabs && <ModalTabs />}
      {children}
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </header>
  );
}

ModalHeader.Title = ModalHeaderTitle;
