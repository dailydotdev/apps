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
  const { activeView, kind, size } = useContext(ModalPropsContext);
  const sectionClassName = classNames(
    'relative flex h-full max-h-full w-full shrink flex-col overflow-auto p-6',
    kind === ModalKind.FlexibleTop && bigModals.includes(size) && 'mobileL:p-8',
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
