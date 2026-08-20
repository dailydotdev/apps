import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostComments } from '../PostComments';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ARBITRAGE_SLOT } from './slots';

export interface ArbitrageCommentsProps {
  post: Post;
}

/**
 * Comment thread with the two in-thread slots. Slot 7 sits where AdAsComment
 * already runs on the classic template; slot 8 follows the thread. The composer
 * is omitted — anonymous visitors cannot post, and it only pushes slots down.
 */
export function ArbitrageComments({
  post,
}: ArbitrageCommentsProps): ReactElement {
  return (
    // gap-4 rather than margins on the children: an ad slot that collapses when
    // unfilled would otherwise leave its margin behind as an empty band.
    <div className="flex flex-col gap-4">
      <h2 className="font-bold typo-body">Discussion</h2>
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.commentNative}
        format={ArbitrageAdFormat.Native}
        reach="30%"
        hideOnPhone
      />
      <PostComments post={post} origin={Origin.ArticlePage} />
      <ArbitrageAdSlot
        slot={ARBITRAGE_SLOT.commentMpu}
        format={ArbitrageAdFormat.Rectangle}
        reach="22%"
      />
    </div>
  );
}
