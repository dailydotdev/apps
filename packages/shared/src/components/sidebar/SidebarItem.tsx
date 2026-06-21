import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { ClickableNavItem } from './ClickableNavItem';
import type { AuthTriggersType } from '../../lib/auth';
import type { SidebarMenuItem } from './common';
import {
  isSidebarItemActive,
  ItemInner,
  NavItem,
  SHORTCUT_DRAG_MIME,
} from './common';
import AuthContext from '../../contexts/AuthContext';
import type { SidebarSectionProps } from './sections/common';
import { SimpleTooltip } from '../tooltips';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

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
  const { isV2 } = useLayoutVariant();
  const isActive =
    !item.disableActiveState &&
    (item.active ||
      (!!item.path && isSidebarItemActive(activePage, item.path)));
  const isCollapsed = !shouldShowLabel;
  // Opt-in per item: only rows that leave the sidebar (e.g. Feed settings,
  // DevCard → /settings) reveal the "open link" icon on hover. Requires
  // `group` on the row.
  const showLinkIconOnHover = !!item.showOpenLinkIcon;

  // v2 only: any row with a path can be dragged into the shortcuts dock to pin
  // it. Uses native drag (the row's anchor is the drag source); the dock reads
  // the payload off dataTransfer. Inert in v1 (draggable stays unset).
  const canPinToDock = isV2 && !!item.path;
  const handleDragStart = canPinToDock
    ? (event: React.DragEvent<HTMLElement>) => {
        event.dataTransfer.setData(
          SHORTCUT_DRAG_MIME,
          JSON.stringify({ title: item.title, path: item.path }),
        );
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.effectAllowed = 'copy';
      }
    : undefined;

  const navItem = (
    <NavItem
      active={isActive}
      ref={item.navItemRef}
      color={item.color}
      disableDefaultBackground={item.disableDefaultBackground}
      draggable={canPinToDock}
      onDragStart={handleDragStart}
      className={classNames(
        isV2 ? 'mx-3 rounded-10' : 'mx-1 rounded-10',
        // Named group so the open-link icon reveals on hovering this row only
        // (the SidebarAside also carries an unnamed `group`).
        showLinkIconOnHover && 'group/openLink',
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
      >
        <ItemInner
          item={item}
          shouldShowLabel={shouldShowLabel}
          active={isActive}
          showLinkIconOnHover={showLinkIconOnHover}
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
