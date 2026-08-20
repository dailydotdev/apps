import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostActions } from '../PostActions';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { OpenLinkIcon } from '../../icons';
import { IconSize } from '../../Icon';

export interface ArbitrageActionBarProps {
  post: Post;
}

/**
 * Engagement counts, the real action bar and the outbound read button.
 *
 * The standard template gets these from PostEngagements, which this template
 * does not render (it would also pull in the comment composer, which anonymous
 * visitors cannot use). Upvote/comment/bookmark/copy are kept because they are
 * what makes the page look like a post rather than a landing page — dropping
 * them is what makes an arbitrage page read as a doorway.
 *
 * The read link stays in the same window: Google's vignette only fires on
 * same-window anchor clicks, and that is the highest-earning slot on the page.
 */
export function ArbitrageActionBar({
  post,
}: ArbitrageActionBarProps): ReactElement {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <PostUpvotesCommentsCount post={post} />
      <div className="flex flex-wrap items-center gap-3 border-y border-border-subtlest-tertiary py-2">
        <PostActions
          post={post}
          postQueryKey={['post', post.id]}
          origin={Origin.ArticlePage}
        />
        <Button
          tag="a"
          href={post.permalink}
          rel="noopener"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon size={IconSize.Small} />}
          className="ml-auto"
          data-testid="arbitrage-read-button"
        >
          Read post
        </Button>
      </div>
    </div>
  );
}
