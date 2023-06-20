import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import ShareModal from '@dailydotdev/shared/src/components/modals/ShareModal';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { useShareComment } from '@dailydotdev/shared/src/hooks/useShareComment';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { getCompanionWrapper } from './common';

interface CompanionDiscussionProps {
  post: PostBootData;
  className?: string;
  style?: CSSProperties;
  onShowUpvoted: (commentId: string, upvotes: number) => unknown;
}

export function CompanionDiscussion({
  post,
  style,
  className,
  onShowUpvoted,
}: CompanionDiscussionProps): ReactElement {
  const commentClasses = { tab: '!min-h-[14.5rem]' };
  const { shareComment, openShareComment, closeShareComment } = useShareComment(
    Origin.Companion,
  );
  useBackgroundRequest(
    generateQueryKey(RequestKey.PostComments, null, post?.id),
  );

  if (!post) {
    return null;
  }

  return (
    <div
      style={style}
      className={classNames(
        className,
        'pb-6 flex absolute top-full right-0 -left-px flex-col min-h-[14rem] rounded-bl-16 bg-theme-bg-primary',
      )}
    >
      <span className="px-6" />
      <div className="overflow-x-hidden overflow-y-auto flex-1 px-4 mt-5 border-t border-theme-divider-tertiary">
        <h3 className="mt-4 mb-6 ml-2 font-bold typo-callout">Discussion</h3>
        <NewComment
          size="medium"
          post={post}
          className={{ ...commentClasses, container: 'mb-4' }}
        />
        <PostComments
          post={post}
          origin={Origin.Companion}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={onShowUpvoted}
          modalParentSelector={getCompanionWrapper}
          className={commentClasses}
        />
      </div>
      {shareComment && (
        <ShareModal
          isOpen={!!shareComment}
          post={post}
          comment={shareComment}
          origin={Origin.Companion}
          onRequestClose={closeShareComment}
          parentSelector={getCompanionWrapper}
        />
      )}
    </div>
  );
}
