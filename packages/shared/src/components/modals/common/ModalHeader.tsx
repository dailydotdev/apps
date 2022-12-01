import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { ModalTabs, ModalTabsProps } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalPropsContext } from './types';

export type ModalHeaderProps = {
  children?: ReactNode;
  title?: string;
};

const ModalHeaderTitle = classed('h3', 'font-bold typo-title3');
const ModalHeaderOuter = classed(
  'header',
  'flex items-center py-4 px-6 w-full h-14',
);

export function ModalHeader({
  children,
  title,
}: ModalHeaderProps): ReactElement {
  const { activeTab, onRequestClose } = useContext(ModalPropsContext);
  const modalTitle = title ?? activeTab;
  return (
    <ModalHeaderOuter
      className={classNames(
        (modalTitle || children) && 'border-b border-theme-divider-tertiary',
      )}
    >
      {children}
      {!!modalTitle && <ModalHeaderTitle>{modalTitle}</ModalHeaderTitle>}
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

export function ModalHeaderTabs(props: ModalTabsProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <ModalHeaderOuter className="border-b border-theme-divider-tertiary">
      <ModalTabs {...props} />
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

ModalHeader.Title = ModalHeaderTitle;
ModalHeader.Tabs = ModalHeaderTabs;
