import React, { ReactElement, CSSProperties, useContext } from 'react';
import classNames from 'classnames';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
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
          applyBottomMargin={false}
          onClick={onCommentClick}
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
    </div>
  );
}
