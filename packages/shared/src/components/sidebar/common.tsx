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
  // The icon image URL of the dragged row (e.g. a squad/source logo), captured
  // at drag time so the pinned shortcut renders it immediately instead of
  // re-fetching it (which flashed a placeholder for a beat).
  image?: string;
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
// the active state (the selected pill is a shared sliding indicator now, so
// callers only add `!text-text-primary`). `active:scale-95` gives the same
// tactile press feedback as the Home/Search/More buttons; it sits on the inner
// button (a child of the dnd sortable wrapper), so it never distorts the
// drag-start rect measurement.
export const railTabClass =
  'focus-outline group relative flex w-full flex-col items-center gap-1 rounded-12 px-1 py-2 text-text-tertiary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-hover hover:text-text-primary active:scale-95 motion-reduce:transition-none';
export const railTabLabelClass = 'typo-caption2 leading-tight text-center';
// Shared `useInteractivePopup` group so the rail's click popups (support,
// settings, the shortcuts tray, the More menu and the sidebar tour) are
// mutually exclusive: opening one closes the others.
export const RAIL_POPUP_GROUP = 'sidebar-rail';
// One source of truth for the glyph size inside every v2 rail control — tabs,
// Home, Search, the bottom utilities and the shortcuts dock. The buttons keep
// their own fixed hit areas (size-10 / the tab row), so changing this resizes
// only the icon within them. New post is deliberately excluded: its filled chip
// is the rail's primary action and is sized on its own.
export const RAIL_ICON_SIZE = IconSize.Size26;
// Glyph box that rail icons sit in, so every tab's height stays identical even
// when a glyph (avatar, streak ring) is a different shape.
export const railGlyphBoxClass =
  'relative flex size-[1.625rem] items-center justify-center';
// One recipe for every count badge on a rail tab, so the Activity bell and the
// gamification tab cannot drift apart — they previously disagreed on all three
// of: containing block (glyph box vs the whole 68px button), anchor edge, and
// numeral size.
//
// It must be placed inside the tab's GLYPH BOX, not the button, or the offsets
// below resolve against the tab's full height (label included) and the badge
// lands somewhere else entirely.
//
// Anchored by its LEFT edge rather than its right, so multi-digit counts grow
// rightward into the tab's own padding instead of creeping left across the
// glyph — "20+" still clears the rail's width at this offset.
//
// Sized DOWN from Bubble's defaults: an 18px box (from 20px) and typo-caption1
// (from subhead, via footnote), so the count notches the 26px glyph rather than
// competing with it. `tabular-nums` stops it reflowing as the number ticks.
// Radius stays Bubble's own `rounded-8`, which on the smaller box reads slightly
// rounder.
//
// The `!` overrides are load-bearing: Bubble sets its own min box and type, and
// same-specificity utilities resolve by stylesheet order, not by the order
// written here.
export const railCountBubbleClass =
  'pointer-events-none -top-1 left-4 px-1 !min-h-[1.125rem] !min-w-[1.125rem] !font-bold !typo-caption1 tabular-nums';
// One colour for every DIVIDER in the v2 sidebar — the rail/panel split, the
// rail's own rules, the panel separators. `-quaternary` (8%) is the design
// system's softest border step; `-tertiary` (20%) read as too dominant for a
// line whose only job is to group things.
//
// Deliberately NOT applied to container borders (popup outlines, kbd chips,
// buttons): those need their edge to define a surface, not to whisper.
//
// The `!` on the border variant is load-bearing — HorizontalSeparator ships its
// own `border-subtlest-tertiary`, and same-specificity utilities resolve by
// stylesheet order rather than by the order written on the element.
export const railDividerBorderClass = '!border-border-subtlest-quaternary';
export const railDividerBgClass = 'bg-border-subtlest-quaternary';
// Shared drag visuals for the v2 sidebar's two drag systems — the rail tabs and
// the shortcuts dock — so a lifted item looks identical in both. Callers add
// the lift (`scale-110`) and their own transition.
//
// The fill must be a `surface-*` token, never a tint of `background-default`:
// that token is a bare `var()`, so Tailwind's `/<n>` opacity modifier computes
// to rgba(0,0,0,0) and the chip silently gets no fill at all. `surface-float`
// is the theme-aware overlay (light salt on dark, dark on light), one step
// below the landing slot so the slot reads as the target and this reads as the
// thing in your hand.
//
// Blur RADIUS is what makes this read as glass — the alpha is not. At
// `backdrop-blur-xl` (24px on a 68px chip) the filter averages the whole
// backdrop into one flat colour: measured over a rail tab it erased the icon
// and the label, leaving a block that looks opaque at any fill. 8px keeps the
// tab underneath recognisable. Raising it undoes this.
//
// `shadow-2`, not `shadow-3`: the latter is a 14px black shadow at 64% alpha
// that blooms into a dark halo in dark mode. The scale is 2 / 3 / bubble —
// there is no `shadow-4`.
export const sidebarDragGhostClass =
  'bg-surface-float rounded-12 border border-border-subtlest-secondary shadow-2 backdrop-blur';
// The parked slot a dragged item lands in — the "it will go here" marker. Its
// content is faded out, so the slot keeps the item's exact height.
//
// `surface-hover` (12%): at `surface-active` (16%) it was the most solid thing
// on screen during a drag and read as the dragged item having an opaque
// backing, and at `surface-float` (8%) it was too faint to show the target.
// Same 8px blur as the ghost, for the same reason.
export const sidebarDragSlotClass = 'rounded-12 bg-surface-hover backdrop-blur';
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
