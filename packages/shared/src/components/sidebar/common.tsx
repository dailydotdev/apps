import type {
  ReactNode,
  ReactElement,
  HTMLAttributeAnchorTarget,
  MutableRefObject,
} from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { OpenLinkIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';

// Drag payload used when a v2 sidebar panel row is dragged into the shortcuts
// dock to pin it. Carried on the native dataTransfer under this MIME type.
export const SHORTCUT_DRAG_MIME = 'application/x-dailydev-shortcut';
export interface ShortcutDragData {
  title: string;
  path: string;
}

export interface SidebarMenuItem {
  icon: ((active: boolean) => ReactElement) | ReactNode;
  title: string;
  titleClassName?: string;
  itemClassName?: string;
  rightIcon?: (active: boolean) => ReactElement;
  path?: string;
  onClick?: () => unknown;
  target?: HTMLAttributeAnchorTarget | undefined;
  isForcedLink?: boolean;
  action?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => unknown;
  alert?: ReactElement;
  active?: boolean;
  hideOnMobile?: boolean;
  requiresLogin?: boolean;
  tooltip?: TooltipProps;
  navItemRef?: MutableRefObject<HTMLElement>;
  color?: string;
  disableDefaultBackground?: boolean;
  // Skip the path-based active highlight (e.g. Recent rows, which mirror pages
  // you're already on and shouldn't read as the selected nav item).
  disableActiveState?: boolean;
  // Reveal an "open link" icon on hover — only for rows that leave the sidebar
  // (e.g. Feed settings, DevCard → /settings). Opt-in, not for in-panel feeds.
  showOpenLinkIcon?: boolean;
  // Render a horizontal divider instead of a nav row (groups options like the
  // settings dropdown). Build via `createSidebarSeparatorItem`.
  isSeparator?: boolean;
}

interface ListIconProps {
  Icon: React.ComponentType<{ className?: string }>;
}

export interface ItemInnerProps {
  item: SidebarMenuItem;
  shouldShowLabel: boolean;
  active?: boolean;
  // Reveal an "open link" icon on hover/focus for link rows (v2 panels), the
  // same affordance the ProfileMenu rows use. The row must carry `group`.
  showLinkIconOnHover?: boolean;
}
interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
  className?: string;
  disableDefaultBackground?: boolean;
  // Opt-in native drag passthrough (used by the v2 sidebar to let panel rows be
  // dragged into the shortcuts dock). Inert unless a caller sets `draggable`.
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLElement>) => void;
}

export const navBtnClass =
  'flex flex-1 items-center pl-2 laptop:pl-0 pr-5 laptop:pr-3 h-10 laptop:h-9 overflow-hidden';
// Vertical icon+label item used on the v2 desktop rail. Shared so the
// notifications bell matches the hard-coded category tabs. Callers append
// the active state (`bg-background-default !text-text-primary`).
export const railTabClass =
  'focus-outline group relative flex w-full flex-col items-center gap-1 rounded-12 px-1 py-2 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary motion-reduce:transition-none';
export const railTabLabelClass = 'typo-caption2 leading-tight text-center';
export const SidebarAside = classed(
  'aside',
  'flex flex-col z-sidebarOverlay laptop:z-sidebar laptop:-translate-x-0 left-0 bg-background-default border-r border-border-subtlest-tertiary transition-[width,transform] duration-300 ease-in-out group fixed top-0 h-full',
);
export const SidebarScrollWrapper = classed(
  'div',
  'flex overflow-x-hidden overflow-y-auto flex-col h-full no-scrollbar',
);
export const Nav = classed('nav', 'flex flex-col pt-1 pb-3');
export const NavSection = classed('ul', 'flex flex-col');
export const NavHeader = classed(
  'li',
  'h-9 flex items-center transition-opacity duration-300',
);

const RawNavItem = classed(
  'li',
  'flex items-center typo-callout relative transition-colors duration-150',
);

export const ListIcon = ({ Icon }: ListIconProps): ReactElement => (
  <Icon className="pointer-events-none h-5 w-5" />
);

// A Slack-style "add" row that leads a v2 panel list to encourage creating the
// next squad / folder / feed. Pass either an `onClick` (button row, e.g. opens
// a modal) or an `href` (link row, e.g. a create page).
export const createSidebarAddItem = (
  title: string,
  target: { onClick: () => void } | { href: string },
): SidebarMenuItem => ({
  icon: () => <ListIcon Icon={() => <PlusIcon />} />,
  title,
  ...('href' in target
    ? { path: target.href, isForcedLink: true }
    : { action: target.onClick }),
});

// A horizontal divider row that groups options inside a v2 panel, mirroring the
// settings dropdown. `key` just needs to be unique within the item list.
export const createSidebarSeparatorItem = (key: string): SidebarMenuItem => ({
  icon: null,
  title: key,
  isSeparator: true,
});

// Compares a (possibly absolute, possibly query-bearing) menu href against
// the current page so v2 rail panels can flag the active row with a single
// shared rule instead of each panel rolling its own check.
export const isSidebarItemActive = (
  activePage: string | undefined,
  href: string,
): boolean => {
  if (!activePage) {
    return false;
  }
  const current = activePage.split('?')[0];
  const target = href.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  return current === target;
};

type ItemInnerIconProps = Pick<SidebarMenuItem, 'alert' | 'icon' | 'active'> & {
  iconClassName?: string;
};
const renderItemIcon = (
  icon: SidebarMenuItem['icon'],
  active?: boolean,
): ReactNode => {
  if (typeof icon === 'string') {
    return <span className="inline-block w-5 text-center">{icon}</span>;
  }

  return icon instanceof Function ? icon(active ?? false) : icon;
};

const ItemInnerIcon = ({
  alert,
  icon,
  active,
  iconClassName = 'relative flex items-center justify-center w-9 h-9',
}: ItemInnerIconProps) => {
  return (
    <span className={iconClassName}>
      {alert}
      {renderItemIcon(icon, active)}
    </span>
  );
};

export const ItemInner = ({
  item,
  shouldShowLabel,
  active,
  showLinkIconOnHover,
}: ItemInnerProps): ReactElement => {
  const isLabelHidden = !shouldShowLabel;

  return (
    <>
      <ItemInnerIcon {...item} active={active} />
      <span
        className={classNames(
          // min-w-0 lets the flex item shrink so a long title actually
          // ellipsis-truncates instead of shoving the trailing icon off-row.
          'min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left transition-[opacity,width] duration-300',
          isLabelHidden ? 'w-0 opacity-0' : 'opacity-100',
          item.titleClassName,
        )}
        title={shouldShowLabel ? item.title : undefined}
        aria-hidden={isLabelHidden}
      >
        {item.title}
      </span>
      {shouldShowLabel && item.rightIcon && (
        <ItemInnerIcon
          {...item}
          icon={item.rightIcon}
          iconClassName="relative ml-2 flex shrink-0 items-center justify-center"
        />
      )}
      {shouldShowLabel && showLinkIconOnHover && !item.rightIcon && (
        // Named group (`openLink`) so it reveals on hovering THIS row only —
        // an unnamed group-hover would also match the SidebarAside's `group`
        // and show on hover anywhere in the sidebar.
        <OpenLinkIcon
          aria-hidden
          size={IconSize.Size16}
          className="ml-1 shrink-0 text-text-quaternary opacity-0 transition-opacity group-focus-within/openLink:opacity-100 group-hover/openLink:opacity-100"
        />
      )}
    </>
  );
};

export const NavItem = forwardRef<HTMLElement, NavItemProps>(
  (
    {
      className,
      color,
      active,
      children,
      disableDefaultBackground,
      draggable,
      onDragStart,
      onDragEnd,
    },
    ref,
  ): ReactElement => {
    const baseClasses = active
      ? 'text-text-primary'
      : 'hover:text-text-primary text-text-tertiary';

    let backgroundClasses: string | undefined;
    if (disableDefaultBackground) {
      backgroundClasses = undefined;
    } else if (active) {
      backgroundClasses = 'bg-surface-hover';
    } else {
      backgroundClasses = 'hover:bg-surface-hover';
    }

    return (
      <RawNavItem
        ref={ref}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={classNames(
          className,
          color || baseClasses,
          backgroundClasses,
        )}
      >
        {children}
      </RawNavItem>
    );
  },
);
NavItem.displayName = 'NavItem';
