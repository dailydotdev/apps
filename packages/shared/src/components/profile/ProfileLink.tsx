import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { LoggedUser } from '../../lib/user';
import { Author } from '../../graphql/comments';

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: Author | LoggedUser;
  ref?: Ref<HTMLAnchorElement>;
}

function ProfileLinkComponent(
  { user, children, className, ...props }: ProfileLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  return (
    <Link href={user.permalink} passHref prefetch={false}>
      <a
        {...props}
        ref={ref}
        className={classNames(className, 'flex items-center no-underline')}
      >
        {children}
      </a>
    </Link>
  );
}

export const ProfileLink = forwardRef(ProfileLinkComponent);
