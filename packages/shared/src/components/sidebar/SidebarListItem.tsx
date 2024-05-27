import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowIcon } from '../icons';

export interface SidebarListItemProps
  extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  title: string;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  className?: string;
  group?: string;
}

function SidebarListItem({
  icon,
  href,
  title,
  isActive,
  className,
  ...props
}: SidebarListItemProps): ReactElement {
  const containerClass = classNames(
    'flex w-full flex-row rounded-16 p-4 tablet:w-64',
    isActive && 'border border-border-subtlest-tertiary bg-theme-active',
    isActive && 'p-[0.9375rem]', // to avoid layout shift for when the border (1px) is displayed being active
    className,
  );
  const content = (
    <>
      {React.cloneElement(icon as ReactElement, {
        secondary: isActive,
        className: !isActive && 'text-text-secondary',
      })}
      <span
        className={classNames(
          'ml-2 typo-callout',
          !isActive && 'text-text-tertiary',
        )}
      >
        {title}
      </span>
      <ArrowIcon
        className={classNames(
          'ml-auto rotate-90',
          !isActive && 'text-text-secondary',
        )}
      />
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <a {...props} className={containerClass}>
          {content}
        </a>
      </Link>
    );
  }

  return (
    <button {...props} type="button" className={containerClass}>
      {content}
    </button>
  );
}

export default SidebarListItem;
