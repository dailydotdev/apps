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
import {
  getProfilePictureClasses,
  ProfileImageSize,
  ProfilePicture,
} from '../../ProfilePicture';
import { Image } from '../../image/Image';
import { fallbackImages } from '../../../lib/config';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { SortCommentsBy } from '../../../graphql/comments';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { DiscussionMetaBar } from './DiscussionMetaBar';
import { DiscussionShareRow } from './DiscussionShareRow';

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
   * Renders a small comment-sort toggle ("Newest first"/"Oldest first") at the
   * top of the comment list. Used by the discovery focus card, which moves the
   * post stats/actions out of this panel.
   */
  showSortHeader?: boolean;
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
  showSortHeader = false,
  onRegisterFocusComment,
  modalParentSelector,
}: PostDiscussionPanelProps): ReactElement => {
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
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
      className="group flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 text-left transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover"
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
        Share your thoughts…
      </span>
      <span className="shrink-0 rounded-10 bg-background-default px-3 py-1.5 text-text-secondary transition-colors typo-footnote group-hover:text-text-primary">
        Comment
      </span>
    </button>
  );

  return (
    <section
      ref={rootRef}
      aria-label="Discussion"
      className={classNames('flex min-h-0 min-w-0 flex-col gap-2', className)}
    >
      <NewComment
        post={post}
        ref={commentRef as LegacyRef<NewCommentRef>}
        shouldHandleCommentQuery
        onComposerOpenChange={setIsComposerOpen}
        size={ProfileImageSize.Medium}
        CommentInputOrModal={CommentInputOrModal}
        renderTrigger={renderComposerTrigger}
      />
      <DiscussionShareRow post={post} withSquads />
      {showSortHeader && (
        <span className="flex shrink-0 flex-row items-center px-1">
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Footnote}
          >
            Sort:
          </Typography>
          <Button
            className="ml-1 !px-1 !text-text-tertiary"
            icon={
              <TimeSortIcon
                secondary
                className={isNewestFirst ? undefined : 'rotate-180'}
              />
            }
            iconPosition={ButtonIconPosition.Right}
            onClick={() =>
              setSortBy(
                isNewestFirst
                  ? SortCommentsBy.OldestFirst
                  : SortCommentsBy.NewestFirst,
              )
            }
            size={ButtonSize.XSmall}
            type="button"
            variant={ButtonVariant.Tertiary}
          >
            {isNewestFirst ? 'Newest first' : 'Oldest first'}
          </Button>
        </span>
      )}
      <div className="min-w-0">
        <PostComments
          post={post}
          sortBy={sortBy}
          origin={origin}
          isComposerOpen={isComposerOpen}
          onShare={(comment) => openShareComment(comment, post)}
          onClickUpvote={(id, count) => onShowUpvoted(id, count, 'comment')}
          modalParentSelector={resolveModalParent}
          removeTopSpacing
        />
      </div>
      {showMetaBar && (
        <div className="flex shrink-0 flex-col gap-3 pt-3">
          <DiscussionMetaBar post={post} />
        </div>
      )}
    </section>
  );
};
