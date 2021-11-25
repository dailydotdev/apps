import React, { HTMLAttributes, ReactElement, useRef } from 'react';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import LinkWithTooltip from '../tooltips/LinkWithTooltip';

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
    <LinkWithTooltip
      href={user.permalink}
      passHref
      prefetch={false}
      tooltip={{ content: user.name }}
    >
      <a
        {...props}
        className={classNames(className, 'flex items-center no-underline')}
        ref={userRef}
      >
        {children}
      </a>
    </LinkWithTooltip>
  );
}
