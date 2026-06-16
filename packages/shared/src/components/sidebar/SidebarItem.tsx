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
        // eslint-disable-next-line no-nested-ternary
        compact && isCollapsed
          ? // Collapsed rail: a centered square button (1:1) in the w-14 rail.
            'mx-auto size-8 rounded-10'
          : // eslint-disable-next-line no-nested-ternary
          compact
          ? 'mx-2 rounded-8'
          : isV2
          ? 'mx-3 rounded-10'
          : 'mx-1 rounded-10',
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
        className={classNames(
          // Collapsed rail: fill the square + center the icon (override the
          // row's height + label padding). Otherwise compact = 28px rows.
          compact && isCollapsed
            ? 'laptop:!size-8 laptop:!justify-center laptop:!p-0'
            : compact && 'laptop:!h-7',
        )}
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
