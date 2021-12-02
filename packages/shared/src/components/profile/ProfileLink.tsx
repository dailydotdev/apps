import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { PublicProfile } from '../../lib/user';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';

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
  const LinkComponent = disableTooltip ? Link : LinkWithTooltip;

  return (
    <LinkComponent
      href={user.permalink}
      passHref
      prefetch={false}
      tooltip={{ content: user.name }}
    >
      <a
        {...props}
        className={classNames(className, 'flex items-center no-underline')}
      >
        {children}
      </a>
    </LinkComponent>
  );
}
