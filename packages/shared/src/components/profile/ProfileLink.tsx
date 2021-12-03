import React, { HTMLAttributes, ReactElement } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { Author } from '../../graphql/comments';
import { SimpleTooltipProps } from '../tooltips/SimpleTooltip';

export enum ProfileLinkTooltip {
  Text = 'text',
  Profile = 'profile',
  Disabled = 'disabled',
}

export interface ProfileLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  user: Author;
  tooltip?: SimpleTooltipProps;
}

export function ProfileLink({
  user,
  tooltip,
  children,
  className,
  ...props
}: ProfileLinkProps): ReactElement {
  const LinkComponent = tooltip ? LinkWithTooltip : Link;

  return (
    <LinkComponent
      href={user.permalink}
      passHref
      prefetch={false}
      tooltip={tooltip}
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
