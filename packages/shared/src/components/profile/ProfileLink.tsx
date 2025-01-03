import type { AnchorHTMLAttributes, ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';

export interface ProfileLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>;
}

function ProfileLinkComponent(
  { href, children, className, ...props }: ProfileLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  return (
    <Link href={href} passHref prefetch={false}>
      <a
        {...props}
        ref={ref}
        className={classNames(
          className,
          'flex min-w-0 shrink items-center no-underline',
        )}
      >
        {children}
      </a>
    </Link>
  );
}

export const ProfileLink = forwardRef(ProfileLinkComponent);
