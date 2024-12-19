import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';
import Link from '../utilities/Link';
import { ArrowIcon } from '../icons';

export interface SidebarListItemProps
  extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  title: string;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  className?: string;
  group?: string;
  customElement?: ReactElement;
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
    'flex w-full flex-row rounded-12 p-3 tablet:w-64',
    isActive && 'bg-surface-float',
    className,
  );

  if (props.customElement) {
    return <div className={containerClass}>{props.customElement}</div>;
  }

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
