import React, { CSSProperties, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
import ShareModal from '@dailydotdev/shared/src/components/modals/ShareModal';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { useShareComment } from '@dailydotdev/shared/src/hooks/useShareComment';
import { getCompanionWrapper } from './common';
import { useCompanionPostComment } from './useCompanionPostComment';
import { useBackgroundRequest } from './useBackgroundRequest';

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
  if (!post) {
    return null;
  }

  const { user } = useContext(AuthContext);
  const {
    closeNewComment,
    openNewComment,
    onCommentClick,
    onInput,
    parentComment,
  } = useCompanionPostComment(post);
  const { shareComment, openShareComment, closeShareComment } = useShareComment(
    Origin.Companion,
  );
  const postCommentsQueryKey = ['post_comments', post?.id];
  useBackgroundRequest(postCommentsQueryKey);

  return (
    <div
      style={style}
      className={classNames(
        className,
        'pb-6 flex absolute top-full right-0 -left-px flex-col min-h-[14rem] rounded-bl-16 bg-theme-bg-primary',
      )}
    >
      <NewComment
        responsive={false}
        className="px-6 pt-0 pb-2"
        user={user}
        onNewComment={() => openNewComment('start discussion button')}
      />
      <div className="overflow-x-hidden overflow-y-auto flex-1 px-6 mt-7 border-t border-theme-divider-tertiary">
        <h3 className="my-3.5 font-bold typo-callout">Discussion</h3>
        <PostComments
          post={post}
          origin={Origin.Companion}
          applyBottomMargin={false}
          onClick={onCommentClick}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={onShowUpvoted}
          modalParentSelector={getCompanionWrapper}
        />
      </div>
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentSelector={getCompanionWrapper}
          onRequestClose={closeNewComment}
          onInputChange={onInput}
          {...parentComment}
        />
      )}
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
