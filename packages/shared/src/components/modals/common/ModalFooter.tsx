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
  const { activeView, isDrawer } = useContext(ModalPropsContext);
  if ((view && view !== activeView) || isDrawer) {
    return null;
  }
  return (
    <footer
      className={classNames(
        'flex h-16 w-full items-center gap-3 border-t border-theme-divider-tertiary p-3',
        justify,
        className,
      )}
    >
      {children}
    </footer>
  );
}
