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
import { useSidebarDragState } from './useSidebarDragState';

// Build a drag image that matches the dock's add-ghost chip exactly (a solid
// chip with a 1px dashed brand border + the row's own icon), so dragging a
// panel row into the shortcuts area looks the same as dragging a catalogue icon
// within the dock. Appended off-screen just long enough for the browser to
// snapshot it during dragstart, then removed.
const buildDockDragImage = (iconEl: Element): HTMLElement => {
  const chip = document.createElement('div');
  chip.className =
    'flex size-10 items-center justify-center rounded-12 border border-dashed border-accent-cabbage-default bg-background-default text-text-primary shadow-3';
  chip.style.position = 'fixed';
  chip.style.top = '-1000px';
  chip.style.left = '-1000px';
  chip.style.pointerEvents = 'none';
  chip.appendChild(iconEl.cloneNode(true));
  document.body.appendChild(chip);
  return chip;
};

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
  const { setDragging } = useSidebarDragState();
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
        const iconEl = event.currentTarget.querySelector('span');
        // Capture the row's image (squad/source logo) so the pinned shortcut
        // shows it instantly instead of re-fetching and flashing a placeholder.
        const image =
          iconEl?.querySelector('img')?.getAttribute('src') ?? undefined;
        event.dataTransfer.setData(
          SHORTCUT_DRAG_MIME,
          JSON.stringify({ title: item.title, path: item.path, image }),
        );
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.effectAllowed = 'copy';
        // Drag with the same chip the dock uses (dashed brand border + the
        // row's own squad logo / source / tag glyph) under the cursor, instead
        // of the browser's default text-row snapshot.
        if (iconEl) {
          const chip = buildDockDragImage(iconEl);
          event.dataTransfer.setDragImage(chip, 20, 20);
          window.setTimeout(() => chip.remove(), 0);
        }
        setDragging(true);
      }
    : undefined;
  const handleDragEnd = canPinToDock ? () => setDragging(false) : undefined;

  const navItem = (
    <NavItem
      active={isActive}
      ref={item.navItemRef}
      color={item.color}
      disableDefaultBackground={item.disableDefaultBackground}
      draggable={canPinToDock}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
