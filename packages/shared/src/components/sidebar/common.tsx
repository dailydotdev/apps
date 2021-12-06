import React, { ReactNode, ReactElement } from 'react';
import Link from 'next/link';
import classed from '../../lib/classed';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TargetTypes } from '../utilities';
import ArrowIcon from '../../../icons/arrow.svg';

export interface SidebarMenuItems {
  key: string;
  items: SidebarMenuItem[];
}

export interface SidebarMenuItem {
  icon: ReactElement;
  title: string;
  path?: string;
  target?: TargetTypes;
  action?: () => unknown;
}

export const ListIcon = ({
  Icon,
}: {
  Icon: React.ComponentType<{ className }>;
}): ReactElement => <Icon className="mr-3 w-5 h-5" />;
export const ItemInner = ({
  item,
  openSidebar,
}: {
  item: SidebarMenuItem;
  openSidebar: boolean;
}): ReactElement => (
  <>
    {item.icon}
    <span
      className={`flex-1 text-left transition-opacity ${
        openSidebar ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {item.title}
    </span>
  </>
);
export const btnClass = 'flex flex-1 items-center px-3 h-7';
export const ButtonOrLink = ({
  item,
  children,
}: {
  item: SidebarMenuItem;
  children?: ReactNode;
}): ReactElement =>
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
}: {
  openSidebar: boolean;
  toggleOpenSidebar: () => Promise<void>;
}): ReactElement => (
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
export const RawNavItem = classed('li', 'flex items-center typo-callout');
export const NavItem = ({
  color,
  children,
}: {
  color?: string;
  children?: ReactNode;
}): ReactElement => (
  <RawNavItem className={color || 'text-theme-label-tertiary'}>
    {children}
  </RawNavItem>
);
