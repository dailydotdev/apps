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
}

interface ButtonOrLinkProps {
  item: SidebarMenuItem;
  children?: ReactNode;
}

interface ListIconProps {
  Icon: React.ComponentType<{ className }>;
}

interface ItemInnerProps {
  item: SidebarMenuItem;
  openSidebar: boolean;
}

interface MenuIconProps {
  openSidebar: boolean;
  toggleOpenSidebar: () => Promise<void>;
}

interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
}

export const btnClass = 'flex flex-1 items-center px-3 h-7';
export const SidebarAside = classed(
  'aside',
  'flex flex-col border-r border-theme-divider-tertiary transition-all transform duration-500 ease-in-out group sticky top-14 h-[calc(100vh-theme(space.14))]',
);
export const Nav = classed('nav', 'my-4');
export const NavSection = classed('ul', 'mt-2');
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
  openSidebar,
}: ItemInnerProps): ReactElement => (
  <>
    <span className="relative mr-3">
      {item.alert}
      {item.icon}
    </span>
    <span
      className={`flex-1 text-left transition-opacity ${
        openSidebar ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {item.title}
    </span>
  </>
);

export const ButtonOrLink = ({
  item,
  children,
}: ButtonOrLinkProps): ReactElement =>
  item.path ? (
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
export const MenuIcon = ({
  openSidebar,
  toggleOpenSidebar,
}: MenuIconProps): ReactElement => (
  <SimpleTooltip
    placement="right"
    content={`${openSidebar ? 'Close' : 'Open'} sidebar`}
  >
    <Button
      onClick={() => toggleOpenSidebar()}
      absolute
      className={`btn btn-primary h-6 w-6 top-3 -right-3 z-3 ${
        openSidebar &&
        'transition-opacity  invisible group-hover:visible opacity-0 group-hover:opacity-100'
      }`}
      buttonSize="xsmall"
    >
      <ArrowIcon
        className={`typo-title3 ${openSidebar ? '-rotate-90' : 'rotate-90'}`}
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
