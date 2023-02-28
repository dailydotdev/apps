import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { ClickableNavItem } from './ClickableNavItem';
import {
  ItemInner,
  ItemInnerProps,
  NavHeader,
  NavItem,
  NavSection,
  SidebarMenuItem,
} from './common';

export interface SectionCommonProps
  extends Pick<ItemInnerProps, 'shouldShowLabel'> {
  sidebarExpanded: boolean;
  sidebarRendered: boolean;
  activePage: string;
  className?: string;
}

interface SectionProps extends SectionCommonProps {
  title?: string;
  items: SidebarMenuItem[];
  isItemsButton: boolean;
}

export function Section({
  title,
  items,
  sidebarExpanded,
  sidebarRendered,
  shouldShowLabel,
  activePage,
  isItemsButton,
  className,
}: SectionProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);

  const mobileItemsFilter = (item: SidebarMenuItem) =>
    (sidebarRendered === false && !item.hideOnMobile) || sidebarRendered;

  const isActive = (item: SidebarMenuItem) => {
    return item.active || item.path === activePage;
  };

  return (
    <NavSection className={className}>
      {title && (
        <NavHeader
          className={classNames(
            'hidden laptop:block',
            sidebarExpanded ? 'opacity-100 px-3' : 'opacity-0 px-0',
          )}
        >
          {title}
        </NavHeader>
      )}
      {items.filter(mobileItemsFilter).map((item) => (
        <NavItem key={item.title} active={isActive(item)} ref={item.navItemRef}>
          <ClickableNavItem
            item={item}
            showLogin={
              item.requiresLogin && !user ? () => showLogin(item.title) : null
            }
            isButton={isItemsButton}
          >
            <ItemInner
              item={item}
              shouldShowLabel={shouldShowLabel}
              active={isActive(item)}
            />
          </ClickableNavItem>
        </NavItem>
      ))}
    </NavSection>
  );
}
