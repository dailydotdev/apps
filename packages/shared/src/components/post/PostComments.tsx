import type { ReactElement, ReactNode } from 'react';
import React, { Fragment, useRef } from 'react';
import classNames from 'classnames';
import type { Comment, SortCommentsBy } from '../../graphql/comments';
import { getCommentHash } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import type { MainCommentProps } from '../comments/MainComment';
import MainComment from '../comments/MainComment';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { Origin } from '../../lib/log';
import type { CommentClassName } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useDeleteComment } from '../../hooks/comments/useDeleteComment';
import { usePostComments } from '../../hooks/comments/usePostComments';
import { useScrollToHashComment } from '../../hooks/comments/useScrollToHashComment';
import { lazyCommentThreshold } from '../utilities';
import { isNullOrUndefined } from '../../lib/func';
import { useCommentContentPreferenceMutationSubscription } from './useCommentContentPreferenceMutationSubscription';
import { CharmEmptyState } from '../charm/CharmEmptyState';
import { cloudinaryCharmNoComments } from '../../lib/image';
import { CommentsTeaserSkeleton } from '../../features/commentsTeaser/CommentsTeaserSkeleton';
import { COMMENTS_TEASER_LIMIT } from '../../features/commentsTeaser/commentsTeaser';

const threadCommentOrigins = new Set<Origin>([
  Origin.ArticleModal,
  Origin.ReaderModal,
  Origin.ArticlePage,
  Origin.CollectionModal,
  Origin.BriefModal,
  Origin.BriefPage,
]);

interface PostCommentsProps {
  post: Post;
  origin: Origin;
  sortBy?: SortCommentsBy;
  isComposerOpen?: boolean;
  joinNotificationCommentId?: string;
  modalParentSelector?: () => HTMLElement | null;
  onShare?: (comment: Comment) => void;
  onClickUpvote?: (commentId: string, upvotes: number) => unknown;
  className?: CommentClassName;
  onCommented?: MainCommentProps['onCommented'];
  canReply?: MainCommentProps['canReply'];
  onReplyBlocked?: MainCommentProps['onReplyBlocked'];
  forceInlineComposer?: MainCommentProps['forceInlineComposer'];
  /**
   * Renders after the top-level comment at which the running total of
   * comments — replies included, every comment counts — crosses a multiple
   * of `interleaveEvery`. Used by the ad template to break a long thread up;
   * never after the last top-level comment, where whatever follows the
   * thread already sits. Both props are required together, and without them
   * the list keeps its original markup.
   */
  interleaveEvery?: number;
  renderInterleaved?: (occurrence: number) => ReactNode;
  /**
   * The logged-out teaser: the first few top-level comments with their
   * replies folded, then skeleton comments for the rest (and instead of the
   * empty state). Every way into the hidden part calls `onTeaserSignup`.
   */
  teaser?: boolean;
  onTeaserSignup?: () => void;
}

const noopShare = (): void => {};
const noopShowUpvotes = (): void => {};

export function PostComments({
  post,
  origin,
  sortBy,
  isComposerOpen = false,
  onShare,
  onClickUpvote,
  modalParentSelector,
  joinNotificationCommentId,
  className = {},
  onCommented,
  canReply,
  onReplyBlocked,
  forceInlineComposer,
  interleaveEvery,
  renderInterleaved,
  teaser = false,
  onTeaserSignup,
}: PostCommentsProps): ReactElement {
  const { id } = post;
  const container = useRef<HTMLDivElement | null>(null);
  const isModalThread = threadCommentOrigins.has(origin);
  const {
    queryKey,
    comments,
    isLoading: isLoadingComments,
    commentsCount,
  } = usePostComments({ postId: id, sortBy });

  useCommentContentPreferenceMutationSubscription({ queryKey });

  const commentRef = useRef<HTMLElement | null>(null);
  const { deleteComment } = useDeleteComment();
  const { commentHash } = useScrollToHashComment({
    containerRef: container,
    commentRef,
    postId: id,
    enabled: !isLoadingComments && commentsCount > 0,
  });

  const containerClassName = isModalThread
    ? classNames('mb-12 flex flex-col gap-4', isComposerOpen ? 'mt-2' : 'mt-5')
    : '-mx-4 mb-12 mt-6 flex flex-col gap-4 mobileL:mx-0';
  // Tablet and laptop pin the teaser's footer over the end of the post
  // card; the card keeps that much room below the skeleton.
  const teaserContainerClassName = classNames(
    containerClassName,
    'tablet:!mb-44',
  );
  const teaserSkeleton = teaser && (
    <CommentsTeaserSkeleton
      className={isModalThread ? 'mt-2' : undefined}
      onClick={() => onTeaserSignup?.()}
    />
  );

  if (isLoadingComments || isNullOrUndefined(comments)) {
    // The teaser loads into its own skeleton, so nothing changes shape when
    // the comments arrive above it.
    return teaser ? (
      <div className={teaserContainerClassName} data-comments-teaser>
        {teaserSkeleton}
      </div>
    ) : (
      <PlaceholderCommentList placeholderAmount={post.numComments} />
    );
  }

  if (commentsCount === 0 && teaser) {
    return (
      <div className={teaserContainerClassName} data-comments-teaser>
        {teaserSkeleton}
      </div>
    );
  }

  if (commentsCount === 0) {
    return (
      <CharmEmptyState
        className="mb-12 mt-8"
        image={cloudinaryCharmNoComments}
        imageAlt="daily.dev charm peeking over a glowing speech bubble"
        title="No comments yet"
        description="The discussion is waiting for a spark. Share your take and get it started."
      />
    );
  }

  const getAppendTooltipParent = (): HTMLElement =>
    modalParentSelector?.() ?? container.current ?? document.body;

  return (
    <div
      className={teaser ? teaserContainerClassName : containerClassName}
      ref={container}
      data-comments-teaser={teaser || undefined}
    >
      {(() => {
        // Replies count too: the interval is over everything the reader
        // scrolls past, not just top-level rows (loaded replies — collapsed
        // pagination beyond the first page is not on screen and not counted),
        // and the boundary can only sit after a top-level block. One prefix
        // pass instead of two reductions per row.
        const allEdges = comments!.postComments.edges;
        const linkedIndex = teaser
          ? allEdges.findIndex(
              ({ node }) =>
                getCommentHash(node.id) === commentHash ||
                !!node.children?.edges?.some(
                  (child) => getCommentHash(child.node.id) === commentHash,
                ),
            )
          : -1;
        const isLocked = (index: number) => teaser && index !== linkedIndex;
        const shownEdges = teaser
          ? allEdges.slice(0, Math.max(COMMENTS_TEASER_LIMIT, linkedIndex + 1))
          : allEdges;
        const totals: number[] = [0];
        shownEdges.forEach((edge, i) => {
          const replies = isLocked(i)
            ? 0
            : edge.node.children?.edges?.length ?? 0;
          totals.push(totals[i] + 1 + replies);
        });
        return shownEdges.map((e, index, edges) => {
          const isLast = index === edges.length - 1;
          const seen = totals[index + 1];
          const shouldInterleave =
            !!interleaveEvery &&
            !!renderInterleaved &&
            !isLast &&
            Math.floor(seen / interleaveEvery) >
              Math.floor(totals[index] / interleaveEvery);

          // Always the Fragment, even rows that interleave nothing: the type at
          // a given key must not flip as the boundary moves (a new comment
          // landing shifts every index), or React remounts that comment's
          // subtree and open reply boxes lose their state.
          return (
            <Fragment key={e.node.id}>
              <MainComment
                isModalThread={isModalThread}
                className={{ commentBox: className }}
                post={post}
                origin={origin}
                commentHash={commentHash ?? undefined}
                commentRef={commentRef as React.MutableRefObject<HTMLElement>}
                comment={e.node}
                onShare={onShare ?? noopShare}
                onDelete={(comment, parentId) =>
                  deleteComment(comment.id, parentId ?? null, post)
                }
                onShowUpvotes={onClickUpvote ?? noopShowUpvotes}
                postAuthorId={post.author?.id ?? null}
                postScoutId={post.scout?.id ?? null}
                appendTooltipTo={getAppendTooltipParent}
                joinNotificationCommentId={joinNotificationCommentId}
                onCommented={onCommented}
                lazy={!commentHash && index >= lazyCommentThreshold}
                canReply={canReply}
                onReplyBlocked={onReplyBlocked}
                forceInlineComposer={forceInlineComposer}
                repliesLocked={isLocked(index)}
                onLockedRepliesClick={onTeaserSignup}
              />
              {shouldInterleave &&
                renderInterleaved(Math.floor(seen / interleaveEvery))}
            </Fragment>
          );
        });
      })()}
      {teaserSkeleton}
    </div>
  );
}
