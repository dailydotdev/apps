import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { navBtnClass, SidebarMenuItem } from './common';

interface ClickableNavItemProps
  extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  item: SidebarMenuItem;
  isButton?: boolean;
  children?: ReactNode;
  showLogin?: () => unknown;
}

export function ClickableNavItem({
  item,
  isButton,
  showLogin,
  children,
  ...props
}: ClickableNavItemProps): ReactElement {
  if (showLogin) {
    return (
      <button
        {...props}
        type="button"
        className={classNames(navBtnClass, props.className)}
        onClick={showLogin}
      >
        {children}
      </button>
    );
  }

  if (!isButton && (!item.action || item.path)) {
    return (
      <Link href={item.path} passHref prefetch={false}>
        <a
          {...(item.action && { onClick: item.action })}
          {...props}
          target={item?.target}
          className={classNames(navBtnClass, props.className)}
          rel="noopener noreferrer"
        >
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button
      {...props}
      type="button"
      className={navBtnClass}
      onClick={item.action}
    >
      {children}
    </button>
  );
}
