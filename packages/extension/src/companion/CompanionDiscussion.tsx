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
        'p-6 rounded-bl-16 border border-t-2 border-r-0 bg-theme-bg-primary border-theme-divider-quaternary',
      )}
    >
      <NewComment user={user} onNewComment={openNewComment} />
      <h3 className="my-8 font-bold typo-callout">Discussion</h3>
      <PostComments
        post={post}
        applyBottomMargin={false}
        onClick={onCommentClick}
        onClickUpvote={onShowUpvoted}
        modalParentSelector={getCompanionWrapper}
      />
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
