import React, {
  ReactNode,
  ReactElement,
  HTMLAttributeAnchorTarget,
} from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TooltipProps } from '../tooltips/BaseTooltip';

export interface SidebarProps {
  promotionalBannerActive?: boolean;
  isNavButtons?: boolean;
  sidebarRendered?: boolean;
  openMobileSidebar?: boolean;
  activePage?: string;
  showDnd?: boolean;
  dndActive?: boolean;
  onNavTabClick?: (tab: string) => void;
  enableSearch?: () => void;
  setOpenMobileSidebar?: () => unknown;
  onShowDndClick?: () => void;
}

export interface SidebarUserButtonProps {
  sidebarRendered?: boolean;
}

export interface SidebarMenuItem {
  icon: ((active: boolean) => ReactElement) | ReactNode;
  title: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  action?: () => unknown;
  alert?: ReactElement;
  active?: boolean;
  hideOnMobile?: boolean;
  requiresLogin?: boolean;
  tooltip?: TooltipProps;
  className?: {
    text?: string;
  };
}

interface ListIconProps {
  Icon: React.ComponentType<{ className }>;
}

interface ItemInnerProps {
  item: SidebarMenuItem;
  sidebarExpanded: boolean;
  active?: boolean;
}
interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
  className?: string;
}

export const navBtnClass =
  'flex flex-1 items-center pl-2 laptop:pl-0 pr-5 laptop:pr-3 h-10 laptop:h-7';
export const SidebarBackdrop = classed(
  'div',
  'fixed w-full h-full bg-theme-overlay-quaternary z-3 cursor-pointer inset-0',
);
export const SidebarAside = classed(
  'aside',
  'flex flex-col w-70 laptop:-translate-x-0 left-0 bg-theme-bg-primary z-3 border-r border-theme-divider-tertiary transition-[width,transform] duration-300 ease-in-out group fixed top-0  h-full ',
);
export const SidebarScrollWrapper = classed(
  'div',
  'flex overflow-x-hidden overflow-y-auto flex-col h-full no-scrollbar',
);
export const Nav = classed('nav', 'my-4 mt-10 laptop:mt-8');
export const NavSection = classed('ul', 'mt-0 laptop:mt-2');
export const NavHeader = classed(
  'li',
  'typo-footnote text-theme-label-quaternary h-7 flex items-center font-bold  transition-opacity',
);

const RawNavItem = classed(
  'li',
  'flex items-center typo-callout hover:bg-theme-active',
);

export const ListIcon = ({ Icon }: ListIconProps): ReactElement => (
  <Icon className="w-5 h-5 pointer-events-none" />
);

const ItemInnerIcon = ({ alert, icon, active }: SidebarMenuItem) => {
  return (
    <span className="relative px-3">
      {alert}
      {icon instanceof Function ? icon(active) : icon}
    </span>
  );
};

const ItemInnerIconTooltip = ({
  alert,
  icon,
  title,
  tooltip = {},
  active,
}: SidebarMenuItem) => (
  <SimpleTooltip {...tooltip} content={title} placement="right">
    <span
      className={classNames(
        'relative px-3',
        tooltip.visible !== undefined && 'pointer-events-none',
      )}
    >
      {alert}
      {icon instanceof Function ? icon(active) : icon}
    </span>
  </SimpleTooltip>
);

export const ItemInner = ({
  item,
  sidebarExpanded,
  active,
}: ItemInnerProps): ReactElement => {
  const Icon = sidebarExpanded ? ItemInnerIcon : ItemInnerIconTooltip;

  return (
    <>
      <Icon {...item} active={active} />
      <span
        className={classNames(
          'flex-1 text-left transition-opacity',
          sidebarExpanded ? 'opacity-100 delay-150' : 'opacity-0',
          item?.className?.text,
        )}
      >
        {item.title}
      </span>
    </>
  );
};

export const NavItem = ({
  className,
  color,
  active,
  children,
}: NavItemProps): ReactElement => {
  const baseClasses = active
    ? 'text-theme-label-primary'
    : 'hover:text-theme-label-primary text-theme-label-tertiary';

  return (
    <RawNavItem
      className={classNames(
        className,
        color || baseClasses,
        active && 'bg-theme-active',
      )}
    >
      {children}
    </RawNavItem>
  );
};
