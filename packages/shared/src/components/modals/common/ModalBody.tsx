import classNames from 'classnames';
import React, { forwardRef, ReactElement, ReactNode, useContext } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = JSX.IntrinsicElements['section'] & {
  children?: ReactNode;
  className?: string;
  view?: string;
};

function ModalBodyComponent({
  children,
  className,
  view,
  ...props
}: ModalBodyProps): ReactElement {
  const { activeView, kind, size } = useContext(ModalPropsContext);
  const sectionClassName = classNames(
    'overflow-auto relative w-full h-full shrink max-h-full p-6',
    kind === ModalKind.FlexibleTop && size === ModalSize.Large && 'mobileL:p-8',
    className,
  );
  if (view && view !== activeView) return null;
  return (
    <section className={sectionClassName} {...props}>
      {children}
    </section>
  );
}

export const ModalBody = forwardRef(ModalBodyComponent);
