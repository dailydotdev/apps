import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import { ModalPropsContext } from './types';
import { Justify } from '../../utilities';

export type ModalFooterProps = {
  children?: ReactNode;
  className?: string;
  justify?: Justify;
  tab?: string;
};

export function ModalFooter({
  children,
  className,
  justify = Justify.End,
  tab,
}: ModalFooterProps): ReactElement {
  const { activeTab } = useContext(ModalPropsContext);
  if (tab && tab !== activeTab) return null;
  return (
    <footer
      className={classNames(
        'flex gap-3 items-center p-3 w-full h-16 border-t border-theme-divider-tertiary',
        justify,
        className,
      )}
    >
      {children}
    </footer>
  );
}
