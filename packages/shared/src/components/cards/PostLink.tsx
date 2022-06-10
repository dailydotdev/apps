import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import { CardLink } from './Card';

export type PostLinkProps = {
  post: Post;
  openNewTab: boolean;
  onLinkClick?: (post: Post, e?: React.MouseEvent) => unknown;
};

export default function PostLink({
  post,
  openNewTab,
  onLinkClick,
}: PostLinkProps): ReactElement {
  return (
    <CardLink
      href={post.permalink}
      {...(openNewTab
        ? { target: '_blank', rel: 'noopener' }
        : { target: '_self' })}
      title={post.title}
      onClick={(e) => onLinkClick?.(post, e)}
      onMouseUp={(event) => event.button === 1 && onLinkClick?.(post)}
    />
  );
}
