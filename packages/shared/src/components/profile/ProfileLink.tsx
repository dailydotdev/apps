import React, {
  forwardRef,
  AnchorHTMLAttributes,
  ReactElement,
  Ref,
} from 'react';
import Link from 'next/link';
import classNames from 'classnames';

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
