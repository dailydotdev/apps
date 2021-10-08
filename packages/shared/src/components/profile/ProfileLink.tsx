import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

const LazyTooltip = dynamic(() => import('../tooltips/Tooltip'));

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
  const anchor = (
    <a
      {...props}
      href={user.permalink}
      className={classNames(className, 'flex items-center no-underline')}
    >
      {children}
    </a>
  );

  return (
    <Link href={user.permalink} passHref prefetch={false}>
      {disableTooltip ? (
        anchor
      ) : (
        <LazyTooltip content={user.name} placement="left">
          {anchor}
        </LazyTooltip>
      )}
    </Link>
  );
}
