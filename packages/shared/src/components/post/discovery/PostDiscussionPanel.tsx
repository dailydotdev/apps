import dynamic from 'next/dynamic';
import type { LegacyRef, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { Origin } from '../../../lib/log';
import { PostComments } from '../PostComments';
import type {
  NewCommentRef,
  NewCommentTriggerRenderProps,
} from '../NewComment';
import { NewComment } from '../NewComment';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { SendAirplaneIcon } from '../../icons';
import { IconSize } from '../../Icon';
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../../ProfilePicture';
import { Image } from '../../image/Image';
import { fallbackImages } from '../../../lib/config';
import ShareBar from '../../ShareBar';
import { DiscussionMetaBar } from './DiscussionMetaBar';

const CommentInputOrModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentInputOrModal" */ '../../comments/CommentInputOrModal'
    ),
);

export interface PostDiscussionPanelProps {
  post: Post;
  origin?: Origin;
  className?: string;
  /**
   * Renders the post stats + comment sort strip inside the panel. Disable it
   * when a parent (e.g. the discovery focus card) surfaces the strip elsewhere.
   */
  showMetaBar?: boolean;
  /**
   * Lets a parent (e.g. a floating "comment" action) focus the composer.
   */
  onRegisterFocusComment?: (fn: () => void) => void;
  /**
   * The element the comment edit/reply modals portal into. Defaults to the
   * panel root so modals stay scoped to this surface.
   */
  modalParentSelector?: () => HTMLElement;
}

const noopFocus = (): void => {};

/**
 * The discussion surface (comments, composer, share) shared by the reader's
 * EngagementRail and the post discovery focus card. Extracted so both surfaces
 * stay in sync instead of duplicating the comment stack.
 */
export const PostDiscussionPanel = ({
  post,
  origin = Origin.ArticlePage,
  className,
  showMetaBar = true,
  onRegisterFocusComment,
  modalParentSelector,
}: PostDiscussionPanelProps): ReactElement => {
  const { sortCommentsBy: sortBy } = useSettingsContext();
  const commentRef = useRef<NewCommentRef | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(origin);

  useEffect(() => {
    if (!onRegisterFocusComment) {
      return undefined;
    }

    const run = (): void => {
      commentRef.current?.onShowInput(Origin.PostCommentButton);
    };
    onRegisterFocusComment(run);

    return () => {
      onRegisterFocusComment(noopFocus);
    };
  }, [onRegisterFocusComment, post.id]);

  const resolveModalParent = (): HTMLElement => {
    if (modalParentSelector) {
      return modalParentSelector();
    }

    return rootRef.current ?? document.body;
  };

  const renderComposerTrigger = ({
    user: triggerUser,
    onCommentClick,
  }: NewCommentTriggerRenderProps): ReactElement => (
    <button
      type="button"
      aria-label="Add a comment"
      onClick={() => onCommentClick(Origin.StartDiscussion)}
      className="group flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2 pl-3 text-left transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover"
    >
      {triggerUser ? (
        <ProfilePicture
          className="shrink-0"
          nativeLazyLoading
          size={ProfileImageSize.Medium}
          user={triggerUser}
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
      <span className="min-w-0 flex-1 truncate text-text-tertiary typo-callout">
        Add a comment…
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-12 bg-background-default text-text-secondary transition-colors group-hover:text-text-primary">
        <SendAirplaneIcon size={IconSize.Small} />
      </span>
    </button>
  );

  return (
    <section
      ref={rootRef}
      aria-label="Discussion"
      className={classNames('flex min-h-0 min-w-0 flex-col gap-2', className)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <PostComments
          post={post}
          sortBy={sortBy}
          origin={origin}
          isComposerOpen={isComposerOpen}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
          modalParentSelector={resolveModalParent}
        />
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t border-border-subtlest-tertiary pt-3">
        <NewComment
          post={post}
          ref={commentRef as LegacyRef<NewCommentRef>}
          shouldHandleCommentQuery
          onComposerOpenChange={setIsComposerOpen}
          size={ProfileImageSize.Medium}
          CommentInputOrModal={CommentInputOrModal}
          renderTrigger={renderComposerTrigger}
        />
        {showMetaBar && <DiscussionMetaBar post={post} />}
        <div className="border-t border-border-subtlest-tertiary pt-3">
          <ShareBar post={post} visibleRows={1} />
        </div>
      </div>
    </section>
  );
};
