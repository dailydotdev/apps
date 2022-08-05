import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import Link from 'next/link';

interface SidebarNavItemProps {
  title: string;
  icon: ReactNode;
  href: string;
  className?: string;
}

function SidebarNavItem({
  icon,
  href,
  title,
  className,
}: SidebarNavItemProps): ReactElement {
  const isActive = window.location.pathname === href;

  return (
    <Link href={href}>
      <a
        className={classNames(
          'flex flex-row p-4 rounded-16 w-64',
          isActive && 'border border-theme-divider-tertiary bg-theme-active',
          className,
        )}
      >
        {icon}
        <span className="ml-2 typo-callout">{title}</span>
        <ArrowIcon className="ml-auto rotate-90" />
      </a>
    </Link>
  );
}

export default SidebarNavItem;
