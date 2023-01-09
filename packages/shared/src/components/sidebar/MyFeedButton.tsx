import React, { ReactElement, ReactNode } from 'react';
import { Alerts } from '../../graphql/alerts';
import { AlertColor, AlertDot } from '../AlertDot';
import { ClickableNavItem } from './ClickableNavItem';
import { ItemInner, NavItem, SidebarMenuItem } from './common';

interface MyFeedButtonProps {
  sidebarRendered?: boolean;
  sidebarExpanded: boolean;
  activePage?: string;
  isButton?: boolean;
  alerts: Alerts;
  icon: ReactNode;
  onNavTabClick?: (page: string) => void;
}

function MyFeedButton({
  sidebarExpanded,
  sidebarRendered,
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
      <AlertDot className="top-0 right-2.5" color={AlertColor.Success} />
    ),
    action: () => onNavTabClick?.('my-feed'),
  };
  const isActive = activePage === myFeedMenuItem.path;

  return (
    <NavItem className="mt-0 laptop:mt-2" active={isActive}>
      <ClickableNavItem item={myFeedMenuItem} isButton={isButton}>
        <ItemInner
          item={myFeedMenuItem}
          sidebarExpanded={sidebarExpanded || sidebarRendered === false}
          active={isActive}
        />
      </ClickableNavItem>
    </NavItem>
  );
}

export default MyFeedButton;
