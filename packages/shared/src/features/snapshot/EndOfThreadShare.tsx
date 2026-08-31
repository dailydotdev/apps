import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { LinkIcon } from '../../components/icons';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import type { Post } from '../../graphql/posts';

/**
 * #6349's end-of-conversation band. It sits where reading actually stops, and
 * copy link is the whole offer: a still image of a live thread is stale within
 * hours, so there is no snapshot here.
 */
export function EndOfThreadShare({
  post,
  commentsCount,
}: {
  post: Post;
  commentsCount: number;
}): ReactElement | null {
  const [, copyLink] = useCopyPostLink(post.commentsPermalink);

  // Nothing to be at the end of: an empty thread has no conversation to pass
  // on, and the band would just be a second copy-link button.
  if (!commentsCount) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-12 bg-surface-float p-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-footnote">
          Enjoyed this discussion?
        </span>
        <span className="text-text-tertiary typo-caption1">
          {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'} and
          counting
        </span>
      </div>
      <Button
        icon={<LinkIcon />}
        onClick={() => copyLink()}
        size={ButtonSize.Small}
        type="button"
        variant={ButtonVariant.Secondary}
      >
        Copy link
      </Button>
    </div>
  );
}
