import React, { ReactElement, useContext } from 'react';
import { ClickableNavItem } from './ClickableNavItem';
import { AuthTriggersType } from '../../lib/auth';
import { ItemInner, NavItem, type SidebarMenuItem } from './common';
import AuthContext from '../../contexts/AuthContext';
import { SidebarSectionProps } from './sections/common';

type SidebarItemProps = Pick<
  SidebarSectionProps,
  'activePage' | 'isItemsButton' | 'shouldShowLabel'
> & {
  item: SidebarMenuItem;
};

export const SidebarItem = ({
  item,
  activePage,
  isItemsButton,
  shouldShowLabel,
}: SidebarItemProps): ReactElement => {
  const { user, showLogin } = useContext(AuthContext);

  const isActive = (activeItem: SidebarMenuItem) => {
    return activeItem.active || activeItem.path === activePage;
  };

  return (
    <NavItem active={isActive(item)} ref={item.navItemRef}>
      <ClickableNavItem
        item={item}
        showLogin={
          item.requiresLogin && !user
            ? () => showLogin({ trigger: item.title as AuthTriggersType })
            : null
        }
        isButton={isItemsButton && !item?.isForcedLink}
        className="truncate"
      >
        <ItemInner
          item={item}
          shouldShowLabel={shouldShowLabel}
          active={isActive(item)}
        />
      </ClickableNavItem>
    </NavItem>
  );
};
