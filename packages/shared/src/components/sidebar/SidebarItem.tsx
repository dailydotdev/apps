import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { ClickableNavItem } from './ClickableNavItem';
import type { AuthTriggersType } from '../../lib/auth';
import { ItemInner, NavItem } from './common';
import type { type SidebarMenuItem } from './common';
import AuthContext from '../../contexts/AuthContext';
import type { SidebarSectionProps } from './sections/common';

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
    <NavItem active={isActive(item)} ref={item.navItemRef} color={item.color}>
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
