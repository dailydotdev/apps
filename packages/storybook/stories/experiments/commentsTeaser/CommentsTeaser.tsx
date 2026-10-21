import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { AuthTriggersType } from '@dailydotdev/shared/src/lib/auth';

// The logged-out comment section, X style: a few real comments, then flat
// skeleton comments that run under the page's pinned footer. Built from the
// post page's own thread-style MainComment, so the only new drawing is the
// skeleton, and it is drawn on that comment's geometry.

/** Why the reader was asked, logged with the sign-up trigger. */
export type SignupReason = 'footer' | 'replies' | 'skeleton' | 'action';
/** What happens to replies under a visible comment. */
export type ReplyMode = 'locked' | 'counted';

export const VISIBLE_LIMIT = 3;

/** The sign-up trigger the teaser would log; a new AuthTriggers value. */
export const COMMENTS_TEASER_TRIGGER = 'comments teaser' as AuthTriggersType;

const noop = (): void => undefined;

export const formatCount = (value: number): string =>
  largeNumberFormat(value) ?? `${value}`;

/**
 * The footer's title on a post page. X says "See all the replies" even when
 * nothing is hidden; this only teases when something is.
 */
export const commentsTitle = (total: number, hidden: number): string =>
  hidden > 0
    ? `See all ${formatCount(total)} comments`
    : 'Join the conversation';

/** Trims the list to what a logged-out reader sees. */
export const visibleComments = (
  comments: Comment[],
  limit: number,
  replies: ReplyMode,
): { shown: Comment[]; count: number } => {
  if (replies === 'locked') {
    const shown = comments.slice(0, limit);
    // Replies stay folded, so only the top-level comments are read.
    return { shown, count: shown.length };
  }
  // Every comment counts against the limit, replies included, in reading
  // order: a comment and as many of its replies as still fit.
  let budget = limit;
  const shown: Comment[] = [];
  comments.forEach((item) => {
    if (budget <= 0) {
      return;
    }
    budget -= 1;
    const edges = item.children?.edges ?? [];
    const kept = edges.slice(0, Math.max(0, budget));
    budget -= kept.length;
    shown.push({ ...item, children: { ...item.children!, edges: kept } });
  });
  return { shown, count: limit - Math.max(0, budget) };
};

export const hiddenCount = (
  comments: Comment[],
  numComments: number,
  replies: ReplyMode,
  limit = VISIBLE_LIMIT,
): number =>
  Math.max(0, numComments - visibleComments(comments, limit, replies).count);

/* ------------------------------------------------------------ skeleton */

const Bar = ({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}): ReactElement => (
  <span
    className={classNames('block rounded-full bg-surface-active', className)}
    style={style}
  />
);

/**
 * A flat comment drawn in grey, on the post page's thread-style comment:
 * no card, 40px avatar, name · handle · time with the reputation badge
 * under it, then text and the action row indented to the text column
 * (52px). Static on purpose: a pulse says "loading" and the reader waits;
 * a still shape says "there is something here" and the reader acts.
 * surface-active (16%), not X's 8%: the same 8% (surface-float) all but
 * vanishes on the dark theme.
 */
export const SkeletonComment = ({
  lines = [100, 78],
  className,
}: {
  lines?: number[];
  className?: string;
}): ReactElement => (
  <div aria-hidden className={classNames('flex flex-col', className)}>
    <div className="flex flex-row">
      <span className="size-10 shrink-0 rounded-12 bg-surface-active" />
      <div className="ml-3 flex flex-1 flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-6" />
        </div>
        <Bar className="h-3.5 w-10 !rounded-6" />
      </div>
    </div>
    <div className="ml-[52px] mt-3 flex flex-col gap-2.5">
      {lines.map((width, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Bar key={index} className="h-3" style={{ width: `${width}%` }} />
      ))}
    </div>
    <div className="ml-[52px] mt-4 flex items-center gap-5">
      {[0, 1, 2, 3, 4].map((key) => (
        <span key={key} className="size-5 rounded-full bg-surface-active" />
      ))}
      <Bar className="ml-auto h-3 w-16" />
    </div>
  </div>
);

/**
 * Two skeleton comments where the hidden ones would be, X's pattern. The
 * page's pinned footer asks; tapping the grey comment asks too, since the
 * reader who taps it wants what is behind it.
 */
export const SkeletonTail = ({
  onSignup,
  className,
}: {
  onSignup: (reason: SignupReason) => void;
  className?: string;
}): ReactElement => (
  <button
    type="button"
    tabIndex={-1}
    aria-hidden
    data-testid="comments-teaser-skeleton"
    className={classNames('flex flex-col gap-6 text-left', className)}
    onClick={() => onSignup('skeleton')}
  >
    <SkeletonComment />
    <SkeletonComment lines={[92, 54]} />
  </button>
);

/* ------------------------------------------------------------ comments */

/**
 * The post page's thread-style MainComment with its replies folded. It
 * renders expanded, so it is folded once on mount through its own toggle,
 * and that toggle is then hidden: production's collapsed state, connector
 * and "N Replies" row, exactly. A tap on the row asks for sign-up instead of
 * expanding. In the app this is a `repliesLocked` prop on MainComment.
 */
const LockedThread = ({
  comment,
  post,
  onSignup,
}: {
  comment: Comment;
  post: Post;
  onSignup: (reason: SignupReason) => void;
}): ReactElement => {
  const root = useRef<HTMLDivElement>(null);
  const hasReplies = (comment.children?.edges.length ?? 0) > 0;

  useEffect(() => {
    if (!hasReplies) {
      return undefined;
    }
    // MainComment renders the toggle once the comment is in view.
    const timer = setInterval(() => {
      const toggle = root.current?.querySelector<HTMLButtonElement>(
        'button[aria-label="Collapse replies thread"]',
      );
      if (toggle) {
        toggle.click();
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [hasReplies]);

  return (
    <div
      ref={root}
      className="[&_button[aria-label='Collapse_replies_thread']]:hidden [&_button[aria-label='Expand_replies_thread']]:hidden"
      onClickCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('button[aria-label^="View "]')) {
          event.preventDefault();
          event.stopPropagation();
          onSignup('replies');
        }
      }}
    >
      <MainComment
        comment={comment}
        post={post}
        origin={Origin.ArticlePage}
        isModalThread
        onShare={noop}
        onDelete={noop}
        onShowUpvotes={noop}
        onCommented={noop}
        postAuthorId={post.author?.id ?? null}
        postScoutId={post.scout?.id ?? null}
      />
    </div>
  );
};

export interface TeaserProps {
  post: Post;
  comments: Comment[];
  replies?: ReplyMode;
  limit?: number;
  onSignup: (reason: SignupReason) => void;
  className?: string;
}

export const CommentsTeaser = ({
  post,
  comments,
  replies = 'locked',
  limit = VISIBLE_LIMIT,
  onSignup,
  className,
}: TeaserProps): ReactElement => {
  const { shown } = visibleComments(comments, limit, replies);

  return (
    // PostComments' own container for the post page (thread style).
    <div className={classNames('mb-12 mt-5 flex flex-col gap-4', className)}>
      {shown.map((item) =>
        replies === 'locked' ? (
          <LockedThread
            key={item.id}
            comment={item}
            post={post}
            onSignup={onSignup}
          />
        ) : (
          <MainComment
            key={item.id}
            comment={item}
            post={post}
            origin={Origin.ArticlePage}
            isModalThread
            onShare={noop}
            onDelete={noop}
            onShowUpvotes={noop}
            onCommented={noop}
            postAuthorId={post.author?.id ?? null}
            postScoutId={post.scout?.id ?? null}
          />
        ),
      )}
      <SkeletonTail onSignup={onSignup} className="mt-2" />
    </div>
  );
};
