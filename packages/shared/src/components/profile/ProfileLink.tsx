import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

const Tooltip = dynamic(() => import('../tooltips/Tooltip'));

interface User {
  name: string;
  image: string;
  permalink: string;
}

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: User;
  disableTooltip?: boolean;
}

export function ProfileLink({
  user,
  disableTooltip,
  children,
  className,
  ...props
}: ProfileLinkProps): ReactElement {
  return (
    <Link href={user.permalink} passHref prefetch={false}>
      <Tooltip content={user.name}>
        <a
          {...props}
          className={classNames(className, 'flex items-center no-underline')}
        >
          {children}
        </a>
      </Tooltip>
    </Link>
  );
}
