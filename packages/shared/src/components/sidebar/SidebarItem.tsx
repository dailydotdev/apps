import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { ClickableNavItem } from './ClickableNavItem';
import type { AuthTriggersType } from '../../lib/auth';
import type { SidebarMenuItem } from './common';
import { ItemInner, NavItem } from './common';
import AuthContext from '../../contexts/AuthContext';
import type { SidebarSectionProps } from './sections/common';
import { SimpleTooltip } from '../tooltips';

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
  const isActive = item.active || item.path === activePage;

  const navItem = (
    <NavItem
      active={isActive}
      ref={item.navItemRef}
      color={item.color}
      disableDefaultBackground={item.disableDefaultBackground}
      className={classNames(
        'mx-1 rounded-10',
        item.itemClassName,
        !shouldShowLabel && 'justify-center',
      )}
    >
      <ClickableNavItem
        item={item}
        showLogin={
          item.requiresLogin && !user
            ? () => showLogin({ trigger: item.title as AuthTriggersType })
            : null
        }
        isButton={isItemsButton && !item?.isForcedLink}
      >
        <ItemInner
          item={item}
          shouldShowLabel={shouldShowLabel}
          active={isActive}
        />
      </ClickableNavItem>
    </NavItem>
  );

  if (shouldShowLabel) {
    return navItem;
  }

  return (
    <SimpleTooltip content={item.title} placement="right" {...item.tooltip}>
      {navItem}
    </SimpleTooltip>
  );
};
