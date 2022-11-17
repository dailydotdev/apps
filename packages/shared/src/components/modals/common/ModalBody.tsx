import classNames from 'classnames';
import React, { forwardRef, ReactElement, ReactNode, useContext } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = JSX.IntrinsicElements['section'] & {
  children?: ReactNode;
  className?: string;
  tab?: string;
};

function ModalBodyComponent({
  children,
  className,
  tab,
  ...props
}: ModalBodyProps): ReactElement {
  const { activeTab, kind, size } = useContext(ModalPropsContext);
  const sectionClassName = classNames(
    'overflow-auto relative w-full h-full shrink max-h-full p-6',
    kind === ModalKind.FlexibleTop && size === ModalSize.Large && 'mobileL:p-8',
    className,
  );
  if (tab && tab !== activeTab) return null;
  return (
    <section className={sectionClassName} {...props}>
      {children}
    </section>
  );
}

export const ModalBody = forwardRef(ModalBodyComponent);
