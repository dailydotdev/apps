import React, { ReactElement, ReactNode } from 'react';
import { Alerts } from '../../graphql/alerts';
import { AlertColor, AlertDot } from '../AlertDot';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';
import { SectionCommonProps } from './Section';

interface MyFeedButtonProps extends SectionCommonProps {
  isButton?: boolean;
  alerts: Alerts;
  icon: ReactNode;
  onNavTabClick?: (page: string) => void;
}

export function MyFeedButton({
  sidebarExpanded,
  shouldShowLabel,
  activePage,
  isButton,
  alerts,
  icon,
  onNavTabClick,
}: MyFeedButtonProps): ReactElement {
  const myFeedMenuItem: SidebarMenuItem = {
    icon,
    title: 'My feed',
    path: '/my-feed',
    alert: (alerts.filter || alerts.myFeed) && !sidebarExpanded && (
      <AlertDot className="right-2.5 top-0" color={AlertColor.Success} />
    ),
    action: () => onNavTabClick?.('my-feed'),
    showActiveAsH1: true,
  };
  const isActive = activePage === myFeedMenuItem.path;

  return (
    <NavItem className="mt-0 laptop:mb-5 laptop:mt-2" active={isActive}>
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
