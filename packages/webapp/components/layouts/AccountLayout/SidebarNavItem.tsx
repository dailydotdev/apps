import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import Link from 'next/link';

interface SidebarNavItemProps {
  title: string;
  icon: ReactNode;
  href: string;
  isActive?: boolean;
  className?: string;
}

function SidebarNavItem({
  icon,
  href,
  title,
  isActive,
  className,
}: SidebarNavItemProps): ReactElement {
  return (
    <Link href={href}>
      <a
        className={classNames(
          'flex flex-row p-4 rounded-16 w-full tablet:w-64',
          isActive && 'border border-theme-divider-tertiary bg-theme-active',
          isActive && 'p-[0.9375rem]', // to avoid layout shift for when the border (1px) is displayed being active
          className,
        )}
      >
        {icon}
        <span
          className={classNames(
            'ml-2 typo-callout',
            !isActive && 'text-theme-label-tertiary',
          )}
        >
          {title}
        </span>
        <ArrowIcon className="ml-auto rotate-90" />
      </a>
    </Link>
  );
}

export default SidebarNavItem;
