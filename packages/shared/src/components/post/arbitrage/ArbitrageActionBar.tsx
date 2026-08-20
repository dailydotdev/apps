import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostActions } from '../PostActions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';

export interface ArbitrageActionBarProps {
  post: Post;
  onCopyPostLink: () => void;
}

/**
 * The standard post page's engagement counts and action bar, in the same order
 * and markup PostEngagements uses. PostEngagements itself is not rendered here
 * because it also mounts the comment composer, which anonymous visitors cannot
 * use. The actions are kept because they are what makes the page read as a post
 * rather than a doorway.
 */
export function ArbitrageActionBar({
  post,
  onCopyPostLink,
}: ArbitrageActionBarProps): ReactElement {
  const { onShowUpvoted } = useUpvoteQuery();

  return (
    <>
      <PostUpvotesCommentsCount
        post={post}
        onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
      />
      <PostActions
        post={post}
        postQueryKey={['post', post.id]}
        onCopyLinkClick={onCopyPostLink}
        origin={Origin.ArticlePage}
      />
    </>
  );
}
