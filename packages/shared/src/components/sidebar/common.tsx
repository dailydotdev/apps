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
}

interface ListIconProps {
  Icon: React.ComponentType<{ className }>;
}

export interface ItemInnerProps {
  item: SidebarMenuItem;
  shouldShowLabel: boolean;
  active?: boolean;
}
interface NavItemProps {
  color?: string;
  active?: boolean;
  children?: ReactNode;
  className?: string;
  disableDefaultBackground?: boolean;
}

export const navBtnClass =
  'flex flex-1 items-center pl-2 laptop:pl-0 pr-5 laptop:pr-3 h-10 laptop:h-9 overflow-hidden';
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
}: ItemInnerProps): ReactElement => {
  return (
    <>
      <ItemInnerIcon {...item} active={active} />
      <span
        className={classNames(
          'flex-1 overflow-hidden truncate whitespace-nowrap text-left transition-[opacity,width] duration-300',
          shouldShowLabel ? 'opacity-100' : 'w-0 opacity-0',
          item.titleClassName,
        )}
        title={shouldShowLabel ? item.title : undefined}
        aria-hidden={!shouldShowLabel}
      >
        {item.title}
      </span>
      {shouldShowLabel && item.rightIcon && (
        <ItemInnerIcon
          {...item}
          icon={item.rightIcon}
          iconClassName="relative flex items-center justify-center"
        />
      )}
    </>
  );
};

export const NavItem = forwardRef<HTMLElement, NavItemProps>(
  (
    { className, color, active, children, disableDefaultBackground },
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
