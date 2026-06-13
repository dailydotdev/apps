import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { ClickableNavItem } from './ClickableNavItem';
import type { AuthTriggersType } from '../../lib/auth';
import type { SidebarMenuItem } from './common';
import { isSidebarItemActive, ItemInner, NavItem } from './common';
import AuthContext from '../../contexts/AuthContext';
import type { SidebarSectionProps } from './sections/common';
import { SimpleTooltip } from '../tooltips';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

type SidebarItemProps = Pick<
  SidebarSectionProps,
  'activePage' | 'isItemsButton' | 'shouldShowLabel' | 'compact'
> & {
  item: SidebarMenuItem;
};

export const SidebarItem = ({
  item,
  activePage,
  isItemsButton,
  shouldShowLabel,
  compact,
}: SidebarItemProps): ReactElement => {
  const { user, showLogin } = useContext(AuthContext);
  const { isV2 } = useLayoutVariant();
  const isActive =
    item.active || (!!item.path && isSidebarItemActive(activePage, item.path));
  const isCollapsed = !shouldShowLabel;

  const navItem = (
    <NavItem
      active={isActive}
      ref={item.navItemRef}
      color={item.color}
      disableDefaultBackground={item.disableDefaultBackground}
      className={classNames(
        isV2 ? 'mx-3 rounded-10' : 'mx-1 rounded-10',
        item.itemClassName,
        isCollapsed && 'justify-center',
      )}
    >
      <ClickableNavItem
        item={item}
        aria-label={isCollapsed ? item.title : undefined}
        showLogin={
          item.requiresLogin && !user
            ? () => showLogin({ trigger: item.title as AuthTriggersType })
            : undefined
        }
        isButton={isItemsButton && !item?.isForcedLink}
        className={compact ? 'laptop:!h-8' : undefined}
      >
        <ItemInner
          item={item}
          shouldShowLabel={shouldShowLabel}
          active={isActive}
          compact={compact}
        />
      </ClickableNavItem>
    </NavItem>
  );

  if (isCollapsed) {
    return (
      <SimpleTooltip content={item.title} placement="right" {...item.tooltip}>
        {navItem}
      </SimpleTooltip>
    );
  }

  return navItem;
};
