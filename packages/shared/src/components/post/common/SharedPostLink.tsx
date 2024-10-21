import React, { ReactElement, ReactNode } from 'react';
import Link from '../../utilities/Link';
import { Post, SharedPost } from '../../../graphql/posts';
import { CombinedClicks } from '../../../lib/click';

interface SharedPostTitleProps {
  sharedPost: SharedPost;
  mainSource: Post['source'];
  children: ReactNode;
  className?: string;
  onGoToLinkProps?: CombinedClicks;
}

export const SharedPostLink = ({
  sharedPost,
  mainSource,
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
        href: `${sharedPost.commentsPermalink}?squad=${mainSource.handle}&n=${mainSource.name}`,
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
