import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import classed from '../../../lib/classed';
import SidebarList from '../../sidebar/SidebarList';
import { ModalPropsContext, ModalTabItem } from './types';

export type ModalSidebarProps = {
  children?: ReactNode;
  className?: string;
};

export type ModalSidebarListProps = {
  className?: string;
  title: string;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  onViewChange?: (view: string) => void;
};

export function ModalSidebarList({
  className,
  isNavOpen,
  onViewChange,
  setIsNavOpen,
  title,
}: ModalSidebarListProps): ReactElement {
  const { activeView, tabs, setActiveView } = useContext(ModalPropsContext);
  return (
    <nav className={classNames('bg-theme-bg-primary z-2', className)}>
      <SidebarList
        className="z-1 pb-6"
        active={activeView}
        title={title}
        onItemClick={(tab) => {
          setActiveView(tab);
          onViewChange?.(tab);
        }}
        items={tabs.map((tab: string | ModalTabItem) =>
          typeof tab === 'string'
            ? { title: tab, icon: <></> }
            : { title: tab.title, ...tab.options },
        )}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
    </nav>
  );
}

export const ModalSidebarInner = classed(
  'div',
  'flex flex-1 flex-col border-l border-theme-divider-tertiary',
);

export function ModalSidebar({
  children,
  className,
}: ModalSidebarProps): ReactElement {
  return (
    <div className={classNames('flex flex-row w-full h-full', className)}>
      {children}
    </div>
  );
}

ModalSidebar.Inner = ModalSidebarInner;
ModalSidebar.List = ModalSidebarList;
