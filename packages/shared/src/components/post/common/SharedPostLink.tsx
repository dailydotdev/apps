import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { Post, SharedPost } from '../../../graphql/posts';
import type { CombinedClicks } from '../../../lib/click';

interface SharedPostTitleProps {
  sharedPost: SharedPost;
  source: Post['source'];
  children: ReactNode;
  className?: string;
  onGoToLinkProps?: CombinedClicks;
}

export const SharedPostLink = ({
  sharedPost,
  source,
  className,
  children,
  onGoToLinkProps,
}: SharedPostTitleProps): ReactElement => {
  const isUnknownSource = sharedPost.source.id === 'unknown';
  const { href, as, ...props } = isUnknownSource
    ? {
        href: sharedPost.permalink,
        target: '_blank',
        rel: 'noopener',
        as: undefined,
        ...onGoToLinkProps,
      }
    : {
        href: `${sharedPost.commentsPermalink}?squad=${source.handle}&n=${source.name}`,
        as: sharedPost.commentsPermalink,
      };

  return (
    <Link href={href} as={as}>
      <a {...props} className={className}>
        {children}
      </a>
    </Link>
  );
};
