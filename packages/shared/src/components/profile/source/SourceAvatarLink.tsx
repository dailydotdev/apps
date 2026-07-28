import type { HTMLAttributes, ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Link from '../../utilities/Link';
import { SourceAvatar } from './SourceAvatar';
import type { Source } from '../../../graphql/sources';
import { ProfileImageSize } from '../../ProfilePicture';

export type LinkableSource = Pick<Source, 'image' | 'handle'> &
  Partial<Pick<Source, 'name' | 'permalink'>>;

export interface SourceAvatarLinkProps extends HTMLAttributes<HTMLElement> {
  source: LinkableSource;
  size?: ProfileImageSize;
  avatarClassName?: string;
}

/**
 * A source avatar that navigates to the source (or squad) page, matching the
 * behavior of the single source avatar on article cards. Falls back to a bare
 * avatar when the query that produced the source did not select `permalink`.
 */
function SourceAvatarLinkComponent(
  {
    source,
    size = ProfileImageSize.Medium,
    className,
    avatarClassName,
    ...props
  }: SourceAvatarLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  const avatar = (
    <SourceAvatar className={avatarClassName} source={source} size={size} />
  );

  // No permalink means nothing to link to, but the ref still has to reach a DOM
  // node: Radix's hover card trigger composes one onto this component and never
  // opens without it. A span (not an href-less anchor) also keeps the click
  // falling through to the card link, since `.card a` gets pointer-events: all.
  if (!source?.permalink) {
    return (
      <span
        {...props}
        ref={ref as Ref<HTMLSpanElement>}
        className={classNames('flex', className)}
      >
        {avatar}
      </span>
    );
  }

  return (
    <Link href={source.permalink} passHref prefetch={false}>
      <a
        {...props}
        ref={ref}
        aria-label={`Go to ${source.name ?? source.handle}`}
        className={classNames('pointer-events-auto flex', className)}
      >
        {avatar}
      </a>
    </Link>
  );
}

export const SourceAvatarLink = forwardRef(SourceAvatarLinkComponent);
