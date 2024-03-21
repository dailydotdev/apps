import classNames from 'classnames';
import React, {
  forwardRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import { ModalKind, ModalPropsContext, ModalSize } from './types';

export type ModalBodyProps = JSX.IntrinsicElements['section'] & {
  children?: ReactNode;
  className?: string;
  view?: string;
};

const bigModals = [ModalSize.Large, ModalSize.XLarge];

function ModalBodyComponent(
  { children, className, view, ...props }: ModalBodyProps,
  ref: MutableRefObject<HTMLElement>,
): ReactElement {
  const { activeView, kind, size, isDrawer } = useContext(ModalPropsContext);
  const sectionClassName = classNames(
    'relative flex h-full max-h-full w-full shrink flex-col overflow-auto',
    kind === ModalKind.FlexibleTop && bigModals.includes(size) && 'tablet:p-8',
    isDrawer ? 'p-0' : 'p-4 tablet:p-6',
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
