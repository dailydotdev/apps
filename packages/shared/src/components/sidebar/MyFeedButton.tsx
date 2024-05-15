import React, { ReactElement, ReactNode } from 'react';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';
import { SectionCommonProps } from './Section';

interface MyFeedButtonProps extends SectionCommonProps {
  className?: string;
  isButton?: boolean;
  icon?: ReactNode;
  onNavTabClick?: (page: string) => void;
  title: string;
  path: string;
  alert?: ReactElement;
}

export function MyFeedButton({
  className,
  shouldShowLabel,
  activePage,
  isButton,
  icon,
  title,
  path,
  alert,
  onNavTabClick,
}: MyFeedButtonProps): ReactElement {
  const myFeedMenuItem: SidebarMenuItem = {
    icon,
    title,
    path,
    alert,
    action: () => onNavTabClick?.(path),
  };
  const isActive = activePage === myFeedMenuItem.path;

  return (
    <NavItem className={className} active={isActive}>
      <ClickableNavItem item={myFeedMenuItem} isButton={isButton}>
        <ItemInner
          item={myFeedMenuItem}
          shouldShowLabel={shouldShowLabel}
          active={isActive}
        />
      </ClickableNavItem>
    </NavItem>
  );
}
