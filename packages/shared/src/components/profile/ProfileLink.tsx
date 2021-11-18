import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';

const Tooltip = dynamic(() => import('../tooltips/Tooltip'));
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
