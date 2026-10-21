import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import CollapsedRepliesPreview from '@dailydotdev/shared/src/components/comments/CollapsedRepliesPreview';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import type { AuthOptionsProps } from '@dailydotdev/shared/src/components/auth/common';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import type { AuthTriggersType } from '@dailydotdev/shared/src/lib/auth';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

// The logged-out comment section, X style: a few real comments, then
// skeleton comments that fade under a sign-up gate. Built only from
// production parts (MainComment, CollapsedRepliesPreview, Button), so what
// moves into packages/shared later is this file's layout and copy, nothing
// re-drawn.

/** How the gate asks. */
export type GateVariant = 'inline' | 'providers' | 'bar';
/** What happens to replies under a visible comment. */
export type ReplyMode = 'locked' | 'counted';
/** Why the reader was asked, logged with the sign-up trigger. */
export type SignupReason = 'gate' | 'replies' | 'skeleton';

export const VISIBLE_LIMIT = 3;

/** The sign-up trigger the gate would log; a new AuthTriggers value in the app. */
export const COMMENTS_TEASER_TRIGGER = 'comments teaser' as AuthTriggersType;

export interface TeaserProps {
  post: Post;
  comments: Comment[];
  /** post.numComments: every comment, replies included. */
  numComments: number;
  variant?: GateVariant;
  replies?: ReplyMode;
  limit?: number;
  onSignup: (reason: SignupReason) => void;
  onLogin?: () => void;
  className?: string;
}

const noop = (): void => undefined;

export const formatCount = (value: number): string =>
  largeNumberFormat(value) ?? `${value}`;

interface GateCopy {
  title: string;
  description: string;
  cta: string;
}

/**
 * The copy only teases when something is actually behind the gate. With
 * every comment already on screen it invites instead: a skeleton is a
 * placeholder for the reader's own comment, not a promise of more.
 */
export const gateCopy = (total: number, hidden: number): GateCopy => {
  if (total === 0) {
    return {
      title: 'Join the conversation',
      description: 'Be the first to share your take on this post.',
      cta: 'Sign up to comment',
    };
  }
  if (hidden <= 0) {
    return {
      title: 'Join the conversation',
      description: 'Sign up to reply, upvote, and follow this discussion.',
      cta: 'Sign up to reply',
    };
  }
  return {
    title: `See all ${formatCount(total)} comments`,
    description: 'Sign up to read the whole discussion and add your take.',
    cta: 'Sign up to see all',
  };
};

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
 * A comment drawn in grey, on CommentContainer's geometry: the bordered
 * card, 40px avatar, name · handle · time row, the reputation badge row, two
 * lines of text and the action row. surface-active (16%), not X's 8%:
 * the same 8% (surface-float) all but vanishes on the dark theme. Static on purpose: a pulse says
 * "loading" and the reader waits; a still shape says "there is something
 * here" and the reader acts.
 */
export const SkeletonComment = ({
  lines = [100, 84],
  className,
}: {
  lines?: number[];
  className?: string;
}): ReactElement => (
  <div
    aria-hidden
    className={classNames(
      'flex flex-col rounded-16 border border-border-subtlest-tertiary p-4',
      className,
    )}
  >
    <div className="flex flex-row">
      <span className="size-10 rounded-12 bg-surface-active" />
      <div className="ml-3 flex flex-1 flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-6" />
        </div>
        <Bar className="h-3.5 w-10 !rounded-6" />
      </div>
    </div>
    <div className="mt-4 flex flex-col gap-2.5">
      {lines.map((width, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Bar key={index} className="h-3" style={{ width: `${width}%` }} />
      ))}
    </div>
    {/* CommentActionButtons: upvote, downvote, reply, share, ⋯ on the
        left, the upvote count on the right. */}
    <div className="mt-5 flex items-center">
      <div className="flex flex-1 items-center gap-4">
        {[0, 1, 2, 3, 4].map((key) => (
          <span key={key} className="size-5 rounded-full bg-surface-active" />
        ))}
      </div>
      <Bar className="h-3 w-16" />
    </div>
  </div>
);

/* ---------------------------------------------------------------- gate */

// X's fade, measured on x.com logged out: clear at the top, 45% at about
// two thirds, solid under the heading. Fixed stops rather than X's
// percentages, because the gate here grows with its sign-up buttons (much
// taller on a phone) and a percentage fade would leave the heading on a
// see-through band. Written against the theme token, so light and dark both
// work.
export const fadeStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to bottom, transparent 0, color-mix(in srgb, var(--theme-background-default) 45%, transparent) 2.5rem, var(--theme-background-default) 5rem)',
};

export const GateActions = ({
  variant,
  cta,
  onSignup,
  onLogin,
}: {
  variant: GateVariant;
  cta: string;
  onSignup: () => void;
  onLogin: () => void;
}): ReactElement => {
  if (variant === 'providers') {
    // The centred SignupWidget's sign-up, prop for prop: Google solid,
    // GitHub a fill, email a text link, then terms and "Log in".
    const onAuthStateUpdate: AuthOptionsProps['onAuthStateUpdate'] = (props) =>
      props.isLoginFlow ? onLogin() : onSignup();
    return (
      <div className="w-full max-w-[26.25rem]">
        <AuthOptions
          ignoreMessages
          formRef={null as unknown as AuthOptionsProps['formRef']}
          trigger={COMMENTS_TEASER_TRIGGER}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          signupStyle="singlePrimary"
          preferGithub={false}
          className={{
            container: '!min-h-0 !max-w-none !overflow-visible',
          }}
          onAuthStateUpdate={onAuthStateUpdate}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[20rem] flex-col items-center gap-3">
      <Button
        className="w-full"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        onClick={onSignup}
      >
        {cta}
      </Button>
      <p className="text-text-tertiary typo-footnote">
        Already have an account?{' '}
        <button
          type="button"
          className="font-bold text-text-primary underline"
          onClick={onLogin}
        >
          Log in
        </button>
      </p>
    </div>
  );
};

/**
 * Skeleton comments under a fade, the ask sitting on the fade. In flow, not
 * fixed: it ends the comment section on every breakpoint, so it never
 * fights the page's own sticky sign-up bar for the bottom of the window.
 */
export const SkeletonGate = ({
  total,
  hidden,
  variant,
  onSignup,
  onLogin,
}: {
  total: number;
  hidden: number;
  variant: GateVariant;
  onSignup: (reason: SignupReason) => void;
  onLogin: () => void;
}): ReactElement => {
  const copy = gateCopy(total, hidden);
  const isBar = variant === 'bar';

  return (
    <section
      aria-label={copy.title}
      className="flex flex-col"
      data-testid="comments-teaser-gate"
    >
      {/* The skeleton itself is a way in, like X's: a reader who taps
          the grey comment wants what is behind it. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="flex flex-col gap-4 text-left"
        onClick={() => onSignup('skeleton')}
      >
        <SkeletonComment />
        <SkeletonComment lines={[92, 60]} />
      </button>
      {/* The ask rises over the second skeleton: the first reads in full,
          the second fades out under X's gradient, the ask sits on the
          solid part. */}
      <div className="relative -mt-28 flex flex-col items-center gap-1 px-4 pb-2 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 -top-8 bottom-0"
          style={fadeStyle}
        />
        <h3 className="relative mt-14 font-bold text-text-primary text-balance typo-title3">
          {isBar && hidden > 0
            ? `${formatCount(hidden)} more ${
                hidden === 1 ? 'comment' : 'comments'
              }`
            : copy.title}
        </h3>
        {isBar ? (
          // The page's bottom bar asks, with the heading this would repeat;
          // the gate only says what is behind it.
          <p className="relative text-text-tertiary text-pretty typo-callout">
            {hidden > 0
              ? 'Sign up below to read them.'
              : 'Sign up below to add yours.'}
          </p>
        ) : (
          <>
            <p className="relative mb-4 max-w-[28rem] text-text-secondary text-pretty typo-callout">
              {copy.description}
            </p>
            <div className="relative flex w-full justify-center">
              <GateActions
                variant={variant}
                cta={copy.cta}
                onSignup={() => onSignup('gate')}
                onLogin={onLogin}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------ comments */

/**
 * A real MainComment with its replies folded: the card ends in
 * CollapsedRepliesPreview, the production "View N replies" row, which asks
 * for sign-up instead of expanding. Laid out like MainComment's own
 * collapsed state (divider under the comment, preview inside the card).
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
  const replies = comment.children?.edges ?? [];
  const bare = { ...comment, children: { ...comment.children!, edges: [] } };
  return (
    <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary">
      <MainComment
        comment={bare}
        post={post}
        origin={Origin.ArticlePage}
        className={{
          container: '!border-0',
          commentBox: replies.length
            ? { container: 'rounded-b-none border-b' }
            : undefined,
        }}
        onShare={noop}
        onDelete={noop}
        onShowUpvotes={noop}
        onCommented={noop}
        postAuthorId={post.author?.id ?? null}
        postScoutId={post.scout?.id ?? null}
      />
      {replies.length > 0 && (
        <CollapsedRepliesPreview
          replies={replies}
          onExpand={() => onSignup('replies')}
        />
      )}
    </div>
  );
};

export const CommentsTeaser = ({
  post,
  comments,
  numComments,
  variant = 'inline',
  replies = 'locked',
  limit = VISIBLE_LIMIT,
  onSignup,
  onLogin = noop,
  className,
}: TeaserProps): ReactElement => {
  const { shown, count } = visibleComments(comments, limit, replies);
  const hidden = Math.max(0, numComments - count);

  return (
    <div
      className={classNames(
        '-mx-4 mb-12 mt-6 flex flex-col gap-4 mobileL:mx-0',
        className,
      )}
    >
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
            onShare={noop}
            onDelete={noop}
            onShowUpvotes={noop}
            onCommented={noop}
            postAuthorId={post.author?.id ?? null}
            postScoutId={post.scout?.id ?? null}
          />
        ),
      )}
      <SkeletonGate
        total={numComments}
        hidden={hidden}
        variant={variant}
        onSignup={onSignup}
        onLogin={onLogin}
      />
    </div>
  );
};
