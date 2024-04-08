import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { ModalPropsContext } from './types';
import { Justify } from '../../utilities';

export type ModalFooterProps = {
  children?: ReactNode;
  className?: string;
  justify?: Justify;
  view?: string;
};

export function ModalFooter({
  children,
  className,
  justify = Justify.End,
  view,
}: ModalFooterProps): ReactElement {
  const { activeView, isDrawer, isForm } = useContext(ModalPropsContext);

  if (isForm || isDrawer) {
    return null;
  }

  if (view && view !== activeView) {
    return null;
  }

  return (
    <footer
      className={classNames(
        'flex h-16 w-full items-center gap-3 border-t border-border-subtlest-tertiary p-3',
        justify,
        className,
      )}
    >
      {children}
    </footer>
  );
}
