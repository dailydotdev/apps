import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef, useContext } from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = JSX.IntrinsicElements['section'] & {
  children?: ReactNode;
  className?: string;
  view?: string;
};

const bigModals = [ModalSize.Large, ModalSize.XLarge];

function ModalBodyComponent(
  { children, className, view, ...props }: ModalBodyProps,
  ref: React.Ref<HTMLElement>,
): ReactElement | null {
  const { activeView, kind, size, isDrawer } = useContext(ModalPropsContext);
  const sectionClassName = classNames(
    'relative flex w-full shrink flex-col',
    !isDrawer && 'h-full max-h-full overflow-auto',
    kind === ModalKind.FlexibleTop && bigModals.includes(size) && 'tablet:p-8',
    // Inside a sheet the panel is the one scroller, so the sheet's pinned
    // rows, its drag and its growth all read the same scroll position.
    isDrawer ? 'h-auto max-h-none overflow-visible p-0' : 'p-4 tablet:p-6',
    className,
  );
  if (view && view !== activeView) {
    return null;
  }
  return (
    <section className={sectionClassName} {...props} ref={ref}>
      {children}
    </section>
  );
}

export const ModalBody = forwardRef(ModalBodyComponent);
