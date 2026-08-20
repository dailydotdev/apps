import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import { PostComments } from '../PostComments';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';

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
    <div className="flex flex-col">
      <h2 className="mb-4 font-bold typo-body">Discussion</h2>
      <ArbitrageAdSlot
        slot={7}
        format={ArbitrageAdFormat.Native}
        reach="30%"
        className="mb-4"
      />
      <PostComments post={post} origin={Origin.ArticlePage} />
      <ArbitrageAdSlot
        slot={8}
        format={ArbitrageAdFormat.Rectangle}
        reach="22%"
        className="my-6"
      />
    </div>
  );
}
