import dynamic from 'next/dynamic';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';
import { PostOrigin } from '../../hooks/log/useLogContextData';
import { useShareComment } from '../../hooks/useShareComment';
import { useUpvoteQuery } from '../../hooks/useUpvoteQuery';
import { AuthTriggers } from '../../lib/auth';
import { NewComment, NewCommentRef } from './NewComment';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import { Comment } from '../../graphql/comments';
import { Origin } from '../../lib/log';
import {
  isSourcePublicSquad,
  SQUAD_COMMENT_JOIN_BANNER_KEY,
} from '../../graphql/squads';
import usePersistentContext from '../../hooks/usePersistentContext';
import { PostContentShare } from './common/PostContentShare';
import { SourceType } from '../../graphql/sources';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { AdAsComment } from '../comments/AdAsComment';
import { PostContentReminder } from './common/PostContentReminder';

const AuthorOnboarding = dynamic(
  () => import(/* webpackChunkName: "authorOnboarding" */ './AuthorOnboarding'),
);

interface PostEngagementsProps {
  post: Post;
  logOrigin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  onCopyLinkClick?: (post?: Post) => void;
}

function PostEngagements({
  post,
  onCopyLinkClick,
  logOrigin,
  shouldOnboardAuthor,
}: PostEngagementsProps): ReactElement {
  const { completeAction } = useActions();
  const postQueryKey = ['post', post.id];
  const { user, showLogin } = useAuthContext();
  const commentRef = useRef<NewCommentRef>();
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const [permissionNotificationCommentId, setPermissionNotificationCommentId] =
    useState<string>();
  const [joinNotificationCommentId, setJoinNotificationCommentId] =
    useState<string>();
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(logOrigin);
  const [isJoinSquadBannerDismissed] = usePersistentContext(
    SQUAD_COMMENT_JOIN_BANNER_KEY,
    false,
  );

  const onCommented = (comment: Comment, isNew: boolean) => {
    if (!isNew) {
      return;
    }

    setPermissionNotificationCommentId(comment.id);

    if (
      isSourcePublicSquad(post.source) &&
      !post.source?.currentMember &&
      !isJoinSquadBannerDismissed
    ) {
      setJoinNotificationCommentId(comment.id);
    }

    if (post.source?.type === SourceType.Squad) {
      completeAction(ActionType.SquadFirstComment);
    }
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
        onCopyLinkClick={onCopyLinkClick}
        post={post}
        postQueryKey={postQueryKey}
        onComment={() =>
          commentRef.current.onShowInput(Origin.PostCommentButton)
        }
        actionsClassName="hidden laptop:flex"
        origin={logOrigin}
      />
      <PostContentReminder post={post} />
      <PostContentShare post={post} />
      <NewComment
        className={{ container: 'mt-6 hidden tablet:flex' }}
        post={post}
        ref={commentRef}
        onCommented={onCommented}
      />
      <AdAsComment postId={post.id} />
      <PostComments
        post={post}
        origin={logOrigin}
        onShare={(comment) => openShareComment(comment, post)}
        onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
        permissionNotificationCommentId={permissionNotificationCommentId}
        joinNotificationCommentId={joinNotificationCommentId}
        onCommented={onCommented}
      />
      {authorOnboarding && (
        <AuthorOnboarding
          onSignUp={
            !user && (() => showLogin({ trigger: AuthTriggers.Author }))
          }
        />
      )}
    </>
  );
}

export default PostEngagements;
