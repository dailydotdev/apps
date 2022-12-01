import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import ArrowIcon from '../icons/Arrow';

export interface SidebarListItemProps
  extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  title: string;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  className?: string;
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
    'flex flex-row p-4 rounded-16 w-full tablet:w-64',
    isActive && 'border border-theme-divider-tertiary bg-theme-active',
    isActive && 'p-[0.9375rem]', // to avoid layout shift for when the border (1px) is displayed being active
    className,
  );
  const content = (
    <>
      {React.cloneElement(icon as ReactElement, {
        secondary: isActive,
        className: !isActive && 'text-theme-label-secondary',
      })}
      <span
        className={classNames(
          'ml-2 typo-callout',
          !isActive && 'text-theme-label-tertiary',
        )}
      >
        {title}
      </span>
      <ArrowIcon
        className={classNames(
          'ml-auto rotate-90',
          !isActive && 'text-theme-label-secondary',
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
