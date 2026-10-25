import dynamic from 'next/dynamic';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import type { Post } from '../../../graphql/posts';
import type { Comment } from '../../../graphql/comments';
import { SortCommentsBy } from '../../../graphql/comments';
import {
  isSourcePublicSquad,
  SQUAD_COMMENT_JOIN_BANNER_KEY,
} from '../../../graphql/squads';
import { SourceType } from '../../../graphql/sources';
import { ActionType } from '../../../graphql/actions';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { useActions } from '../../../hooks/useActions';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { usePostComments } from '../../../hooks/comments/usePostComments';
import { useOpenPostCommentRequest } from '../../../hooks/post/useOpenPostCommentRequest';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { AuthTriggers } from '../../../lib/auth';
import { fallbackImages } from '../../../lib/config';
import { Origin } from '../../../lib/log';
import type { NewCommentRef } from '../NewComment';
import { NewComment } from '../NewComment';
import { PostActions } from '../PostActions';
import { PostComments } from '../PostComments';
import { PostUpvotesCommentsCount } from '../PostUpvotesCommentsCount';
import { PostContentShare } from '../common/PostContentShare';
import { PostContentReminder } from '../common/PostContentReminder';
import { DiscussionShareRow } from '../focus/DiscussionShareRow';
import { EndOfThreadShare } from '../../../features/snapshot/EndOfThreadShare';
import { useStoredCommentDraft } from '../../fields/RichTextEditor/useDraftStorage';
import { AdAsComment } from '../../comments/AdAsComment';
import SocialBar from '../../cards/socials/SocialBar';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../../ProfilePicture';
import { Image } from '../../image/Image';
import { ClickableText } from '../../buttons/ClickableText';
import { IconSize } from '../../Icon';
import { TimeSortIcon } from '../../icons/Sort/Time';

const AuthorOnboarding = dynamic(
  () =>
    import(/* webpackChunkName: "authorOnboarding" */ '../AuthorOnboarding'),
);

const CommentInput = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInput" */ '../../comments/CommentInput'
    ),
);

interface PostHybridDiscussionProps {
  post: Post;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  onCopyLinkClick?: (post?: Post) => void;
  /** Between the share band and the discussion: answered questions, ads. */
  beforeDiscussion?: ReactNode;
  /** The programmatic thread units replace the internal comment ad. */
  hideInternalAd?: boolean;
  interleaveEvery?: number;
  renderInterleaved?: (occurrence: number) => ReactNode;
}

/**
 * PostEngagements in the hybrid's order: production's counts and action row,
 * then the redesign's discussion with a quiet composer row, share to Squad,
 * sort as a text link, the thread and the end of thread share. It sits in
 * the column's `gap-4` flow, so its children carry no margins of their own.
 */
export function PostHybridDiscussion({
  post,
  origin,
  shouldOnboardAuthor,
  onCopyLinkClick,
  beforeDiscussion,
  hideInternalAd,
  interleaveEvery,
  renderInterleaved,
}: PostHybridDiscussionProps): ReactElement {
  const { completeAction } = useActions();
  const { user, showLogin } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const { commentsCount } = usePostComments({ postId: post.id, sortBy });
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const commentRef = useRef<NewCommentRef>(null);
  const discussionRef = useRef<HTMLElement>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const [joinNotificationCommentId, setJoinNotificationCommentId] =
    useState<string>();
  const draft = useStoredCommentDraft(post.id, !!user && !isComposerOpen);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(origin);
  const [isJoinSquadBannerDismissed] = usePersistentContext(
    SQUAD_COMMENT_JOIN_BANNER_KEY,
    false,
  );
  const [linkClicked, setLinkClicked] = useState(false);
  const { interaction } = usePostActions({ post });
  const showSocialBar = linkClicked && interaction !== 'upvote';

  const openComposer = (commentOrigin: Origin) =>
    commentRef.current?.onShowInput(commentOrigin);

  const onComment = () => {
    discussionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    openComposer(Origin.PostCommentButton);
  };

  const handleLinkClick = () => {
    setLinkClicked(true);
    onCopyLinkClick?.(post);
  };

  const onCommented = (comment: Comment, isNew: boolean) => {
    if (!isNew) {
      return;
    }

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

  useOpenPostCommentRequest(commentRef);

  return (
    <>
      <PostUpvotesCommentsCount
        post={post}
        onUpvotesClick={(upvotes) => onShowUpvoted(post.id, upvotes)}
        className="!mb-0"
      />
      <PostActions
        onCopyLinkClick={handleLinkClick}
        post={post}
        postQueryKey={['post', post.id]}
        onComment={onComment}
        origin={origin}
      />
      <PostContentReminder post={post} />
      <PostContentShare post={post} />
      {showSocialBar && <SocialBar post={post} />}
      {beforeDiscussion}
      <section
        ref={discussionRef}
        aria-label="Discussion"
        className="flex min-w-0 scroll-mt-[calc(var(--safe-area-top,0px)+var(--shell-top,4rem))] flex-col gap-2"
      >
        {!isComposerOpen && (
          <button
            type="button"
            aria-label="Add a comment"
            onClick={() => openComposer(Origin.StartDiscussion)}
            className="group flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 text-left transition-colors hover:border-border-subtlest-primary"
          >
            {user ? (
              <ProfilePicture
                className="shrink-0"
                nativeLazyLoading
                size={ProfileImageSize.Medium}
                user={user}
              />
            ) : (
              <Image
                alt="Placeholder image for anonymous user"
                aria-hidden
                className={classNames(
                  'shrink-0',
                  getProfilePictureClasses(ProfileImageSize.Medium),
                )}
                fetchPriority="low"
                height={32}
                loading="lazy"
                role="presentation"
                src={fallbackImages.avatar}
                width={32}
              />
            )}
            {draft ? (
              <span className="min-w-0 flex-1 truncate text-text-secondary typo-callout">
                <span className="font-bold">Draft:</span> {draft}
              </span>
            ) : (
              <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
                Share your thoughts…
              </span>
            )}
            <span className="shrink-0 rounded-10 bg-background-default px-3 py-1.5 text-text-secondary transition-colors typo-footnote group-hover:text-text-primary">
              Comment
            </span>
          </button>
        )}
        <div className={classNames(isComposerOpen && 'animate-composer-in')}>
          <NewComment
            post={post}
            ref={commentRef}
            className={{ container: '!hidden' }}
            onCommented={onCommented}
            onComposerOpenChange={setIsComposerOpen}
            shouldHandleCommentQuery
            size={ProfileImageSize.Medium}
            CommentInput={CommentInput}
          />
        </div>
        <DiscussionShareRow post={post} withSquads />
        {!isPlus && !hideInternalAd && (
          <div className="py-2 empty:hidden">
            <AdAsComment postId={post.id} source={post.source} isCompact />
          </div>
        )}
        {commentsCount > 0 && (
          <ClickableText
            type="button"
            defaultTypo={false}
            className="mb-2 w-fit gap-1 typo-footnote"
            onClick={() =>
              setSortBy(
                isNewestFirst
                  ? SortCommentsBy.OldestFirst
                  : SortCommentsBy.NewestFirst,
              )
            }
          >
            {isNewestFirst ? 'Newest first' : 'Oldest first'}
            <TimeSortIcon
              secondary
              size={IconSize.XSmall}
              className={isNewestFirst ? undefined : 'rotate-180'}
            />
          </ClickableText>
        )}
        <PostComments
          post={post}
          sortBy={sortBy}
          origin={origin}
          interleaveEvery={interleaveEvery}
          renderInterleaved={renderInterleaved}
          isComposerOpen={isComposerOpen}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
          joinNotificationCommentId={joinNotificationCommentId}
          onCommented={onCommented}
          removeSpacing
        />
        <EndOfThreadShare
          commentsCount={commentsCount}
          post={post}
          className="mt-4"
        />
      </section>
      {authorOnboarding && (
        <AuthorOnboarding
          onSignUp={
            user ? undefined : () => showLogin({ trigger: AuthTriggers.Author })
          }
        />
      )}
    </>
  );
}
