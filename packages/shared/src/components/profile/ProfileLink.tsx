import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { getTooltipProps } from '../../lib/tooltip';
import { PublicProfile } from '../../lib/user';

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: Pick<PublicProfile, 'image' | 'permalink' | 'username' | 'name'>;
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
