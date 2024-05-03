import dynamic from 'next/dynamic';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { useShareComment } from '../../hooks/useShareComment';
import { useUpvoteQuery } from '../../hooks/useUpvoteQuery';
import { AuthTriggers } from '../../lib/auth';
import { NewComment, NewCommentRef } from './NewComment';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { PostUpvotesCommentsCount } from './PostUpvotesCommentsCount';
import { Comment } from '../../graphql/comments';
import { Origin } from '../../lib/analytics';
import {
  isSourcePublicSquad,
  SQUAD_COMMENT_JOIN_BANNER_KEY,
} from '../../graphql/squads';
import usePersistentContext from '../../hooks/usePersistentContext';
import { PostContentShare } from './common/PostContentShare';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, MagicIcon } from '../icons';
import { IconSize } from '../Icon';
import { webappUrl } from '../../lib/constants';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

const AuthorOnboarding = dynamic(
  () => import(/* webpackChunkName: "authorOnboarding" */ './AuthorOnboarding'),
);

interface PostEngagementsProps {
  post: Post;
  analyticsOrigin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  onCopyLinkClick?: (post?: Post) => void;
}

function PostEngagements({
  post,
  onCopyLinkClick,
  analyticsOrigin,
  shouldOnboardAuthor,
}: PostEngagementsProps): ReactElement {
  const postQueryKey = ['post', post.id];
  const { user, showLogin } = useAuthContext();
  const commentRef = useRef<NewCommentRef>();
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const [permissionNotificationCommentId, setPermissionNotificationCommentId] =
    useState<string>();
  const [joinNotificationCommentId, setJoinNotificationCommentId] =
    useState<string>();
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(analyticsOrigin);
  const [isJoinSquadBannerDismissed] = usePersistentContext(
    SQUAD_COMMENT_JOIN_BANNER_KEY,
    false,
  );
  const showSimilarPosts = useFeature(feature.similarPosts);

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
        origin={analyticsOrigin}
      />
      <PostContentShare post={post} />
      {showSimilarPosts && (
        <Button
          tag="a"
          href={`${webappUrl}posts/${post.id}/similar`}
          size={ButtonSize.Large}
          className="mt-6 border-border-subtlest-tertiary"
          variant={ButtonVariant.Option}
          icon={<MagicIcon secondary />}
        >
          Show similar posts <div className="flex-1" />
          <ArrowIcon
            secondary
            className="-mr-3 rotate-90"
            size={IconSize.Small}
          />
        </Button>
      )}
      <NewComment
        className={{ container: 'mt-6 hidden tablet:flex' }}
        post={post}
        ref={commentRef}
        onCommented={onCommented}
      />
      <PostComments
        post={post}
        origin={analyticsOrigin}
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
