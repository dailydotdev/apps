import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostComments } from '../PostComments';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT, COMMENTS_PER_INTERLEAVED_AD } from './slots';

export interface ArbitrageCommentsProps {
  post: Post;
}

/**
 * Comment thread, styled exactly as the standard post page renders it. Nothing
 * sits between the heading and the first comment any more: the units that used
 * to open and close the thread now follow it, so everything from the action bar
 * to the end of the discussion reads as the normal product.
 *
 * The exception is a long thread, where a native unit appears after every
 * COMMENTS_PER_INTERLEAVED_AD comments. It never renders after the last one,
 * which would only double up with the ad block below.
 *
 * The composer is omitted — anonymous visitors cannot post.
 */
export function ArbitrageComments({
  post,
}: ArbitrageCommentsProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold typo-body">Discussion</h2>
      <PostComments
        post={post}
        origin={Origin.ArticlePage}
        interleaveEvery={COMMENTS_PER_INTERLEAVED_AD}
        renderInterleaved={() => (
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.commentNative}
            format={ArbitrageAdFormat.Native}
            reach="30%"
          />
        )}
      />
    </div>
  );
}
