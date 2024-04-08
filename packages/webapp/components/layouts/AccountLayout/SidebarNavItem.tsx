import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
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
          'flex w-full flex-row rounded-16 p-4 tablet:w-64',
          isActive && 'border border-border-subtlest-tertiary bg-theme-active',
          isActive && 'p-[0.9375rem]', // to avoid layout shift for when the border (1px) is displayed being active
          className,
        )}
      >
        {icon}
        <span
          className={classNames(
            'ml-2 typo-callout',
            !isActive && 'text-text-tertiary',
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
