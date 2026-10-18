import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  MiniCloseIcon,
  SparkleIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FIRST_FEED_POSTS } from './firstFeed.fixture';

export type Direction = 'today' | 'a' | 'b' | 'c';

export const directionLabels: Record<Direction, string> = {
  today: 'Today (production)',
  a: 'A · Start here on the top card',
  b: 'B · Welcome strip with one button',
  c: 'C · Three picks card in the feed',
};

const posts: Post[] = FIRST_FEED_POSTS.map((post) => ({
  ...post,
  read: false,
  bookmarked: false,
  upvoted: false,
  commented: false,
  userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
}));

const handlers = {
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

// The cards are real links; the stage keeps a click on this page so the
// "after first read" state can be seen.
const stopNavigation = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('a')) {
    e.preventDefault();
  }
};

const gridStyle = {
  '--num-cards': 3,
  '--feed-gap': '2rem',
  maxWidth:
    'calc(20rem * var(--num-cards) + var(--feed-gap) * (var(--num-cards) - 1))',
} as CSSProperties;

const Grid = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="mx-auto grid w-full grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3"
    style={gridStyle}
  >
    {children}
  </div>
);

interface FeedState {
  readIds: string[];
  onRead: (post: Post) => void;
}

const Card = ({
  post,
  readIds,
  onRead,
}: { post: Post } & FeedState): ReactElement => (
  <ArticleGrid
    post={{ ...post, read: readIds.includes(post.id) }}
    onPostClick={() => onRead(post)}
    {...handlers}
  />
);

// Shown once the first read lands, in every direction, so the user learns
// why reading matters: the feed is theirs and it learns.
const FirstReadToast = ({ onClose }: { onClose: () => void }): ReactElement => (
  <div
    role="status"
    className="fixed bottom-6 left-1/2 z-3 flex w-[calc(100%-2rem)] max-w-[26rem] -translate-x-1/2 items-center gap-3 rounded-16 bg-surface-invert px-4 py-3 text-surface-primary shadow-2"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-avocado-default text-white">
      <VIcon size={IconSize.Small} />
    </span>
    <p className="flex-1 typo-callout">
      <strong>First read done.</strong> Your feed learns from every post you
      open.
    </p>
    <Button
      aria-label="Close"
      icon={<MiniCloseIcon />}
      onClick={onClose}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      className="!text-surface-primary"
    />
  </div>
);

const FeedHeading = (): ReactElement => (
  <div className="mx-auto mb-6 flex w-full items-center" style={gridStyle}>
    <h1 className="font-bold text-text-primary typo-title2">For you</h1>
  </div>
);

const TodayFeed = ({ readIds, onRead }: FeedState): ReactElement => (
  <Grid>
    {posts.map((post) => (
      <Card key={post.id} post={post} readIds={readIds} onRead={onRead} />
    ))}
  </Grid>
);

// A: the top card carries the cue. No new surface, nothing to read before
// reading; the label points at a real post and leaves with the first read.
const StartHereFeed = ({ readIds, onRead }: FeedState): ReactElement => {
  const [first, ...rest] = posts;
  const showCue = readIds.length === 0;

  return (
    <Grid>
      <div className="relative">
        {showCue && (
          <span className="absolute -top-3 left-4 z-2 flex items-center gap-1 rounded-8 bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption1 shadow-2">
            <SparkleIcon size={IconSize.Size16} />
            Start here
          </span>
        )}
        <div
          className={classNames(
            'rounded-16 transition-shadow',
            showCue && 'shadow-[0_0_0_2px_var(--theme-accent-cabbage-default)]',
          )}
        >
          <Card post={first} readIds={readIds} onRead={onRead} />
        </div>
      </div>
      {rest.map((post) => (
        <Card key={post.id} post={post} readIds={readIds} onRead={onRead} />
      ))}
    </Grid>
  );
};

// B: one sentence and one button above the feed. Says what to do and why,
// then gets out of the way.
const WelcomeStripFeed = ({ readIds, onRead }: FeedState): ReactElement => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [first] = posts;

  return (
    <>
      {!isDismissed && readIds.length === 0 && (
        <div
          className="mx-auto mb-8 flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5 tablet:flex-row tablet:items-center"
          style={gridStyle}
        >
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-bold text-text-primary typo-title3">
              Your feed is ready, Ada
            </p>
            <p className="text-text-secondary typo-callout">
              Start with one post. Every read teaches your feed what you like.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={<ArrowIcon className="rotate-90" />}
              iconPosition={ButtonIconPosition.Right}
              onClick={() => onRead(first)}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
            >
              Read the top pick
            </Button>
            <Button
              aria-label="Dismiss"
              icon={<MiniCloseIcon />}
              onClick={() => setIsDismissed(true)}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Tertiary}
            />
          </div>
        </div>
      )}
      <TodayFeed readIds={readIds} onRead={onRead} />
    </>
  );
};

// C: a feed-sized card in the first slot that lists three titles. Reads as
// part of the feed, but it is one more thing to parse before the first read.
const ThreePicksFeed = ({ readIds, onRead }: FeedState): ReactElement => {
  const picks = posts.slice(0, 3);

  return (
    <Grid>
      {readIds.length === 0 && (
        <div className="flex min-h-[22rem] flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-text-tertiary typo-footnote">
              Start here
            </p>
            <p className="font-bold text-text-primary typo-title3">
              Three picks for your tags
            </p>
          </div>
          <ol className="flex flex-1 flex-col gap-2">
            {picks.map((post, index) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => onRead(post)}
                  className="flex w-full items-start gap-3 rounded-12 p-2 text-left hover:bg-surface-hover"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-surface-primary font-bold text-surface-invert typo-caption1">
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 min-w-0 flex-1 font-bold text-text-primary typo-callout">
                    {post.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="text-text-tertiary typo-caption1">
            Every read teaches your feed what you like.
          </p>
        </div>
      )}
      {posts.map((post) => (
        <Card key={post.id} post={post} readIds={readIds} onRead={onRead} />
      ))}
    </Grid>
  );
};

const feeds: Record<Direction, (state: FeedState) => ReactElement> = {
  today: TodayFeed,
  a: StartHereFeed,
  b: WelcomeStripFeed,
  c: ThreePicksFeed,
};

export const FirstFeed = ({
  direction,
  alreadyRead = false,
}: {
  direction: Direction;
  alreadyRead?: boolean;
}): ReactElement => {
  const [readIds, setReadIds] = useState<string[]>(
    alreadyRead ? [posts[0].id] : [],
  );
  const [showToast, setShowToast] = useState(false);
  const Feed = feeds[direction];

  const onRead = (post: Post) => {
    if (readIds.includes(post.id)) {
      return;
    }

    if (!readIds.length && direction !== 'today') {
      setShowToast(true);
    }

    setReadIds([...readIds, post.id]);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="flex flex-col px-4 py-8" onClickCapture={stopNavigation}>
      <FeedHeading />
      <Feed readIds={readIds} onRead={onRead} />
      {showToast && <FirstReadToast onClose={() => setShowToast(false)} />}
    </div>
  );
};
