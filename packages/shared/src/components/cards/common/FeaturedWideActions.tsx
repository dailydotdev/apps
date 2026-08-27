import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import ActionButtons from './ActionButtons';
import type { PostCardProps } from './common';
import { Container } from './common';
import { CardSpace } from './Card';

export type FeaturedWideActionsProps = Pick<
  PostCardProps,
  | 'onUpvoteClick'
  | 'onCommentClick'
  | 'onCopyLinkClick'
  | 'onBookmarkClick'
  | 'onDownvoteClick'
> & {
  post: Post;
};

export const FeaturedWideActions = ({
  post,
  onUpvoteClick,
  onCommentClick,
  onCopyLinkClick,
  onBookmarkClick,
  onDownvoteClick,
}: FeaturedWideActionsProps): ReactElement => (
  <Container>
    <CardSpace />
    <ActionButtons
      post={post}
      onUpvoteClick={onUpvoteClick}
      onCommentClick={onCommentClick}
      onCopyLinkClick={onCopyLinkClick}
      onBookmarkClick={onBookmarkClick}
      onDownvoteClick={onDownvoteClick}
      variant="grid"
    />
  </Container>
);
