import dynamic from 'next/dynamic';
import React, { ReactElement, useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Comment } from '../../graphql/comments';
import { Post } from '../../graphql/posts';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { usePostComment } from '../../hooks/usePostComment';
import { useShareComment } from '../../hooks/useShareComment';
import { useUpvoteQuery } from '../../hooks/useUpvoteQuery';
import { AuthTriggers } from '../../lib/auth';
import { PostActions, ShareBookmarkProps } from './PostActions';
import { PostComments } from './PostComments';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import MarkdownInput from '../fields/MarkdownInput';

const AuthorOnboarding = dynamic(
  () => import(/* webpackChunkName: "authorOnboarding" */ './AuthorOnboarding'),
);
const NewCommentModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "newCommentModal" */ '../modals/comment/NewCommentModal'
    ),
);
const ShareNewCommentPopup = dynamic(
  () =>
    import(
      /* webpackChunkName: "shareNewCommentPopup" */ '../ShareNewCommentPopup'
    ),
  { ssr: false },
);

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

interface PostEngagementsProps extends ShareBookmarkProps {
  post: Post;
  analyticsOrigin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  enableShowShareNewComment?: boolean;
}

function PostEngagements({
  post,
  onShare,
  onBookmark,
  analyticsOrigin,
  shouldOnboardAuthor,
  enableShowShareNewComment,
}: PostEngagementsProps): ReactElement {
  const postQueryKey = ['post', post.id];
  const { user, showLogin } = useAuthContext();
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const [permissionNotificationCommentId, setPermissionNotificationCommentId] =
    useState<string>();
  const { onShowUpvoted } = useUpvoteQuery();
  const {
    closeNewComment,
    openNewComment,
    onCommentClick,
    updatePostComments,
    onShowShareNewComment,
    parentComment,
    showShareNewComment,
  } = usePostComment(post, {
    enableShowShareNewComment,
  });
  const { shareComment, openShareComment, closeShareComment } =
    useShareComment(analyticsOrigin);

  const onComment = (comment: Comment, isNew?: boolean) => {
    if (isNew) {
      setPermissionNotificationCommentId(comment.id);
    }
    updatePostComments(comment, isNew);
  };

  useEffect(() => {
    if (shouldOnboardAuthor) {
      setAuthorOnboarding(true);
    }
  }, [shouldOnboardAuthor]);

  return (
    <>
      <PostUpvotesCommentsCount
        post={post}
        onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
      />
      <PostActions
        onBookmark={onBookmark}
        onShare={onShare}
        post={post}
        postQueryKey={postQueryKey}
        onComment={() => openNewComment('comment button')}
        actionsClassName="hidden laptop:flex"
        origin={analyticsOrigin}
      />
      {/* TODO:: Revert this after testing phase */}
      <MarkdownInput
        className="mt-4"
        postId={post.id}
        sourceId={post.source.id}
        onSubmit={() => console.log('submitted')}
      />
      <PostComments
        post={post}
        origin={analyticsOrigin}
        onClick={onCommentClick}
        onShare={(comment) => openShareComment(comment, post)}
        onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
        permissionNotificationCommentId={permissionNotificationCommentId}
      />
      {authorOnboarding && (
        <AuthorOnboarding
          onSignUp={!user && (() => showLogin(AuthTriggers.Author))}
        />
      )}
      {parentComment && (
        <NewCommentModal
          isOpen={!!parentComment}
          parentComment={parentComment}
          onRequestClose={closeNewComment}
          onComment={onComment}
          post={post}
        />
      )}
      {showShareNewComment && (
        <ShareNewCommentPopup
          post={post}
          commentId={showShareNewComment}
          onRequestClose={() => onShowShareNewComment(null)}
        />
      )}
      {shareComment && (
        <ShareModal
          isOpen={!!shareComment}
          post={post}
          comment={shareComment}
          origin={analyticsOrigin}
          onRequestClose={closeShareComment}
        />
      )}
    </>
  );
}

export default PostEngagements;
