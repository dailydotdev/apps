import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { SidebarMenuItem } from './common';
import { navBtnClass } from './common';
import { combinedClicks } from '../../lib/click';

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
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (showLogin) {
        event.preventDefault();
        showLogin();
      } else {
        item.action?.(event);
      }
    },
    [showLogin, item],
  );

  if (!isButton && (!item.action || item.path)) {
    return (
      <Link href={item.path} passHref prefetch={false}>
        <a
          {...props}
          {...combinedClicks(onClick)}
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
    <button {...props} type="button" className={navBtnClass} onClick={onClick}>
      {children}
    </button>
  );
}
