import React, {
  ReactElement,
  useState,
  CSSProperties,
  useContext,
} from 'react';
import classNames from 'classnames';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { usePostComment } from '@dailydotdev/shared/src/hooks/usePostComment';
import { NewComment } from '@dailydotdev/shared/src/components/post/NewComment';
import { PostComments } from '@dailydotdev/shared/src/components/post/PostComments';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import NewCommentModal from '@dailydotdev/shared/src/components/modals/NewCommentModal';
import { useBackgroundRequest } from './useBackgroundRequest';
import { getCompanionWrapper } from './common';

interface CompanionDiscussionProps {
  post: PostBootData;
  className?: string;
  style?: CSSProperties;
  onShowUpvoted: (commentId: string, upvotes: number) => unknown;
}

export function CompanionDiscussion({
  post,
  className,
  onShowUpvoted,
}: CompanionDiscussionProps): ReactElement {
  if (!post) {
    return null;
  }

  const [input, setInput] = useState<string>('');
  const { user } = useContext(AuthContext);
  const {
    closeNewComment,
    openNewComment,
    onCommentClick,
    updatePostComments,
    parentComment,
  } = usePostComment(post);
  const mutationKey = ['post_comments_mutations', post?.id];
  const postCommentsQueryKey = ['post_comments', post?.id];
  const previewQueryKey = ['comment_preview', input];
  const mentionQueryKey = ['user-mention', post?.id];
  useBackgroundRequest(mentionQueryKey);
  useBackgroundRequest(previewQueryKey);
  useBackgroundRequest(postCommentsQueryKey);
  useBackgroundRequest(mutationKey, ({ req, res }) => {
    const isNew = req.variables.id !== res.comment.id;
    updatePostComments(res.comment, isNew);
    closeNewComment();
  });

  return (
    <>
      <div
        className={classNames(
          className,
          'p-6 rounded-bl-16 border border-r-0 bg-theme-bg-primary border-theme-label-primary border-t-theme-divider-tertiary',
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
      </div>
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentSelector={getCompanionWrapper}
          onRequestClose={closeNewComment}
          onInputChange={setInput}
          {...parentComment}
        />
      )}
    </>
  );
}
