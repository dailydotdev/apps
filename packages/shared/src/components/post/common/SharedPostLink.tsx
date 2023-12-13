import Link from 'next/link';
import React, { ReactElement, ReactNode } from 'react';
import { Post } from '../../../graphql/posts';
import { CombinedClicks } from '../../../lib/click';

interface SharedPostTitleProps {
  post: Post;
  children: ReactNode;
  className?: string;
  onGoToLinkProps?: CombinedClicks;
}

export const SharedPostLink = ({
  post,
  className,
  children,
  onGoToLinkProps,
}: SharedPostTitleProps): ReactElement => {
  const isUnknownSource = post.sharedPost.source.id === 'unknown';
  const { href, as, ...props } = isUnknownSource
    ? {
        href: post.sharedPost.permalink,
        target: '_blank',
        rel: 'noopener',
        as: undefined,
        ...onGoToLinkProps,
      }
    : {
        href: `${post.sharedPost.commentsPermalink}?squad=${post.source.handle}&n=${post.source.name}`,
        as: post.sharedPost.commentsPermalink,
      };

  return (
    <Link href={href} as={as}>
      <a {...props} className={className}>
        {children}
      </a>
    </Link>
  );
};
