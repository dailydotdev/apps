import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext, useState } from 'react';
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
  defaultOpen?: boolean;
};

export function ModalSidebarList({
  className,
  title,
  defaultOpen = false,
}: ModalSidebarListProps): ReactElement {
  const { activeView, tabs, setActiveView, isMobile } =
    useContext(ModalPropsContext);
  const [isNavOpen, setNavOpen] = useState(defaultOpen);

  // open nav if there is no active view
  if (isMobile && isNavOpen !== !activeView) {
    setNavOpen(!activeView);
  }

  return (
    <nav className={classNames('z-2 bg-background-default', className)}>
      <SidebarList
        className="z-1 pb-6"
        active={activeView}
        title={title}
        onItemClick={(tab) => {
          setActiveView(tab);
        }}
        items={tabs.map((tab: string | ModalTabItem) =>
          typeof tab === 'string'
            ? { title: tab, icon: <></> }
            : { title: tab.title, ...tab.options },
        )}
        isOpen={isNavOpen}
      />
    </nav>
  );
}

export const ModalSidebarInner = classed(
  'div',
  'flex flex-1 flex-col tablet:border-l tablet:border-border-subtlest-tertiary',
);

export function ModalSidebar({
  children,
  className,
}: ModalSidebarProps): ReactElement {
  return (
    <div className={classNames('flex h-full w-full flex-row', className)}>
      {children}
    </div>
  );
}

ModalSidebar.Inner = ModalSidebarInner;
ModalSidebar.List = ModalSidebarList;
