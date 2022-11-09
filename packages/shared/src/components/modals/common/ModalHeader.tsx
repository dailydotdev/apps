import React, { ReactElement, ReactNode, useContext } from 'react';
import classed from '../../../lib/classed';
import { ModalClose } from './ModalClose';
import { ModalPropsContext } from './types';
import classNames from 'classnames';

export type ModalHeaderProps = {
  children?: ReactNode;
  title?: string;
};

const ModalHeaderTitle = classed('h3', 'font-bold typo-title3');

export function ModalHeader({
  children,
  title,
}: ModalHeaderProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <header className={classNames(
      'flex justify-between items-center py-4 px-6 w-full h-14',
      (title || tabs || children) && 'border-b border-theme-divider-tertiary'
    )}>
      {!!title && <ModalHeaderTitle>{title}</ModalHeaderTitle>}
      {children}
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </header>
  );
}

ModalHeader.Title = ModalHeaderTitle;
