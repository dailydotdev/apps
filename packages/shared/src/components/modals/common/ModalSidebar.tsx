import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useState } from 'react';
import classed from '../../../lib/classed';
import SidebarList from '../../sidebar/SidebarList';
import type { ModalTabItem } from './types';
import { ModalPropsContext } from './types';
import { ProfileSection } from '../../ProfileMenu/ProfileSection';
import type { IconProps } from '../../Icon';
import { TypographyColor, TypographyType } from '../../typography/Typography';

export type ModalSidebarProps = {
  children?: ReactNode;
  className?: string;
};

export type ModalSidebarListProps = {
  className?: string;
  title: ReactNode;
  defaultOpen?: boolean;
};

export function ModalSidebarList({
  className,
  title,
  defaultOpen = false,
}: ModalSidebarListProps): ReactElement | null {
  const { activeView, tabs, setActiveView, isMobile } =
    useContext(ModalPropsContext);
  const [isNavOpen, setNavOpen] = useState(defaultOpen);

  // open nav if there is no active view
  if (isMobile && isNavOpen !== !activeView) {
    setNavOpen(!activeView);
  }

  if (isMobile) {
    if (!isNavOpen) {
      return null;
    }

    return (
      <nav className={classNames('flex flex-col px-4 pb-6 pt-2', className)}>
        <ProfileSection
          items={(tabs ?? []).map((tab: string | ModalTabItem) => {
            const tabTitle: string = typeof tab === 'string' ? tab : tab.title;
            const options = typeof tab === 'string' ? {} : tab.options;
            const icon = options.icon as ReactElement | undefined;
            return {
              title: tabTitle,
              icon: icon
                ? (props: IconProps) => React.cloneElement(icon, props)
                : undefined,
              onClick: () => setActiveView?.(tabTitle),
              typography: {
                type: TypographyType.Body,
                color: TypographyColor.Secondary,
              },
            };
          })}
        />
      </nav>
    );
  }

  return (
    <nav className={classNames('z-2 bg-background-default', className)}>
      <SidebarList
        className="z-1 pb-6"
        active={activeView ?? ''}
        title={title}
        onItemClick={(tab) => {
          setActiveView?.(tab);
        }}
        items={(tabs ?? []).map((tab: string | ModalTabItem) =>
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
    <div
      className={classNames(
        'flex w-full flex-1 flex-row overflow-y-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}

ModalSidebar.Inner = ModalSidebarInner;
ModalSidebar.List = ModalSidebarList;
