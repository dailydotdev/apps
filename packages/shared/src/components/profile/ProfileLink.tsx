import React, { HTMLAttributes, ReactElement, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import { getShouldLoadTooltip } from '../tooltips/LazyTooltip';

const LazyTooltip = dynamic(
  () => import(/* webpackChunkName: "lazyTooltip" */ '../tooltips/LazyTooltip'),
);

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
  const userRef = useRef();
  return (
    <>
      {getShouldLoadTooltip(disableTooltip) && (
        <LazyTooltip content={user.name} reference={userRef} />
      )}
      <Link href={user.permalink} passHref prefetch={false}>
        <a
          {...props}
          className={classNames(className, 'flex items-center no-underline')}
          ref={userRef}
        >
          {children}
        </a>
      </Link>
    </>
  );
}
