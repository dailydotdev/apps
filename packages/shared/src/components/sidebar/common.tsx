import React, {
  ReactNode,
  ReactElement,
  HTMLAttributeAnchorTarget,
} from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import ArrowIcon from '../../../icons/arrow.svg';

export interface SidebarProps {
  useNavButtonsNotLinks?: boolean;
  sidebarRendered?: boolean;
  openMobileSidebar?: boolean;
  activePage?: string;
  onNavTabClick?: (tab: string) => void;
  enableSearch?: () => void;
  setOpenMobileSidebar?: () => unknown;
  onShowDndClick?: () => void;
}

export interface SidebarUserButtonProps {
  sidebarRendered?: boolean;
  onShowDndClick?: () => void;
}
export interface SidebarMenuItems {
  key: string;
  items: SidebarMenuItem[];
}

export interface SidebarMenuItem {
  icon: ReactElement;
  title: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  action?: () => unknown;
  alert?: ReactElement;
  active?: boolean;
  hideOnMobile?: boolean;
  requiresLogin?: boolean;
}

interface ButtonOrLinkProps {
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
}

interface MenuIconProps {
  sidebarExpanded: boolean;
  toggleSidebarExpanded: () => void;
}

interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
}

export const btnClass = 'flex flex-1 items-center px-3 h-7';
export const SidebarBackdrop = classed(
  'div',
  'fixed w-full h-full bg-theme-overlay-quaternary z-3 cursor-pointer inset-0',
);
export const SidebarAside = classed(
  'aside',
  'flex flex-col w-70 laptop:-translate-x-0 bg-theme-bg-primary z-3 border-r border-theme-divider-tertiary transition-all transform duration-300 ease-in-out group fixed laptop:sticky top-0 laptop:top-14 h-screen laptop:h-[calc(100vh-theme(space.14))]',
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
export const RawNavItem = classed(
  'li',
  'flex items-center typo-callout hover:bg-theme-active hover:text-theme-label-primary',
);

export const ListIcon = ({ Icon }: ListIconProps): ReactElement => (
  <Icon className="w-5 h-5" />
);
export const ItemInner = ({
  item,
  sidebarExpanded,
}: ItemInnerProps): ReactElement => (
  <>
    <span className="relative mr-3">
      {item.alert}
      {item.icon}
    </span>
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

export const ButtonOrLink = ({
  item,
  useNavButtonsNotLinks,
  showLogin,
  children,
}: ButtonOrLinkProps): ReactElement => {
  if (showLogin) {
    return (
      <button type="button" className={btnClass} onClick={showLogin}>
        {children}
      </button>
    );
  }
  return (!useNavButtonsNotLinks && !item.action) ||
    (item.path && !useNavButtonsNotLinks) ? (
    <Link href={item.path} passHref prefetch={false}>
      <a target={item?.target} className={btnClass} rel="noopener noreferrer">
        {children}
      </a>
    </Link>
  ) : (
    <button type="button" className={btnClass} onClick={item.action}>
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
      absolute
      className={`btn btn-primary h-6 w-6 top-3 -right-3 z-3 ${
        sidebarExpanded &&
        'transition-opacity  invisible group-hover:visible opacity-0 group-hover:opacity-100'
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
  color,
  active,
  children,
}: NavItemProps): ReactElement => (
  <RawNavItem
    className={classNames(
      color || 'text-theme-label-tertiary',
      active && 'bg-theme-active text-theme-label-primary',
    )}
  >
    {children}
  </RawNavItem>
);
