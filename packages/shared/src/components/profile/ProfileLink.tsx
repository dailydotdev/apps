import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import { getTooltipProps } from '../../lib/tooltip';
import classNames from 'classnames';

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
      <a
        {...(disableTooltip ? {} : getTooltipProps(user.name))}
        {...props}
        className={classNames(className, 'flex items-center no-underline')}
      >
        {children}
      </a>
    </Link>
  );
}
