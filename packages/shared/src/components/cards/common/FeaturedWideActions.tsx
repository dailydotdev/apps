import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import ActionButtons from './ActionButtons';
import { FeedCardGlassActions } from './FeedCardGlassActions';
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
  useGlass?: boolean;
};

export const FeaturedWideActions = ({
  post,
  useGlass,
  onUpvoteClick,
  onCommentClick,
  onCopyLinkClick,
  onBookmarkClick,
  onDownvoteClick,
}: FeaturedWideActionsProps): ReactElement =>
  useGlass ? (
    <>
      {/* Reserve the floating bar's footprint (h-10 + bottom-2) plus a
          small gap so the clipped text column always ends above it. */}
      <div aria-hidden className="h-14 shrink-0" />
      <FeedCardGlassActions
        post={post}
        onUpvoteClick={onUpvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
        onDownvoteClick={onDownvoteClick}
      />
    </>
  ) : (
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
