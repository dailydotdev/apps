import dynamic from 'next/dynamic';
import type { LegacyRef, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Post } from '../../../graphql/posts';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { Origin } from '../../../lib/log';
import { PostComments } from '../PostComments';
import type { NewCommentRef } from '../NewComment';
import { NewComment } from '../NewComment';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { AnalyticsIcon } from '../../icons';
import { SortCommentsBy } from '../../../graphql/comments';
import { ClickableText } from '../../buttons/ClickableText';
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { ProfileImageSize } from '../../ProfilePicture';
import ShareBar from '../../ShareBar';

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
  actionBar?: ReactNode;
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
 * The discussion surface (counts, sort, composer, comments, share) shared by
 * the reader's EngagementRail and the post discovery focus card. Extracted so
 * both surfaces stay in sync instead of duplicating the comment stack.
 */
export const PostDiscussionPanel = ({
  post,
  origin = Origin.ArticlePage,
  className,
  actionBar,
  onRegisterFocusComment,
  modalParentSelector,
}: PostDiscussionPanelProps): ReactElement => {
  const { user } = useAuthContext();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const commentRef = useRef<NewCommentRef | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { onShowUpvoted } = useUpvoteQuery();
  const { openShareComment } = useShareComment(origin);
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const sortLabel = isNewestFirst ? 'Sort: Newest first' : 'Sort: Oldest first';

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

  return (
    <section
      ref={rootRef}
      aria-label="Discussion"
      className={classNames('flex min-h-0 min-w-0 flex-col gap-3', className)}
    >
      <div className="flex shrink-0 flex-col gap-3">
        {actionBar && (
          <div className="border-b border-border-subtlest-tertiary pb-2">
            {actionBar}
          </div>
        )}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-text-tertiary typo-callout">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4">
            {upvotes > 0 && (
              <ClickableText onClick={() => onShowUpvoted(post.id, upvotes)}>
                {largeNumberFormat(upvotes)} Upvote{upvotes > 1 ? 's' : ''}
              </ClickableText>
            )}
            <span>
              {largeNumberFormat(comments)} Comment{comments === 1 ? '' : 's'}
            </span>
            {canSeeAnalytics && (
              <Link
                href={`${webappUrl}posts/${post.id}/analytics`}
                passHref
                prefetch={false}
              >
                <ClickableText
                  tag="a"
                  className="gap-1"
                  textClassName="text-text-tertiary"
                >
                  <AnalyticsIcon />
                  Analytics
                </ClickableText>
              </Link>
            )}
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              icon={
                <TimeSortIcon
                  secondary
                  className={isNewestFirst ? undefined : 'rotate-180'}
                />
              }
              onClick={() =>
                setSortBy(
                  isNewestFirst
                    ? SortCommentsBy.OldestFirst
                    : SortCommentsBy.NewestFirst,
                )
              }
              aria-label={sortLabel}
              title={sortLabel}
              className="!text-text-tertiary"
            />
          </div>
        </div>
      </div>
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
      <div className="shrink-0">
        <NewComment
          post={post}
          ref={commentRef as LegacyRef<NewCommentRef>}
          shouldHandleCommentQuery
          onComposerOpenChange={setIsComposerOpen}
          size={ProfileImageSize.Medium}
          CommentInputOrModal={CommentInputOrModal}
        />
      </div>
      <div className="shrink-0 border-t border-border-subtlest-tertiary pt-3">
        <ShareBar post={post} visibleRows={1} />
      </div>
    </section>
  );
};
