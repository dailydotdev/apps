import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import type { Candidate } from './catalog';
import { byId, Category, Family } from './catalog';
import type { FrameIcon } from './frames';
import { FrameIconGlyph } from './frames';

/**
 * The bubble's glyph. Frames no longer carry an icon of their own — the
 * headline is the title — so a tray bubble picks one from what the card is
 * about. Streaks get the flame, everything else follows its category.
 */
const bubbleIcon = (candidate: Candidate): FrameIcon => {
  if (candidate.family === Family.Streak || candidate.family === Family.Rhythm) {
    return 'streak';
  }
  if (candidate.category === Category.Crown) {
    return 'medal';
  }
  if (candidate.category === Category.Community) {
    return 'gift';
  }
  if (candidate.category === Category.Surprise) {
    return 'magic';
  }
  return 'sparkle';
};
import type { Person } from './people';
import { Avatar, CAST, ME } from './people';

/**
 * Enough of a feed to judge a placement against.
 *
 * The posts are deliberately plausible rather than lorem: a placement that only
 * looks right next to grey rectangles has not been tested. Everything is
 * theme-token based, so these read correctly in both Storybook themes.
 */

const POSTS = [
  { title: 'Postgres 19 ships async I/O, and the numbers are absurd', source: 'ACM Queue', person: CAST[5] },
  { title: 'What actually happens when you run kubectl apply', source: 'Cloudflare Blog', person: CAST[0] },
  { title: 'Rust in the kernel, one year on', source: 'LWN', person: CAST[4] },
  { title: 'Stop using UUIDs as primary keys (mostly)', source: 'Julia Evans', person: CAST[2] },
  { title: 'The end of the free CI tier', source: 'The Pragmatic Engineer', person: CAST[6] },
  { title: 'A practical guide to connection pooling', source: 'Vercel Blog', person: CAST[1] },
];

export const PostCard = ({ index }: { index: number }): ReactElement => {
  const post = POSTS[index % POSTS.length];

  return (
    <article className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-center gap-2">
        <Avatar person={post.person} size={24} />
        <span className="truncate text-text-tertiary typo-caption1">
          {post.source}
        </span>
      </div>
      <h3 className="line-clamp-3 font-bold text-text-primary typo-callout">
        {post.title}
      </h3>
      <div className="mt-auto h-24 w-full rounded-10 bg-surface-hover" />
      <div className="flex items-center gap-3 text-text-quaternary typo-caption2">
        <span>{12 + index * 7} upvotes</span>
        <span>{2 + index} comments</span>
      </div>
    </article>
  );
};

/**
 * The feed grid, with a slot the placement can be dropped into. `at` is the
 * index the injected node takes, matching how `FeedItemType.Highlight` is
 * positioned today.
 */
export const MockFeed = ({
  injected,
  at = 3,
  above,
  columns = 3,
  count = 6,
}: {
  injected?: ReactNode;
  at?: number;
  above?: ReactNode;
  columns?: number;
  count?: number;
}): ReactElement => {
  const items: ReactNode[] = [];

  for (let index = 0; index < count; index += 1) {
    if (injected && index === at) {
      items.push(<React.Fragment key="injected">{injected}</React.Fragment>);
    }
    // eslint-disable-next-line react/no-array-index-key
    items.push(<PostCard key={`post-${index}`} index={index} />);
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-16 bg-background-default p-4">
      {above}
      <div
        className="grid items-start gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Story tray                                                                  */
/* -------------------------------------------------------------------------- */

export interface Bubble {
  id: string;
  label: string;
  seen?: boolean;
  /** Renders the frame itself inside the ring instead of a face. */
  candidate?: Candidate;
  person?: Person;
}

/**
 * The Instagram / Apple Health shape: a row of rings above the feed. The ring
 * is the whole affordance, so it costs one row of height and no feed slot.
 */
export const StoryTray = ({
  bubbles,
  size = 64,
}: {
  bubbles: Bubble[];
  size?: number;
}): ReactElement => (
  <div className="flex gap-4 overflow-x-auto pb-1">
    {bubbles.map((bubble) => (
      <button
        key={bubble.id}
        type="button"
        className="flex shrink-0 flex-col items-center gap-1.5"
        style={{ width: size + 12 }}
      >
        <span
          className={classNames(
            'flex items-center justify-center rounded-full p-[2px]',
            bubble.seen ? 'bg-border-subtlest-secondary' : '',
          )}
          style={{
            width: size,
            height: size,
            background: bubble.seen
              ? undefined
              : 'linear-gradient(135deg, #CE3DF3, #FF9157 60%, #FFE24C)',
          }}
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-background-default p-[2px]">
            {bubble.candidate ? (
              // A 9:16 frame squeezed into a circle is mush. The candidate's
              // own product icon on its own hue reads instantly at 60px, and it
              // is the same icon that appears on the frame itself.
              <span
                className="flex h-full w-full items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${bubble.candidate.hue}, ${bubble.candidate.hue}22 78%)`,
                }}
              >
                <span
                  className="flex text-white [&_svg]:h-full [&_svg]:w-full"
                  style={{ width: size * 0.42, height: size * 0.42 }}
                >
                  <FrameIconGlyph icon={bubbleIcon(bubble.candidate)} />
                </span>
              </span>
            ) : (
              <Avatar person={bubble.person ?? ME} size={size - 8} />
            )}
          </span>
        </span>
        <span className="w-full truncate text-center text-text-tertiary typo-caption2">
          {bubble.label}
        </span>
      </button>
    ))}
  </div>
);

export const defaultBubbles: Bubble[] = [
  { id: 'week', label: 'Your week', candidate: byId('persona.week') },
  { id: 'streak', label: 'Streak', candidate: byId('streak.moment') },
  { id: 'crown', label: 'Top reader', candidate: byId('crown.topReader') },
  { id: 'rank', label: 'Your rank', candidate: byId('community.podium'), seen: true },
  { id: 'tags', label: 'Topics', candidate: byId('tags.dominant'), seen: true },
];

/* -------------------------------------------------------------------------- */
/* Other entry points                                                          */
/* -------------------------------------------------------------------------- */

/** A slim strip above the feed. One line, dismissible, no feed slot taken. */
export const RecapStrip = ({
  count = 8,
}: {
  count?: number;
}): ReactElement => (
  <div className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-overlay-float-cabbage text-accent-cabbage-default">
      <SparkleIcon />
    </span>
    <span className="flex flex-1 flex-col">
      <span className="font-bold text-text-primary typo-footnote">
        Your week is ready
      </span>
      <span className="text-text-quaternary typo-caption2">
        {count} moments, including a Top reader badge
      </span>
    </span>
    <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">
      Open
    </span>
  </div>
);

/** The header entry point: no feed real estate at all, just a dot. */
export const HeaderBar = ({
  unread = true,
}: {
  unread?: boolean;
}): ReactElement => (
  <div className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-2.5">
    <span className="h-6 w-6 rounded-8 bg-text-primary" />
    <span className="h-8 flex-1 rounded-10 bg-surface-float" />
    <span className="relative flex h-9 w-9 items-center justify-center rounded-10 text-text-tertiary">
      <SparkleIcon />
      {unread && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-cabbage-default" />
      )}
    </span>
    <span className="relative flex h-9 w-9 items-center justify-center rounded-10 text-text-tertiary">
      <HotIcon />
    </span>
    <Avatar person={ME} size={28} />
  </div>
);
