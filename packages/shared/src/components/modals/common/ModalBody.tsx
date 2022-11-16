import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = JSX.IntrinsicElements['section'] & {
  children?: ReactNode;
  tab?: string;
};

export function ModalBody({ children, tab }: ModalBodyProps): ReactElement {
  const { activeTab, kind, size } = useContext(ModalPropsContext);
  const className = classNames(
    'overflow-auto relative w-full h-full shrink max-h-full p-6',
    kind === ModalKind.FlexibleTop && size === ModalSize.Large && 'mobileL:p-8',
  );
  if (tab && tab !== activeTab) return null;
  return <section className={className}>{children}</section>;
}
