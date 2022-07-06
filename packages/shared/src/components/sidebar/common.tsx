import React, {
  ReactNode,
  ReactElement,
  HTMLAttributeAnchorTarget,
  HTMLAttributes,
} from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import ArrowIcon from '../icons/Arrow';
import { TooltipProps } from '../tooltips/BaseTooltip';

export interface SidebarProps {
  promotionalBannerActive?: boolean;
  useNavButtonsNotLinks?: boolean;
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
  icon: (active: boolean) => ReactElement;
  title: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  action?: () => unknown;
  alert?: ReactElement;
  active?: boolean;
  hideOnMobile?: boolean;
  requiresLogin?: boolean;
  tooltip?: TooltipProps;
}

interface ButtonOrLinkProps
  extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  item: SidebarMenuItem;
  useNavButtonsNotLinks?: boolean;
  children?: ReactNode;
  showLogin?: () => unknown;
}

interface ListIconProps {
  Icon: React.ComponentType<{ className }>;
}

interface ItemInnerProps {
  item: SidebarMenuItem;
  sidebarExpanded: boolean;
  active?: boolean;
}

interface MenuIconProps {
  sidebarExpanded: boolean;
  toggleSidebarExpanded: () => void;
}

interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
  className?: string;
}

export const btnClass =
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
export const Nav = classed('nav', 'my-4');
export const NavSection = classed('ul', 'mt-0 laptop:mt-2');
export const NavHeader = classed(
  'li',
  'typo-footnote text-theme-label-quaternary h-7 flex items-center font-bold  transition-opacity',
);
export const AlertContainer = classed(
  'div',
  'mx-4 my-3 px-1 py-1 border border-theme-status-success rounded-10 flex flex-row flex-wrap relative',
);
export const AlertCopy = classed(
  'p',
  'typo-subhead p-1 pl-2 pr-1.5 max-w-[calc(100%-1.5rem)]',
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
        )}
      >
        {item.title}
      </span>
    </>
  );
};

export const ButtonOrLink = ({
  item,
  useNavButtonsNotLinks,
  showLogin,
  children,
  ...props
}: ButtonOrLinkProps): ReactElement => {
  if (showLogin) {
    return (
      <button {...props} type="button" className={btnClass} onClick={showLogin}>
        {children}
      </button>
    );
  }
  return (!useNavButtonsNotLinks && !item.action) ||
    (item.path && !useNavButtonsNotLinks) ? (
    <Link href={item.path} passHref prefetch={false}>
      <a
        {...props}
        target={item?.target}
        className={btnClass}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    </Link>
  ) : (
    <button {...props} type="button" className={btnClass} onClick={item.action}>
      {children}
    </button>
  );
};

export const MenuIcon = ({
  sidebarExpanded,
  toggleSidebarExpanded,
}: MenuIconProps): ReactElement => (
  <SimpleTooltip
    placement="right"
    content={`${sidebarExpanded ? 'Close' : 'Open'} sidebar`}
  >
    <Button
      onClick={toggleSidebarExpanded}
      position="absolute"
      className={`btn btn-primary h-6 w-6 top-3 -right-3 z-3 ${
        sidebarExpanded &&
        'transition-opacity invisible group-hover:visible opacity-0 group-hover:opacity-100'
      }`}
      buttonSize="xsmall"
    >
      <ArrowIcon
        className={`typo-title3 ${
          sidebarExpanded ? '-rotate-90' : 'rotate-90'
        }`}
      />
    </Button>
  </SimpleTooltip>
);
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
